import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import {
  MetricsRibbon,
  PortalPage,
  Button,
  type RibbonGroup,
} from "@thegoodintro/ui";
import { MeetingsView } from "./_view";
import type { MeetingItem, MeetingStatusEnum } from "./_status";

export const metadata: Metadata = {
  title: "Meetings — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

type ExecRel = {
  name: string | null;
  title: string | null;
  company: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  context_notes: string | null;
  interested_in: string | null;
  current_projects: string | null;
  not_interested_in: string | null;
  timeline: string | null;
  seniority_signal: string | null;
};
type RequesterRel = { name: string | null; role: string | null; email: string | null };
type RequestRel = {
  q1_what: string | null;
  q2_why: string | null;
  created_at: string | null;
  executive: ExecRel | ExecRel[] | null;
  vendor: { name: string } | { name: string }[] | null;
  requester: RequesterRel | RequesterRel[] | null;
};
type MeetingRow = {
  id: string;
  status: MeetingStatusEnum;
  scheduled_at: string | null;
  credit_lot_id: string | null;
  payment_due_at: string | null;
  join_url: string | null;
  charity: { name: string } | { name: string }[] | null;
  request: RequestRel | RequestRel[] | null;
  gift: { charity_amount_cents: number } | { charity_amount_cents: number }[] | null;
};

function shape(row: MeetingRow): MeetingItem {
  const req = one<RequestRel>(row.request);
  const exec = one<ExecRel>(req?.executive);
  const vendor = one<{ name: string }>(req?.vendor);
  const requester = one<RequesterRel>(req?.requester);
  const charity = one<{ name: string }>(row.charity);
  const gift = one<{ charity_amount_cents: number }>(row.gift);
  return {
    id: row.id,
    status: row.status,
    scheduledIso: row.scheduled_at,
    creditLotId: row.credit_lot_id,
    paymentDueIso: row.payment_due_at,
    joinUrl: row.join_url,
    vendorName: vendor?.name ?? "Vendor",
    execName: exec?.name ?? null,
    execLabel: exec ? [exec.title, exec.company].filter(Boolean).join(", ") : "—",
    execTitle: exec?.title ?? null,
    execCompany: exec?.company ?? null,
    execPhotoUrl: exec?.photo_url ?? null,
    execLinkedinUrl: exec?.linkedin_url ?? null,
    execContextNotes: exec?.context_notes ?? null,
    execInterestedIn: exec?.interested_in ?? null,
    execCurrentProjects: exec?.current_projects ?? null,
    execNotInterestedIn: exec?.not_interested_in ?? null,
    execTimeline: exec?.timeline ?? null,
    execSenioritySignal: exec?.seniority_signal ?? null,
    charityName: charity?.name ?? null,
    giftAmountCents: gift?.charity_amount_cents ?? null,
    requesterName: requester?.name ?? null,
    requesterRole: requester?.role ?? null,
    requesterEmail: requester?.email ?? null,
    requestQ1: req?.q1_what ?? null,
    requestQ2: req?.q2_why ?? null,
    requestSubmittedIso: req?.created_at ?? null,
  };
}

export default async function MeetingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; m?: string; d?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  const now = new Date();
  const y = now.getUTCFullYear();
  const monthStart = new Date(Date.UTC(y, now.getUTCMonth(), 1)).toISOString();
  const monthEnd = new Date(Date.UTC(y, now.getUTCMonth() + 1, 1)).toISOString();
  const sevenAhead = new Date(now.getTime() + 7 * 86_400_000).toISOString();
  const head = { count: "exact" as const, head: true };

  const [allMeetings, upcomingC, pendingC, satisfiedC] = await Promise.all([
    // Every meeting feeds the calendar + list (one fetch, client-side paging).
    supabase
      .from("meeting")
      .select(
        "id, status, scheduled_at, credit_lot_id, payment_due_at, join_url, charity:charity_id ( name ), request:request_id ( q1_what, q2_why, created_at, executive:executive_id ( name, title, company, photo_url, linkedin_url, context_notes, interested_in, current_projects, not_interested_in, timeline, seniority_signal ), vendor:vendor_id ( name ), requester:requested_by_user_id ( name, role, email ) ), gift:gift_record ( charity_amount_cents )",
      )
      .order("scheduled_at", { ascending: false, nullsFirst: false })
      .limit(2000),

    // Ribbon — upcoming (confirmed, next 7 days)
    supabase
      .from("meeting")
      .select("id", head)
      .eq("status", "confirmed")
      .gte("scheduled_at", now.toISOString())
      .lt("scheduled_at", sevenAhead),
    // Ribbon — pending requests (awaiting review)
    supabase.from("request").select("id", head).eq("status", "submitted"),
    // Ribbon — meetings satisfied (held this month)
    supabase
      .from("meeting")
      .select("id", head)
      .eq("status", "held")
      .gte("scheduled_at", monthStart)
      .lt("scheduled_at", monthEnd),
  ]);

  const meetings = ((allMeetings.data ?? []) as unknown as MeetingRow[]).map(shape);

  const ribbonGroups: RibbonGroup[] = [
    { label: "Upcoming meetings", stats: [{ value: String(upcomingC.count ?? 0), sub: "confirmed in the next 7 days", big: true }] },
    { label: "Pending requests", stats: [{ value: String(pendingC.count ?? 0), sub: "awaiting your review", big: true }] },
    { label: "Meetings satisfied", stats: [{ value: String(satisfiedC.count ?? 0), sub: "held to completion this month", big: true }] },
  ];

  const actionsEnabled = await getFlag("request_loop");
  // Sidebar sub-nav sends ?status=confirmed/held/cancelled (Scheduled / Completed
  // / Cancellations). Validate it and seed the list filter; a status filter reads
  // best in the list, so default to list view when one is present.
  const MEETING_STATUSES: MeetingStatusEnum[] = [
    "proposed",
    "confirmed",
    "held",
    "no_show",
    "cancelled",
    "reversed",
  ];
  const initialStatus = MEETING_STATUSES.includes(sp.status as MeetingStatusEnum)
    ? (sp.status as MeetingStatusEnum)
    : null;
  const initialView = sp.view === "list" || initialStatus ? "list" : "calendar";
  const initialKey = sp.d ?? (sp.m ? `${sp.m}-01` : null);

  return (
    <PortalPage
      title="Meetings"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Meetings" }]}
      action={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" href="/admin/reports">
            Export
          </Button>
          <Button variant="primary" size="md" href="/admin/meetings/new">
            + New meeting
          </Button>
        </div>
      }
    >
      <MetricsRibbon groups={ribbonGroups} columns={3} numeralFont="fraunces" />

      <MeetingsView
        meetings={meetings}
        nowIso={now.toISOString()}
        actionsEnabled={actionsEnabled}
        initialView={initialView}
        initialKey={initialKey}
        initialStatus={initialStatus}
      />
    </PortalPage>
  );
}
