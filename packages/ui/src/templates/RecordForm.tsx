"use client";

import type { FormEvent, ReactNode } from "react";
import { Button } from "../primitives/Button";

/**
 * T5 RecordForm (BLUEPRINT T5 + UI_KIT_DESIGN_LOG). Two variants:
 *   - "admin": full editor canvas. Two-column field grid on desktop; single
 *     column on mobile. Section headers in mono uppercase group related fields.
 *     Sticky action bar at the bottom (Save primary ink + Cancel ghost).
 *   - "vendor" (LOCKED 2026-06-06 on Vendor Request Form): 720px column
 *     centered, white form card (--portal-card-reading) with warm-cream
 *     textareas inside; hairline dividers between sections; right-aligned action
 *     row OUTSIDE the card (Cancel ghost + primary ink Send →).
 *
 * Field-level structure (label, hint, error, counter, DEFAULT/CUSTOM chip) lives
 * in <Field>; this template owns the section grouping + the action surface.
 */

export type RecordFormVariant = "admin" | "vendor";

export interface FormSection {
  /** Mono uppercase eyebrow (e.g. "QUESTION 1 OF 3" on vendor, "PROFILE" on admin). */
  title?: string;
  /** Helper sub-heading sitting under the eyebrow. */
  helper?: string;
  /** Each field is a <Field>-wrapped control (or arbitrary node). */
  fields: ReactNode[];
}

export interface RecordFormProps {
  variant?: RecordFormVariant;
  sections: FormSection[];
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  submitting?: boolean;
  /** Vendor variant lays out a right-aligned action row OUTSIDE the card; admin
   *  uses a sticky bar at the bottom of the editor. */
  className?: string;
}

export function RecordForm({
  variant = "admin",
  sections,
  onSubmit,
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Save",
  submitting,
  className = "",
}: RecordFormProps) {
  if (variant === "vendor") {
    return (
      <form onSubmit={onSubmit} className={`mx-auto max-w-[720px] ${className}`}>
        <div
          className="rounded-2xl border p-6 md:p-8"
          style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
        >
          {sections.map((s, i) => (
            <div key={i}>
              {i > 0 && <div className="my-7 border-t" style={{ borderColor: "var(--portal-line)" }} />}
              {s.title && (
                <p className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                  {s.title}
                </p>
              )}
              {s.helper && (
                <p className="mt-1 text-[13px]" style={{ color: "var(--portal-ink)" }}>
                  {s.helper}
                </p>
              )}
              <div className="mt-3 space-y-5">{s.fields}</div>
            </div>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} type="button">
              {cancelLabel}
            </Button>
          )}
          <Button type="submit" loading={submitting} rightIcon={<span aria-hidden>→</span>}>
            {submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  // Admin variant: wider editor canvas, two-column grid, sticky save bar.
  return (
    <form onSubmit={onSubmit} className={`relative ${className}`}>
      <div className="space-y-8 pb-24">
        {sections.map((s, i) => (
          <section key={i}>
            {s.title && (
              <p className="text-[11px] font-mono uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                {s.title}
              </p>
            )}
            {s.helper && (
              <p className="mt-1 text-[13px]" style={{ color: "var(--portal-ink)" }}>
                {s.helper}
              </p>
            )}
            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-5">{s.fields}</div>
          </section>
        ))}
      </div>
      {/* Sticky save bar */}
      <div
        className="sticky bottom-0 -mx-8 px-8 h-16 flex items-center justify-end gap-3 border-t"
        style={{ background: "var(--portal-page)", borderColor: "var(--portal-line)" }}
      >
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} type="button">
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
