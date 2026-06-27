import {
  shortDateLabel,
  timeWithZone,
  type MeetingStatusEnum,
} from "@/app/admin/meetings/_status";

/**
 * Pure shaping for the read-only /vendor/meetings list. Vendor-scoped by RLS
 * upstream (the meeting select policy restricts to the vendor's own meetings).
 * Reuses the admin meeting status pill + Sydney date/time formatters so the two
 * portals never drift; the group buckets, provider label, and "what's next"
 * copy are the vendor-facing additions. No money figures (charity-amount rule).
 */

export type GiftStatusEnum = "released" | "paid" | "voided";

/** The four buckets the vendor view groups meetings into (task spec). */
export type MeetingGroup = "upcoming" | "pending" | "past" | "cancelled";

export const MEETING_GROUPS: MeetingGroup[] = ["upcoming", "pending", "past", "cancelled"];

export const MEETING_GROUP_LABEL: Record<MeetingGroup, string> = {
  upcoming: "Upcoming",
  pending: "Pending",
  past: "Past",
  cancelled: "Cancelled",
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

type ExecRel = { name: string | null; title: string | null; company: string | null };
type RequestRel = { executive: ExecRel | ExecRel[] | null };
type GiftRel = { status: GiftStatusEnum; charity_amount_cents: number };

export interface RawVendorMeeting {
  id: string;
  status: MeetingStatusEnum;
  scheduled_at: string | null;
  join_url: string | null;
  created_at: string;
  charity: { name: string } | { name: string }[] | null;
  request: RequestRel | RequestRel[] | null;
  gift: GiftRel | GiftRel[] | null;
}

export interface VendorMeetingRow {
  id: string;
  status: MeetingStatusEnum;
  group: MeetingGroup;
  execName: string | null;
  execDetail: string | null; // "title, company"
  scheduledIso: string | null;
  whenLabel: string; // "12 Mar 2027 · 14:30 AEST" or "Not scheduled yet"
  joinUrl: string | null;
  provider: string | null; // "Zoom" / "Teams" / "Google Meet" / "Video call"
  charityName: string | null;
  /** Only a meaningful gift is surfaced (released/paid); a voided gift reads as none. */
  giftStatus: Exclude<GiftStatusEnum, "voided"> | null;
  nextStep: string;
}

/** Which bucket a meeting falls in, given "now" (passed in for testability). */
export function meetingGroup(
  status: MeetingStatusEnum,
  scheduledIso: string | null,
  now: Date,
): MeetingGroup {
  if (status === "proposed") return "pending";
  if (status === "no_show" || status === "cancelled" || status === "reversed") return "cancelled";
  if (status === "held") return "past";
  // confirmed: upcoming while the locked-in time is still ahead, else past (awaiting outcome).
  if (scheduledIso && new Date(scheduledIso).getTime() >= now.getTime()) return "upcoming";
  return "past";
}

/** Best-effort provider name from a join URL host. Read-only label, never parsed for control. */
export function providerFromUrl(url: string | null): string | null {
  if (!url) return null;
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return "Video call";
  }
  if (host.includes("zoom.")) return "Zoom";
  if (host.includes("teams.")) return "Teams";
  if (host.includes("meet.google.")) return "Google Meet";
  if (host.includes("webex.")) return "Webex";
  return "Video call";
}

/** Plain-language "what happens next". Read-only guidance; triggers nothing. */
export function nextStep(
  status: MeetingStatusEnum,
  opts: { upcoming: boolean; hasJoinUrl: boolean; giftPaid: boolean },
): string {
  switch (status) {
    case "proposed":
      return "TheGoodIntro is arranging a time with the executive.";
    case "confirmed":
      if (!opts.upcoming) return "The scheduled time has passed; awaiting the meeting outcome.";
      return opts.hasJoinUrl
        ? "Confirmed. Use the join link at the scheduled time."
        : "Confirmed. A join link will be shared before the meeting.";
    case "held":
      return opts.giftPaid
        ? "Meeting complete. The gift has been sent to the chosen charity."
        : "Meeting complete. A gift goes to the executive's chosen charity.";
    case "no_show":
      return "Marked as a no-show; no gift was sent.";
    case "cancelled":
      return "This meeting was cancelled.";
    case "reversed":
      return "Reversed; being rebooked with the same executive.";
  }
}

export function shapeVendorMeetingRow(raw: RawVendorMeeting, now: Date): VendorMeetingRow {
  const exec = one<ExecRel>(one<RequestRel>(raw.request)?.executive);
  const charity = one<{ name: string }>(raw.charity);
  const gift = one<GiftRel>(raw.gift);
  const group = meetingGroup(raw.status, raw.scheduled_at, now);
  const upcoming = group === "upcoming";
  const giftStatus =
    gift && (gift.status === "released" || gift.status === "paid") ? gift.status : null;

  return {
    id: raw.id,
    status: raw.status,
    group,
    execName: exec?.name ?? null,
    execDetail: exec ? [exec.title, exec.company].filter(Boolean).join(", ") || null : null,
    scheduledIso: raw.scheduled_at,
    whenLabel: raw.scheduled_at
      ? `${shortDateLabel(raw.scheduled_at)} · ${timeWithZone(raw.scheduled_at)}`
      : "Not scheduled yet",
    joinUrl: raw.join_url,
    provider: providerFromUrl(raw.join_url),
    charityName: charity?.name ?? null,
    giftStatus,
    nextStep: nextStep(raw.status, {
      upcoming,
      hasJoinUrl: !!raw.join_url,
      giftPaid: gift?.status === "paid",
    }),
  };
}

/**
 * Default ordering for the "All" view: upcoming first (soonest at top), then
 * pending, then past (most recent first), then cancelled (most recent first).
 * Within a single-group filter this collapses to that group's order.
 */
export function sortVendorMeetings(rows: VendorMeetingRow[]): VendorMeetingRow[] {
  const rank: Record<MeetingGroup, number> = { upcoming: 0, pending: 1, past: 2, cancelled: 3 };
  return [...rows].sort((a, b) => {
    if (rank[a.group] !== rank[b.group]) return rank[a.group] - rank[b.group];
    const at = a.scheduledIso ?? "";
    const bt = b.scheduledIso ?? "";
    return a.group === "upcoming" ? at.localeCompare(bt) : bt.localeCompare(at);
  });
}
