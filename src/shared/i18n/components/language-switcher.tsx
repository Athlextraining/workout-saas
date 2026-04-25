'use client';

import { useTransition } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/shared/i18n/routing';
import { updateProfileLocale } from '@/modules/identity/application/update-profile-locale';

type Variant = 'inline' | 'menu-row' | 'footer';

interface Props {
  variant?: Variant;
}

export function LanguageSwitcher({ variant = 'inline' }: Props) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();

  const otherLocale = locale === 'es' ? 'en' : 'es';

  function switchTo(target: 'es' | 'en') {
    if (target === locale) return;
    document.cookie = `NEXT_LOCALE=${target}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    // Fire-and-forget: anonymous users get a no-op response.
    updateProfileLocale(target).catch(() => {});
    startTransition(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      router.replace({ pathname, params } as any, { locale: target });
    });
  }

  if (variant === 'menu-row') {
    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-xs uppercase tracking-wider text-muted">{t('label')}</span>
        <div className="flex items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => switchTo('es')}
            disabled={isPending}
            className={`px-2 py-1 rounded ${locale === 'es' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
            aria-pressed={locale === 'es'}
          >
            ES
          </button>
          <span className="text-muted">·</span>
          <button
            type="button"
            onClick={() => switchTo('en')}
            disabled={isPending}
            className={`px-2 py-1 rounded ${locale === 'en' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
            aria-pressed={locale === 'en'}
          >
            EN
          </button>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={() => switchTo(otherLocale)}
        disabled={isPending}
        className="text-xs text-muted hover:text-white transition-colors"
        aria-label={t('switchTo', { lang: otherLocale === 'es' ? t('spanish') : t('english') })}
      >
        {otherLocale === 'es' ? 'ES' : 'EN'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      <button
        type="button"
        onClick={() => switchTo('es')}
        disabled={isPending}
        className={`px-1.5 py-0.5 rounded ${locale === 'es' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
        aria-pressed={locale === 'es'}
        aria-label={t('switchTo', { lang: t('spanish') })}
      >
        ES
      </button>
      <span className="text-muted">|</span>
      <button
        type="button"
        onClick={() => switchTo('en')}
        disabled={isPending}
        className={`px-1.5 py-0.5 rounded ${locale === 'en' ? 'text-white font-semibold' : 'text-muted hover:text-white'}`}
        aria-pressed={locale === 'en'}
        aria-label={t('switchTo', { lang: t('english') })}
      >
        EN
      </button>
    </div>
  );
}
