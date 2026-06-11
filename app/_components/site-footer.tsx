"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/executives", label: "Executives" },
  { href: "/vendors", label: "Vendors" },
  { href: "/giving", label: "Giving" },
  { href: "/charities", label: "Charities" },
  { href: "/ledger", label: "Ledger" },
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
          <Link href="/" className="hp-brand" aria-label="TheGoodIntro home">
            <Image
              src="/brand/wordmark.png"
              alt="TheGoodIntro"
              width={750}
              height={168}
              className="h-8 w-auto"
            />
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
          <p className="hp-footer-meta">
            &copy; 2026 TheGoodIntro &middot; ABN 59 398 447 638
          </p>
        </div>
      </div>
    </footer>
  );
}
