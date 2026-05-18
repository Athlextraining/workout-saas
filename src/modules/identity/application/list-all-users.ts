import { createSupabaseAdmin } from '@/shared/infra/supabase/admin'
import { isCurrentUserAdmin } from '@/modules/support/application/require-admin'

export interface AdminUserListItem {
  id: string
  email: string
  full_name: string | null
  category: string | null
}

export async function listAllUsers(): Promise<AdminUserListItem[]> {
  if (!(await isCurrentUserAdmin())) return []

  const admin = createSupabaseAdmin()
  const [{ data: authData }, { data: profiles }] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, full_name, category'),
  ])

  const profileMap = new Map(
    (profiles ?? []).map((p: { id: string; full_name: string | null; category: string | null }) => [
      p.id,
      p,
    ]),
  )

  return (authData?.users ?? [])
    .filter((u) => u.email)
    .map((u) => {
      const profile = profileMap.get(u.id)
      return {
        id: u.id,
        email: u.email!,
        full_name: profile?.full_name ?? null,
        category: profile?.category ?? null,
      }
    })
    .sort((a, b) => a.email.localeCompare(b.email))
}
