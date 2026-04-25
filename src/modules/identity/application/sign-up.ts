'use server'

import { getLocale } from 'next-intl/server'
import { redirect } from '@/shared/i18n/routing'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'

export async function signUp(formData: FormData) {
  const locale = await getLocale()
  const supabase = await createSupabaseServerClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Persist locale preference to profile (best-effort; trigger creates the row).
  if (data.user) {
    await supabase
      .from('profiles')
      .update({ locale })
      .eq('id', data.user.id)
  }

  redirect({ href: '/onboarding', locale })
}
