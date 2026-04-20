import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Crab Digital Agency — Цепляем тренды. Держим рынок.",
  description:
    "Digital-агентство полного цикла: SMM, web-разработка, performance и брендинг. Крепкий панцирь стратегии и цепкие клешни исполнения — для брендов, которые растут, меняясь.",
  openGraph: {
    title: "Crab Digital Agency",
    description: "Цепляем тренды. Держим рынок.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="min-h-screen flex flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
