import type { CSSProperties } from "react";
import type { RibbonGroup } from "../types";

/**
 * T1 Metrics ribbon — the dark --portal-ribbon band across the top of a
 * dashboard (BLUEPRINT T1 + UI_KIT_DESIGN_LOG global rule "two rows of four,
 * never eight across"). Headline numbers ONLY live here, never as white cards.
 *
 * Generalised from the admin RibbonMetrics shape so admin / vendor / exec all
 * share one component. Server-friendly; presentational.
 */

export interface MetricsRibbonProps {
  groups: RibbonGroup[];
  /** Number of columns at lg+. Defaults to 4 (locked: "two rows of four"). */
  columns?: 2 | 3 | 4;
  className?: string;
  style?: CSSProperties;
}

const COLS: Record<2 | 3 | 4, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

export function MetricsRibbon({ groups, columns = 4, className = "", style }: MetricsRibbonProps) {
  return (
    <section
      className={`rounded-2xl px-6 py-4 mb-5 grid grid-cols-2 ${COLS[columns]} gap-y-4 gap-x-2 ${className}`}
      style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)", ...style }}
    >
      {groups.map((g, i) => (
        <div
          key={g.label}
          className={i % columns === 0 ? "" : "lg:pl-5 lg:border-l"}
          style={i % columns === 0 ? undefined : { borderColor: "rgba(255,255,255,0.16)" }}
        >
          <div className="text-[10px] uppercase tracking-[0.18em] mb-2 opacity-70">{g.label}</div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 items-baseline">
            {g.stats.map((s, j) => (
              <div key={j} className="flex items-baseline gap-1.5">
                <span className={s.big ? "text-[22px] font-semibold leading-none" : "text-[20px] font-semibold leading-none"}>
                  {s.value}
                </span>
                {s.unit && <span className="text-[11px] opacity-70">{s.unit}</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
