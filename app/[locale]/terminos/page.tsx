import type { Metadata } from 'next'
import { useTranslations } from 'next-intl'
import { Link } from '@/shared/i18n/routing'
import { SITE_URL } from '@/shared/seo/site'
import { LanguageSwitcher } from '@/shared/i18n/components/language-switcher'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isEn = locale === 'en'
  const esPath = '/terminos'
  const enPath = '/en/terms'
  const selfPath = isEn ? enPath : esPath

  return {
    title: isEn ? 'Terms and Conditions' : 'Términos y Condiciones',
    description: isEn
      ? 'ATHLEX Training terms and conditions. Service use, subscription, and cancellation terms.'
      : 'Términos y condiciones de ATHLEX Training. Condiciones de uso, suscripción y cancelación del servicio.',
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

export default function TerminosPage() {
  const t = useTranslations('terms')
  return (
    <div className="min-h-screen px-5 py-12 sm:py-16">
      <article className="mx-auto w-full max-w-2xl space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-white">{t('title')}</h1>
          <p className="text-xs uppercase tracking-wider opacity-70">
            {t('lastUpdatedLabel')}: {t('lastUpdated')}
          </p>
        </header>

        <Section title={t('sections.whoWeAre.title')}>
          <p>
            {t('sections.whoWeAre.body')}
          </p>
        </Section>

        <Section title={t('sections.acceptance.title')}>
          <p>
            {t('sections.acceptance.bodyPrefix')}
            <Link href="/privacidad" className="text-[var(--accent-green)] underline">
              {t('sections.acceptance.policyLinkText')}
            </Link>
            {t('sections.acceptance.bodySuffix')}
          </p>
        </Section>

        <Section title={t('sections.minimumAge.title')}>
          <p>
            {t('sections.minimumAge.body')}
          </p>
        </Section>

        <Section title={t('sections.subscriptionPayment.title')}>
          <ul className="list-disc space-y-1 pl-5">
            <li>{t('sections.subscriptionPayment.item1')}</li>
            <li>{t('sections.subscriptionPayment.item2')}</li>
            <li>{t('sections.subscriptionPayment.item3')}</li>
            <li>{t('sections.subscriptionPayment.item4')}</li>
          </ul>
        </Section>

        <Section title={t('sections.contentUsage.title')}>
          <p>
            {t('sections.contentUsage.body')}
          </p>
        </Section>

        <Section title={t('sections.trainingRisks.title')}>
          <p>
            {t('sections.trainingRisks.body')}
          </p>
        </Section>

        <Section title={t('sections.userConduct.title')}>
          <p>
            {t('sections.userConduct.body')}
          </p>
        </Section>

        <Section title={t('sections.suspensionCancellation.title')}>
          <p>
            {t('sections.suspensionCancellation.body')}
          </p>
        </Section>

        <Section title={t('sections.availability.title')}>
          <p>
            {t('sections.availability.body')}
          </p>
        </Section>

        <Section title={t('sections.limitationLiability.title')}>
          <p>
            {t('sections.limitationLiability.body')}
          </p>
        </Section>

        <Section title={t('sections.termsChanges.title')}>
          <p>
            {t('sections.termsChanges.body')}
          </p>
        </Section>

        <Section title={t('sections.applicableLaw.title')}>
          <p>
            {t('sections.applicableLaw.body')}
          </p>
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
