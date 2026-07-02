"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Icon } from "../icons";
import { Wordmark } from "../Wordmark";
import { initialsOf } from "../primitives/Avatar";
import { Badge } from "../primitives/Badge";
import type { AccountChip, IdentityCard, NavItem, Portal } from "../types";

/**
 * Per-portal sidebar (LOCKED in UI_KIT_DESIGN_LOG global decisions).
 * Each portal's identity is its sidebar colour:
 *   admin  = brand emerald (`--portal-emerald-sidebar`, re-locked 2026-06-09)
 *   vendor = deep teal-pine (`--vendor-sidebar`, 2026-06-05)
 *   exec   = charcoal ink (`--exec-sidebar`, 2026-06-08)
 *
 * Locked anatomy:
 *   - Wordmark block at top (Fraunces TheGoodIntro with The/Good/Intro colour split).
 *   - Grouped nav (mono uppercase 10px tracking-[0.18em] @60% group headings).
 *   - Items: icon + label + optional amber count badge + optional trailing padlock
 *     (pre-payment gates; vendor only).
 *   - Optional identity card slot (vendor pattern; sits above the account chip).
 *   - Account chip pinned to the bottom.
 *
 * Responsive: collapses to a top hamburger on narrow viewports (locked but not yet
 * wired — the kit ships desktop-first; a basic mobile toggle is added in the next
 * port pass, BLUEPRINT §1 density rules note).
 */

export interface PortalSidebarProps {
  /** Which portal: drives sidebar colour + which tokens it consumes. */
  portal: Portal;
  /** Optional override of the default TheGoodIntro wordmark. */
  brand?: ReactNode;
  /** Grouped nav. Each group has an uppercase heading; pass empty string for ungrouped. */
  groups: { heading?: string; items: NavItem[] }[];
  /** Optional sidebar-bottom identity card (vendor pattern). */
  identity?: IdentityCard;
  /** Account chip pinned to the bottom; a sign-out form/action is composed by the caller. */
  account: AccountChip;
  onSignOut?: () => void;
  /** Render slot for the sign-out form (e.g. server-action `<form action={signOutAction}>`). */
  signOutSlot?: ReactNode;
  /** Optional endpoint returning `{ [badgeKey]: number }`. When set, nav items
   *  with a `badgeKey` hydrate their count from here after mount, so the shell
   *  paints its stable nav immediately instead of blocking on badge queries
   *  server-side. Failure is silent (badges simply stay absent). */
  badgeSource?: string;
}

/** Fetch the deferred badge counts once after mount; silent on any failure. */
function useLiveBadges(badgeSource?: string): Record<string, number> | null {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    if (!badgeSource) return;
    let cancelled = false;
    fetch(badgeSource, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d === "object") {
          setCounts(d as Record<string, number>);
        }
      })
      .catch(() => {
        /* badges are decorative; leave them absent on error */
      });
    return () => {
      cancelled = true;
    };
  }, [badgeSource]);
  return counts;
}

/** Resolve a nav item's badge: the live count when available, else the static one. */
function badgeFor(item: NavItem, live: Record<string, number> | null): number | undefined {
  if (item.badgeKey && live && item.badgeKey in live) return live[item.badgeKey];
  return item.badgeCount;
}

interface Palette {
  /** Sidebar fill. */
  bg: string;
  /** Active-row wash. */
  active: string;
  /** Active-row ink (button-like). */
  activeInk: string;
  /** Default ink @ alpha. */
  ink: string;
  /** Hairline divider. */
  hair: string;
}

const PALETTES: Record<Portal, Palette> = {
  admin: {
    bg: "var(--portal-emerald-sidebar)",
    active: "var(--portal-emerald-sidebar-active)",
    activeInk: "var(--portal-emerald-sidebar-text)",
    ink: "var(--portal-emerald-sidebar-text)",
    hair: "rgba(255,255,255,0.10)",
  },
  vendor: {
    bg: "var(--vendor-sidebar)",
    active: "var(--vendor-sidebar-soft)",
    activeInk: "var(--vendor-sidebar-ink)",
    ink: "color-mix(in oklch, var(--vendor-sidebar-ink) 82%, transparent)",
    hair: "color-mix(in oklch, var(--vendor-sidebar-ink) 10%, transparent)",
  },
  exec: {
    bg: "var(--exec-sidebar)",
    active: "var(--exec-sidebar-active)",
    activeInk: "var(--exec-sidebar-text)",
    ink: "var(--exec-sidebar-text)",
    hair: "rgba(255,255,255,0.10)",
  },
};

