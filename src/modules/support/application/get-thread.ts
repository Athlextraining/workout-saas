import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'
import { getThreadById } from '../infra/thread-repository'
import type { SupportThreadWithMessages } from '../domain/thread'

export async function getThread(
  threadId: string,
): Promise<SupportThreadWithMessages | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const data = await getThreadById(threadId)
  if (!data) return null

  const profile = await getCurrentProfile()
  const isAdmin = Boolean(profile?.is_admin)
  const isOwner = data.thread.user_id === user.id
  if (!isAdmin && !isOwner) return null

  return data
}
