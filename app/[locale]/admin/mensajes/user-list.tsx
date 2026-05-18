'use client'

import { useState, useTransition } from 'react'
import { useRouter } from '@/shared/i18n/routing'
import { Drawer } from 'vaul'
import { sendAdminMessage } from '@/modules/support/application/send-admin-message'
import { SUBJECT_MAX, BODY_MAX } from '@/modules/support/domain/validators'
import type { AdminUserListItem } from '@/modules/identity/application/list-all-users'

interface Props {
  users: AdminUserListItem[]
}

export function UserList({ users }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<AdminUserListItem | null>(null)
  const [open, setOpen] = useState(false)
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function openDrawer(user: AdminUserListItem) {
    setSelected(user)
    setSubject('')
    setBody('')
    setError(null)
    setOpen(true)
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) return
    setError(null)
    startTransition(async () => {
      const res = await sendAdminMessage({
        userId: selected.id,
        userEmail: selected.email,
        subject,
        body,
      })
      if (res.error) {
        setError(res.error)
        return
      }
      setOpen(false)
      router.push({ pathname: '/admin/mensajes/[id]', params: { id: res.threadId! } })
    })
  }

  if (users.length === 0) {
    return (
      <div className="glass rounded-xl p-6 text-center text-muted text-sm">
        Sin usuarios registrados.
      </div>
    )
  }

  return (
    <>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="glass rounded-xl p-4 flex items-center justify-between gap-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              {user.full_name && (
                <p className="text-xs text-muted truncate">{user.full_name}</p>
              )}
              {user.category && (
                <span className="badge badge--pill badge--muted mt-1 text-[10px]">
                  {user.category.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => openDrawer(user)}
              className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium glass border border-white/10 hover:bg-white/10 transition-colors"
            >
              Mensaje
            </button>
          </li>
        ))}
      </ul>

      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[80] rounded-t-2xl bg-[#0f0f1a] border-t border-white/10 p-6 max-w-lg mx-auto">
            <Drawer.Handle className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />
            <Drawer.Title className="text-base font-semibold mb-1">Nuevo mensaje</Drawer.Title>
            {selected && (
              <p className="text-xs text-muted mb-4">Para: {selected.email}</p>
            )}
            <form onSubmit={onSubmit} className="space-y-3">
              <input
                type="text"
                maxLength={SUBJECT_MAX}
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto"
                className="input-glass w-full px-4 py-3 rounded-xl text-sm"
              />
              <textarea
                rows={5}
                maxLength={BODY_MAX}
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Mensaje…"
                className="input-glass w-full px-4 py-3 rounded-xl text-sm resize-y"
              />
              {error && (
                <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={pending || !subject.trim() || !body.trim()}
                className="w-full py-3 rounded-xl text-sm font-semibold btn-gradient disabled:opacity-50"
              >
                {pending ? '…' : 'Enviar'}
              </button>
            </form>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
