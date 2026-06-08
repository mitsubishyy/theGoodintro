"use client";

import type { ReactNode } from "react";
import { Icon } from "../icons";

/**
 * T6 Checklist (BLUEPRINT T6 + UI_KIT_DESIGN_LOG "Admin Checklists - LOCKED").
 * Progress header ("3 / 6 · 50%") + a list of items. Each item: checkbox + label
 * + right-side affordance (upload dropzone, "Sign document" button, or a link).
 *
 * Used by vendor "Get started" onboarding and admin checklist templates /
 * assigned. Items are controlled (the caller drives `done` + `onToggle`).
 */

export interface ChecklistItem {
  id: string;
  label: string;
  hint?: string;
  done: boolean;
  /** Right-side affordance: dropzone / action button / link / nothing. */
  affordance?: ReactNode;
  onToggle?: (id: string, next: boolean) => void;
}

export interface ChecklistProps {
  items: ChecklistItem[];
  /** Title shown above the progress bar; defaults to "Onboarding checklist". */
  title?: string;
  className?: string;
}

export function Checklist({ items, title = "Onboarding checklist", className = "" }: ChecklistProps) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <section
      className={`rounded-2xl border ${className}`}
      style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
    >
      <header className="px-5 pt-5 pb-4">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          {title}
        </h2>
        <div className="mt-2 flex items-baseline justify-between">
          <p className="text-[18px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            {done} / {total} <span className="text-[12.5px] font-normal" style={{ color: "var(--muted-foreground)" }}>· {pct}%</span>
          </p>
        </div>
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--portal-line)" }}>
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--portal-amber)" }} />
        </div>
      </header>
      <ul className="divide-y" style={{ borderColor: "var(--portal-line)" }}>
        {items.map((it) => (
          <li key={it.id} className="px-5 py-4 flex items-start gap-3">
            <button
              type="button"
              onClick={() => it.onToggle?.(it.id, !it.done)}
              aria-pressed={it.done}
              className="mt-0.5 size-5 rounded-md grid place-items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-amber)]"
              style={
                it.done
                  ? { background: "var(--portal-ink)", color: "var(--portal-card)" }
                  : { background: "transparent", border: "1.5px solid var(--portal-line)" }
              }
              aria-label={`${it.done ? "Mark not done" : "Mark done"}: ${it.label}`}
            >
              {it.done && <Icon name="check" size={14} />}
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium" style={{ color: it.done ? "var(--muted-foreground)" : "var(--portal-ink)", textDecoration: it.done ? "line-through" : "none" }}>
                {it.label}
              </p>
              {it.hint && (
                <p className="mt-0.5 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                  {it.hint}
                </p>
              )}
            </div>
            {it.affordance && <div className="shrink-0">{it.affordance}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}
