import Link from "next/link";
import type { ReactNode } from "react";
import { Avatar } from "../primitives/Avatar";
import { Badge } from "../primitives/Badge";
import { Icon } from "../icons";

/**
 * Photo-led exec card grid (LOCKED 2026-06-05 on Vendor Dashboard "Executives
 * for you" widget). 2-col × N-row card grid; renders inside a parent widget.
 *
 * Locked anatomy per card: 56px photo · Name · Title · Company (mono uppercase
 * muted) · heart-outline + charity name in amber-soft pill · full-width 32px
 * action button (primary ink "Request" OR amber-soft "Requested" chip with
 * leading amber dot). Photos in mockups are placeholders; production reads
 * `executive.photo_url`.
 */

export interface ExecCard {
  id: string;
  name: string;
  title: string;
  company: string;
  charityName: string;
  /** Photo URL (production: `executive.photo_url`; falls back to initials). */
  photoUrl?: string | null;
  /** Whether this vendor has already requested this exec. */
  requested?: boolean;
  /** Whole-card click for the "view detail" affordance. */
  href?: string;
  /** Override the default Request CTA (e.g. a server-action form). */
  cta?: ReactNode;
}

export interface ExecCardGridProps {
  cards: ExecCard[];
  /** Columns at lg+; defaults to 2 (the locked vendor pattern). */
  columns?: 2 | 3;
  className?: string;
}

const COLS: Record<2 | 3, string> = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3" };

export function ExecCardGrid({ cards, columns = 2, className = "" }: ExecCardGridProps) {
  return (
    <div className={`grid grid-cols-1 ${COLS[columns]} gap-4 ${className}`}>
      {cards.map((c) => (
        <Card key={c.id} card={c} />
      ))}
    </div>
  );
}

function Card({ card }: { card: ExecCard }) {
  const inner = (
    <div
      className="rounded-xl p-5 flex flex-col gap-4 h-full"
      style={{ background: "var(--portal-page)", border: "1px solid var(--portal-line)" }}
    >
      <div className="flex items-start gap-4">
        <Avatar name={card.name} src={card.photoUrl} size={56} />
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
            {card.name}
          </p>
          <p className="text-[12.5px] truncate" style={{ color: "var(--muted-foreground)" }}>
            {card.title}
          </p>
          <p className="mt-1 text-[10.5px] font-mono uppercase tracking-[0.14em] truncate" style={{ color: "var(--muted-foreground)" }}>
            {card.company}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 text-[11.5px]">
        <Icon name="heart" size={14} className="opacity-80" />
        <Badge tone="amber">{card.charityName}</Badge>
      </div>
      {card.cta ?? (
        card.requested ? (
          <span
            className="inline-flex items-center justify-center h-8 rounded-md gap-1.5 text-[12.5px] font-medium"
            style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
          >
            <span className="size-1.5 rounded-full" style={{ background: "var(--portal-amber)" }} />
            Requested
          </span>
        ) : (
          <span
            className="inline-flex items-center justify-center h-8 rounded-md text-[12.5px] font-semibold"
            style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
          >
            Request
          </span>
        )
      )}
    </div>
  );
  if (card.href) {
    return (
      <Link href={card.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--portal-amber)] rounded-xl">
        {inner}
      </Link>
    );
  }
  return inner;
}
