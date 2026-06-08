"use client";

import type { ReactNode } from "react";

/**
 * Locked 2026-06-06 on Vendor Request Form Q3 (UI_KIT_DESIGN_LOG global). For
 * binary or small-N choices that need title + supporting subtitle per option.
 * NOT a native radio input; the whole card is the click target with a leading
 * filled / ghost circle for the radio appearance. Re-use across vendor + admin
 * wherever the choice is meaningful enough to warrant a card (not just a radio
 * in a list).
 */

export interface RadioCardOption<V extends string = string> {
  value: V;
  title: string;
  subtitle?: string;
  /** Optional right-side affordance (icon, badge, etc.). */
  affordance?: ReactNode;
  disabled?: boolean;
}

export interface RadioCardProps<V extends string = string> {
  name: string;
  options: RadioCardOption<V>[];
  value: V | null;
  onChange: (value: V) => void;
  className?: string;
}

export function RadioCard<V extends string = string>({ name, options, value, onChange, className = "" }: RadioCardProps<V>) {
  return (
    <div className={`flex flex-col gap-3 ${className}`} role="radiogroup" aria-label={name}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-disabled={opt.disabled || undefined}
            disabled={opt.disabled}
            onClick={() => !opt.disabled && onChange(opt.value)}
            className="flex items-start gap-4 p-4 rounded-xl text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-amber)] disabled:opacity-50 disabled:cursor-not-allowed"
            style={
              selected
                ? {
                    background: "var(--portal-amber-soft)",
                    boxShadow: "0 0 0 2px var(--portal-amber) inset",
                  }
                : {
                    background: "var(--portal-card-reading)",
                    border: "1px solid var(--portal-line)",
                  }
            }
          >
            <span
              className="mt-0.5 size-4 rounded-full shrink-0 grid place-items-center"
              style={
                selected
                  ? { background: "var(--portal-amber)", border: "none" }
                  : { background: "transparent", border: "1.5px solid var(--portal-line)" }
              }
            >
              {selected && <span className="size-1.5 rounded-full" style={{ background: "#fff" }} />}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[14.5px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                {opt.title}
              </span>
              {opt.subtitle && (
                <span className="block text-[12.5px] mt-1" style={{ color: "var(--muted-foreground)" }}>
                  {opt.subtitle}
                </span>
              )}
            </span>
            {opt.affordance && <span className="shrink-0">{opt.affordance}</span>}
          </button>
        );
      })}
    </div>
  );
}
