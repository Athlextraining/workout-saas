import type { Metadata, Viewport } from "next";
import { League_Spartan } from "next/font/google";
import { Suspense } from "react";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  LOCALE_PRIMARY,
  LOCALE_ALTERNATES,
} from "@/shared/seo/site";
import { JsonLd, organizationLd, webSiteLd } from "@/shared/seo/jsonld";
import { routing } from "@/shared/i18n/routing";
import "../globals.css";
import { Navbar } from "./navbar";
import { NavbarSkeleton } from "./navbar-skeleton";
import { NavProgress } from "./nav-progress";
import { ChatBubbleServer } from "./components/chat-bubble-server";
import { Analytics } from "@/shared/analytics/analytics";
import { CookieBanner } from "@/shared/analytics/cookie-banner";

const league_spartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEn = locale === "en";
  const titleDefault = isEn
    ? `${SITE_NAME} — ATHX training and programming`
    : `${SITE_NAME} — Programación y entrenamiento ATHX`;
  const description = isEn
    ? "ATHX™ programming and training for athletes. Weekly plan, progress tracking, and direct chat with your coach. First week free."
    : DEFAULT_DESCRIPTION;
  const keywords = isEn
    ? ["ATHX", "ATHX programming", "ATHX training", "ATHLEX Training", "ATHX prep", "ATHX 2026", "functional fitness training", "competition training"]
    : DEFAULT_KEYWORDS;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: titleDefault,
      template: `%s · ${SITE_NAME}`,
    },
    description,
    keywords,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_NAME, url: SITE_URL }],
    creator: SITE_NAME,
    publisher: SITE_NAME,
    alternates: {
      canonical: isEn ? "/en" : "/",
      languages: {
        es: "/",
        en: "/en",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title: titleDefault,
      description,
      url: isEn ? `${SITE_URL}/en` : SITE_URL,
      locale: isEn ? "en_US" : LOCALE_PRIMARY,
      alternateLocale: isEn ? [LOCALE_PRIMARY] : LOCALE_ALTERNATES,
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
    },
    robots: isEn
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
    formatDetection: { telephone: false, email: false, address: false },
    verification: {
      google: "0I3Tszx3upfC4WQEetpiTU2wA1xGH8AnShOiRiSpULo",
    },
    category: "fitness",
  };
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={`${league_spartan.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <JsonLd data={organizationLd(locale as 'es' | 'en')} />
          <JsonLd data={webSiteLd(locale as 'es' | 'en')} />
          <NavProgress />
          <Suspense fallback={<NavbarSkeleton />}>
            <Navbar />
          </Suspense>
          <main className="flex-1 flex flex-col">{children}</main>
          <Suspense fallback={null}>
            <ChatBubbleServer />
          </Suspense>
          <Analytics />
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