function isActive(pathname: string, href: string): boolean {
  if (href === pathname) return true;
  // First-level admin/vendor/exec home items should not match every nested route.
  const segments = href.split("/").filter(Boolean);
  if (segments.length <= 1) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export function PortalSidebar({ portal, brand, groups, identity, account, onSignOut, signOutSlot, badgeSource }: PortalSidebarProps) {
  const pathname = usePathname() ?? "";
  const p = PALETTES[portal];
  const liveBadges = useLiveBadges(badgeSource);
  return (
    <aside
      className="w-60 shrink-0 hidden md:flex flex-col justify-between"
      style={{ background: p.bg }}
    >
      <div>
        <div className="px-5 h-16 flex items-center border-b" style={{ borderColor: p.hair }}>
          {brand ?? <Wordmark size={16} surface="dark" />}
        </div>
        <nav className="px-3 py-4 space-y-5">
          {groups.map((g, gi) => (
            <Fragment key={gi}>
              {g.heading && (
                <div
                  className="px-3 text-[10px] uppercase tracking-[0.18em] mb-1.5"
                  style={{ color: p.ink, opacity: 0.6 }}
                >
                  {g.heading}
                </div>
              )}
              <div className="space-y-1">
                {g.items.map((item) => (
                  <NavRow key={item.label} item={item} pathname={pathname} palette={p} liveBadges={liveBadges} />
                ))}
              </div>
            </Fragment>
          ))}
        </nav>
      </div>
      <div className="px-3 pb-4">
        {identity && (
          <>
            <div className="my-3 border-t" style={{ borderColor: p.hair }} />
            <div className="px-3 py-2 flex items-center gap-3">
              <span
                className="size-7 rounded-md flex items-center justify-center font-mono text-[10px] font-semibold uppercase shrink-0"
                style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
              >
                {identity.initials}
              </span>
              <div className="leading-tight min-w-0">
                <div className="text-[13px] font-semibold truncate" style={{ color: p.activeInk }}>
                  {identity.title}
                </div>
                <div className="text-[11px] truncate" style={{ color: p.ink, opacity: 0.65 }}>
                  {identity.subtitle}
                </div>
              </div>
            </div>
          </>
        )}
        <div className="my-3 border-t" style={{ borderColor: p.hair }} />
        <div className="px-3 py-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(255,255,255,0.06)" }}>
          <span
            className="size-8 rounded-full grid place-items-center text-[12px] font-semibold shrink-0"
            style={{ background: p.active, color: p.activeInk }}
          >
            {initialsOf(account.name || "?")}
          </span>
          <div className="leading-tight min-w-0">
            <div className="text-[13px] font-medium truncate" style={{ color: p.activeInk }}>
              {account.name}
            </div>
            {(signOutSlot || onSignOut) && (
              signOutSlot ?? (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="text-[10px] uppercase tracking-[0.16em] opacity-70 hover:opacity-100"
                  style={{ color: p.activeInk }}
                >
                  Sign out
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavRow({
  item,
  pathname,
  palette,
  liveBadges,
}: {
  item: NavItem;
  pathname: string;
  palette: Palette;
  liveBadges: Record<string, number> | null;
}) {
  const active = isActive(pathname, item.href);
  const badge = badgeFor(item, liveBadges);
  return (
    <>
      <Link
        href={item.href}
        className="flex items-center gap-3 px-3 py-2 rounded-xl text-[13.5px]"
        style={active ? { background: palette.active, color: palette.activeInk, fontWeight: 600 } : { color: palette.ink }}
      >
        <Icon name={item.icon} />
        <span className="flex-1 truncate">{item.label}</span>
        {badge !== undefined && badge > 0 && <Badge tone="amber" count={badge} />}
        {item.locked && <Icon name="padlock" size={12} className="opacity-60" />}
      </Link>
      {item.children && item.children.length > 0 && (
        <div className="mt-0.5 mb-1 ml-7 space-y-0.5">
          {item.children.map((child) => {
            const childActive = isActive(pathname, child.href);
            const childBadge = badgeFor(child, liveBadges);
            return (
              <Link
                key={child.label}
                href={child.href}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px]"
                style={childActive ? { background: palette.active, color: palette.activeInk, fontWeight: 600 } : { color: palette.ink, opacity: 0.9 }}
              >
                <span className="flex-1 truncate">{child.label}</span>
                {childBadge !== undefined && childBadge > 0 && <Badge tone="amber" count={childBadge} />}
                {child.locked && <Icon name="padlock" size={12} className="opacity-60" />}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
