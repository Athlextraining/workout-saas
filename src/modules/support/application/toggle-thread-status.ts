'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from './require-admin'
import { setThreadStatus } from '../infra/thread-repository'

export async function toggleThreadStatus(
  threadId: string,
  status: 'open' | 'closed',
): Promise<{ error?: string }> {
  await requireAdmin()
  const { error } = await setThreadStatus(threadId, status)
  if (error) return { error }
  revalidatePath(`/admin/mensajes/${threadId}`)
  revalidatePath('/admin/mensajes')
  return {}
}
