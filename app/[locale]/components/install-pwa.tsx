'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Drawer } from 'vaul'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Platform = 'android' | 'ios' | 'desktop' | 'unknown'
type IosBrowser = 'safari' | 'other' | 'inapp'

function detectPlatform(): Platform {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return 'android'
  if (/iphone|ipad|ipod/.test(ua)) return 'ios'
  if (/macintosh/.test(ua) && navigator.maxTouchPoints > 1) return 'ios'
  return 'desktop'
}

function detectIosBrowser(): IosBrowser {
  if (typeof navigator === 'undefined') return 'safari'
  const ua = navigator.userAgent
  // In-app browsers
  if (/FBAN|FBAV|Instagram|Line|Twitter|TikTok|GSA/.test(ua)) return 'inapp'
  // Other browsers (Chrome, Firefox, Edge, Opera on iOS)
  if (/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua)) return 'other'
  return 'safari'
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  // iOS Safari legacy
  return Boolean((window.navigator as unknown as { standalone?: boolean }).standalone)
}

interface Props {
  variant?: 'card' | 'inline' | 'menu-row'
  showHint?: boolean
  nested?: boolean
  onBeforeInstall?: () => void
}

export function InstallPwa({ variant = 'card', showHint = false, nested = false, onBeforeInstall }: Props) {
  const t = useTranslations('installPwa')
  const [platform, setPlatform] = useState<Platform>('unknown')
  const [iosBrowser, setIosBrowser] = useState<IosBrowser>('safari')
  const [installed, setInstalled] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [iosOpen, setIosOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setPlatform(detectPlatform())
    setIosBrowser(detectIosBrowser())
    setInstalled(isStandalone())

    // Register service worker so Chrome fires beforeinstallprompt
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferred(null)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (installed) return null
  if (platform === 'desktop' || platform === 'unknown') {
    // Only render if Chrome desktop fired the prompt
    if (!deferred) return null
  }

  async function handleClick() {
    onBeforeInstall?.()
    if (platform === 'ios') {
      setIosOpen(true)
      return
    }
    if (deferred) {
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferred(null)
    }
  }

  // Android with no prompt yet → don't show button (criteria not met)
  if (platform === 'android' && !deferred) return null

  const button = (
    <button
      type="button"
      onClick={handleClick}
      className={
        variant === 'card'
          ? 'w-full py-3.5 rounded-xl text-base font-semibold btn-gradient flex items-center justify-center gap-2'
          : variant === 'menu-row'
          ? 'nav-drawer-item w-full text-left'
          : 'w-full py-3 rounded-xl text-sm font-semibold btn-gradient flex items-center justify-center gap-2'
      }
    >
      <DownloadIcon />
      {variant === 'menu-row' ? <span>{t('button')}</span> : t('button')}
    </button>
  )

  return (
    <>
      {variant === 'card' ? (
        <div className="glass rounded-xl p-5 space-y-3">
          <div>
            <p className="text-sm text-muted">{t('eyebrow')}</p>
            <p className="font-semibold">{t('title')}</p>
            <p className="text-sm text-muted mt-1">{t('description')}</p>
          </div>
          {button}
        </div>
      ) : variant === 'menu-row' ? (
        button
      ) : (
        <div className="space-y-2">
          {button}
          {showHint && (
            <p className="text-xs text-muted text-center">{t('hintProfile')}</p>
          )}
        </div>
      )}

      <IosDrawer nested={false} open={iosOpen} onOpenChange={setIosOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl bg-[var(--bg-primary)] border-t border-white/10 p-6 pb-safe-bottom">
            <Drawer.Title className="text-lg font-semibold mb-2">
              {iosBrowser === 'safari'
                ? t('ios.title')
                : iosBrowser === 'inapp'
                ? t('ios.notSafari.titleInApp')
                : t('ios.notSafari.title')}
            </Drawer.Title>
            <Drawer.Description className="sr-only">
              {t('ios.description')}
            </Drawer.Description>

            {iosBrowser === 'safari' ? (
              <ol className="space-y-4 text-sm mt-4">
                <li className="flex gap-3">
                  <Step n={1} />
                  <span>
                    {t.rich('ios.step1', {
                      icon: () => (
                        <ShareIcon className="inline-block align-text-bottom mx-1" />
                      ),
                    })}
                  </span>
                </li>
                <li className="flex gap-3">
                  <Step n={2} />
                  <span>{t('ios.step2')}</span>
                </li>
                <li className="flex gap-3">
                  <Step n={3} />
                  <span>{t('ios.step3')}</span>
                </li>
              </ol>
            ) : (
              <div className="space-y-4 mt-2">
                <p className="text-sm text-muted">
                  {iosBrowser === 'inapp'
                    ? t('ios.notSafari.bodyInApp')
                    : t('ios.notSafari.body')}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.origin)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch {}
                  }}
                  className="w-full py-3 rounded-xl btn-gradient text-sm font-semibold"
                >
                  {copied ? t('ios.copied') : t('ios.copyLink')}
                </button>
                <ol className="space-y-3 text-sm pt-2 border-t border-white/10">
                  <li className="flex gap-3">
                    <Step n={1} />
                    <span>{t('ios.notSafari.step1')}</span>
                  </li>
                  <li className="flex gap-3">
                    <Step n={2} />
                    <span>{t('ios.notSafari.step2')}</span>
                  </li>
                  <li className="flex gap-3">
                    <Step n={3} />
                    <span>{t('ios.notSafari.step3')}</span>
                  </li>
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => setIosOpen(false)}
              className="mt-6 w-full py-3 rounded-xl border border-white/15 text-sm font-medium"
            >
              {t('ios.close')}
            </button>
          </Drawer.Content>
        </Drawer.Portal>
      </IosDrawer>
    </>
  )
}

function Step({ n }: { n: number }) {
  return (
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-black text-xs font-bold flex items-center justify-center">
      {n}
    </span>
  )
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IosDrawer({
  nested,
  open,
  onOpenChange,
  children,
}: {
  nested: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}) {
  if (nested) {
    return (
      <Drawer.NestedRoot open={open} onOpenChange={onOpenChange}>
        {children}
      </Drawer.NestedRoot>
    )
  }
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Drawer.Root>
  )
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M12 3v12M12 3l-4 4M12 3l4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
