import type { SupabaseClient } from "@supabase/supabase-js";
import { bandForMeetingNumber, charityShareCentsForMeetingNumber } from "@thegoodintro/pricing";
import { formatAud } from "@/lib/format";
import { execCharityForPeriod, financialYearWindow, monthWindow } from "@/lib/reporting";

/* Demo executive resolution + live-data loader for the locked exec dashboard
   (design/locked/exec-dashboard, VP1). Real magic-link exec/EA auth is deferred
   (EXECUTIVE_PORTAL_BRIEF); for the staging demo we resolve one seeded executive
   and the staff/admin session reads it under RLS. */

const SEEDED_DEMO_EXEC = "00000000-0000-0000-0000-00000000ec03"; // Priya Raghavan (locked sample)

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

/** The executive whose dashboard the demo shows: the locked sample, else the first active. */
export async function resolveDemoExecutiveId(supabase: SupabaseClient): Promise<string | null> {
  const { data: known } = await supabase
    .from("executive")
    .select("id")
    .eq("id", SEEDED_DEMO_EXEC)
    .is("deleted_at", null)
    .maybeSingle();
  if (known?.id) return known.id as string;

  const { data: first } = await supabase
    .from("executive")
    .select("id")
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (first?.id as string) ?? null;
}

export interface IncomingRow {
  id: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  /** request.proposed_at is not in schema yet, so the locked "Date · duration ·
   *  provider" line degrades to duration + an honest scheduling note. */
  timeLabel: string;
}

export interface UpcomingRow {
  id: string;
  dateLabel: string;
  timeLabel: string;
  name: string;
  role: string | null;
  company: string;
  photoUrl: string | null;
  joinUrl: string | null;
  provider: "Zoom" | "Teams";
  amount: string;
  charityName: string;
  isOverride: boolean;
  standingCharityName: string;
}

export interface ImpactRow {
  id: string;
  datePrefix: string; // mono "02 JUN"
  body: string;
  status: string; // "Confirmed." / "Pending."
  name: string;
  photoUrl: string | null;
}

export interface ExecHomeData {
  exec: {
    id: string;
    name: string;
    firstName: string;
    title: string | null;
    company: string | null;
    email: string;
    photoUrl: string | null;
    timezone: string;
  };
  greeting: string; // "Good morning, Priya." — capital "Good" rendered emerald in the view
  greetingDate: string;
  metrics: {
    incoming: number;
    upcoming: number;
    fyAmount: string;
    fyMeetings: number;
    lifetimeAmount: string;
    lifetimeMeetings: number;
    lifetimeCharities: number;
  };
  standing: {
    charityId: string;
    name: string;
    cause: string | null;
    abn: string | null;
    dgrItem: string | null;
    dgrStatus: string | null;
    logoUrl: string | null;
    sinceLabel: string | null;
  } | null;
  incoming: IncomingRow[];
  upcoming: UpcomingRow[];
  impact: ImpactRow[];
}

const AEST = "Australia/Sydney";

function longDate(d: Date, tz: string): string {
  return new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", timeZone: tz }).format(d);
}
function partOfDay(d: Date, tz: string): string {
  const hour = Number(new Intl.DateTimeFormat("en-AU", { hour: "numeric", hour12: false, timeZone: tz }).format(d));
  if (hour < 12) return "morning";
  if (hour < 18) return "afternoon";
  return "evening";
}
function shortDateNum(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: tz }).format(new Date(iso));
}
function monoDatePrefix(iso: string, tz: string): string {
  const parts = new Intl.DateTimeFormat("en-AU", { day: "2-digit", month: "short", timeZone: tz }).formatToParts(new Date(iso));
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  const mon = (parts.find((p) => p.type === "month")?.value ?? "").toUpperCase();
  return `${day} ${mon}`;
}
function clockLabel(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: tz }).format(new Date(iso)) + " AEST";
}
function providerFromUrl(url: string | null): "Zoom" | "Teams" {
  return url && /teams\.microsoft|teams\.live/.test(url) ? "Teams" : "Zoom";
}
function attendeeTitle(attendee: unknown): string | null {
  const a = attendee as { title?: string } | null;
  return a?.title?.trim() || null;
}

