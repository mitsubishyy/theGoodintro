"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CALENDLY_URL } from "@/lib/config";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/executives", label: "Executives" },
  { href: "/vendors", label: "Vendors" },
  { href: "/giving", label: "Giving" },
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const bare = pathname === "/apply";

  /**
   * Reveal an emerald hairline below the nav once the page is scrolled.
   * Class toggles on body so the rule lives in globals.css next to the nav.
   */
  useEffect(() => {
    const onScroll = () => {
      document.body.classList.toggle("hp-is-scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="hp-topnav" aria-label="Primary">
      <Link href="/" className="hp-brand">
        <span className="hp-brand-mark" aria-hidden="true" />
        <span>
          the<span className="it">Good</span>intro
        </span>
      </Link>

      {!bare && (
        <>
          <div className="hp-nav-links">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
          <div className="hp-nav-actions">
            <a className="hp-nav-cta" href={CALENDLY_URL}>
              Apply
              <span className="arrow" aria-hidden="true">
                <svg viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 8 L8 2 M3.5 2 H8 V6.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
        </>
      )}
    </nav>
  );
}
