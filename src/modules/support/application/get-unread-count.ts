import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'

export async function getUnreadCount(): Promise<number> {
  const user = await getCurrentUser()
  if (!user) return 0

  const profile = await getCurrentProfile()
  const isAdmin = Boolean(profile?.is_admin)

  const supabase = await createSupabaseServerClient()
  const query = supabase
    .from('support_threads')
    .select('id, last_read_by_user, last_read_by_admin, support_messages!inner(created_at, author)')

  if (!isAdmin) query.eq('user_id', user.id)

  const { data } = await query
  if (!data) return 0

  let count = 0
  type Row = {
    id: string
    last_read_by_user: string | null
    last_read_by_admin: string | null
    support_messages: Array<{ created_at: string; author: 'user' | 'admin' }>
  }

  for (const row of data as Row[]) {
    const lastFromOther = row.support_messages
      .filter((m) => (isAdmin ? m.author === 'user' : m.author === 'admin'))
      .map((m) => m.created_at)
      .sort()
      .pop()
    if (!lastFromOther) continue
    const readAt = isAdmin ? row.last_read_by_admin : row.last_read_by_user
    if (!readAt || lastFromOther > readAt) count++
  }

  return count
}
