import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_URL } from "@/shared/seo/site";
import { LanguageSwitcher } from "@/shared/i18n/components/language-switcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const esPath = "/cookies";
  const enPath = "/en/cookies";
  const selfPath = isEn ? enPath : esPath;

  return {
    title: isEn ? "Cookie Policy" : "Política de Cookies",
    description: isEn
      ? "ATHLEX Training cookie policy. Which cookies we use and how to manage them."
      : "Política de cookies de ATHLEX Training. Qué cookies usamos y cómo gestionarlas.",
    alternates: {
      canonical: `${SITE_URL}${selfPath}`,
      languages: {
        es: `${SITE_URL}${esPath}`,
        en: `${SITE_URL}${enPath}`,
        "x-default": `${SITE_URL}${esPath}`,
      },
    },
    robots: { index: true, follow: true },
  };
}

export default async function CookiesPage() {
  const t = await getTranslations("cookies.page");

  return (
    <div className="min-h-screen px-5 py-12 sm:py-16">
      <article className="mx-auto w-full max-w-2xl space-y-8 text-sm leading-relaxed text-[var(--text-secondary)]">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold text-white">{t("title")}</h1>
          <p className="text-xs uppercase tracking-wider opacity-70">
            {t("lastUpdatedLabel")}: {t("lastUpdated")}
          </p>
        </header>

        <Section title={t("sections.technical.title")}>
          <p>{t("sections.technical.body")}</p>
        </Section>

        <Section title={t("sections.analytics.title")}>
          <p>{t("sections.analytics.body")}</p>
        </Section>

        <Section title={t("sections.control.title")}>
          <p>{t("sections.control.body")}</p>
        </Section>
      </article>
      <div className="mx-auto w-full max-w-2xl mt-12 pt-6 border-t border-white/10 flex justify-center">
        <LanguageSwitcher variant="footer" />
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {children}
    </section>
  );
}
