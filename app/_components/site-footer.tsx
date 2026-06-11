"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Labelled link groups. "Learn" is the slot for the citable resource pages
// (comparison, definitions, money flow); new public pages get a footer link
// here even when they stay off the top nav.
const GROUPS: { label: string; links: { href: string; label: string }[] }[] = [
  {
    label: "Explore",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/executives", label: "Executives" },
      { href: "/vendors", label: "Vendors" },
      { href: "/pricing", label: "Pricing" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    label: "Giving",
    links: [
      { href: "/giving", label: "Giving" },
      { href: "/charities", label: "Charities" },
      { href: "/ledger", label: "Ledger" },
      { href: "/impact", label: "Impact" },
    ],
  },
  {
    label: "Learn",
    links: [{ href: "/compare", label: "Compare channels" }],
  },
  {
    label: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
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

        <nav className="hp-footer-cols" aria-label="Footer">
          {GROUPS.map((group) => (
            <div className="hp-footer-col" key={group.label}>
              <p className="hp-footer-col-label">{group.label}</p>
              <ul className="hp-footer-links">
                {group.links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

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
