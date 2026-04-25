'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Drawer } from 'vaul'
import { ChatPanel } from './chat-panel'

export function AdminBell() {
  const t = useTranslations('nav.adminBell')
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch('/api/support/poll', { cache: 'no-store' })
      const json = await res.json()
      if (json.authenticated && json.isAdmin) setUnread(json.unread ?? 0)
    } catch {}
  }, [])

  useEffect(() => {
    if (open) return
    fetchUnread()
    const id = setInterval(fetchUnread, 60000)
    return () => clearInterval(id)
  }, [open, fetchUnread])

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button type="button" className="nav-bell" aria-label={t('ariaLabel')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M10 20a2 2 0 0 0 4 0"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          {unread > 0 && <span className="nav-bell-badge">{unread}</span>}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" />
        <Drawer.Content className="chat-drawer">
          <Drawer.Title className="sr-only">{t('inboxTitle')}</Drawer.Title>
          <div className="chat-drawer-handle" />
          <div className="chat-drawer-body">
            <ChatPanel
              mode="admin"
              open={open}
              onClose={() => setOpen(false)}
              onStateChange={(n) => setUnread(n)}
            />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
