'use client'

import { useFormStatus } from 'react-dom'
import { Spinner } from '../spinner'

export function SignOutButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 rounded-xl text-red-400 glass hover:bg-white/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      {pending && <Spinner size={18} />}
      {pending ? 'Cerrando sesion...' : 'Cerrar sesion'}
    </button>
  )
}
