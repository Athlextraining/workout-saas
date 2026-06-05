import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import { createSupabaseAdmin } from '@/shared/infra/supabase/admin'
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

  const localized = data.content as LocalizedWeekContent
  const content: WeekContent = localized[locale] ?? localized.es!

  return {
    ...(data as Omit<WorkoutTemplate, 'content'>),
    content,
  } as WorkoutTemplate
}

/**
 * Reads a template via the service-role client, bypassing RLS.
 * Used only for the public (logged-out) week-1 preview, scoped to a single row.
 */
export async function getPublicTemplate(
  category: Category,
  weekNumber: number,
  locale: Locale,
): Promise<WorkoutTemplate | null> {
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('category', category)
    .eq('week_number', weekNumber)
    .single()

  if (!data) return null

  const localized = data.content as LocalizedWeekContent
  const content: WeekContent = localized[locale] ?? localized.es!

  return {
    ...(data as Omit<WorkoutTemplate, 'content'>),
    content,
  } as WorkoutTemplate
}
