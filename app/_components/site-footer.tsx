"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { CALENDLY_URL } from "@/lib/config";

export default function SiteFooter() {
  const pathname = usePathname();
  // The survey is a focused, distraction-free page: no footer nav.
  if (pathname === "/apply") return null;

  return (
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
  );
}
