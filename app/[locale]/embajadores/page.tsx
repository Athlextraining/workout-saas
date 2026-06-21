import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ApplicationForm } from "@/modules/ambassadors/ui/application-form";
import { SITE_URL } from "@/shared/seo/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ambassadors" });
  const isEn = locale === "en";
  const esPath = "/embajadores";
  const enPath = "/en/ambassadors";
  const selfPath = isEn ? enPath : esPath;

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
    robots: { index: true, follow: true },
    alternates: {
      canonical: `${SITE_URL}${selfPath}`,
      languages: {
        es: `${SITE_URL}${esPath}`,
        en: `${SITE_URL}${enPath}`,
        "x-default": `${SITE_URL}${esPath}`,
      },
    },
    openGraph: {
      type: "article",
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: `${SITE_URL}${selfPath}`,
      locale: isEn ? "en_US" : "es_ES",
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ambassadors" });

  const steps = t.raw("sections.howItWorks.steps") as string[];
  const criteria = t.raw("sections.criteria.items") as string[];

  return (
    <article className="mx-auto max-w-2xl px-6 py-16 space-y-10">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-accent">{t("eyebrow")}</p>
        <h1 className="text-4xl font-bold leading-tight">{t("title")}</h1>
        <p className="text-muted text-lg">{t("intro")}</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t("sections.about.title")}</h2>
        <p>{t("sections.about.body")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t("sections.howItWorks.title")}</h2>
        <ol className="space-y-3 list-decimal list-inside">
          {steps.map((step, i) => (
            <li key={i} className="text-base leading-snug">
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t("sections.criteria.title")}</h2>
        <ul className="space-y-3">
          {criteria.map((item, i) => (
            <li key={i} className="flex items-start gap-3 border-l-2 border-accent/40 pl-4">
              <span className="text-base leading-snug">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 border-t border-white/10 pt-10">
        <h2 className="text-2xl font-semibold">{t("form.title")}</h2>
        <ApplicationForm />
      </section>
    </article>
  );
}
