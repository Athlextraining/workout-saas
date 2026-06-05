import { getPublicTemplate } from '../infra/template-repository'
import type { UserWeekWorkout } from '../domain/workout'
import type { Locale } from '@/shared/i18n/config'

/**
 * Public, unauthenticated preview: ATHX PRO, cycle 1, week 1.
 * Returns null if the template row is missing.
 */
export async function getPreviewWorkout(
  locale: Locale,
): Promise<UserWeekWorkout | null> {
  const template = await getPublicTemplate('athx_pro', 1, locale)
  if (!template) return null

  return { ...template, cycle_number: 1, week_number: 1 }
}
