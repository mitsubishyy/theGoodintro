import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/config";
import SiteHeader from "./_components/site-header";
import SiteFooter from "./_components/site-footer";
import PageTransition from "./_components/PageTransition";
import PageShell from "./_components/page-shell";
import { OrganizationJsonLd, WebSiteJsonLd } from "./_components/json-ld";

// Search-engine verification tokens are pasted into Vercel env (not secret).
// When unset, nothing is emitted, so this is safe to ship before they exist.
const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const bingVerification = process.env.BING_SITE_VERIFICATION;

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
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}),
  },
};

export const viewport: Viewport = {
  themeColor: "#1f7a47",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-AU"
      className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}
    >
      <body suppressHydrationWarning className="text-foreground bg-background antialiased">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
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
