import { getLocale } from 'next-intl/server'
import { Link, redirect } from '@/shared/i18n/routing'
import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { listUserThreads } from '@/modules/support/application/list-user-threads'
import { ThreadList } from '@/modules/support/ui/thread-list'

export default async function PreguntanosPage() {
  const locale = await getLocale()
  const user = await getCurrentUser()
  if (!user) redirect({ href: '/login', locale })

  const threads = await listUserThreads()

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pregúntanos</h1>
          <p className="text-muted text-sm mt-1">
            Cualquier duda, te contestamos por aquí.
          </p>
        </div>
        <Link
          href="/preguntanos/nuevo"
          className="shrink-0 px-4 py-2 rounded-xl btn-gradient text-sm font-semibold"
        >
          Nuevo
        </Link>
      </header>

      <ThreadList threads={threads} pathname="/preguntanos/[id]" />
    </div>
  )
}
