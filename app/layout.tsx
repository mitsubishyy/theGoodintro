import type { Metadata } from "next";
import Link from "next/link";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import "./globals.css";
import { SITE_URL, SITE_DESCRIPTION, CALENDLY_URL } from "@/lib/config";

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
      className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}
    >
      <body suppressHydrationWarning className="text-foreground bg-background antialiased">
        <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-base font-semibold tracking-tight">
                TheBigIntro
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground border border-border rounded-full px-2 py-0.5">
                <span className="size-1.5 rounded-full pulse-dot" style={{ background: "var(--signal)" }} />
                Founding cohort
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
              <Link href="/how-it-works" className="hover:text-foreground transition-colors">
                How it works
              </Link>
              <Link href="/executives" className="hover:text-foreground transition-colors">
                For executives
              </Link>
              <Link href="/vendors" className="hover:text-foreground transition-colors">
                For vendors
              </Link>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
            <a
              href={CALENDLY_URL}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-sm font-medium pl-4 pr-3 py-2 hover:bg-primary transition-colors"
            >
              Apply
              <ArrowRight className="size-3.5" />
            </a>
          </div>
        </header>

        <main>{children}</main>

        <footer className="border-t border-border bg-card/40 mt-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-10 py-16">
            <div className="grid lg:grid-cols-3 gap-12 mb-16">
              <div>
                <Link href="/" className="text-base font-semibold tracking-tight">
                  TheBigIntro
                </Link>
                <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                  Relevant senior meetings that fund real giving. Australia
                  first. Invite only.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="size-1.5 rounded-full" style={{ background: "var(--signal)" }} />
                  Now accepting applications
                </div>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
                  Explore
                </div>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/how-it-works" className="hover:text-foreground transition-colors text-muted-foreground">How it works</Link></li>
                  <li><Link href="/executives" className="hover:text-foreground transition-colors text-muted-foreground">For executives</Link></li>
                  <li><Link href="/vendors" className="hover:text-foreground transition-colors text-muted-foreground">For vendors</Link></li>
                  <li><Link href="/about" className="hover:text-foreground transition-colors text-muted-foreground">About</Link></li>
                  <li><Link href="/opportunity" className="hover:text-foreground transition-colors text-muted-foreground">Partner with us</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-4">
                  Legal
                </div>
                <ul className="space-y-3 text-sm">
                  <li><Link href="/privacy" className="hover:text-foreground transition-colors text-muted-foreground">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-foreground transition-colors text-muted-foreground">Terms</Link></li>
                  <li>
                    <a href={CALENDLY_URL} className="hover:text-foreground transition-colors text-muted-foreground inline-flex items-center gap-1">
                      Contact
                      <ArrowUpRight className="size-3" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <span>EST · 2026 · Australia</span>
              <span>© TheBigIntro</span>
            </div>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
