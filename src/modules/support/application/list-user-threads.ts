import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { listUserThreads as repoList } from '../infra/thread-repository'
import type { SupportThreadWithMeta } from '../domain/thread'

export async function listUserThreads(): Promise<SupportThreadWithMeta[]> {
  const user = await getCurrentUser()
  if (!user) return []
  return repoList(user.id)
}
