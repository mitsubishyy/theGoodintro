import type { SupabaseClient } from "@supabase/supabase-js";
import { charityShareCentsForMeetingNumber } from "@thegoodintro/pricing";
import { formatAud } from "@/lib/format";
import type {
  Charity,
  MeetingRequest,
  CompletedDonation,
} from "./_components/exec-dashboard";

/* Demo executive resolution + live-data loader for the executive dashboard.
   Shared by the page (read) and the standing-nomination action so both target
   the same executive. Real magic-link exec/EA auth is deferred (EXECUTIVE_
   PORTAL_BRIEF); for the staging demo we resolve one seeded executive. */

const SEEDED_DEMO_EXEC = "00000000-0000-0000-0000-00000000ec01"; // Jordan Smith, Hexagon Bank

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

/** The executive whose dashboard the demo shows: the seeded one, else the first active. */
export async function resolveDemoExecutiveId(
  supabase: SupabaseClient,
): Promise<string | null> {
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

export type ExecDashboardData = {
  exec: { id: string; name: string; firstName: string; title: string | null; company: string | null };
  charities: Charity[];
  defaultCharityId: string;
  defaultCharityName: string;
  incoming: MeetingRequest[];
  donations: CompletedDonation[];
  indicativeAmount: string;
  ribbon: {
    upcoming: number;
    taken: number;
    generatedAllTime: string;
    requestsToAction: number;
  };
  thisYearAmount: string;
  thisYearCount: number;
};

export async function loadExecDashboard(
  supabase: SupabaseClient,
  execId: string,
): Promise<ExecDashboardData | null> {
  // 1. Executive + DGR-endorsed charities (picker source).
  const [{ data: execRow }, { data: charityRows }] = await Promise.all([
    supabase
      .from("executive")
      .select("id, name, title, company, default_charity_id")
      .eq("id", execId)
      .maybeSingle(),
    supabase
      .from("charity")
      .select("id, name, abn, dgr_status")
      .eq("dgr_status", "endorsed")
      .is("deleted_at", null)
      .order("name", { ascending: true }),
  ]);
  if (!execRow) return null;

  const charities: Charity[] = (charityRows ?? []).map((c) => ({
    id: c.id as string,
    name: c.name as string,
    abn: (c.abn as string) ?? null,
    cause: null, // not in schema yet — see note in exec/page.tsx
    blurb: null,
  }));
  const defaultCharityId = (execRow.default_charity_id as string) ?? charities[0]?.id ?? "";
  const defaultCharityName = charities.find((c) => c.id === defaultCharityId)?.name ?? "";

  // 2. Incoming (submitted requests for this exec) + the exec's request ids.
  const { data: reqRows } = await supabase
    .from("request")
    .select(
      "id, status, q1_what, q2_why, meeting_minutes, created_at, vendor:vendor_id(name, status, email_domain), requested_by_user:requested_by_user_id(name)",
    )
    .eq("executive_id", execId)
    .order("created_at", { ascending: true });

  const allReqs = reqRows ?? [];
  const requestIds = allReqs.map((r) => r.id as string);

  const incoming: MeetingRequest[] = allReqs
    .filter((r) => r.status === "submitted")
    .map((r) => {
      const v = one<{ name: string; status: string; email_domain: string }>(r.vendor);
      const u = one<{ name: string }>(r.requested_by_user);
      const vetted = v?.status === "active";
      return {
        id: r.id as string,
        vendorName: u?.name ?? v?.name ?? "A vendor",
        vendorRole: "",
        vendorCompany: v?.name ?? "",
        topic: (r.q1_what as string) ?? "",
        proposed: `${r.meeting_minutes ?? 45} min`,
        pitch: (r.q1_what as string) ?? "",
        why: (r.q2_why as string) ?? "",
        companyBlurb: v ? `${v.name} · ${v.email_domain}` : "",
        linkedin: "",
        verified: { abn: vetted, founder: vetted },
      };
    });

  // 3. Donations: gift_records on this exec's held meetings.
  let donations: CompletedDonation[] = [];
  if (requestIds.length > 0) {
    const { data: mtgRows } = await supabase
      .from("meeting")
      .select("id, request_id")
      .in("request_id", requestIds);
    const meetingIds = (mtgRows ?? []).map((m) => m.id as string);
    const reqById = new Map(
      allReqs.map((r) => {
        const v = one<{ name: string }>(r.vendor);
        const u = one<{ name: string }>(r.requested_by_user);
        return [r.id as string, { vendor: v?.name ?? "", person: u?.name ?? "" }];
      }),
    );
    const mtgToReq = new Map((mtgRows ?? []).map((m) => [m.id as string, m.request_id as string]));

    if (meetingIds.length > 0) {
      const { data: giftRows } = await supabase
        .from("gift_record")
        .select("created_at, charity_amount_cents, status, charity_id, charity:charity_id(name), meeting_id")
        .in("meeting_id", meetingIds)
        .neq("status", "voided")
        .order("created_at", { ascending: false });

      donations = (giftRows ?? []).map((g) => {
        const c = one<{ name: string }>(g.charity);
        const reqId = mtgToReq.get(g.meeting_id as string);
        const who = reqId ? reqById.get(reqId) : undefined;
        const cents = g.charity_amount_cents as number;
        return {
          date: shortDate(g.created_at as string),
          iso: g.created_at as string,
          vendor: [who?.person, who?.vendor].filter(Boolean).join(" · ") || "A meeting",
          charity: c?.name ?? "Charity",
          charityId: (g.charity_id as string) ?? "",
          amount: formatAud(cents),
          amountCents: cents,
          status: g.status === "paid" ? "confirmed" : "pending",
        };
      });
    }
  }

  // 4. Meeting counts for the ribbon.
  const [{ count: upcoming }, { count: taken }] = await Promise.all([
    requestIds.length
      ? supabase.from("meeting").select("id", { count: "exact", head: true }).in("request_id", requestIds).in("status", ["proposed", "confirmed"])
      : Promise.resolve({ count: 0 } as { count: number }),
    requestIds.length
      ? supabase.from("meeting").select("id", { count: "exact", head: true }).in("request_id", requestIds).eq("status", "held")
      : Promise.resolve({ count: 0 } as { count: number }),
  ]);

  const generatedAllTimeCents = donations.reduce((s, d) => s + d.amountCents, 0);
  const yearStr = String(new Date().getFullYear());
  const thisYear = donations.filter((d) => d.iso.startsWith(yearStr));
  const thisYearCents = thisYear.reduce((s, d) => s + d.amountCents, 0);

  const name = (execRow.name as string) ?? "there";
  return {
    exec: {
      id: execId,
      name,
      firstName: name.split(" ")[0],
      title: (execRow.title as string) ?? null,
      company: (execRow.company as string) ?? null,
    },
    charities,
    defaultCharityId,
    defaultCharityName,
    incoming,
    donations,
    // Indicative band-1 share ($900). The actual per-meeting gift rises by band
    // to $1,200 and is computed per meeting from the pricing engine / pricing
    // page (the source of truth); this is the floor shown before a band is known.
    indicativeAmount: formatAud(charityShareCentsForMeetingNumber(1)),
    ribbon: {
      upcoming: upcoming ?? 0,
      taken: taken ?? 0,
      generatedAllTime: formatAud(generatedAllTimeCents),
      requestsToAction: incoming.length,
    },
    thisYearAmount: formatAud(thisYearCents),
    thisYearCount: thisYear.length,
  };
}

function shortDate(iso: string): string {
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Sydney" }).format(new Date(iso));
}
