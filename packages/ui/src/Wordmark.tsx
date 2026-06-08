import type { CSSProperties } from "react";

/**
 * TheGoodIntro wordmark — LOCKED 2026-06-07 (UI_KIT_DESIGN_LOG global decisions).
 * Fraunces semibold with explicit colour split: "The" + "Intro" in --portal-ink,
 * "Good" in brand emerald --primary. Fraunces is a sanctioned brand exception to
 * the marketing rule "Fraunces for italic emphasis + big numbers only".
 *
 * The circle mark (custom stylised G) is NOT rendered here; insert at port from
 * apps/web/public/brand-logo.png alongside the wordmark when the design calls for
 * the full lockup. This component renders the wordmark only.
 *
 * Brand spelling per FACTS.md: TheGoodIntro (T, G, I capitalised) — never the
 * lowercase repo legacy.
 */

export interface WordmarkProps {
  /** Font size; defaults to 18px (sidebar use); pages override as needed. */
  size?: number;
  /** Light surface (default, ink + emerald) or dark surface (light ink). */
  surface?: "light" | "dark";
  className?: string;
  style?: CSSProperties;
}

export function Wordmark({ size = 18, surface = "light", className, style }: WordmarkProps) {
  const ink = surface === "dark" ? "var(--portal-card)" : "var(--portal-ink)";
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-display), serif",
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.01em",
        color: ink,
        ...style,
      }}
      aria-label="TheGoodIntro"
    >
      <span>The</span>
      <span style={{ color: "var(--primary)" }}>Good</span>
      <span>Intro</span>
    </span>
  );
}
