import Link from 'next/link'
import type { SupportThreadWithMeta } from '../domain/thread'

interface Props {
  threads: SupportThreadWithMeta[]
  basePath: string
  showUserEmail?: boolean
}

export function ThreadList({ threads, basePath, showUserEmail = false }: Props) {
  if (threads.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center text-muted text-sm">
        No hay mensajes todavía.
      </div>
    )
  }

  return (
    <ul className="space-y-2">
      {threads.map((t) => {
        const date = new Date(t.last_message_at ?? t.updated_at).toLocaleString(
          'es-ES',
          { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' },
        )
        return (
          <li key={t.id}>
            <Link
              href={`${basePath}/${t.id}`}
              className="block glass rounded-xl p-4 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <p className="text-sm font-semibold truncate">{t.subject}</p>
                <div className="flex items-center gap-2 shrink-0">
                  {t.unread_for_admin && showUserEmail && (
                    <span className="badge badge--pill badge--green">Nuevo</span>
                  )}
                  <span
                    className={`badge badge--pill ${
                      t.status === 'open' ? 'badge--green' : 'badge--muted'
                    }`}
                  >
                    {t.status === 'open' ? 'Abierto' : 'Cerrado'}
                  </span>
                </div>
              </div>
              {showUserEmail && t.user_email && (
                <p className="text-[11px] text-muted truncate">{t.user_email}</p>
              )}
              {t.last_message_preview && (
                <p className="text-xs text-muted line-clamp-2 mt-1">
                  {t.last_message_author === 'admin' ? 'ATHLEX: ' : ''}
                  {t.last_message_preview}
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
