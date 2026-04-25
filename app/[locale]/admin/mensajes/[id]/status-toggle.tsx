'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { toggleThreadStatus } from '@/modules/support/application/toggle-thread-status'

export function StatusToggle({
  threadId,
  status,
}: {
  threadId: string
  status: 'open' | 'closed'
}) {
  const [pending, start] = useTransition()
  const t = useTranslations('admin.thread')
  const next = status === 'open' ? 'closed' : 'open'

  return (
    <button
      type="button"
      onClick={() =>
        start(async () => {
          await toggleThreadStatus(threadId, next)
        })
      }
      disabled={pending}
      className="text-[10px] uppercase tracking-wider text-muted hover:text-white disabled:opacity-50"
    >
      {pending ? '…' : status === 'open' ? t('closeButton') : t('reopenButton')}
    </button>
  )
}
