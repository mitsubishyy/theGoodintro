"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/executives", label: "Executives" },
  { href: "/vendors", label: "Vendors" },
  { href: "/giving", label: "Giving" },
  { href: "/pricing", label: "Pricing" },
];

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function SiteFooter() {
  const pathname = usePathname();
  if (pathname === "/apply") return null;

  return (
    <footer className="hp-footer">
      <div className="hp-footer-grid">
        <div className="hp-footer-brand">
          <Link href="/" className="hp-brand">
            <span className="hp-brand-mark" aria-hidden="true" />
            <span>
              the<span className="it">Good</span>intro
            </span>
          </Link>
          <p className="hp-footer-tag">
            Senior introductions that fund Australian charities.
          </p>
        </div>

        <ul className="hp-footer-links" aria-label="Explore">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
          {LEGAL.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>

        <div className="hp-footer-contact">
          <a
            className="hp-footer-email"
            href="mailto:issy@thegoodintros.com"
          >
            issy@thegoodintros.com
          </a>
          <p className="hp-footer-meta">ABN pending registration</p>
          <p className="hp-footer-meta">&copy; 2026 theGoodintro Pty Ltd</p>
        </div>
      </div>
    </footer>
  );
}
