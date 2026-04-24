import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import { Suspense } from "react";
import { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION } from "@/shared/seo/site";
import "./globals.css";
import { Navbar } from "./navbar";
import { NavbarSkeleton } from "./navbar-skeleton";
import { NavProgress } from "./nav-progress";
import { ChatBubbleServer } from "./components/chat-bubble-server";

const league_spartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Ajusta los pesos según lo necesario
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Entrenamiento ATHX`,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  verification: {
    google: "0I3Tszx3upfC4WQEetpiTU2wA1xGH8AnShOiRiSpULo",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${league_spartan.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <NavProgress />
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
        <Suspense fallback={null}>
          <ChatBubbleServer />
        </Suspense>
      </body>
    </html>
  );
}
