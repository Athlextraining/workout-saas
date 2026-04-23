import { isCurrentUserAdmin } from './require-admin'
import { listAllThreads as repoListAll } from '../infra/thread-repository'
import type { SupportThreadWithMeta } from '../domain/thread'

export async function listAllThreads(): Promise<SupportThreadWithMeta[]> {
  if (!(await isCurrentUserAdmin())) return []
  return repoListAll()
}
