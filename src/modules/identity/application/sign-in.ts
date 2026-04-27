'use server'

import { getLocale } from 'next-intl/server'
import { redirect } from '@/shared/i18n/routing'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'

export async function signIn(formData: FormData) {
  const locale = await getLocale()
  const supabase = await createSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Backfill profiles.locale for users who signed up before the column existed
  const { data: { user } } = await supabase.auth.getUser()
  if (user && (locale === 'es' || locale === 'en')) {
    // Only update if profile still has default 'es' AND active locale differs
    await supabase
      .from('profiles')
      .update({ locale })
      .eq('id', user.id)
      .eq('locale', 'es')
      .neq('locale', locale)
  }

  redirect({ href: '/entrenamiento', locale })
}
