'use client'

import { useState, useTransition } from 'react'
import { useRouter } from '@/shared/i18n/routing'
import { replyToThread } from '../application/reply-to-thread'
import { BODY_MAX } from '../domain/validators'

export function ReplyForm({ threadId, closed }: { threadId: string; closed?: boolean }) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await replyToThread({ threadId, body })
      if (res.error) {
        setError(res.error)
        return
      }
      setBody('')
      router.refresh()
    })
  }

  if (closed) {
    return (
      <p className="text-sm text-muted text-center italic">
        Este hilo está cerrado. Abre uno nuevo si necesitas algo más.
      </p>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <textarea
        rows={3}
        maxLength={BODY_MAX}
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Escribe tu respuesta…"
        className="input-glass w-full px-4 py-3 rounded-xl text-sm resize-y"
      />
      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending || !body.trim()}
        className="w-full py-3 rounded-xl text-sm font-semibold btn-gradient disabled:opacity-50"
      >
        {pending ? 'Enviando…' : 'Enviar respuesta'}
      </button>
    </form>
  )
}
