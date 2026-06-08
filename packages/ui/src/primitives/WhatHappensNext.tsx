/**
 * Locked 2026-06-06 (UI_KIT_DESIGN_LOG global decisions). Reusable
 * vendor-portal pattern (also re-used on Vendor Pre-payment Dashboard and
 * the reusable Lockout page) for surfacing a short multi-step process at a
 * decision moment. Mono eyebrow + N amber-circled numbered lines. No card
 * around them. Three steps is the locked count for the request flow; the
 * pattern itself scales to N.
 */

export interface WhatHappensNextProps {
  /** Mono eyebrow above the steps. Defaults to "WHAT HAPPENS NEXT". */
  heading?: string;
  steps: string[];
  className?: string;
}

export function WhatHappensNext({ heading = "WHAT HAPPENS NEXT", steps, className = "" }: WhatHappensNextProps) {
  return (
    <div className={className}>
      <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {heading}
      </p>
      <ol className="mt-2 space-y-2">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span
              className="size-[18px] rounded-full shrink-0 grid place-items-center font-mono text-[10px] font-semibold"
              style={{ background: "var(--portal-amber)", color: "#fff" }}
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="text-[12.5px] leading-snug" style={{ color: "var(--muted-foreground)" }}>
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
