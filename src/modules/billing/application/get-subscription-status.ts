import { createSupabaseServerClient } from '@/shared/infra/supabase/server'
import { getActiveSubscription } from '../infra/subscription-repository'

export async function isUserSubscribed(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient()
  const { data } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .single()
  if (data?.is_admin) return true

  const sub = await getActiveSubscription(userId)
  return sub !== null
}
