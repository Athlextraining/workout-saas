import { requireAdmin } from '@/modules/support/application/require-admin'
import { listAllThreads } from '@/modules/support/application/list-all-threads'
import { ThreadList } from '@/modules/support/ui/thread-list'

export default async function AdminMensajesPage() {
  await requireAdmin()
  const threads = await listAllThreads()

  const openCount = threads.filter((t) => t.status === 'open').length

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Bandeja · Admin</h1>
        <p className="text-muted text-sm mt-1">
          {openCount} abierto{openCount === 1 ? '' : 's'} · {threads.length} total
        </p>
      </header>

      <ThreadList threads={threads} basePath="/admin/mensajes" showUserEmail />
    </div>
  )
}
