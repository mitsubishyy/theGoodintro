import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getVendor } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatAud, ageShort } from "@/lib/format";
import { bandForMeetingNumber } from "@thegoodintro/pricing";
import {
  VendorDashboard,
  type ExecRow,
  type PendingRow,
  type GiftRow,
} from "./_components/dashboard";

export const metadata: Metadata = {
  title: "Your account — theGoodintro",
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

  // Non-active vendors get the vetting flow (not the full dashboard).
  if (vendor.status !== "active") {
    const step = VETTING[vendor.status] ?? VETTING.signed_up;
    return (
      <main className="mx-auto max-w-2xl px-6 py-16" style={{ color: "var(--foreground)" }}>
        <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>{vendor.name}</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Welcome to theGoodintro</h1>
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

  const now = new Date();
  const yearStart = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString();
  const month = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "Australia/Sydney" }).format(now);

  const [lotsRes, meetingsRes, cycleRes, giftsRes, requestsRes, execsRes] = await Promise.all([
    supabase.from("credit_lot").select("quantity_remaining"),
    supabase.from("meeting").select("status, credit_lot_id, scheduled_at, created_at, request:request_id(executive:executive_id(title,company))"),
    supabase.from("cycle").select("held_meetings_count").order("started_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("gift_record").select("charity_amount_cents, created_at, charity:charity_id(name), meeting:meeting_id(request:request_id(executive:executive_id(title,company)))"),
    supabase.from("request").select("status, executive_id, created_at, executive:executive_id(title,company)"),
    supabase.from("executive").select("id, title, company, charity:default_charity_id(name)").order("company"),
  ]);

  const remaining = (lotsRes.data ?? []).reduce((s, l) => s + (l.quantity_remaining as number), 0);
  const meetings = meetingsRes.data ?? [];
  const reserved = meetings.filter((m) => m.status === "confirmed" && m.credit_lot_id).length;
  const meetingsPending = meetings.filter((m) => m.status === "proposed" || m.status === "confirmed").length;
  const held = meetings.filter((m) => m.status === "held").length;
  const available = Math.max(0, remaining - reserved);

  const heldForBand = (cycleRes.data?.held_meetings_count as number) ?? held;
  const band = bandForMeetingNumber(heldForBand + 1);
  const money = formatAud(band.rateCents);
  let progressPercent = 100;
  let progressNote = "Top band";
  if (band.hi !== null) {
    const into = heldForBand + 1 - band.lo;
    progressPercent = Math.round((into / (band.hi - band.lo + 1)) * 100);
    progressNote = `${band.hi - heldForBand} held to Band ${band.band + 1}`;
  }

  const gifts = giftsRes.data ?? [];
  const toCharityCents = gifts.filter((g) => (g.created_at as string) >= yearStart).reduce((s, g) => s + (g.charity_amount_cents as number), 0);
  const giftRows: GiftRow[] = gifts.map((g) => {
    const charity = one<{ name: string }>(g.charity);
    const mtg = one<{ request: unknown }>(g.meeting);
    const req = one<{ executive: unknown }>(mtg?.request);
    const e = one<{ title: string; company: string }>(req?.executive);
    return { charity: charity?.name ?? "Charity", exec: e ? `${e.title}, ${e.company}` : "a meeting", amount: formatAud(g.charity_amount_cents as number) };
  }).slice(0, 5);

  const openExecIds = new Set(
    (requestsRes.data ?? []).filter((r) => r.status === "submitted" || r.status === "accepted").map((r) => r.executive_id as string),
  );

  const execs: ExecRow[] = (execsRes.data ?? []).map((e) => {
    const charity = one<{ name: string }>(e.charity);
    return { id: e.id as string, company: (e.company as string) ?? "", title: (e.title as string) ?? "", charity: charity?.name ?? "—", requested: openExecIds.has(e.id as string) };
  });

  // Pending: open requests (waiting on exec) + scheduled meetings (securing a time).
  const pending: PendingRow[] = [];
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
        meetingsHeld: held,
        toCharity: formatAud(toCharityCents),
        bandLabel: `Band ${band.band}`,
        bandRate: `${money} / mtg`,
      }}
      execs={execs}
      credits={{ available, bandLabel: `Band ${band.band}`, bandRate: money, progressPercent, progressNote }}
      pending={pending.slice(0, 5)}
      gifts={giftRows}
      myRequestsBadge={openExecIds.size}
    />
  );
}
