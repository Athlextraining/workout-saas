'use server'

import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'
import { createSupabaseServerClient } from '@/shared/infra/supabase/server'

export async function markThreadRead(threadId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { error: 'No autenticado.' }

  const profile = await getCurrentProfile()
  const isAdmin = Boolean(profile?.is_admin)

  const supabase = await createSupabaseServerClient()
  const column = isAdmin ? 'last_read_by_admin' : 'last_read_by_user'

  const { error } = await supabase
    .from('support_threads')
    .update({ [column]: new Date().toISOString() })
    .eq('id', threadId)

  if (error) return { error: error.message }
  return {}
}
