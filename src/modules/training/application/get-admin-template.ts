import { requireAdmin } from '@/modules/support/application/require-admin'
import { getRawTemplate } from '../infra/template-repository'
import type { Category } from '@/modules/identity/domain/profile'
import type { LocalizedWeekContent } from '../domain/workout'

export async function getAdminTemplate(
  category: Category,
  weekNumber: number,
): Promise<LocalizedWeekContent | null> {
  await requireAdmin()
  return getRawTemplate(category, weekNumber)
}
