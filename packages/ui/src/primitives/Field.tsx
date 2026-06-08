import type { ReactNode } from "react";

/**
 * Labelled input wrapper with inline validation. T5 RecordForm composes these.
 * Field itself owns label + hint + error + the optional DEFAULT chip pattern
 * (locked on admin Account tab), but is control-agnostic — the caller supplies
 * <input> / <textarea> / <select> as `children`. Counter slot for character
 * counters on textareas (vendor T5 question pattern).
 */

export interface FieldProps {
  label: string;
  /** Show a DEFAULT/CUSTOM chip inline with the label (Settings pattern). */
  chip?: "default" | "custom" | null;
  hint?: string;
  error?: string;
  required?: boolean;
  /** Right-aligned slot below the label (e.g. character counter). */
  counter?: ReactNode;
  /** The control (input / textarea / etc.). */
  children: ReactNode;
  className?: string;
}

const CHIP_TONE: Record<"default" | "custom", { background: string; color: string }> = {
  default: { background: "var(--muted)", color: "var(--muted-foreground)" },
  custom: { background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" },
};

export function Field({ label, chip, hint, error, required, counter, children, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-[13px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            {label}
            {required && <span aria-hidden="true" className="ml-0.5" style={{ color: "var(--portal-amber-ink)" }}>*</span>}
          </label>
          {chip && (
            <span
              className="text-[10px] font-mono uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
              style={CHIP_TONE[chip]}
            >
              {chip}
            </span>
          )}
        </div>
        {counter && (
          <span className="text-[11.5px] font-mono" style={{ color: "var(--muted-foreground)" }}>
            {counter}
          </span>
        )}
      </div>
      {children}
      {error ? (
        <p className="text-[11.5px]" style={{ color: "oklch(0.45 0.16 25)" }} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}
