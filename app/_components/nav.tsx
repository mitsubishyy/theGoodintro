"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CallButton } from "./call-button";
import { Wordmark } from "./wordmark";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/executives", label: "For executives" },
  { href: "/vendors", label: "For vendors" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Condense on scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the drawer on route change.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on Escape; lock body scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href ? "page" : undefined;

  return (
    <header className={`site-head${scrolled ? " scrolled" : ""}`}>
      <div className="topline" />
      <div className="wrap">
        <nav aria-label="Primary">
          <Link href="/" className="logo" aria-label="theBigintro home">
            <Wordmark />
          </Link>
          <div className="nlinks">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} aria-current={isActive(l.href)}>
                {l.label}
              </Link>
            ))}
            <CallButton>Apply</CallButton>
          </div>
          <button
            type="button"
            className="nav-toggle"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </div>

      <div
        className={`nav-scrim${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        id="mobile-nav"
        className={`nav-drawer${open ? " open" : ""}`}
        aria-label="Site"
        inert={!open}
      >
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href)}>
            {l.label}
          </Link>
        ))}
        <CallButton>Apply</CallButton>
      </div>
    </header>
  );
}
