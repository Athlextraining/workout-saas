import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/routing";
import { JsonLd, faqPageLd } from "@/shared/seo/jsonld";
import { SITE_URL } from "@/shared/seo/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "queEsAthx" });
  const isEn = locale === "en";
  const esPath = "/que-es-athx";
  const enPath = "/en/what-is-athx";
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
  const t = await getTranslations({ locale, namespace: "queEsAthx" });

  const faqItems = [
    {
      question: t("faq.items.q1.question"),
      answer: t("faq.items.q1.answer"),
    },
    {
      question: t("faq.items.q2.question"),
      answer: t("faq.items.q2.answer"),
    },
    {
      question: t("faq.items.q3.question"),
      answer: t("faq.items.q3.answer"),
    },
    {
      question: t("faq.items.q4.question"),
      answer: t("faq.items.q4.answer"),
    },
    {
      question: t("faq.items.q5.question"),
      answer: t("faq.items.q5.answer"),
    },
  ];

  return (
    <article className="mx-auto max-w-2xl px-6 py-16 space-y-10">
      <JsonLd data={faqPageLd(faqItems, locale as 'es' | 'en')} />

      <header className="space-y-4">
        <p className="text-sm uppercase tracking-widest text-accent">{t("eyebrow")}</p>
        <h1 className="text-4xl font-bold leading-tight">
          {t("title")}
        </h1>
        <p className="text-muted text-lg" dangerouslySetInnerHTML={{ __html: t("intro") }} />
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t("sections.format.title")}</h2>
        <p dangerouslySetInnerHTML={{ __html: t("sections.format.body") }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {t("sections.programming.title")}
        </h2>
        <p dangerouslySetInnerHTML={{ __html: t("sections.programming.body1") }} />
        <p dangerouslySetInnerHTML={{ __html: t("sections.programming.body2") }} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {t("faq.title")}
        </h2>
        <div className="space-y-3">
          {faqItems.map((item) => (
            <details key={item.question} className="glass rounded-xl px-5 py-4 group">
              <summary className="text-sm font-medium list-none flex items-center justify-between cursor-pointer">
                <span>{item.question}</span>
                <span className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-muted text-sm mt-3 leading-relaxed">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="space-y-4 border-t border-white/10 pt-10">
        <h2 className="text-2xl font-semibold">{t("cta.title")}</h2>
        <p>
          {t("cta.body")}
        </p>
        <Link
          href="/login"
          className="block w-full text-center py-3.5 rounded-xl text-base font-semibold btn-gradient"
        >
          {t("cta.button")}
        </Link>
      </section>
    </article>
  );
}
