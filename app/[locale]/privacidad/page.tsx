import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { SITE_URL } from '@/shared/seo/site'
import { LanguageSwitcher } from '@/shared/i18n/components/language-switcher'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isEn = locale === 'en'
  const esPath = '/privacidad'
  const enPath = '/en/privacy'
  const selfPath = isEn ? enPath : esPath

  return {
    title: isEn ? 'Privacy Policy' : 'Política de privacidad',
    description: isEn
      ? 'ATHLEX Training privacy policy. How we handle your personal data in the ATHX programming service.'
      : 'Política de privacidad de ATHLEX Training. Cómo tratamos tus datos personales en el servicio de programación ATHX.',
    alternates: {
      canonical: `${SITE_URL}${selfPath}`,
      languages: {
        es: `${SITE_URL}${esPath}`,
        en: `${SITE_URL}${enPath}`,
        'x-default': `${SITE_URL}${esPath}`,
      },
    },
    robots: { index: true, follow: true },
  }
}

export default async function PrivacidadPage() {
  const t = await getTranslations('privacy')
  return (
    <div className="min-h-screen px-5 py-12 sm:py-16">
      <article className="mx-auto w-full max-w-2xl space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-xs uppercase tracking-wider opacity-70">
            {t('lastUpdatedLabel')}: {t('lastUpdated')}
          </p>
        </header>

        <Section title={t('sections.responsible.title')}>
          <p>{t('sections.responsible.body')}</p>
        </Section>

        <Section title={t('sections.dataCollected.title')}>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('sections.dataCollected.itemRegistration')}</li>
            <li>{t('sections.dataCollected.itemProfile')}</li>
            <li>{t('sections.dataCollected.itemSubscription')}</li>
            <li>{t('sections.dataCollected.itemTechnical')}</li>
          </ul>
        </Section>

        <Section title={t('sections.purposes.title')}>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('sections.purposes.itemTraining')}</li>
            <li>{t('sections.purposes.itemManage')}</li>
            <li>{t('sections.purposes.itemCommunicate')}</li>
          </ul>
        </Section>

        <Section title={t('sections.legalBasis.title')}>
          <p>{t('sections.legalBasis.body')}</p>
        </Section>

        <Section title={t('sections.providers.title')}>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('sections.providers.itemSupabase')}</li>
            <li>{t('sections.providers.itemStripe')}</li>
            <li>{t('sections.providers.itemResend')}</li>
            <li>{t('sections.providers.itemVercel')}</li>
            <li>{t('sections.providers.itemGoogle')}</li>
          </ul>
          <p className="mt-2">{t('sections.providers.footer')}</p>
        </Section>

        <Section title={t('sections.retention.title')}>
          <p>{t('sections.retention.body')}</p>
        </Section>

        <Section title={t('sections.rights.title')}>
          <p>{t('sections.rights.body')}</p>
        </Section>

        <Section title={t('sections.cookies.title')}>
          <p>{t('sections.cookies.body')}</p>
        </Section>

        <Section title={t('sections.changes.title')}>
          <p>{t('sections.changes.body')}</p>
        </Section>
      </article>
      <div className="mx-auto w-full max-w-2xl mt-12 pt-6 border-t border-white/10 flex justify-center">
        <LanguageSwitcher variant="footer" />
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {children}
    </section>
  )
}
