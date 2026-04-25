import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { ContactForm } from '@/modules/support/ui/contact-form'

export default async function NuevoMensajePage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <Link href="/preguntanos" className="text-xs text-muted hover:text-white">
        ← Volver
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Nuevo mensaje</h1>
        <p className="text-muted text-sm mt-1">
          Te respondemos lo antes posible al correo y aquí mismo.
        </p>
      </div>

      <div className="glass rounded-xl p-5">
        <ContactForm />
      </div>
    </div>
  )
}
