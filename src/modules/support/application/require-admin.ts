import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'

export async function requireAdmin() {
  const profile = await getCurrentProfile()
  if (!profile?.is_admin) redirect('/')
  return profile
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile()
  return Boolean(profile?.is_admin)
}
