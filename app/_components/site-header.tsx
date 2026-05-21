"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CALENDLY_URL } from "@/lib/config";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/vendors", label: "Vendors" },
  { href: "/giving", label: "Giving" },
  { href: "/about", label: "About" },
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
            <a
              className="hp-nav-phone"
              href="mailto:hello@thegoodintro.com"
              aria-label="Contact us"
            >
              <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M3.2 1.8 H5.0 L6 4.4 L4.6 5.4 C5.2 7.1 6.6 8.4 8.4 9 L9.4 7.6 L12 8.6 V10.4 C12 11.0 11.5 11.5 10.9 11.5 C5.9 11.2 2.4 7.7 2.1 2.7 C2.1 2.1 2.6 1.6 3.2 1.8 Z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </a>
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
