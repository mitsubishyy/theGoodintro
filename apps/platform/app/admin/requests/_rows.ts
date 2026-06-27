import { ageShort, formatDate } from "@/lib/format";
import type { MeetingStatusEnum } from "../meetings/_status";
import type { RequestStatusEnum } from "./_status";

/**
 * Pure row-shaping for the read-only /admin/requests list. Kept out of the page
 * and the client table so it is unit-testable and so the server component stays
 * a thin fetch + render. No money math, no state changes; PostgREST embeds
 * arrive as object-or-array, so `one` normalises them.
 */

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

type NameRel = { name: string | null };
type RequesterRel = { name: string | null; role: string | null; email: string | null };
type ExecRel = { name: string | null; title: string | null; company: string | null };
type MeetingRel = { status: MeetingStatusEnum; scheduled_at: string | null; created_at: string };

export interface RawRequest {
  id: string;
  status: RequestStatusEnum;
  created_at: string;
  vendor: NameRel | NameRel[] | null;
  requester: RequesterRel | RequesterRel[] | null;
  executive: ExecRel | ExecRel[] | null;
  meeting: MeetingRel | MeetingRel[] | null;
}

export interface LinkedMeeting {
  status: MeetingStatusEnum;
  scheduledIso: string | null;
}

export interface RequestRow {
  id: string;
  status: RequestStatusEnum;
  vendorName: string;
  requesterName: string | null;
  requesterDetail: string | null; // "role · email"
  execName: string | null;
  execDetail: string | null; // "title, company"
  createdIso: string;
  ageLabel: string; // "3d" / "14h" / "5m"
  createdLabel: string; // absolute date for the sub-line / tooltip
  meeting: LinkedMeeting | null;
}

/**
 * The newest meeting linked to a request, or null. A manual reversal spawns a
 * fresh `proposed` meeting on the same request (reverse_held), so a request can
 * own several meetings; the list shows the latest attempt by created_at.
 */
export function pickLatestMeeting(meeting: RawRequest["meeting"]): LinkedMeeting | null {
  const list = Array.isArray(meeting) ? meeting : meeting ? [meeting] : [];
  if (list.length === 0) return null;
  const latest = [...list].sort((a, b) =>
    (b.created_at ?? "").localeCompare(a.created_at ?? ""),
  )[0];
  return { status: latest.status, scheduledIso: latest.scheduled_at ?? null };
}

export function shapeRequestRow(raw: RawRequest): RequestRow {
  const vendor = one<NameRel>(raw.vendor);
  const requester = one<RequesterRel>(raw.requester);
  const exec = one<ExecRel>(raw.executive);
  const age = ageShort(raw.created_at);
  return {
    id: raw.id,
    status: raw.status,
    vendorName: vendor?.name ?? "Vendor",
    requesterName: requester?.name ?? null,
    requesterDetail: [requester?.role, requester?.email].filter(Boolean).join(" · ") || null,
    execName: exec?.name ?? null,
    execDetail: exec ? [exec.title, exec.company].filter(Boolean).join(", ") || null : null,
    createdIso: raw.created_at,
    ageLabel: age.label,
    createdLabel: formatDate(raw.created_at),
    meeting: pickLatestMeeting(raw.meeting),
  };
}
