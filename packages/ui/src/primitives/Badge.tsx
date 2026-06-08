import type { CSSProperties, ReactNode } from "react";
import type { Tone } from "../types";

/**
 * Inter title case, leading dot optional. Used for status pills and count chips.
 * Tones locked in UI_KIT_DESIGN_LOG:
 *   amber  = the gold accent (Request sent, Pending, count chips)
 *   green  = soft-green "Meeting complete" (vendor-portal token)
 *   muted  = muted-grey (Declined / inactive)
 *   neutral = portal-ink on portal-card (default)
 *   danger = soft-red (overdue / error)
 */

export interface BadgeProps {
  tone?: Tone;
  /** Show a leading status dot. */
  dot?: boolean;
  /** Count chip = mono digits in an amber-soft pill, no dot. Use `count` instead of children. */
  count?: number;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  amber: {
    bg: "var(--portal-amber-soft)",
    fg: "var(--portal-amber-ink)",
    dot: "var(--portal-amber)",
  },
  green: {
    bg: "oklch(0.93 0.04 155)",
    fg: "oklch(0.38 0.10 155)",
    dot: "oklch(0.55 0.12 155)",
  },
  muted: {
    bg: "color-mix(in oklch, var(--portal-line) 50%, transparent)",
    fg: "var(--muted-foreground)",
    dot: "var(--border-strong)",
  },
  neutral: {
    bg: "var(--portal-card)",
    fg: "var(--portal-ink)",
    dot: "var(--portal-ink)",
  },
  danger: {
    bg: "oklch(0.94 0.04 25)",
    fg: "oklch(0.45 0.16 25)",
    dot: "oklch(0.55 0.18 25)",
  },
};

export function Badge({ tone = "amber", dot, count, children, className = "", style }: BadgeProps) {
  const t = TONE[tone];
  if (typeof count === "number") {
    return (
      <span
        className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1.5 rounded-full font-mono text-[10.5px] font-semibold ${className}`}
        style={{ background: t.bg, color: t.fg, ...style }}
      >
        {count}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11.5px] font-medium whitespace-nowrap ${className}`}
      style={{ background: t.bg, color: t.fg, ...style }}
    >
      {dot && <span className="size-1.5 rounded-full shrink-0" style={{ background: t.dot }} />}
      {children}
    </span>
  );
}
