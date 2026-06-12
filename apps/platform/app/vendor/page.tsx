import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { formatAud, ageShort } from "@/lib/format";
import { bandForMeetingNumber } from "@thegoodintro/pricing";
import { vendorCharityForPeriod, financialYearWindow } from "@/lib/reporting";
import type { ExecCard, RibbonGroup } from "@thegoodintro/ui";
import {
  VendorDashboard,
  type ExecRow,
  type PendingRow as LegacyPendingRow,
  type GiftRow as LegacyGiftRow,
} from "./_components/dashboard";
import {
  LockedVendorDashboard,
  type GiftRow,
  type PendingRow,
  type UpcomingRow,
} from "./_components/locked-dashboard";

export const metadata: Metadata = {
  title: "Your account — TheGoodIntro",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

const VETTING: Record<string, { title: string; body: string }> = {
  signed_up: { title: "Next: a short vetting call", body: "Tell us about you and book a quick call. Once approved, payment unlocks and you can start requesting meetings." },
  call_booked: { title: "Application received", body: "Thanks. We will confirm your approval on the call." },
  approved: { title: "You are approved", body: "Payment is unlocked. Buy meeting credits to open the executive list." },
  paid: { title: "Payment received", body: "Your credits are on the way; the executive list opens shortly." },
  dormant: { title: "Access paused", body: "Your access window has ended. Buy credits to reopen the list." },
  churned: { title: "Account closed", body: "Get in touch if you would like to come back." },
};

export default async function VendorHome() {
  const result = await getVendor();
  if (!result?.user) redirect("/login");

  if (!result.vendorUser) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
        <div className="max-w-md">
          <h1 className="text-xl font-semibold">Finish setting up</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Your account is not linked to an organisation yet.{" "}
            <Link href="/signup" className="underline-offset-2 hover:underline" style={{ color: "var(--foreground)" }}>Complete sign-up</Link>.
          </p>
        </div>
      </main>
    );
  }

  const vendorRow = one<{ id: string; name: string; status: string }>(result.vendorUser.vendor);
  const vendor = vendorRow!;
  const supabase = result.supabase;

  // Non-active vendors get the vetting flow (not the full dashboard). The
  // locked pre-payment shell variant (vendor-signup-and-prepayment lock) is a
  // separate port; this surface is unchanged until then.
  if (vendor.status !== "active") {
    const step = VETTING[vendor.status] ?? VETTING.signed_up;
    return (
      <main className="mx-auto max-w-2xl px-6 py-16" style={{ color: "var(--foreground)" }}>
        <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>{vendor.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome to TheGoodIntro</h1>
        <div className="mt-8 rounded-2xl border p-6" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
          <span className="rounded-full px-2 py-0.5 text-xs" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>{vendor.status}</span>
          <h2 className="mt-3 text-lg font-semibold">{step.title}</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>{step.body}</p>
          {vendor.status === "signed_up" ? (
            <Link href="/vendor/application" className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>Start your application</Link>
          ) : null}
        </div>
      </main>
    );
  }

  const lockedShell = await getFlag("vendor_shell");
  const now = new Date();

  const [lotsRes, meetingsRes, cycleRes, giftsRes, requestsRes, execsRes] = await Promise.all([
    supabase.from("credit_lot").select("quantity_remaining"),
    supabase
      .from("meeting")
      .select(
        "id, status, credit_lot_id, scheduled_at, created_at, join_url, charity:charity_id(name), request:request_id(meeting_minutes, executive:executive_id(name,title,company,photo_url, charity:default_charity_id(name)))",
      ),
    supabase.from("cycle").select("held_meetings_count").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    supabase
      .from("gift_record")
      .select("id, charity_amount_cents, charity_id, sat_date, created_at, charity:charity_id(name), meeting:meeting_id(request:request_id(executive:executive_id(name,title,company)))")
      .order("sat_date", { ascending: false }),
    supabase.from("request").select("id, status, executive_id, created_at, executive:executive_id(name,title,company)"),
    supabase
      .from("executive")
      .select("id, name, title, company, photo_url, created_at, charity:default_charity_id(name)")
      .order("created_at", { ascending: false }),
  ]);

  const remaining = (lotsRes.data ?? []).reduce((s, l) => s + (l.quantity_remaining as number), 0);
  const meetings = meetingsRes.data ?? [];
  const reserved = meetings.filter((m) => m.status === "confirmed" && m.credit_lot_id).length;
  const meetingsPending = meetings.filter((m) => m.status === "proposed" || m.status === "confirmed").length;
  const heldCount = meetings.filter((m) => m.status === "held").length;
  const available = Math.max(0, remaining - reserved);

  const heldForBand = (cycleRes.data?.held_meetings_count as number) ?? heldCount;
  const band = bandForMeetingNumber(heldForBand + 1);
  const rate = formatAud(band.rateCents);
  let progressPercent = 100;
  let progressNote = "Top band";
  if (band.hi !== null) {
    const into = heldForBand + 1 - band.lo;
    progressPercent = Math.round((into / (band.hi - band.lo + 1)) * 100);
    const more = band.hi - heldForBand;
    progressNote = `${more} more held ${more === 1 ? "meeting" : "meetings"} to reach Band ${band.band + 1}`;
  }

  const gifts = giftsRes.data ?? [];
  // Money through the reporting layer (FY, on sat_date) so all three dashboards
  // read one source and never drift. The gift list below is display only.
  const toCharityCents = await vendorCharityForPeriod(supabase, vendor.id, financialYearWindow(now));

  const openExecIds = new Set(
    (requestsRes.data ?? []).filter((r) => r.status === "submitted" || r.status === "accepted").map((r) => r.executive_id as string),
  );

  if (!lockedShell) {
    // Pre-port dashboard, unchanged (vendor_shell off).
    const month = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "Australia/Sydney" }).format(now);
    const giftRows: LegacyGiftRow[] = gifts.map((g) => {
      const charity = one<{ name: string }>(g.charity);
      const mtg = one<{ request: unknown }>(g.meeting);
      const req = one<{ executive: unknown }>(mtg?.request);
      const e = one<{ title: string; company: string }>(req?.executive);
      return { charity: charity?.name ?? "Charity", exec: e ? `${e.title}, ${e.company}` : "a meeting", amount: formatAud(g.charity_amount_cents as number) };
    }).slice(0, 5);

    const execs: ExecRow[] = (execsRes.data ?? []).map((e) => {
      const charity = one<{ name: string }>(e.charity);
      return { id: e.id as string, company: (e.company as string) ?? "", title: (e.title as string) ?? "", charity: charity?.name ?? "—", requested: openExecIds.has(e.id as string) };
    });

    const pending: LegacyPendingRow[] = [];
    for (const r of requestsRes.data ?? []) {
      if (r.status !== "submitted") continue;
      const e = one<{ title: string; company: string }>(r.executive);
      pending.push({ exec: e ? `${e.title}, ${e.company}` : "Executive", state: "Waiting on exec", age: ageShort(r.created_at as string).label });
    }
    for (const m of meetings) {
      if (m.status !== "proposed" && m.status !== "confirmed") continue;
      const req = one<{ executive: unknown }>(m.request);
      const e = one<{ title: string; company: string }>(req?.executive);
      pending.push({ exec: e ? `${e.title}, ${e.company}` : "Executive", state: m.status === "confirmed" ? "Securing a time" : "Accepted, awaiting time", age: ageShort(m.created_at as string).label });
    }

    return (
      <VendorDashboard
        company={vendor.name}
        userName={(result.vendorUser.name as string) ?? "You"}
        role={(result.vendorUser.role as string) ?? "owner"}
        month={month}
        ribbon={{
          creditsAvailable: available,
          creditsReserved: reserved,
          meetingsPending,
          meetingsHeld: heldCount,
          toCharity: formatAud(toCharityCents),
          bandLabel: `Band ${band.band}`,
          bandRate: `${rate} / mtg`,
        }}
        execs={execs}
        credits={{ available, bandLabel: `Band ${band.band}`, bandRate: rate, progressPercent, progressNote }}
        pending={pending.slice(0, 5)}
        gifts={giftRows}
        myRequestsBadge={openExecIds.size}
      />
    );
  }

  // ── Locked dashboard (vendor_shell on) ────────────────────────────────────

  // "Held this month": the canonical held date is gift_record.sat_date
  // (meeting has no held_at column). Calendar month per the locked default.
  const sydneyYmd = new Intl.DateTimeFormat("en-CA", { timeZone: "Australia/Sydney", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const monthStart = `${sydneyYmd.slice(0, 7)}-01`;
  const heldThisMonth = gifts.filter((g) => g.sat_date !== null && (g.sat_date as string) >= monthStart).length;

  const ribbon: RibbonGroup[] = [
    {
      label: "Credits",
      stats: [
        { value: String(available), unit: "available" },
        { value: String(reserved), unit: "reserved" },
      ],
    },
    {
      label: "Meetings",
      stats: [
        { value: String(meetingsPending), unit: "pending" },
        { value: String(heldThisMonth), unit: "held this month" },
      ],
    },
    {
      label: "To charity via you",
      stats: [{ value: formatAud(toCharityCents), unit: "this FY", big: true }],
    },
    {
      label: "Your band",
      stats: [{ value: `Band ${band.band}`, unit: `${rate} / mtg` }],
    },
  ];

  const dateFmt = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "Australia/Sydney" });
  const timeFmt = new Intl.DateTimeFormat("en-AU", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Australia/Sydney", timeZoneName: "short" });

  const upcomingAll = meetings
    .filter((m) => (m.status === "proposed" || m.status === "confirmed") && m.scheduled_at && new Date(m.scheduled_at as string) >= now)
    .sort((a, b) => new Date(a.scheduled_at as string).getTime() - new Date(b.scheduled_at as string).getTime());
  const upcoming: UpcomingRow[] = upcomingAll.slice(0, 2).map((m) => {
    const req = one<{ meeting_minutes: number; executive: unknown }>(m.request);
    const e = one<{ name: string; title: string; company: string; photo_url: string | null; charity: unknown }>(req?.executive);
    const meetingCharity = one<{ name: string }>(m.charity);
    const execCharity = one<{ name: string }>(e?.charity);
    const at = new Date(m.scheduled_at as string);
    return {
      id: m.id as string,
      exec: e ? `${e.name}, ${e.title} · ${e.company}` : "Executive",
      charity: meetingCharity?.name ?? execCharity?.name ?? "their chosen charity",
      photoUrl: e?.photo_url ?? null,
      execName: e?.name ?? "Executive",
      when: `${dateFmt.format(at)} · ${timeFmt.format(at)} · ${req?.meeting_minutes ?? 45} min`,
      joinUrl: (m.join_url as string | null) ?? null,
    };
  });

  // "Executives for you" ordering signal is a parked open decision; recently
  // added is the interim order (the mockup's order is arbitrary).
  const execCards: ExecCard[] = (execsRes.data ?? []).slice(0, 4).map((e) => {
    const charity = one<{ name: string }>(e.charity);
    return {
      id: e.id as string,
      name: (e.name as string) ?? "",
      title: (e.title as string) ?? "",
      company: (e.company as string) ?? "",
      charityName: charity?.name ?? "their chosen charity",
      photoUrl: (e.photo_url as string | null) ?? null,
      requested: openExecIds.has(e.id as string),
      href: `/vendor/executives/${e.id}`,
    };
  });

  const pendingAll = (requestsRes.data ?? [])
    .filter((r) => r.status === "submitted" || r.status === "accepted")
    .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime());
  const pending: PendingRow[] = pendingAll.slice(0, 4).map((r) => {
    const e = one<{ name: string; title: string; company: string }>(r.executive);
    return {
      key: r.id as string,
      who: e ? `${e.name}, ${e.title} · ${e.company}` : "Executive",
      state: r.status === "accepted" ? "Accepted · securing time" : "Waiting on exec",
      age: ageShort(r.created_at as string).label,
    };
  });

  const giftRows: GiftRow[] = gifts.slice(0, 3).map((g) => {
    const charity = one<{ name: string }>(g.charity);
    const mtg = one<{ request: unknown }>(g.meeting);
    const req = one<{ executive: unknown }>(mtg?.request);
    const e = one<{ name: string; title: string }>(req?.executive);
    return {
      key: g.id as string,
      charity: charity?.name ?? "Charity",
      after: e ? `${e.name}, ${e.title}` : "a meeting",
      amount: formatAud(g.charity_amount_cents as number),
    };
  });
  const distinctCharities = new Set(gifts.map((g) => g.charity_id as string)).size;
  const impactEyebrow = `${formatAud(toCharityCents)} to Good this FY · ${distinctCharities} ${distinctCharities === 1 ? "charity" : "charities"} · ${gifts.length} ${gifts.length === 1 ? "meeting" : "meetings"} held`;

  return (
    <LockedVendorDashboard
      ribbon={ribbon}
      upcoming={upcoming}
      upcomingCount={upcomingAll.length}
      execCards={execCards}
      credits={{
        available,
        bandLine: `BAND ${band.band} · ${rate} TO CHARITY / MEETING`,
        progressPercent,
        progressNote,
      }}
      pending={pending}
      pendingCount={pendingAll.length}
      impactEyebrow={impactEyebrow}
      gifts={giftRows}
    />
  );
}
