import type { ReactNode } from "react";
import { Badge } from "../primitives/Badge";
import { EmptyState } from "../primitives/EmptyState";
import { ErrorInline } from "../primitives/ErrorInline";
import { Skeleton } from "../primitives/Skeleton";
import type { LoadState } from "../types";

/**
 * T2 Widget shell — the card every dashboard tile inherits (BLUEPRINT T2 +
 * UI_KIT_DESIGN_LOG "Every widget ships three states"). A widget with no data
 * still renders at full size with its empty state; it is never dropped.
 *
 *   - title: mono uppercase header (rendered Inter semibold; eyebrow style
 *     applied via className for now to keep the kit dependency-free).
 *   - count: amber count chip when work is pending.
 *   - link: "→ all" deep link into the full module.
 *   - right: header-right slot (e.g. Calendar/List toggle).
 *   - state: drives loading / empty / error rendering automatically.
 *
 * Server-friendly; the only client surface is the optional retry button (inside
 * ErrorInline, which is marked "use client").
 */

export interface WidgetProps {
  title: string;
  count?: number;
  link?: { label: string; href?: string };
  right?: ReactNode;
  state?: LoadState;
  /** Required when state === "empty" (or omitted) so a widget with no data is never blank. */
  emptyText?: string;
  emptyAction?: ReactNode;
  /** Required when state === "error". */
  onRetry?: () => void;
  errorMessage?: string;
  lastRefresh?: string;
  children?: ReactNode;
}

export function Widget({
  title,
  count,
  link,
  right,
  state = "ready",
  emptyText,
  emptyAction,
  onRetry,
  errorMessage,
  lastRefresh,
  children,
}: WidgetProps) {
  return (
    <section
      className="rounded-2xl border"
      style={{
        background: "var(--portal-card)",
        borderColor: "var(--portal-line)",
        boxShadow: "0 1px 2px rgba(20,40,30,0.04)",
      }}
    >
      <header
        className="px-5 py-3.5 flex items-center justify-between border-b"
        style={{ borderColor: "var(--portal-line)" }}
      >
        <div className="flex items-center gap-2">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
            {title}
          </h2>
          {typeof count === "number" && count > 0 && <Badge tone="amber" count={count} />}
        </div>
        <div className="flex items-center gap-3">
          {right}
          {link && (
            link.href ? (
              <a href={link.href} className="text-[12px] font-medium" style={{ color: "var(--portal-amber-ink)" }}>
                {link.label} →
              </a>
            ) : (
              <span className="text-[12px] font-medium" style={{ color: "var(--portal-amber-ink)" }}>
                {link.label} →
              </span>
            )
          )}
        </div>
      </header>
      {state === "loading" ? (
        <div className="p-5">
          <Skeleton variant="row" lines={4} />
        </div>
      ) : state === "error" ? (
        <ErrorInline message={errorMessage} lastRefresh={lastRefresh} onRetry={onRetry} />
      ) : state === "empty" ? (
        <EmptyState title={emptyText ?? "Nothing here yet."} action={emptyAction} />
      ) : (
        children
      )}
    </section>
  );
}
