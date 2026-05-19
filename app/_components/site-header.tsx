"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CALENDLY_URL } from "@/lib/config";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/vendors", label: "For vendors" },
  { href: "/pricing", label: "Pricing" },
  { href: "/giving", label: "Giving" },
  { href: "/faq", label: "FAQ" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const bare = pathname === "/apply"; // survey: brand only, no nav

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-base font-semibold tracking-tight">
            {bare ? (
              <>
                the<span style={{ color: "var(--primary)" }}>Good</span>intro
              </>
            ) : (
              <>
                The<span style={{ color: "var(--primary)" }}>Big</span>Intro
              </>
            )}
          </span>
        </Link>

        {!bare && (
          <>
            <nav className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <span
                className="h-4 w-px"
                style={{ background: "var(--border)" }}
                aria-hidden
              />
              <Link
                href="/privacy"
                className="text-xs hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-xs hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </nav>
            <a
              href={CALENDLY_URL}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-sm font-medium pl-4 pr-3 py-2 hover:bg-primary transition-colors"
            >
              Apply
              <ArrowRight className="size-3.5" />
            </a>
          </>
        )}
      </div>
    </header>
  );
}
