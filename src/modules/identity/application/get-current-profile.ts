import { getCurrentUser } from './get-current-user'
import { getProfile } from '../infra/profile-repository'
import type { Profile } from '../domain/profile'

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null
  return getProfile(user.id)
}
