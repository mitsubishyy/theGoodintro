import type { ReactNode } from "react";
import type { IconName } from "./icons";

/** The three portal surfaces with locked sidebar palettes (UI_KIT_DESIGN_LOG). */
export type Portal = "admin" | "vendor" | "exec";

/** Async/lookup state every interactive shell exposes (BLUEPRINT §0). */
export type LoadState = "ready" | "loading" | "error" | "empty";

/** Tone tokens for badges / status pills / dots. */
export type Tone = "amber" | "neutral" | "green" | "muted" | "danger";

/** A single nav row in <PortalSidebar>. */
export interface NavItem {
  label: string;
  href: string;
  icon: IconName;
  /** Renders an amber count badge on the right when > 0. */
  badgeCount?: number;
  /** Pre-payment / pre-vetting gate: shows a padlock at the END of the row;
   *  the item stays clickable and routes to the lockout page (UI_KIT_DESIGN_LOG
   *  "Reusable lockout page pattern"). Admin items never use this. */
  locked?: boolean;
  /** Expandable parent (admin "Clients", "Meetings"). */
  children?: NavItem[];
}

/** Sidebar bottom "identity card" (vendor portal pattern; optional elsewhere). */
export interface IdentityCard {
  /** Two-letter initials, or pass `src` for a logo. */
  initials: string;
  src?: string;
  /** Top line, e.g. "Acme Robotics". */
  title: string;
  /** Bottom line, e.g. "Band 2 · Renews 12 Mar 2027" OR "Awaiting approval". */
  subtitle: string;
}

/** Account block pinned to the sidebar bottom. */
export interface AccountChip {
  name: string;
  role?: string;
  avatarUrl?: string;
}

/** One stat group inside a <MetricsRibbon>. */
export interface RibbonStat {
  value: string;
  unit?: string;
  /** Bigger weight for headline numbers like "to charity / FY". */
  big?: boolean;
}
export interface RibbonGroup {
  label: string;
  stats: RibbonStat[];
}

/** <DataTable> column descriptor; T3 list template (next installment). */
export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
  width?: string;
  align?: "left" | "right";
}
