'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Spinner } from '../spinner'

export function PortalButton() {
  const t = useTranslations('perfil.actions')
  const [loading, setLoading] = useState(false)

  async function handlePortal() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const { url } = await res.json()
      if (url) {
        window.dispatchEvent(new Event('nav-progress:start'))
        window.location.href = url
        return
      }
    } catch (err) {
      console.error('Portal error:', err)
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handlePortal}
      disabled={loading}
      className="w-full py-3 rounded-xl glass hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {loading && <Spinner size={18} />}
      {loading ? t('managingPortal') : t('managePortal')}
    </button>
  )
}
