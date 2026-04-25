import { useTranslations, useFormatter } from 'next-intl'
import { Link } from '@/shared/i18n/routing'
import type { SupportThreadWithMeta } from '../domain/thread'

type ThreadPathname = '/preguntanos/[id]' | '/admin/mensajes/[id]'

interface Props {
  threads: SupportThreadWithMeta[]
  pathname: ThreadPathname
  showUserEmail?: boolean
}

export function ThreadList({ threads, pathname, showUserEmail = false }: Props) {
  const t = useTranslations()
  const format = useFormatter()

  if (threads.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center text-muted text-sm">
        {t('support.threadList.empty')}
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {threads.map((thread) => {
        const date = format.dateTime(new Date(thread.last_message_at ?? thread.updated_at), {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
        return (
          <li key={thread.id}>
            <Link
              href={{ pathname, params: { id: thread.id } }}
              className="block glass rounded-xl p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-sm font-semibold truncate">{thread.subject}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {thread.unread_for_admin && showUserEmail && (
                    <span className="badge badge--pill badge--green">{t('support.threadList.newBadge')}</span>
                  )}
                  <span
                    className={`badge badge--pill ${
                      thread.status === 'open' ? 'badge--green' : 'badge--muted'
                    }`}
                  >
                    {thread.status === 'open' ? t('support.threadList.statusOpen') : t('support.threadList.statusClosed')}
                  </span>
                </div>
              </div>
              {showUserEmail && thread.user_email && (
                <p className="text-[11px] text-muted truncate">{thread.user_email}</p>
              )}
              {thread.last_message_preview && (
                <p className="text-xs text-muted line-clamp-2 mt-1">
                  {thread.last_message_author === 'admin' ? t('support.threadList.adminPrefix') : ''}
                  {thread.last_message_preview}
                </p>
              )}
              <p className="text-[10px] text-muted mt-2">{date}</p>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
