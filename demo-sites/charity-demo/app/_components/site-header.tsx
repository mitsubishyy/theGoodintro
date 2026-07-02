"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/charities", label: "Charities" },
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
      <Link href="/" className="hp-brand" aria-label="TheGoodIntro home">
        <Image
          src="/brand/wordmark.png"
          alt="TheGoodIntro"
          width={750}
          height={168}
          priority
          className="h-7 w-auto"
        />
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
        </>
      )}
    </nav>
  );
}
