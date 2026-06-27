import { ageShort, formatDate } from "@/lib/format";
import { pickLatestMeeting, type LinkedMeeting } from "@/app/admin/requests/_rows";
import type { RequestStatusEnum } from "@/app/admin/requests/_status";
import type { MeetingStatusEnum } from "@/app/admin/meetings/_status";

/**
 * Pure row-shaping for the read-only /vendor/requests list. Vendor-scoped: the
 * page fetches under the vendor's RLS session, so these rows are already only
 * the vendor's own requests. Reuses the admin latest-meeting picker + status
 * enums so the two portals never drift; the "what happens next" copy is the one
 * vendor-facing addition. No money figures (charity-amount copy rule).
 */

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

type ExecRel = { name: string | null; title: string | null; company: string | null };
type MeetingRel = { status: MeetingStatusEnum; scheduled_at: string | null; created_at: string };

export interface RawVendorRequest {
  id: string;
  status: RequestStatusEnum;
  created_at: string;
  executive: ExecRel | ExecRel[] | null;
  meeting: MeetingRel | MeetingRel[] | null;
}

export interface VendorRequestRow {
  id: string;
  status: RequestStatusEnum;
  execName: string | null;
  execDetail: string | null; // "title, company"
  createdIso: string;
  createdLabel: string; // absolute date (vendors asked for the created date)
  ageLabel: string; // "3d" / "14h" — shown as the muted sub-line
  meeting: LinkedMeeting | null;
  nextStep: string;
}

/**
 * Plain-language "what happens next" for a request, derived from its status and
 * the live meeting state. Read-only guidance; it triggers nothing. A reversal
 * spawns a fresh proposed meeting, so the latest meeting (pickLatestMeeting)
 * usually reads as that rebooked `proposed`, not the `reversed` one.
 */
export function nextStep(status: RequestStatusEnum, meeting: LinkedMeeting | null): string {
  if (status === "submitted") return "Waiting on the executive to accept or decline.";
  if (status === "declined") return "The executive declined this request.";
  if (status === "closed") return "This request was closed by TheGoodIntro.";
  // accepted — the meeting carries the live state.
  if (!meeting) return "Accepted. TheGoodIntro is arranging a time.";
  switch (meeting.status) {
    case "proposed":
      return "Accepted. TheGoodIntro is arranging a time.";
    case "confirmed":
      return "Time confirmed. The meeting is on the calendar.";
    case "held":
      return "Meeting complete. A gift goes to the executive's chosen charity.";
    case "no_show":
      return "The meeting was missed. TheGoodIntro will follow up.";
    case "cancelled":
      return "This meeting was cancelled.";
    case "reversed":
      return "Being rebooked with the same executive.";
  }
}

export function shapeVendorRequestRow(raw: RawVendorRequest): VendorRequestRow {
  const exec = one<ExecRel>(raw.executive);
  const meeting = pickLatestMeeting(raw.meeting);
  return {
    id: raw.id,
    status: raw.status,
    execName: exec?.name ?? null,
    execDetail: exec ? [exec.title, exec.company].filter(Boolean).join(", ") || null : null,
    createdIso: raw.created_at,
    createdLabel: formatDate(raw.created_at),
    ageLabel: ageShort(raw.created_at).label,
    meeting,
    nextStep: nextStep(raw.status, meeting),
  };
}
