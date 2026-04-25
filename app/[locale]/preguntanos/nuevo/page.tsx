import { getLocale, getTranslations } from 'next-intl/server'
import { Link, redirect } from '@/shared/i18n/routing'
import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { ContactForm } from '@/modules/support/ui/contact-form'

export default async function NuevoMensajePage() {
  const locale = await getLocale()
  const t = await getTranslations()
  const user = await getCurrentUser()
  if (!user) redirect({ href: '/login', locale })

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-6">
      <Link href="/preguntanos" className="text-xs text-muted hover:text-white">
        {t('preguntanos.new.backLink')}
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{t('preguntanos.new.title')}</h1>
        <p className="text-muted text-sm mt-1">
          {t('preguntanos.new.subtitle')}
        </p>
      </div>

      <div className="glass rounded-xl p-5">
        <ContactForm />
      </div>
    </div>
  )
}
