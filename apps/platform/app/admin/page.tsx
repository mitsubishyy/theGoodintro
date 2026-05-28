import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatAud, ageShort } from "@/lib/format";
import { financialYearWindow, monthWindow, revenueForPeriod } from "@/lib/reporting";
import {
  MetricsRibbon,
  CalendarWidget,
  TasksWidget,
  RequestsWidget,
  CommsWidget,
  type Task,
  type PendingRequest,
} from "./_components/widgets";

export const metadata: Metadata = {
  title: "Dashboard — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const DAY = 86_400_000;
function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

export default async function AdminDashboard() {
  const supabase = await createClient();
  const now = new Date();
  const y = now.getUTCFullYear();
  const monthStart = new Date(Date.UTC(y, now.getUTCMonth(), 1)).toISOString();
  const monthEnd = new Date(Date.UTC(y, now.getUTCMonth() + 1, 1)).toISOString();
  const head = { count: "exact" as const, head: true };
  const fyWindow = financialYearWindow(now);
  const mtdWindow = monthWindow(now);

  const [
    scheduled, ahead, doneC, vendorsC, execsC,
    monthMeetings, proposedMtgs, onboardExecs, releasedGifts, pendingReqs,
    fyRev, mtdRev,
  ] = await Promise.all([
    supabase.from("meeting").select("id", head).eq("status", "confirmed"),
    supabase.from("meeting").select("id", head).eq("status", "proposed"),
    supabase.from("meeting").select("id", head).eq("status", "held"),
    supabase.from("vendor").select("id", head),
    supabase.from("executive").select("id", head).eq("status", "active"),
    supabase.from("meeting").select("scheduled_at").in("status", ["confirmed", "held"]).gte("scheduled_at", monthStart).lt("scheduled_at", monthEnd),
    supabase.from("meeting").select("created_at, request:request_id(vendor:vendor_id(name), executive:executive_id(title,company))").eq("status", "proposed").order("created_at", { ascending: true }).limit(6),
    supabase.from("executive").select("name, created_at").in("status", ["invited", "set_up"]).order("created_at", { ascending: true }).limit(6),
    supabase.from("gift_record").select("created_at, charity:charity_id(name)").eq("status", "released").order("created_at", { ascending: true }).limit(6),
    supabase.from("request").select("created_at, vendor:vendor_id(name), executive:executive_id(title,company)").eq("status", "submitted").order("created_at", { ascending: true }).limit(8),
    // Money goes through the reporting layer (FY, filtered on sat_date) so the
    // dashboard, reports, and CSV never drift. Never recompute money in a page.
    revenueForPeriod(supabase, fyWindow),
    revenueForPeriod(supabase, mtdWindow),
  ]);

  const toCharity = fyRev.charityCommittedCents;
  const revenueYtd = fyRev.netCents;
  const revenueMtd = mtdRev.netCents;

  const bookedDays = Array.from(
    new Set((monthMeetings.data ?? []).map((m) => new Date(m.scheduled_at as string).getUTCDate())),
  );

  // Needs-action tasks, oldest first, capped.
  const tasks: Task[] = [];
  for (const m of proposedMtgs.data ?? []) {
    const req = one<{ vendor: unknown; executive: unknown }>(m.request);
    const v = one<{ name: string }>(req?.vendor);
    const e = one<{ title: string; company: string }>(req?.executive);
    const a = ageShort(m.created_at as string);
    tasks.push({ type: "Confirm time", who: `${v?.name ?? "Vendor"} → ${e?.title ?? ""}, ${e?.company ?? ""}`, age: a.label, stale: a.days >= 3, actions: ["Confirm"] });
  }
  for (const e of onboardExecs.data ?? []) {
    const a = ageShort(e.created_at as string);
    tasks.push({ type: "New onboard", who: `Exec: ${e.name as string}`, age: a.label, stale: a.days >= 3, actions: ["Set up profile"] });
  }
  for (const g of releasedGifts.data ?? []) {
    const c = one<{ name: string }>(g.charity);
    const a = ageShort(g.created_at as string);
    tasks.push({ type: "Release gift", who: c?.name ?? "Charity", age: a.label, stale: a.days >= 1, actions: ["Release"] });
  }

  const requests: PendingRequest[] = (pendingReqs.data ?? []).map((r) => {
    const v = one<{ name: string }>(r.vendor);
    const e = one<{ title: string; company: string }>(r.executive);
    const a = ageShort(r.created_at as string);
    return { vendor: v?.name ?? "Vendor", exec: `${e?.title ?? ""}, ${e?.company ?? ""}`, age: a.label, stale: a.days >= 3 };
  });

  return (
    <>
      <MetricsRibbon
        m={{
          meetingsScheduled: scheduled.count ?? 0,
          meetingsAhead: ahead.count ?? 0,
          meetingsDone: doneC.count ?? 0,
          vendors: vendorsC.count ?? 0,
          execs: execsC.count ?? 0,
          toCharity: formatAud(toCharity),
          revenueMtd: formatAud(revenueMtd),
          revenueYtd: formatAud(revenueYtd),
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8 space-y-5">
          <CalendarWidget bookedDays={bookedDays} today={now.getUTCDate()} monthDate={now} />
          <TasksWidget tasks={tasks.slice(0, 6)} />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <RequestsWidget requests={requests} />
          <CommsWidget comms={[]} />
        </div>
      </div>
    </>
  );
}
