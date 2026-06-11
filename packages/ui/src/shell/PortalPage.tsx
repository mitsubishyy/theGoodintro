import type { ReactNode } from "react";
import { Icon } from "../icons";

/**
 * The page frame inside the shell. Owns:
 *   - Optional Back row (LOCKED 2026-06-04, UI_KIT_DESIGN_LOG) — 32px row above
 *     the title; routes to the parent route (caller derives, not browser history).
 *     Hidden on first-level routes; the caller decides by setting `back`.
 *   - Optional breadcrumb.
 *   - Title H1 + optional primary action button on the right.
 *   - Content slot.
 *
 * Presentational; server-friendly.
 */

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PortalPageProps {
  /** The page H1. Omit on record-detail screens where RecordDetail renders its
   *  own header band as the single H1 (the back-row + breadcrumb still show). */
  title?: string;
  /** Set to render the locked Back-row. Caller derives the parent route from the breadcrumb. */
  back?: { label?: string; href: string };
  breadcrumb?: BreadcrumbItem[];
  /** Primary page action button slot (e.g. "+ New executive"). */
  action?: ReactNode;
  /** Inline-eyebrow under the title (small mono-uppercase tag). */
  eyebrow?: string;
  /** Mono-uppercase count rendered to the right of the title on admin list
   *  surfaces, e.g. "14 active / 17 all" (locked across Admin Vendors / Execs /
   *  Meetings / Templates / Giving / Requests list headers). */
  count?: ReactNode;
  children: ReactNode;
}

export function PortalPage({ title, back, breadcrumb, action, eyebrow, count, children }: PortalPageProps) {
  return (
    <main className="flex-1 min-w-0 px-8 py-6">
      {back && (
        <a
          href={back.href}
          className="inline-flex items-center gap-2 h-8 text-[14px] font-semibold hover:bg-[var(--portal-card-hover)] rounded-md -ml-2 pl-2 pr-3"
          style={{ color: "var(--portal-ink)" }}
        >
          <Icon name="chevron-left" size={20} />
          {back.label ?? "Back"}
        </a>
      )}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="mt-2 text-[12px]" style={{ color: "var(--muted-foreground)" }} aria-label="Breadcrumb">
          {breadcrumb.map((b, i) => (
            <span key={i}>
              {i > 0 && <span className="mx-1.5 opacity-60">/</span>}
              {b.href ? (
                <a href={b.href} className="hover:text-[var(--portal-ink)]">
                  {b.label}
                </a>
              ) : (
                <span>{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      {(title || action) && (
        <div className="mt-3 flex items-baseline justify-between gap-4">
          <div className="min-w-0 flex items-baseline gap-3">
            {title && (
              <h1 className="text-[20px] font-semibold tracking-tight truncate" style={{ color: "var(--portal-ink)" }}>
                {title}
              </h1>
            )}
            {count && (
              <span
                className="text-[11px] font-mono uppercase tracking-[0.18em] whitespace-nowrap"
                style={{ color: "var(--muted-foreground)" }}
              >
                {count}
              </span>
            )}
            {eyebrow && (
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                {eyebrow}
              </p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="mt-5">{children}</div>
    </main>
  );
}