export async function loadExecHome(supabase: SupabaseClient, execId: string, now = new Date()): Promise<ExecHomeData | null> {
  const { data: execRow } = await supabase
    .from("executive")
    .select("id, name, title, company, primary_email, photo_url, timezone, default_charity_id")
    .eq("id", execId)
    .maybeSingle();
  if (!execRow) return null;

  const tz = (execRow.timezone as string) || AEST;
  const defaultCharityId = (execRow.default_charity_id as string) ?? null;
  const fy = financialYearWindow(now);
  const month = monthWindow(now);

  // ── Standing charity + "since" from the open nomination row ────────────────
  let standing: ExecHomeData["standing"] = null;
  if (defaultCharityId) {
    const [{ data: charity }, { data: nom }] = await Promise.all([
      supabase.from("charity").select("id, name, short_name, abn, dgr_status").eq("id", defaultCharityId).maybeSingle(),
      supabase
        .from("nomination_history")
        .select("started_at")
        .eq("executive_id", execId)
        .eq("charity_id", defaultCharityId)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (charity) {
      standing = {
        charityId: charity.id as string,
        name: charity.name as string,
        cause: null, // charity.cause not in schema yet (next charity-content increment)
        abn: (charity.abn as string) ?? null,
        dgrItem: null, // charity.dgr_item not in schema yet
        dgrStatus: (charity.dgr_status as string) ?? null,
        logoUrl: null, // charity.logo_url not in schema yet → initials fallback
        sinceLabel: nom?.started_at ? shortDateNum(nom.started_at as string, tz) : null,
      };
    }
  }

  // ── Requests for this exec (incoming + the id set for meetings/gifts) ──────
  const { data: reqRows } = await supabase
    .from("request")
    .select("id, status, vendor_id, attendee, meeting_minutes, created_at, vendor:vendor_id(name), requester:requested_by_user_id(name, photo_url)")
    .eq("executive_id", execId)
    .order("created_at", { ascending: true });
  const allReqs = reqRows ?? [];
  const requestIds = allReqs.map((r) => r.id as string);
  const vendorIds = [...new Set(allReqs.map((r) => r.vendor_id as string))];

  // Per-vendor held count → indicative band amount for each request's vendor.
  const heldByVendor = new Map<string, number>();
  if (vendorIds.length) {
    const { data: cycles } = await supabase
      .from("cycle")
      .select("vendor_id, held_meetings_count, started_at")
      .in("vendor_id", vendorIds)
      .order("started_at", { ascending: false });
    for (const c of cycles ?? []) {
      if (!heldByVendor.has(c.vendor_id as string)) heldByVendor.set(c.vendor_id as string, (c.held_meetings_count as number) ?? 0);
    }
  }
  const indicativeForVendor = (vendorId: string): string =>
    formatAud(bandForMeetingNumber((heldByVendor.get(vendorId) ?? 0) + 1).rateCents);

  const incoming: IncomingRow[] = allReqs
    .filter((r) => r.status === "submitted")
    .map((r) => {
      const v = one<{ name: string }>(r.vendor);
      const u = one<{ name: string; photo_url: string | null }>(r.requester);
      return {
        id: r.id as string,
        name: u?.name ?? v?.name ?? "A vendor",
        role: attendeeTitle(r.attendee),
        company: v?.name ?? "",
        photoUrl: u?.photo_url ?? null,
        timeLabel: `${r.meeting_minutes ?? 45} min · time to be confirmed`,
      };
    });

  // ── Meetings: upcoming (confirmed) + gifts (held) ─────────────────────────
  let upcoming: UpcomingRow[] = [];
  let impact: ImpactRow[] = [];
  let upcomingMonthCount = 0;
  let fyHeldCount = 0;

  if (requestIds.length) {
    const reqMeta = new Map(
      allReqs.map((r) => {
        const v = one<{ name: string }>(r.vendor);
        const u = one<{ name: string; photo_url: string | null }>(r.requester);
        return [
          r.id as string,
          { vendorId: r.vendor_id as string, vendor: v?.name ?? "", person: u?.name ?? "", photo: u?.photo_url ?? null, role: attendeeTitle(r.attendee) },
        ];
      }),
    );

    const { data: mtgRows } = await supabase
      .from("meeting")
      .select("id, request_id, charity_id, scheduled_at, join_url, status, charity:charity_id(name)")
      .in("request_id", requestIds);
    const meetings = mtgRows ?? [];

    upcoming = meetings
      .filter((m) => m.status === "confirmed" && m.scheduled_at)
      .sort((a, b) => (a.scheduled_at as string).localeCompare(b.scheduled_at as string))
      .map((m) => {
        const meta = reqMeta.get(m.request_id as string)!;
        const c = one<{ name: string }>(m.charity);
        const charityName = c?.name ?? standing?.name ?? "your charity";
        return {
          id: m.id as string,
          dateLabel: shortDateNum(m.scheduled_at as string, tz),
          timeLabel: clockLabel(m.scheduled_at as string, tz),
          name: meta.person || meta.vendor,
          role: meta.role,
          company: meta.vendor,
          photoUrl: meta.photo,
          joinUrl: (m.join_url as string) ?? null,
          provider: providerFromUrl(m.join_url as string | null),
          amount: indicativeForVendor(meta.vendorId),
          charityName,
          isOverride: Boolean(m.charity_id && standing && m.charity_id !== standing.charityId),
          standingCharityName: standing?.name ?? "",
        };
      });

    upcomingMonthCount = meetings.filter(
      (m) => m.status === "confirmed" && m.scheduled_at && (m.scheduled_at as string) >= month.from && (m.scheduled_at as string) < month.to,
    ).length;

    // Recent impact: gift_records on this exec's held meetings.
    const meetingIds = meetings.map((m) => m.id as string);
    const mtgToReq = new Map(meetings.map((m) => [m.id as string, m.request_id as string]));
    if (meetingIds.length) {
      const { data: gifts } = await supabase
        .from("gift_record")
        .select("meeting_id, charity_amount_cents, status, sat_date, created_at, charity:charity_id(name)")
        .in("meeting_id", meetingIds)
        .neq("status", "voided")
        .order("sat_date", { ascending: false })
        .limit(3);
      impact = (gifts ?? []).map((g) => {
        const meta = reqMeta.get(mtgToReq.get(g.meeting_id as string) ?? "");
        const c = one<{ name: string }>(g.charity);
        const iso = (g.sat_date as string) ?? (g.created_at as string);
        const who = [meta?.person, meta?.vendor].filter(Boolean).join(", ") || "A meeting";
        return {
          id: g.meeting_id as string,
          datePrefix: monoDatePrefix(iso, tz),
          body: `${who} sent ${formatAud(g.charity_amount_cents as number)} to ${c?.name ?? "charity"}.`,
          status: g.status === "paid" ? "Confirmed." : "Pending.",
          name: meta?.person || meta?.vendor || "Meeting",
          photoUrl: meta?.photo ?? null,
        };
      });

      const { count: fyHeld } = await supabase
        .from("gift_record")
        .select("meeting_id", { count: "exact", head: true })
        .in("meeting_id", meetingIds)
        .neq("status", "voided")
        .gte("sat_date", fy.from)
        .lt("sat_date", fy.to);
      fyHeldCount = fyHeld ?? 0;
    }
  }

  // ── Money + lifetime counts through the reporting layer ────────────────────
  const [fyCharity, lifetimeCharity] = await Promise.all([
    execCharityForPeriod(supabase, execId, fy),
    execCharityForPeriod(supabase, execId, {}),
  ]);

  let lifetimeMeetings = 0;
  let lifetimeCharities = 0;
  if (requestIds.length) {
    const { data: allMtg } = await supabase.from("meeting").select("id").in("request_id", requestIds);
    const ids = (allMtg ?? []).map((m) => m.id as string);
    if (ids.length) {
      const { data: giftAll } = await supabase
        .from("gift_record")
        .select("charity_id")
        .in("meeting_id", ids)
        .neq("status", "voided");
      lifetimeMeetings = (giftAll ?? []).length;
      lifetimeCharities = new Set((giftAll ?? []).map((g) => g.charity_id as string)).size;
    }
  }

  const { count: incomingCount } = await supabase
    .from("request")
    .select("id", { count: "exact", head: true })
    .eq("executive_id", execId)
    .eq("status", "submitted");

  const name = (execRow.name as string) ?? "there";
  return {
    exec: {
      id: execId,
      name,
      firstName: name.split(" ")[0],
      title: (execRow.title as string) ?? null,
      company: (execRow.company as string) ?? null,
      email: (execRow.primary_email as string) ?? "",
      photoUrl: (execRow.photo_url as string) ?? null,
      timezone: tz,
    },
    greeting: `Good ${partOfDay(now, tz)}, ${name.split(" ")[0]}.`,
    greetingDate: longDate(now, tz),
    metrics: {
      incoming: incomingCount ?? incoming.length,
      upcoming: upcomingMonthCount,
      fyAmount: formatAud(fyCharity.totalCents),
      fyMeetings: fyHeldCount,
      lifetimeAmount: formatAud(lifetimeCharity.totalCents),
      lifetimeMeetings,
      lifetimeCharities,
    },
    standing,
    incoming,
    upcoming,
    impact,
  };
}

// Indicative band-1 share, used where a vendor context is not in hand.
export function indicativeFloor(): string {
  return formatAud(charityShareCentsForMeetingNumber(1));
}
