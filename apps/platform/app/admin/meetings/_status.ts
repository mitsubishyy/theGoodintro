import { MEETING_FEE_AUD } from "@thegoodintro/pricing";
import { formatAud } from "@/lib/format";
import type { Tone } from "@thegoodintro/ui";

/**
 * Admin Meetings — shared presentation + money rules (Admin Meetings list T3,
 * UI_KIT_DESIGN_LOG "Admin Meetings list (T3) — LOCKED"). Pure + server-safe so
 * the server page and the client calendar/list/drawer all read one source of
 * truth and never drift. No money figure is hardcoded: the flat credit value is
 * `MEETING_FEE_AUD` from @thegoodintro/pricing, formatted through lib/format.
 */

export type MeetingStatusEnum =
  | "proposed"
  | "confirmed"
  | "held"
  | "no_show"
  | "cancelled"
  | "reversed";

/** One shaped meeting row, built by the server page and shared with the client. */
export interface MeetingItem {
  id: string;
  status: MeetingStatusEnum;
  /** UTC ISO of the scheduled time; null while proposed-without-a-time. */
  scheduledIso: string | null;
  /** Non-null = a credit is attached (reserved while confirmed, consumed at held). */
  creditLotId: string | null;
  paymentDueIso: string | null;
  joinUrl: string | null;
  vendorName: string;
  /** Executive full name (avatar). null = no executive on the request. */
  execName: string | null;
  /** "Title, Company" used as the dense secondary label. */
  execLabel: string;
  execTitle: string | null;
  execCompany: string | null;
  execPhotoUrl: string | null;
  // ── The executive's qualified context (what they care about) — shown so the
  //    admin can see why this is a fit. context_notes is the populated field
  //    today; the structured ones fill in as the admin form captures them. ────
  execLinkedinUrl: string | null;
  execContextNotes: string | null;
  execInterestedIn: string | null;
  execCurrentProjects: string | null;
  execNotInterestedIn: string | null;
  execTimeline: string | null;
  execSenioritySignal: string | null;
  charityName: string | null;
  /** Frozen gift_record.charity_amount_cents — present only once held. */
  giftAmountCents: number | null;
  // ── The SaaS vendor's side of the request (admin-meeting-detail-vendor-side
  //    lock): who asked, what they want, and when they submitted. ─────────────
  requesterName: string | null;
  requesterRole: string | null;
  requesterEmail: string | null;
  /** request.q1_what — "Who do you want to meet?" */
  requestQ1: string | null;
  /** request.q2_why — "Why this person specifically?" */
  requestQ2: string | null;
  requestSubmittedIso: string | null;
}

export const ENDED_STATUSES: MeetingStatusEnum[] = ["no_show", "cancelled", "reversed"];

/** The flat credit value, e.g. "$1,500" — one meeting = one credit (CALCULATIONS). */
export function creditFlat(): string {
  return formatAud(MEETING_FEE_AUD * 100);
}

/**
 * Credit column (money-accurate, do not regress — design log lock):
 *   proposed                     → "None"
 *   confirmed + credit reserved  → "Reserved · $1,500"
 *   confirmed + overcommit       → "Awaiting payment"  (no credit, payment due)
 *   held                         → "Consumed · $1,500"
 *   no_show / cancelled / reversed → "—"  (releaseMeeting returns the credit:
 *                                   credit_lot_id is null, so no figure is shown;
 *                                   the mock's "Consumed · $1,500" on No-show is a
 *                                   mock error, not the state machine.)
 */
export function creditLabel(m: MeetingItem): string {
  switch (m.status) {
    case "proposed":
      return "None";
    case "confirmed":
      return m.creditLotId ? `Reserved · ${creditFlat()}` : "Awaiting payment";
    case "held":
      return `Consumed · ${creditFlat()}`;
    default:
      return "—";
  }
}

/**
 * Gift column: the frozen charity amount, on Held rows only (design log lock).
 * Never the $1,500 fee — the gift is the per-band charity share, frozen at Held.
 */
export function giftLabel(m: MeetingItem): string {
  if (m.status === "held" && m.giftAmountCents != null) {
    return formatAud(m.giftAmountCents);
  }
  return "—";
}

/**
 * "Needs attention" is a derived money-flag, not a status: a confirmed meeting
 * with no credit reserved is an overcommit awaiting payment. It drives the gold
 * calendar chip and the "ATTN" legend count. Distinct from Proposed.
 */
export function needsAttention(m: MeetingItem): boolean {
  return m.status === "confirmed" && m.creditLotId == null;
}

// ── List status pill (kit Badge tone) ───────────────────────────────────────

