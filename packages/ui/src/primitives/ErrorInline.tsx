"use client";

import { Icon } from "../icons";

/**
 * Inline "could not load · Retry" inside a widget. Never a whole-page crash
 * (BLUEPRINT §0). Other widgets stay unaffected. Optional last-refresh time
 * line per UI_KIT_DESIGN_LOG global decisions.
 */
export interface ErrorInlineProps {
  message?: string;
  lastRefresh?: string;
  onRetry?: () => void;
}

export function ErrorInline({ message = "Could not load. Other widgets are unaffected.", lastRefresh, onRetry }: ErrorInlineProps) {
  return (
    <div className="px-5 py-6 flex items-start gap-3 text-[13px]" role="alert">
      <Icon name="x" size={16} className="mt-0.5 shrink-0" />
      <div className="flex-1">
        <p style={{ color: "var(--portal-ink)" }}>{message}</p>
        {lastRefresh && (
          <p className="mt-1 text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
            Last refresh {lastRefresh}
          </p>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="text-[12px] font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-amber)] rounded"
          style={{ color: "var(--portal-amber-ink)" }}
        >
          Retry
        </button>
      )}
    </div>
  );
}
