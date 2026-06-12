import type { CSSProperties } from "react";
import type { RibbonGroup } from "../types";

/**
 * T1 Metrics ribbon — the dark --portal-ribbon band across the top of a
 * dashboard (BLUEPRINT T1 + UI_KIT_DESIGN_LOG global rule "two rows of four,
 * never eight across"). Headline numbers ONLY live here, never as white cards.
 *
 * Generalised from the admin RibbonMetrics shape so admin / vendor / exec all
 * share one component. Server-friendly; presentational.
 *
 * Numeral typography is per-screen LOCKED:
 *  - "inter" (default) = Inter semibold 20-22px (earlier admin).
 *  - "fraunces" = Fraunces semibold 28/36px headline numbers
 *    (Admin Dashboard re-lock 2026-06-09; Vendor Dashboard 2026-06-05).
 *
 * Stat flow inside a group is independent of the numeral font:
 *  - "stacked" = one stat per line with `sub` sub-lines (Admin Dashboard).
 *  - "inline"  = stats side by side with `unit` beside each number (Vendor
 *    Dashboard "2 available · 0 reserved"). Defaults follow the original
 *    pairings (inter→inline, fraunces→stacked) so existing screens are
 *    unchanged; the vendor ribbon passes numeralFont="fraunces" +
 *    layout="inline".
 *
 * When `columns` results in more than one row of groups, a thin horizontal
 * hairline separates each row (Admin Dashboard README "white@5% horizontal
 * hairline between rows").
 */

export interface MetricsRibbonProps {
  groups: RibbonGroup[];
  /** Number of columns at lg+. Defaults to 4 (locked: "two rows of four"). */
  columns?: 2 | 3 | 4;
  /** Numeral typography family. See header for per-screen mapping. */
  numeralFont?: "inter" | "fraunces";
  /** Stat flow inside a group; defaults to the font's original pairing. */
  layout?: "inline" | "stacked";
  className?: string;
  style?: CSSProperties;
}

const COLS: Record<2 | 3 | 4, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export function MetricsRibbon({
  groups,
  columns = 4,
  numeralFont = "inter",
  layout,
  className = "",
  style,
}: MetricsRibbonProps) {
  const fraunces = numeralFont === "fraunces";
  const stacked = (layout ?? (fraunces ? "stacked" : "inline")) === "stacked";
  return (
    <section
      className={`rounded-2xl px-6 py-5 mb-5 grid grid-cols-2 ${COLS[columns]} gap-y-6 gap-x-2 ${className}`}
      style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)", ...style }}
    >
      {groups.map((g, i) => {
        const inFirstRow = i < columns;
        const firstInRow = i % columns === 0;
        return (
          <div
            key={g.label + i}
            className={[
              firstInRow ? "" : "lg:pl-5 lg:border-l",
              inFirstRow ? "" : "lg:pt-6 lg:border-t",
            ].join(" ")}
            style={{ borderColor: "rgba(255,255,255,0.10)" }}
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] mb-2 opacity-70">
              {g.label}
            </div>
            <div className={stacked ? "space-y-1" : "flex flex-wrap gap-x-5 gap-y-1 items-baseline"}>
              {g.stats.map((s, j) => (
                <div key={j} className={stacked ? "" : "flex items-baseline gap-1.5"}>
                  <span
                    style={{
                      fontFamily: fraunces ? "var(--font-display), serif" : undefined,
                      fontWeight: 600,
                      fontSize: fraunces ? (s.big ? 36 : 28) : s.big ? 22 : 20,
                      lineHeight: 1,
                      letterSpacing: fraunces ? "-0.01em" : undefined,
                    }}
                  >
                    {s.value}
                  </span>
                  {s.unit && (
                    <span className="text-[11px] opacity-70">{s.unit}</span>
                  )}
                  {s.sub && (
                    <div className="mt-2 text-[12px] opacity-60 leading-snug">{s.sub}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
