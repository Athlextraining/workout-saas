import type { Metadata } from 'next'
import { getLocale, getTranslations, getFormatter } from 'next-intl/server'
import { redirect } from '@/shared/i18n/routing'
import { getCurrentUser } from '@/modules/identity/application/get-current-user'
import { getCurrentProfile } from '@/modules/identity/application/get-current-profile'
import { signOut } from '@/modules/identity/application/sign-out'
import { getActiveSubscription } from '@/modules/billing/infra/subscription-repository'
import { PortalButton } from './portal-button'
import { SignOutButton } from './sign-out-button'
import { InstallPwa } from '../components/install-pwa'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export default async function PerfilPage() {
  const locale = await getLocale()
  const t = await getTranslations('perfil')
  const format = await getFormatter()
  const user = await getCurrentUser()
  if (!user) {
    redirect({ href: '/login', locale })
    return null
  }

  const profile = await getCurrentProfile()
  const subscription = await getActiveSubscription(user.id)

  return (
    <div className="max-w-lg mx-auto py-12 px-4 space-y-8">
      <h1 className="text-2xl font-bold">{t('title')}</h1>

      <div className="glass rounded-xl p-5 space-y-3">
        <p>
          <span className="text-muted text-sm">{t('fields.email')}</span>
          <br />
          {user.email}
        </p>
        <div className="border-t border-white/10" />
        <p>
          <span className="text-muted text-sm">{t('fields.subscription')}</span>
          <br />
          {subscription ? (
            <span className="text-green-400">{t('status.active')}</span>
          ) : (
            <span className="text-muted">{t('status.none')}</span>
          )}
        </p>
        {subscription && (
          <>
            <div className="border-t border-white/10" />
            <p>
              <span className="text-muted text-sm">{t('fields.nextRenewal')}</span>
              <br />
              {subscription.current_period_end
                ? format.dateTime(new Date(subscription.current_period_end), { dateStyle: 'long' })
                : '—'}
            </p>
          </>
        )}
        <div className="border-t border-white/10" />
        <p>
          <span className="text-muted text-sm">{t('fields.language')}</span>
          <br />
          {profile?.locale === 'en' ? 'English' : 'Español'}
        </p>
      </div>

      <InstallPwa variant="card" />

      <div className="space-y-3">
        {subscription && <PortalButton />}

        <form action={signOut}>
          <SignOutButton />
        </form>
      </div>
    </div>
  )
}
