import type { Metadata } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/config";
import SiteHeader from "./_components/site-header";
import SiteFooter from "./_components/site-footer";
import PageTransition from "./_components/PageTransition";
import PageShell from "./_components/page-shell";
import { OrganizationJsonLd } from "./_components/json-ld";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TheGoodIntro. Meetings that fund what matters.",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "TheGoodIntro. Meetings that fund what matters.",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "TheGoodIntro",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheGoodIntro. Meetings that fund what matters.",
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}
    >
      <body suppressHydrationWarning className="text-foreground bg-background antialiased">
        <OrganizationJsonLd />
        <PageShell>
          <SiteHeader />
          <main>
            <PageTransition>{children}</PageTransition>
          </main>
          <SiteFooter />
        </PageShell>
        <Analytics />
      </body>
    </html>
  );
}
