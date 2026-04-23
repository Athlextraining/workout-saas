'use client'

import { useState, useEffect, useCallback } from 'react'
import { Drawer } from 'vaul'
import { ChatPanel } from './chat-panel'

interface Props {
  initialMode: 'anon' | 'user'
}

export function ChatBubble({ initialMode }: Props) {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(0)

  const fetchUnread = useCallback(async () => {
    if (initialMode === 'anon') return
    try {
      const res = await fetch('/api/support/poll', { cache: 'no-store' })
      const json = await res.json()
      if (json.authenticated) setUnread(json.unread ?? 0)
    } catch {}
  }, [initialMode])

  useEffect(() => {
    if (open) return
    fetchUnread()
    const id = setInterval(fetchUnread, 60000)
    return () => clearInterval(id)
  }, [open, fetchUnread])

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="chat-bubble"
          aria-label={
            initialMode === 'anon'
              ? 'Más información'
              : 'Abrir chat con el equipo'
          }
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M21 12a8 8 0 0 1-11.8 7L4 20l1-5.2A8 8 0 1 1 21 12z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          {unread > 0 && <span className="chat-bubble-badge">{unread}</span>}
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" />
        <Drawer.Content className="chat-drawer">
          <Drawer.Title className="sr-only">Chat</Drawer.Title>
          <div className="chat-drawer-handle" />
          <div className="chat-drawer-body">
            <ChatPanel
              mode={initialMode}
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
