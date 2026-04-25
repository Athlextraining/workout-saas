'use server'

import { getLocale } from 'next-intl/server'
import { redirect } from '@/shared/i18n/routing'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'

export async function signOut() {
  const locale = await getLocale()
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect({ href: '/', locale })
}