export function statusPill(status: MeetingStatusEnum): { label: string; tone: Tone } {
  switch (status) {
    case "confirmed":
      return { label: "Confirmed", tone: "neutral" };
    case "held":
      return { label: "Held", tone: "green" };
    case "proposed":
      return { label: "Proposed", tone: "amber" };
    case "no_show":
      return { label: "No-show", tone: "muted" };
    case "cancelled":
      return { label: "Cancelled", tone: "muted" };
    case "reversed":
      return { label: "Reversed", tone: "muted" };
  }
}

// ── Calendar chip + legend colour mapping ────────────────────────────────────

export type ChipKind = "confirmed" | "held" | "attention" | "proposed" | "ended";

export function chipKind(m: MeetingItem): ChipKind {
  if (m.status === "held") return "held";
  if (ENDED_STATUSES.includes(m.status)) return "ended";
  if (needsAttention(m)) return "attention";
  if (m.status === "proposed") return "proposed";
  return "confirmed";
}

/**
 * Chip styling per kind. `bar` is the left accent + the legend dot; `bg` fills
 * the whole chip (only "needs attention" is filled, faded gold); `strike` greys
 * + strikes the text (ended meetings). Internal status categorisation colour is
 * sanctioned on platform surfaces (design/locked README).
 */
export const CHIP_STYLE: Record<ChipKind, { bar: string; bg?: string; strike?: boolean }> = {
  confirmed: { bar: "oklch(0.58 0.10 155)" },
  held: { bar: "oklch(0.46 0.09 155)" },
  attention: { bar: "var(--portal-amber)", bg: "var(--portal-amber-soft)" },
  proposed: { bar: "color-mix(in oklch, var(--portal-ink) 35%, transparent)" },
  ended: { bar: "color-mix(in oklch, var(--portal-ink) 22%, transparent)", strike: true },
};

/** Legend order matches the locked footer: Confirmed · Held · Needs attention · Proposed · Cancelled / No-show. */
export const CALENDAR_LEGEND: { kind: ChipKind; label: string }[] = [
  { kind: "confirmed", label: "Confirmed" },
  { kind: "held", label: "Held" },
  { kind: "attention", label: "Needs attention" },
  { kind: "proposed", label: "Proposed" },
  { kind: "ended", label: "Cancelled / No-show" },
];

// ── Date / time formatting (Sydney) ──────────────────────────────────────────

export const SYDNEY_TZ = "Australia/Sydney";

/** "YYYY-MM-DD" in the given timezone (en-CA yields ISO order) — calendar bucket key. */
export function dayKey(iso: string, tz: string = SYDNEY_TZ): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

/** 24h time like "09:30" in Sydney. */
export function timeLabel(iso: string, tz: string = SYDNEY_TZ): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/** Short timezone name for Sydney at that instant, e.g. "AEST" / "AEDT". */
export function zoneAbbrev(iso: string, tz: string = SYDNEY_TZ): string {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: tz,
    timeZoneName: "short",
    hour: "2-digit",
  }).formatToParts(new Date(iso));
  return parts.find((p) => p.type === "timeZoneName")?.value ?? "";
}

/** "14:30 AEST" — time + zone, for the list and drawer. */
export function timeWithZone(iso: string, tz: string = SYDNEY_TZ): string {
  return `${timeLabel(iso, tz)} ${zoneAbbrev(iso, tz)}`.trim();
}

/**
 * Relative day label keyed on the Sydney calendar date: "Today" / "Tomorrow" /
 * "Yesterday", otherwise "Mon 2 Jun" (or "Mon 2 Jun 2027" across a year).
 */
export function relativeDateLabel(
  iso: string | null,
  nowIso: string,
  tz: string = SYDNEY_TZ,
): string {
  if (!iso) return "No time set";
  const target = dayKey(iso, tz);
  const today = dayKey(nowIso, tz);
  if (target === today) return "Today";

  const diffDays = Math.round(
    (Date.parse(`${target}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000,
  );
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";

  const sameYear = target.slice(0, 4) === today.slice(0, 4);
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
  }).format(new Date(iso));
}

/** "22 Apr 2026" — compact date for sub-lines (e.g. request submitted). */
export function shortDateLabel(iso: string | null, tz: string = SYDNEY_TZ): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: tz,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

/** "YYYY-MM-DDTHH:mm" in Sydney — prefill value for a datetime-local input. */
export function toDatetimeLocal(iso: string | null, tz: string = SYDNEY_TZ): string {
  if (!iso) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date(iso));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${get("year")}-${get("month")}-${get("day")}T${hour}:${get("minute")}`;
}

/** "Monday 2 June 2026" — drawer long form. */
export function longDateLabel(iso: string | null, tz: string = SYDNEY_TZ): string {
  if (!iso) return "To be confirmed";
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: tz,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}
