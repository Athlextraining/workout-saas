import { requireAdmin } from '@/modules/support/application/require-admin'
import { listAllUsers } from '@/modules/identity/application/list-all-users'
import { UserList } from './user-list'

export default async function AdminMensajesPage() {
  await requireAdmin()
  const users = await listAllUsers()

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Usuarios · Admin</h1>
        <p className="text-muted text-sm mt-1">{users.length} usuarios registrados</p>
      </header>

      <UserList users={users} />
    </div>
  )
}
