import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL, SITE_DESCRIPTION, CALENDLY_URL } from "@/lib/config";

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
    <html lang="en">
      <body suppressHydrationWarning>
        <header>
          <Link href="/">TheBigIntro</Link>
          <nav>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/executives">For executives</Link>
            <Link href="/vendors">For vendors</Link>
            <Link href="/about">About</Link>
            <a href={CALENDLY_URL}>Apply</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>TheBigIntro · relevant senior meetings that fund real giving</p>
          <nav>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/executives">For executives</Link>
            <Link href="/vendors">For vendors</Link>
            <Link href="/about">About</Link>
            <Link href="/opportunity">Partner with us</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </nav>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
