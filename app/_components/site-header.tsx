"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CALENDLY_URL } from "@/lib/config";

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
              "TheBigIntro"
            )}
          </span>
          {!bare && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.16em] text-muted-foreground border border-border rounded-full px-2 py-0.5">
              <span
                className="size-1.5 rounded-full pulse-dot"
                style={{ background: "var(--signal)" }}
              />
              Founding cohort
            </span>
          )}
        </Link>

        {!bare && (
          <>
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
          </>
        )}
      </div>
    </header>
  );
}
