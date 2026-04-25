import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import type { Category } from '@/modules/identity/domain/profile'
import type { WorkoutTemplate, WeekContent, LocalizedWeekContent } from '../domain/workout'
import type { Locale } from '@/shared/i18n/config'

export async function getTemplate(
  category: Category,
  weekNumber: number,
  locale: Locale,
): Promise<WorkoutTemplate | null> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('category', category)
    .eq('week_number', weekNumber)
    .single()

  if (!data) return null

  const localized = data.week_content as LocalizedWeekContent
  const content: WeekContent = localized[locale] ?? localized.es!

  return {
    ...(data as Omit<WorkoutTemplate, 'week_content'>),
    week_content: content,
  } as WorkoutTemplate
}
