"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons";

/**
 * Single-row inline filter bar (LOCKED 2026-06-06 on Vendor Executives List).
 * Vendor-portal variant of the locked "collapsible Filters panel" pattern —
 * Issy explicitly rejected the stacked panel as "taking up half the page".
 *
 * Locked anatomy: 64px row on --portal-page (no card, no border) between the
 * header strip and the table. "FILTER BY" mono eyebrow + inline filter pills
 * (8-12px gap) + right-aligned "N of P match" count + hairline + "Clear all"
 * amber link (only when ≥1 filter active). Each pill = category + active count
 * only; values live in per-pill popovers (NOT in the bar). Empty pills are
 * ghost; active pills are amber-soft.
 *
 * Per-pill popovers are not designed yet; the pill button accepts an `onOpen`
 * callback the parent screen wires when it builds its own popover content.
 */

export interface FilterPill {
  key: string;
  /** Category label (e.g. "Industry", "Title", "Location", "Status"). */
  label: string;
  /** Number of currently selected values; 0 = ghost/empty, > 0 = amber-soft active. */
  activeCount: number;
  /** Called when the pill is clicked (parent owns the popover). */
  onOpen?: () => void;
}

export interface InlineFilterBarProps {
  /** Eyebrow label; defaults to "FILTER BY". */
  heading?: string;
  pills: FilterPill[];
  /** "N of P match" right-aligned indicator. */
  matchLabel?: string;
  /** "Clear all" handler (renders the link only when at least one pill has activeCount > 0). */
  onClearAll?: () => void;
  className?: string;
  /** Optional right-side slot replacing the default match label + clear (e.g. for an admin variant). */
  right?: ReactNode;
}

export function InlineFilterBar({ heading = "FILTER BY", pills, matchLabel, onClearAll, right, className = "" }: InlineFilterBarProps) {
  const anyActive = pills.some((p) => p.activeCount > 0);
  return (
    <div
      className={`h-16 flex items-center gap-3 ${className}`}
      style={{ background: "var(--portal-page)" }}
    >
      <span className="text-[10px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {heading}
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {pills.map((p) => (
          <Pill key={p.key} pill={p} />
        ))}
      </div>
      <div className="ml-auto flex items-center gap-3 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
        {right ?? (
          <>
            {matchLabel && <span>{matchLabel}</span>}
            {anyActive && onClearAll && (
              <>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={onClearAll}
                  className="font-medium hover:underline underline-offset-4"
                  style={{ color: "var(--portal-amber-ink)" }}
                >
                  Clear all
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Pill({ pill }: { pill: FilterPill }) {
  const active = pill.activeCount > 0;
  return (
    <button
      type="button"
      onClick={pill.onOpen}
      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[12px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-amber)]"
      style={
        active
          ? { background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }
          : { background: "transparent", border: "1px solid var(--portal-line)", color: "var(--muted-foreground)" }
      }
    >
      <span>{pill.label}</span>
      {active && <span className="opacity-80">· {pill.activeCount}</span>}
      <Icon name="chevron-down" size={12} />
    </button>
  );
}
