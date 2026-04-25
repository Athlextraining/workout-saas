'use server'

import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import type { Locale } from '@/shared/i18n/config'

export async function updateProfileLocale(locale: Locale): Promise<{ error?: string }> {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Anonymous users: nothing to persist; the cookie set client-side handles them.
  if (!user) return {}

  const { error } = await supabase
    .from('profiles')
    .update({ locale })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return {}
}
