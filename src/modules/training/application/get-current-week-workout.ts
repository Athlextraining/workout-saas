import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getProfile } from '@/modules/identity/infra/profile-repository'
import { getUserCycleWeek } from '../domain/cycle'
import { getTemplate } from '../infra/template-repository'
import type { UserWeekWorkout } from '../domain/workout'
import type { Locale } from '@/shared/i18n/config'

export async function getCurrentWeekWorkout(locale: Locale): Promise<UserWeekWorkout | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const profile = await getProfile(user.id)
  if (!profile?.category || !profile?.cycle_start_date) return null

  const { cycleNumber, weekNumber } = getUserCycleWeek(profile.cycle_start_date)

  const template = await getTemplate(profile.category, weekNumber, locale)
  if (!template) return null

  return { ...template, cycle_number: cycleNumber, week_number: weekNumber }
}
