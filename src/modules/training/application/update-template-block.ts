'use server'

import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/modules/support/application/require-admin'
import { validateBlock, type BlockKey } from '../domain/workout-validators'
import { updateTemplateBlock } from '../infra/template-repository'
import type { Category } from '@/modules/identity/domain/profile'
import type { WeekContent } from '../domain/workout'
import type { Locale } from '@/shared/i18n/config'

export async function updateTemplateBlockAction(
  category: Category,
  weekNumber: number,
  day: keyof WeekContent,
  blockKey: BlockKey,
  byLocale: Partial<Record<Locale, unknown>>,
): Promise<{ error?: string }> {
  await requireAdmin()

  for (const value of Object.values(byLocale)) {
    const { error } = validateBlock(blockKey, value)
    if (error) return { error }
  }

  const result = await updateTemplateBlock(category, weekNumber, day, blockKey, byLocale)
  if (result.error) return result

  revalidatePath('/[locale]/admin/entrenos/[category]/[week]', 'page')
  revalidatePath('/[locale]/entrenamiento', 'page')
  return {}
}
