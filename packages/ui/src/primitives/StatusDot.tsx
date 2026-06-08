import type { Tone } from "../types";

/** Small standalone dot (e.g. notification bell unread indicator, list-row marker). */
export interface StatusDotProps {
  tone?: Tone;
  size?: number;
  className?: string;
}

const COLOUR: Record<Tone, string> = {
  amber: "var(--portal-amber)",
  green: "oklch(0.55 0.12 155)",
  muted: "var(--border-strong)",
  neutral: "var(--portal-ink)",
  danger: "oklch(0.55 0.18 25)",
};

export function StatusDot({ tone = "amber", size = 8, className = "" }: StatusDotProps) {
  return (
    <span
      className={`inline-block rounded-full shrink-0 ${className}`}
      style={{ width: size, height: size, background: COLOUR[tone] }}
      aria-hidden="true"
    />
  );
}
