import type { ReactNode } from "react";
import { Icon } from "../icons";
import { Avatar } from "../primitives/Avatar";
import { StatusDot } from "../primitives/StatusDot";

/**
 * Thin cream bar above the content. Anatomy per BLUEPRINT §2 + UI_KIT_DESIGN_LOG:
 *   - Left: page H1 + optional mono-uppercase eyebrow (e.g. "ACME ROBOTICS · BAND 2").
 *   - Right: notification bell with amber dot when unread, user avatar.
 *   - Optional middle/right "context" slot for a portal-specific widget
 *     (admin: env label; vendor: credit balance; exec/EA: "acting for").
 *   - Optional search affordance.
 *
 * Presentational; no hooks. Server-friendly.
 */

export interface PortalTopbarProps {
  title: string;
  /** Mono-uppercase eyebrow rendered to the right of the title. */
  eyebrow?: string;
  /** Optional inline search trigger. */
  searchPlaceholder?: string;
  /** Optional context widget (env label, credit balance, acting-for). */
  context?: ReactNode;
  /** Show an amber dot on the bell when unread > 0. */
  unreadCount?: number;
  /** Account on the right; pass null to hide. */
  account: { name: string; avatarUrl?: string } | null;
}

export function PortalTopbar({ title, eyebrow, searchPlaceholder, context, unreadCount, account }: PortalTopbarProps) {
  const hasUnread = (unreadCount ?? 0) > 0;
  return (
    <header
      className="h-16 shrink-0 px-8 flex items-center justify-between border-b"
      style={{ background: "var(--portal-header)", color: "var(--foreground)", borderColor: "var(--portal-line)" }}
    >
      <div className="flex items-baseline gap-3 min-w-0">
        <h1 className="text-[18px] font-semibold tracking-tight truncate">{title}</h1>
        {eyebrow && (
          <span className="text-[11px] uppercase tracking-[0.18em] truncate" style={{ color: "var(--muted-foreground)" }}>
            {eyebrow}
          </span>
        )}
      </div>
      <div className="flex items-center gap-3">
        {searchPlaceholder && (
          <div
            className="hidden md:flex items-center gap-2 h-9 px-3 rounded-full text-[12.5px]"
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            <Icon name="search" />
            <span>{searchPlaceholder}</span>
          </div>
        )}
        {context}
        <div className="relative size-9 rounded-full grid place-items-center" style={{ background: "var(--muted)", color: "var(--portal-ink)" }}>
          <Icon name="bell" />
          {hasUnread && <span className="absolute top-1.5 right-1.5"><StatusDot tone="amber" size={7} /></span>}
        </div>
        {account && <Avatar name={account.name} src={account.avatarUrl} size={36} />}
      </div>
    </header>
  );
}
