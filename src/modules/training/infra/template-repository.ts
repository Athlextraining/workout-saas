import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import { createSupabaseAdmin } from '@/shared/infra/supabase/admin'
import type { Category } from '@/modules/identity/domain/profile'
import type { WorkoutTemplate, WeekContent, LocalizedWeekContent } from '../domain/workout'
import type { BlockKey } from '../domain/workout-validators'
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

/**
 * Returns the full localized content (both languages) for the admin editor.
 * Service-role client — gated by requireAdmin in the use case.
 */
export async function getRawTemplate(
  category: Category,
  weekNumber: number,
): Promise<LocalizedWeekContent | null> {
  const supabase = createSupabaseAdmin()
  const { data } = await supabase
    .from('workout_templates')
    .select('content')
    .eq('category', category)
    .eq('week_number', weekNumber)
    .single()

  if (!data) return null
  return data.content as LocalizedWeekContent
}

/**
 * Merges a single block into one day, for each provided locale, leaving every
 * other day/block/locale untouched. Empty value removes the block. Service-role
 * client — gated by requireAdmin in the use case.
 */
export async function updateTemplateBlock(
  category: Category,
  weekNumber: number,
  day: keyof WeekContent,
  blockKey: BlockKey,
  byLocale: Partial<Record<Locale, unknown>>,
): Promise<{ error?: string }> {
  const supabase = createSupabaseAdmin()
  const { data, error: readErr } = await supabase
    .from('workout_templates')
    .select('content')
    .eq('category', category)
    .eq('week_number', weekNumber)
    .single()

  if (readErr || !data) return { error: 'Plantilla no encontrada' }

  const content = data.content as LocalizedWeekContent

  for (const [locale, value] of Object.entries(byLocale) as [Locale, unknown][]) {
    const week = content[locale]
    if (!week) continue
    const dayWorkout = week[day] as unknown as Record<string, unknown> | undefined
    if (!dayWorkout) continue

    const empty =
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)

    if (empty) {
      delete dayWorkout[blockKey]
    } else {
      dayWorkout[blockKey] = value
    }
  }

  const { error: writeErr } = await supabase
    .from('workout_templates')
    .update({ content })
    .eq('category', category)
    .eq('week_number', weekNumber)

  if (writeErr) return { error: writeErr.message }
  return {}
}
