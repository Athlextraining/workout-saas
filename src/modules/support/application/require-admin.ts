import { getLocale } from 'next-intl/server'
import { redirect } from '@/shared/i18n/routing'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'

export async function requireAdmin() {
  const profile = await getCurrentProfile()
  if (!profile?.is_admin) {
    const locale = await getLocale()
    redirect({ href: '/', locale })
  }
  return profile
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return Boolean(profile?.is_admin)
}
