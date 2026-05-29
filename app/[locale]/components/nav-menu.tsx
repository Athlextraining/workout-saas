'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { Link } from '@/shared/i18n/routing'
import { Drawer } from 'vaul'
import { LanguageSwitcher } from '@/shared/i18n/components/language-switcher'
import { signOut } from '@/modules/identity/application/sign-out'
import { InstallPwa } from './install-pwa'
import { SubscribeButton } from '../entrenamiento/subscribe-button'

interface Props {
  avatarUrl?: string | null
  emailInitial: string
  isAdmin: boolean
  isSubscribed: boolean
}

export function NavMenu({ avatarUrl, emailInitial, isAdmin, isSubscribed }: Props) {
  const t = useTranslations('nav.menu')
  const [open, setOpen] = useState(false)

  return (
    <Drawer.Root open={open} onOpenChange={setOpen} direction="right">
      <Drawer.Trigger asChild>
        <button
          type="button"
          className="nav-hamburger"
          aria-label={t('ariaLabel')}
        >
          <span className="nav-hamburger-avatar">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{emailInitial.toUpperCase()}</span>
            )}
          </span>
          <svg width="18" height="14" viewBox="0 0 24 18" fill="none" aria-hidden>
            <path d="M3 3h18M3 9h18M3 15h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70]" />
        <Drawer.Content className="nav-drawer">
          <Drawer.Title className="sr-only">{t('title')}</Drawer.Title>
          <div className="nav-drawer-body">
            <div className="nav-drawer-head">
              <span className="text-xs uppercase tracking-[0.18em] text-muted">
                {t('title')}
              </span>
            </div>

            <nav className="flex flex-col">
              <LanguageSwitcher variant="menu-row" />
              <MenuLink
                href="/perfil"
                onNavigate={() => setOpen(false)}
                label={t('profileLink')}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
                    <path
                      d="M4 20c0-4 4-6 8-6s8 2 8 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                }
              />
              {isAdmin && (
                <MenuLink
                  href="/admin/mensajes"
                  onNavigate={() => setOpen(false)}
                  label={t('adminLink')}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <path
                        d="M3 7l9 6 9-6M5 5h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                  }
                />
              )}
              <InstallPwa variant="menu-row" onBeforeInstall={() => setOpen(false)} />
            </nav>

            {!isSubscribed && (
              <div className="pt-4">
                <SubscribeButton
                  className="block w-full py-3 rounded-xl text-sm font-semibold btn-gradient"
                  label={t('subscribeLink')}
                />
              </div>
            )}

            <div className="mt-auto pt-4 border-t border-white/10">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full text-left nav-drawer-item text-red-400 hover:text-red-300"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M15 17l5-5-5-5M20 12H9M12 20H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t('signOut')}
                </button>
              </form>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}

function MenuLink({
  href,
  label,
  icon,
  onNavigate,
}: {
  href: '/perfil' | '/admin/mensajes'
  label: string
  icon: React.ReactNode
  onNavigate: () => void
}) {
  return (
    <Link href={href} onClick={onNavigate} className="nav-drawer-item">
      {icon}
      <span>{label}</span>
    </Link>
  )
}
