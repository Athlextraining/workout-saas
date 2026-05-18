'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { sendNewMessage } from '../application/send-new-message'
import { SUBJECT_MAX, BODY_MAX } from '../domain/validators'

export function ContactForm() {
  const t = useTranslations()
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await sendNewMessage({ subject, body })
      if (res.error) {
        setError(res.error)
      }
    })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-muted" htmlFor="subject">
          {t('support.form.subjectLabel')}
        </label>
        <input
          id="subject"
          type="text"
          maxLength={SUBJECT_MAX}
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={t('support.form.subjectPlaceholder')}
          className="input-glass w-full px-4 py-3 rounded-xl text-sm"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs uppercase tracking-wider text-muted" htmlFor="body">
          {t('support.form.bodyLabel')}
        </label>
        <textarea
          id="body"
          rows={6}
          maxLength={BODY_MAX}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={t('support.form.bodyPlaceholder')}
          className="input-glass w-full px-4 py-3 rounded-xl text-sm resize-y"
        />
        <div className="text-[10px] text-muted text-right">
          {body.length}/{BODY_MAX}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !subject.trim() || !body.trim()}
        className="w-full py-3.5 rounded-xl text-base font-semibold btn-gradient disabled:opacity-50"
      >
        {pending ? t('support.form.submitNewSending') : t('support.form.submitNew')}
      </button>
    </form>
  )
}
