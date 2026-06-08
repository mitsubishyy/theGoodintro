"use client";

import type { ReactNode } from "react";

/**
 * Tab strip — locked 2026-06-05 on Admin Settings shell (UI_KIT_DESIGN_LOG).
 * Full-width below the topbar / page title, 48px tall, with a bottom hairline.
 * Active tab carries a 2px ink underline; inactive tabs are muted with hover ink.
 */

export interface TabsItem {
  key: string;
  label: string;
  /** Optional amber count chip (Inbox unread, Checklists "to-do", etc.). */
  badgeCount?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabsItem[];
  active: string;
  onChange: (key: string) => void;
  /** Optional right-side slot (e.g. a "+ New" button on a list+editor shell). */
  right?: ReactNode;
  className?: string;
}

export function Tabs({ tabs, active, onChange, right, className = "" }: TabsProps) {
  return (
    <div
      className={`h-12 flex items-end justify-between border-b ${className}`}
      style={{ borderColor: "var(--portal-line)" }}
      role="tablist"
    >
      <div className="flex items-end gap-1">
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={t.disabled || undefined}
              disabled={t.disabled}
              onClick={() => onChange(t.key)}
              className="h-12 px-4 inline-flex items-center gap-2 text-[13.5px] font-medium focus-visible:outline-none focus-visible:bg-[var(--portal-card-hover)] disabled:opacity-50"
              style={{
                color: isActive ? "var(--portal-ink)" : "var(--muted-foreground)",
                borderBottom: isActive ? "2px solid var(--portal-ink)" : "2px solid transparent",
                marginBottom: "-1px",
              }}
            >
              {t.label}
              {typeof t.badgeCount === "number" && t.badgeCount > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full font-mono text-[10.5px] font-semibold"
                  style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
                >
                  {t.badgeCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {right && <div className="pb-2 pr-4">{right}</div>}
    </div>
  );
}
