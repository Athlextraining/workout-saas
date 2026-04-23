import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getThread } from '@/modules/support/application/get-thread'
import { MessageBubble } from '@/modules/support/ui/message-bubble'
import { ReplyForm } from '@/modules/support/ui/reply-form'

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params
  const data = await getThread(id)
  if (!data) notFound()

  const { thread, messages } = data

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <Link href="/preguntanos" className="text-xs text-muted hover:text-white">
        ← Volver
      </Link>

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
      </header>

      <div className="space-y-3">
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            viewerIsAuthor={m.author === 'user'}
          />
        ))}
      </div>

      <div className="glass rounded-xl p-4">
        <ReplyForm threadId={thread.id} closed={thread.status === 'closed'} />
      </div>
    </div>
  )
}
