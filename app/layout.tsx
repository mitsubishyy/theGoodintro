import type { Metadata } from "next";
import {
  Fraunces,
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  EB_Garamond,
  Cormorant_Garamond,
  Libre_Caslon_Text,
  Crimson_Pro,
  Source_Serif_4,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/config";
import SiteHeader from "./_components/site-header";
import SiteFooter from "./_components/site-footer";
import PageTransition from "./_components/PageTransition";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const libreCaslon = Libre_Caslon_Text({
  variable: "--font-libre-caslon",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson-pro",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
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
  title: "theGoodintro. Meetings that fund what matters.",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "theGoodintro. Meetings that fund what matters.",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "theGoodintro",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "theGoodintro. Meetings that fund what matters.",
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
      className={`${fraunces.variable} ${playfair.variable} ${ebGaramond.variable} ${cormorant.variable} ${libreCaslon.variable} ${crimsonPro.variable} ${sourceSerif.variable} ${inter.variable} ${mono.variable}`}
    >
      <body suppressHydrationWarning className="text-foreground bg-background antialiased">
        <SiteHeader />

        <main>
          <PageTransition>{children}</PageTransition>
        </main>

        <SiteFooter />

        <Analytics />
      </body>
    </html>
  );
}
