'use client'

import { useState } from 'react'
import { Spinner } from '../spinner'

interface SubscribeButtonProps {
  className?: string
  label?: string
}

export function SubscribeButton({
  className = "mt-2 px-4 py-2 bg-black text-white rounded-md text-sm hover:bg-gray-800",
  label = "Suscribirse",
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    if (loading) return
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
        return
      }
      console.error('Checkout error:', data.error)
      alert(data.error || 'Error al crear la sesion de pago')
    } catch (err) {
      console.error('Fetch error:', err)
      alert('Error de conexion')
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
      {loading ? 'Redirigiendo...' : label}
    </button>
  )
}
