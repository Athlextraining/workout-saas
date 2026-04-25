import { Link } from '@/shared/i18n/routing'
import { notFound } from 'next/navigation'
import { requireAdmin } from '@/modules/support/application/require-admin'
import { getThread } from '@/modules/support/application/get-thread'
import { MessageBubble } from '@/modules/support/ui/message-bubble'
import { ReplyForm } from '@/modules/support/ui/reply-form'
import { StatusToggle } from './status-toggle'

export default async function AdminThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const data = await getThread(id)
  if (!data) notFound()

  const { thread, messages, user_email } = data

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/mensajes" className="text-xs text-muted hover:text-white">
          ← Bandeja
        </Link>
        <StatusToggle threadId={thread.id} status={thread.status} />
      </div>

      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <span
            className={`badge badge--pill ${
              thread.status === 'open' ? 'badge--green' : 'badge--muted'
            }`}
          >
            {thread.status === 'open' ? 'Abierto' : 'Cerrado'}
          </span>
        </div>
        <h1 className="text-2xl font-bold leading-tight">{thread.subject}</h1>
        {user_email && (
          <p className="text-muted text-xs">De: {user_email}</p>
        )}
      </header>

      <div className="space-y-3">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            viewerIsAuthor={m.author === 'admin'}
          />
        ))}
      </div>

      <div className="glass rounded-xl p-4">
        <ReplyForm threadId={thread.id} closed={thread.status === 'closed'} />
      </div>
    </div>
  )
}
