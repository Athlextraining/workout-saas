import type { Metadata, Viewport } from "next";
import { League_Spartan } from "next/font/google";
import { Suspense } from "react";
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  LOCALE_PRIMARY,
  LOCALE_ALTERNATES,
} from "@/shared/seo/site";
import { JsonLd, organizationLd, webSiteLd } from "@/shared/seo/jsonld";
import "./globals.css";
import { Navbar } from "./navbar";
import { NavbarSkeleton } from "./navbar-skeleton";
import { NavProgress } from "./nav-progress";
import { ChatBubbleServer } from "./components/chat-bubble-server";
import { Analytics } from "@/shared/analytics/analytics";

const league_spartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Ajusta los pesos según lo necesario
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Programación y entrenamiento ATHX`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
    languages: {
      "es-ES": "/",
      "es-419": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Programación y entrenamiento ATHX`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    locale: LOCALE_PRIMARY,
    alternateLocale: LOCALE_ALTERNATES,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Programación y entrenamiento ATHX`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
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

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${league_spartan.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <JsonLd data={organizationLd()} />
        <JsonLd data={webSiteLd()} />
        <NavProgress />
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Suspense fallback={null}>
          <ChatBubbleServer />
        </Suspense>
        <Analytics />
      </body>
    </html>
  );
}
