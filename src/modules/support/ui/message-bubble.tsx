import { useFormatter, useTranslations } from 'next-intl'
import type { SupportMessage } from '../domain/thread'

interface Props {
  message: SupportMessage
  viewerIsAuthor: boolean
}

export function MessageBubble({ message, viewerIsAuthor }: Props) {
  const t = useTranslations()
  const format = useFormatter()

  const date = format.dateTime(new Date(message.created_at), {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`flex flex-col ${viewerIsAuthor ? 'items-end' : 'items-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          viewerIsAuthor
            ? 'bg-[var(--accent-green)] text-black'
            : 'glass text-[var(--text-primary)]'
        }`}
      >
        {message.body}
      </div>
      <span className="text-[10px] text-muted mt-1 px-1">
        {message.author === 'admin' ? t('support.bubble.admin') : t('support.bubble.you')} · {date}
      </span>
    </div>
  )
}
