import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Nav } from "./_components/nav";
import { Footer } from "./_components/footer";
import { RevealOnScroll } from "./_components/reveal-on-scroll";
import { SITE_URL, SITE_DESCRIPTION } from "@/lib/config";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Display / wordmark face: Fraunces, with italics for the editorial voice.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TheBigIntro. Meetings that fund what matters.",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "TheBigIntro. Meetings that fund what matters.",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "TheBigIntro",
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TheBigIntro. Meetings that fund what matters.",
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
      className={`${inter.variable} ${fraunces.variable}`}
    >
      <body suppressHydrationWarning>
        {/* Set motion-ready before paint so the hero choreography never
            flashes, and only when the visitor has not asked for reduced
            motion. No JS or reduced-motion leaves all content visible. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.classList.add('motion-ready')}}catch(e){}",
          }}
        />
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <RevealOnScroll />
        <Analytics />
      </body>
    </html>
  );
}
