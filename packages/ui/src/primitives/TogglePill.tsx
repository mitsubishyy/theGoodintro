"use client";

import { Icon } from "../icons";

/**
 * Locked 2026-06-04 on Settings · AI tab (UI_KIT_DESIGN_LOG global decisions).
 * 36×20 stadium with full border-radius; 16px round thumb, 2px padding.
 *   ON:      --portal-ink track + white thumb on the RIGHT.
 *   OFF:     --portal-line muted-grey track + hairline border + grey thumb LEFT.
 *   LOCKED:  desaturated track + 12px padlock-outline icon to the RIGHT of the
 *            track (not inside it).
 *
 * Lives in @thegoodintro/ui; never re-implement per screen.
 */

export interface TogglePillProps {
  checked: boolean;
  onChange?: (next: boolean) => void;
  /** Locked = uneditable system rule (e.g. admin override). Shows a padlock to the right. */
  locked?: boolean;
  /** Accessible label (the visible label is rendered by the row composing the toggle). */
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function TogglePill({ checked, onChange, locked, ariaLabel, disabled, className = "" }: TogglePillProps) {
  const interactive = !locked && !disabled;
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-disabled={!interactive || undefined}
        disabled={!interactive}
        onClick={interactive && onChange ? () => onChange(!checked) : undefined}
        className="relative inline-flex items-center transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-amber)]"
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? "var(--portal-ink)" : "var(--portal-line)",
          border: checked ? "none" : "1px solid var(--border-strong)",
          opacity: locked ? 0.55 : 1,
          cursor: interactive ? "pointer" : "default",
        }}
      >
        <span
          className="absolute top-0.5 transition-transform duration-150"
          style={{
            left: 2,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: checked ? "#fff" : "var(--border-strong)",
            transform: checked ? "translateX(16px)" : "translateX(0)",
          }}
        />
      </button>
      {locked && <Icon name="padlock" size={12} className="opacity-60" />}
    </span>
  );
}
