'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Spinner } from '../spinner'
import { trackEvent } from '@/shared/analytics/analytics'

interface SubscribeButtonProps {
  className?: string
  label?: string
}

export function SubscribeButton({
  className = "mt-2 px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800",
  label,
}: SubscribeButtonProps) {
  const t = useTranslations('entrenamiento.subscribe')
  const [loading, setLoading] = useState(false)
  const displayLabel = label ?? t('button')

  async function handleSubscribe() {
    if (loading) return
    setLoading(true)
    trackEvent('begin_checkout', { currency: 'EUR', value: 9.8 })
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.dispatchEvent(new Event('nav-progress:start'))
        window.location.href = data.url
        return
      }
      console.error('Checkout error:', data.error)
      alert(data.error || t('errorGeneral'))
    } catch (err) {
      console.error('Fetch error:', err)
      alert(t('errorConnection'))
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className={`${className} disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
    >
      {loading && <Spinner size={18} />}
      {loading ? t('redirecting') : displayLabel}
    </button>
  )
}
