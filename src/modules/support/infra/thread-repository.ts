import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import { createSupabaseAdmin } from '@/shared/infra/supabase/admin'
import type {
  SupportThread,
  SupportMessage,
  SupportThreadWithMeta,
  SupportThreadWithMessages,
} from '../domain/thread'

export async function createThread(params: {
  userId: string
  subject: string
  body: string
}): Promise<{ thread?: SupportThread; message?: SupportMessage; error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: thread, error: tErr } = await supabase
    .from('support_threads')
    .insert({ user_id: params.userId, subject: params.subject })
    .select()
    .single()
  if (tErr || !thread) return { error: tErr?.message ?? 'No se pudo crear el hilo.' }

  const { data: message, error: mErr } = await supabase
    .from('support_messages')
    .insert({ thread_id: thread.id, author: 'user', body: params.body })
    .select()
    .single()
  if (mErr || !message) return { error: mErr?.message ?? 'No se pudo crear el mensaje.' }

  return { thread, message }
}

export async function getLatestOpenThreadForUser(
  userId: string,
): Promise<SupportThread | null> {
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('support_threads')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'open')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

export async function createAdminThread(params: {
  userId: string
  subject: string
  body: string
}): Promise<{ thread?: SupportThread; error?: string }> {
  const supabase = createSupabaseAdmin()
  const { data: thread, error: tErr } = await supabase
    .from('support_threads')
    .insert({ user_id: params.userId, subject: params.subject })
    .select()
    .single()
  if (tErr || !thread) return { error: tErr?.message ?? 'No se pudo crear el hilo.' }

  const { error: mErr } = await supabase
    .from('support_messages')
    .insert({ thread_id: thread.id, author: 'admin', body: params.body })
  if (mErr) return { error: mErr.message }

  return { thread }
}

export async function addAdminMessageToThread(params: {
  threadId: string
  body: string
}): Promise<{ error?: string }> {
  const supabase = createSupabaseAdmin()
  const { error: mErr } = await supabase
    .from('support_messages')
    .insert({ thread_id: params.threadId, author: 'admin', body: params.body })
  if (mErr) return { error: mErr.message }

  await supabase
    .from('support_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', params.threadId)

  return {}
}

export async function addMessage(params: {
  threadId: string
  author: 'user' | 'admin'
  body: string
}): Promise<{ message?: SupportMessage; error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase
    .from('support_messages')
    .insert({
      thread_id: params.threadId,
      author: params.author,
      body: params.body,
    })
    .select()
    .single()
  if (error || !data) return { error: error?.message ?? 'No se pudo enviar.' }
  return { message: data }
}

export async function getThreadById(
  threadId: string,
): Promise<SupportThreadWithMessages | null> {
  const supabase = await createSupabaseServerClient()
  const { data: thread } = await supabase
    .from('support_threads')
    .select('*')
    .eq('id', threadId)
    .single()
  if (!thread) return null

  const { data: messages } = await supabase
    .from('support_messages')
    .select('*')
    .eq('thread_id', threadId)
    .order('created_at', { ascending: true })

  // user email via admin (profiles.email isn't stored; fetch from auth)
  let user_email: string | undefined
  try {
    const admin = createSupabaseAdmin()
    const { data } = await admin.auth.admin.getUserById(thread.user_id)
    user_email = data?.user?.email ?? undefined
  } catch {}

  return { thread, messages: messages ?? [], user_email }
}

export async function listUserThreads(userId: string): Promise<SupportThreadWithMeta[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('support_threads')
    .select('*, support_messages(body, author, created_at)')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
  return (data ?? []).map(mapThreadRow)
}

export async function listAllThreads(): Promise<SupportThreadWithMeta[]> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('support_threads')
    .select('*, support_messages(body, author, created_at)')
    .order('updated_at', { ascending: false })
  const threads = (data ?? []).map(mapThreadRow)

  // Enrich with user emails (admin-scoped)
  try {
    const admin = createSupabaseAdmin()
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 })
    const byId = new Map(list?.users.map((u) => [u.id, u.email ?? undefined]))
    for (const t of threads) t.user_email = byId.get(t.user_id) ?? undefined
  } catch {}

  return threads
}

type ThreadRow = SupportThread & {
  support_messages?: Array<{ body: string; author: 'user' | 'admin'; created_at: string }>
}

function mapThreadRow(row: ThreadRow): SupportThreadWithMeta {
  const msgs = (row.support_messages ?? []).slice().sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1,
  )
  const last = msgs[0]
  return {
    id: row.id,
    user_id: row.user_id,
    subject: row.subject,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
    last_message_preview: last?.body.slice(0, 120),
    last_message_author: last?.author,
    last_message_at: last?.created_at,
    unread_for_admin: last?.author === 'user' && row.status === 'open',
  }
}

export async function setThreadStatus(
  threadId: string,
  status: 'open' | 'closed',
): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase
    .from('support_threads')
    .update({ status })
    .eq('id', threadId)
  return { error: error?.message }
}
