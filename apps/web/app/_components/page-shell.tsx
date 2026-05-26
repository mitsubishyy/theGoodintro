"use client";

import { usePathname } from "next/navigation";

/**
 * Decides the page wrapper per route.
 *
 * - The executive survey at /apply keeps the original (pre-HopeRise) theme:
 *   no oat page-frame, original colour tokens via `.legacy-theme`. This page
 *   is a focused conversion surface and must not inherit the marketing-site
 *   redesign.
 * - Every other route gets the HopeRise oat page-frame.
 */
export default function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Internal admin portal: full-bleed, no marketing page-frame.
  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  if (pathname === "/apply") {
    return <div className="legacy-theme">{children}</div>;
  }

  return (
    <div className="hp-page-frame">
      <div className="hp-page">{children}</div>
    </div>
  );
}
