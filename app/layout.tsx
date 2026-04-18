import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Navbar } from "./navbar";
import { NavbarSkeleton } from "./navbar-skeleton";

const league_spartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // Ajusta los pesos según lo necesario
});

export const metadata: Metadata = {
  title: "ATHX Coaching",
  description:
    "Programa de entrenamiento para preparar ATHX 2026. Diseñado por atletas, ejecutado por ti.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${league_spartan.variable} h-full antialiased`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        <Suspense fallback={<NavbarSkeleton />}>
          <Navbar />
        </Suspense>
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
