'use server'

import { requireAdmin } from './require-admin'
import {
  createAdminThread,
  getLatestOpenThreadForUser,
  addAdminMessageToThread,
} from '../infra/thread-repository'
import { sendReplyToUser } from '../infra/email-client'
import { validateBody, validateSubject } from '../domain/validators'
import { createSupabaseAdmin } from '@/shared/infra/supabase/admin'
import { defaultLocale, locales, type Locale } from '@/shared/i18n/config'

export async function sendAdminMessage(input: {
  userId: string
  userEmail: string
  subject: string
  body: string
}): Promise<{ error?: string; threadId?: string }> {
  await requireAdmin()

  const body = input.body.trim()
  const bodyErr = validateBody(body)
  if (bodyErr) return { error: bodyErr }

  const subject = input.subject.trim()
  const subjectErr = validateSubject(subject)
  if (subjectErr) return { error: subjectErr }

  // Reuse existing open thread if one exists to avoid duplicate chats
  const existingThread = await getLatestOpenThreadForUser(input.userId)
  let thread: { id: string } | undefined

  if (existingThread) {
    const { error: msgErr } = await addAdminMessageToThread({
      threadId: existingThread.id,
      body,
    })
    if (msgErr) return { error: msgErr }
    thread = existingThread
  } else {
    const { thread: newThread, error } = await createAdminThread({
      userId: input.userId,
      subject,
      body,
    })
    if (error || !newThread) return { error: error ?? 'No se pudo crear el hilo.' }
    thread = newThread
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  try {
    const admin = createSupabaseAdmin()
    const { data: profile } = await admin
      .from('profiles')
      .select('locale')
      .eq('id', input.userId)
      .maybeSingle()
    const rawLocale = profile?.locale as string | null | undefined
    const recipientLocale: Locale = locales.includes(rawLocale as Locale)
      ? (rawLocale as Locale)
      : defaultLocale
    await sendReplyToUser({
      threadId: thread.id,
      subject,
      body,
      userEmail: input.userEmail,
      appUrl,
      recipientLocale,
    })
  } catch (e) {
    console.error('Resend error (admin message):', e)
  }

  return { threadId: thread.id }
}
