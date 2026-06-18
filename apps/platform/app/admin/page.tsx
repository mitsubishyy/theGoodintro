import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatAudCompact, ageShort } from "@/lib/format";
import {
  financialYearWindow,
  monthWindow,
  revenueForPeriod,
} from "@/lib/reporting";
import {
  MetricsRibbon,
  PortalPage,
  Widget,
  Button,
  type RibbonGroup,
} from "@thegoodintro/ui";
import { LastRefreshed } from "./_lib/LastRefreshed";
import { BookedMeetingsCalendar } from "./_widgets/calendar";
import {
  DistributionsBars,
  GiftsSentList,
  NeedsActionList,
  PendingRequestsList,
  RecentOnboardsList,
  UnrespondedCommsList,
  ViewToggle,
  type DistributionGroup,
  type GiftRow,
  type NeedsActionRow,
  type OnboardRow,
  type PendingRequestRow,
} from "./_widgets";

export const metadata: Metadata = {
  title: "Dashboard — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

const SYDNEY_TZ = "Australia/Sydney";
const LIFETIME_WINDOW = { from: "1900-01-01", to: "9999-12-31" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const now = new Date();
  const y = now.getUTCFullYear();
  const monthStart = new Date(Date.UTC(y, now.getUTCMonth(), 1)).toISOString();
  const monthEnd = new Date(Date.UTC(y, now.getUTCMonth() + 1, 1)).toISOString();
  const sevenDaysAhead = new Date(now.getTime() + 7 * 86_400_000).toISOString();
  const head = { count: "exact" as const, head: true };
  const fyWindow = financialYearWindow(now);
  const mtdWindow = monthWindow(now);

  const [
    scheduledThisMonthC,
    nextSevenDaysC,
    bookedAheadC,
    completedMtdC,
    activeVendorsC,
    onboardingVendorsC,
    activeExecsC,
    pausedExecsC,
    invitedExecsC,
    monthMeetings,
    meetingStatusRows,
    proposedMtgs,
    onboardExecs,
    releasedGifts,
    reverseUnlocks,
    pendingReqs,
    recentOnboards,
    giftsByCharity,
    lifetimeRev,
    mtdRev,
    fyRev,
  ] = await Promise.all([
    // Ribbon row 1
    supabase
      .from("meeting")
      .select("id", head)
      .in("status", ["confirmed", "held"])
      .gte("scheduled_at", monthStart)
      .lt("scheduled_at", monthEnd),
    supabase
      .from("meeting")
      .select("id", head)
      .in("status", ["confirmed", "held"])
      .gte("scheduled_at", now.toISOString())
      .lt("scheduled_at", sevenDaysAhead),
    supabase
      .from("meeting")
      .select("id", head)
      .in("status", ["confirmed", "proposed"])
      .gte("scheduled_at", now.toISOString()),
    supabase
      .from("meeting")
      .select("id", head)
      .eq("status", "held")
      .gte("scheduled_at", monthStart)
      .lt("scheduled_at", monthEnd),
    supabase.from("vendor").select("id", head).eq("status", "active"),
    supabase
      .from("vendor")
      .select("id", head)
      .in("status", ["signed_up", "call_booked", "approved", "paid"]),
    // Ribbon row 2
    supabase.from("executive").select("id", head).eq("status", "active"),
    supabase.from("executive").select("id", head).eq("status", "paused"),
    supabase.from("executive").select("id", head).eq("status", "invited"),

    // Booked Meetings calendar — every confirmed/held meeting with a time, so
    // the client calendar can page month to month without a round trip.
    supabase
      .from("meeting")
      .select("scheduled_at")
      .in("status", ["confirmed", "held"])
      .not("scheduled_at", "is", null),

    // Distributions · meeting status
    supabase.from("meeting").select("status"),

    // Needs Action sources (mirrors the pre-port logic)
    supabase
      .from("meeting")
      .select(
        "created_at, request:request_id ( vendor:vendor_id ( name ), executive:executive_id ( title, company ) )",
      )
      .eq("status", "proposed")
      .order("created_at", { ascending: true })
      .limit(4),
    supabase
      .from("executive")
      .select("name, created_at")
      .in("status", ["invited", "set_up"])
      .order("created_at", { ascending: true })
      .limit(3),
    supabase
      .from("gift_record")
      .select("created_at, charity:charity_id ( name )")
      .eq("status", "released")
      .order("created_at", { ascending: true })
      .limit(3),
    // Needs Action · paid invoices voided in Xero = manual reverse-unlock. The
    // daily reconcile stamps voided_in_xero_at (V2_BUILD_PLAN §7 — v1 never
    // auto-reverses); this surfaces it for Issy to action by hand.
    supabase
      .from("invoice")
      .select("created_at, voided_in_xero_at, vendor:vendor_id ( name )")
      .eq("status", "paid")
      .not("voided_in_xero_at", "is", null)
      .order("voided_in_xero_at", { ascending: true })
      .limit(5),

    // Pending Requests
    supabase
      .from("request")
      .select(
        "created_at, vendor:vendor_id ( name ), executive:executive_id ( name, title, company )",
      )
      .eq("status", "submitted")
      .order("created_at", { ascending: true })
      .limit(5),

    // Recent Onboards (vendor users in last 30 days). No `photo_url` on
    // vendor_user (only `executive.photo_url` exists); avatar uses initials.
    supabase
      .from("vendor_user")
      .select("name, role, created_at, vendor:vendor_id ( name )")
      .gte(
        "created_at",
        new Date(now.getTime() - 30 * 86_400_000).toISOString(),
      )
      .order("created_at", { ascending: false })
      .limit(3),

    // Gifts Sent (per-charity totals from the frozen-at-Held amounts)
    supabase
      .from("gift_record")
      .select("charity_amount_cents, charity:charity_id ( name )"),

    // Ribbon money — lifetime + MTD + YTD via the reporting layer (FY-anchored).
    revenueForPeriod(supabase, LIFETIME_WINDOW),
    revenueForPeriod(supabase, mtdWindow),
    revenueForPeriod(supabase, fyWindow),
  ]);

  // ── Ribbon ──────────────────────────────────────────────────────────────
  const scheduledThisMonth = scheduledThisMonthC.count ?? 0;
  const completedMtd = completedMtdC.count ?? 0;
  const completionPct =
    scheduledThisMonth + completedMtd === 0
      ? 0
      : Math.round((completedMtd / (scheduledThisMonth + completedMtd)) * 100);

  const ribbonGroups: RibbonGroup[] = [
    {
      label: "Scheduled this month",
      stats: [
        {
          value: String(scheduledThisMonth),
          sub: `${nextSevenDaysC.count ?? 0} in the next 7 days`,
          big: true,
        },
      ],
    },
    {
      label: "Booked ahead",
      stats: [
        {
          value: String(bookedAheadC.count ?? 0),
          sub: "across the future schedule",
          big: true,
        },
      ],
    },
    {
      label: "Completed MTD",
      stats: [
        {
          value: String(completedMtd),
          sub: `${completionPct}% of scheduled`,
          big: true,
        },
      ],
    },
    {
      label: "Active vendors",
      stats: [
        {
          value: String(activeVendorsC.count ?? 0),
          sub: `${onboardingVendorsC.count ?? 0} in onboarding`,
          big: true,
        },
      ],
    },
    {
      label: "Active executives",
      stats: [
        {
          value: String(activeExecsC.count ?? 0),
          sub: `${pausedExecsC.count ?? 0} paused, ${invitedExecsC.count ?? 0} invited`,
          big: true,
        },
      ],
    },
    {
      label: "To charity",
      stats: [
        {
          value: formatAudCompact(lifetimeRev.charityCommittedCents),
          sub: "lifetime",
          big: true,
        },
      ],
    },
    {
      label: "Revenue, month",
      stats: [
        {
          value: formatAudCompact(mtdRev.netCents),
          sub: "month to date",
          big: true,
        },
      ],
    },
    {
      label: "Revenue, year",
      stats: [
        {
          value: formatAudCompact(fyRev.netCents),
          sub: "financial year to date",
          big: true,
        },
      ],
    },
  ];

  // ── Booked Meetings calendar ───────────────────────────────────────────
  // Group booked days by "YYYY-MM" (UTC, matching the grid) for the
  // month-paging client calendar.
  const bookedByMonth: Record<string, number[]> = {};
  for (const m of monthMeetings.data ?? []) {
    const d = new Date(m.scheduled_at as string);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const day = d.getUTCDate();
    (bookedByMonth[key] ??= []).includes(day) || bookedByMonth[key].push(day);
  }
  const todayKey = `${y}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

  // ── Pending Requests ───────────────────────────────────────────────────
  const pendingRows: PendingRequestRow[] = (pendingReqs.data ?? []).map((r) => {
    const v = one<{ name: string }>(r.vendor);
    const e = one<{ name: string; title: string; company: string }>(r.executive);
    const a = ageShort(r.created_at as string);
    // Real `request.status` only carries `submitted` today; per the lock the
    // four-state tone mapping is portal-wide. Default rows to "review" until the
    // sub-state (match/exec/block) is wired through the matching engine.
    return {
      vendor: v?.name ?? "Vendor",
      exec: e?.name ?? `${e?.title ?? ""}, ${e?.company ?? ""}`.trim(),
      detail: `Submitted ${a.label} ago`,
      tone: "review",
    };
  });

  // ── Needs Action (aggregate of proposed meetings, released gifts, onboards)
  const needsRows: NeedsActionRow[] = [];
  for (const m of proposedMtgs.data ?? []) {
    const req = one<{ vendor: unknown; executive: unknown }>(m.request);
    const v = one<{ name: string }>(req?.vendor);
    const e = one<{ title: string; company: string }>(req?.executive);
    const a = ageShort(m.created_at as string);
    needsRows.push({
      manual: false,
      lead: `Confirm meeting time, ${v?.name ?? "Vendor"} → ${e?.title ?? ""}`,
      detail: `Vendor proposed a time for ${e?.company ?? ""}; awaiting your confirmation`,
      age: a.label,
      ageTone: a.days >= 7 ? "red" : a.days >= 2 ? "amber" : "ink",
    });
  }
  for (const g of releasedGifts.data ?? []) {
    const c = one<{ name: string }>(g.charity);
    const a = ageShort(g.created_at as string);
    needsRows.push({
      manual: true,
      lead: `Pay released gift, ${c?.name ?? "Charity"}`,
      detail: "Manual follow-up · awaiting EFT and receipt",
      age: a.label,
      ageTone: a.days >= 7 ? "red" : a.days >= 2 ? "amber" : "ink",
    });
  }
  for (const e of onboardExecs.data ?? []) {
    const a = ageShort(e.created_at as string);
    needsRows.push({
      manual: false,
      lead: `Set up executive profile, ${e.name as string}`,
      detail: "Pending business context + calendar connect",
      age: a.label,
      ageTone: a.days >= 7 ? "red" : a.days >= 2 ? "amber" : "ink",
    });
  }
  for (const r of reverseUnlocks.data ?? []) {
    const v = one<{ name: string }>(r.vendor);
    const a = ageShort((r.voided_in_xero_at as string) ?? (r.created_at as string));
    needsRows.push({
      manual: true,
      lead: `Reverse credit unlock, ${v?.name ?? "Vendor"}`,
      detail: "Invoice voided in Xero after payment · manual reversal",
      age: a.label,
      ageTone: a.days >= 7 ? "red" : a.days >= 2 ? "amber" : "ink",
    });
  }
  needsRows.sort((x, y) => {
    const order = { red: 0, amber: 1, ink: 2 } as const;
    return order[x.ageTone] - order[y.ageTone];
  });
  const needsCapped = needsRows.slice(0, 7);
  const assignedToMe = 0; // assignee model not wired yet; counted by lib once it is

  // ── Distributions ──────────────────────────────────────────────────────
  const meetingStatusCounts = new Map<string, number>();
  for (const m of meetingStatusRows.data ?? []) {
    const s = (m.status as string) ?? "unknown";
    meetingStatusCounts.set(s, (meetingStatusCounts.get(s) ?? 0) + 1);
  }
  const meetingStatusTotal = Array.from(meetingStatusCounts.values()).reduce(
    (s, n) => s + n,
    0,
  );
  const distributions: DistributionGroup[] = [
    {
      title: "Meeting status",
      available: meetingStatusTotal > 0,
      unavailableHint: "No meetings recorded yet.",
      total: meetingStatusTotal,
      rows: Array.from(meetingStatusCounts.entries())
        .map(([label, count]) => ({
          label: label[0]!.toUpperCase() + label.slice(1),
          count,
          tone:
            label === "held"
              ? ("green" as const)
              : label === "confirmed"
                ? ("amber" as const)
                : label === "cancelled" || label === "no_show"
                  ? ("muted" as const)
                  : ("neutral" as const),
        }))
        .sort((a, b) => b.count - a.count),
    },
    {
      title: "Vendors by tier",
      available: false,
      unavailableHint: "Awaiting vendor.tier column (follow-up migration).",
      total: 0,
      rows: [],
    },
    {
      title: "Exec capacity",
      available: false,
      unavailableHint: "Awaiting executive.monthly_meeting_limit column.",
      total: 0,
      rows: [],
    },
    {
      title: "Charities supported",
      available: false,
      unavailableHint: "Awaiting charity.cause_category column.",
      total: 0,
      rows: [],
    },
  ];

  // ── Recent Onboards ────────────────────────────────────────────────────
  const onboards: OnboardRow[] = (recentOnboards.data ?? []).map((u) => {
    const v = one<{ name: string }>(u.vendor);
    const created = new Date(u.created_at as string);
    return {
      name: u.name as string,
      role: (u.role as string) ?? "Member",
      company: v?.name ?? "—",
      dateLabel: new Intl.DateTimeFormat("en-AU", {
        day: "2-digit",
        month: "short",
        timeZone: SYDNEY_TZ,
      })
        .format(created)
        .toUpperCase(),
    };
  });

  // ── Gifts Sent ─────────────────────────────────────────────────────────
  const giftsAgg = new Map<string, { count: number; totalCents: number }>();
  for (const g of giftsByCharity.data ?? []) {
    const c = one<{ name: string }>(g.charity);
    const name = c?.name ?? "Charity";
    const cur = giftsAgg.get(name) ?? { count: 0, totalCents: 0 };
    cur.count += 1;
    cur.totalCents += (g.charity_amount_cents as number) ?? 0;
    giftsAgg.set(name, cur);
  }
  const gifts: GiftRow[] = Array.from(giftsAgg.entries())
    .map(([charity, v]) => ({ charity, count: v.count, totalCents: v.totalCents }))
    .sort((a, b) => b.totalCents - a.totalCents)
    .slice(0, 4);
  const giftsTotalCount = Array.from(giftsAgg.values()).reduce(
    (s, v) => s + v.count,
    0,
  );

  // ── H1 sub-line: locked date + "last refreshed" tick ───────────────────
  const todayLabel = new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SYDNEY_TZ,
  }).format(now);
  const stampIso = now.toISOString();

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <PortalPage
      title="Dashboard"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Dashboard" }]}
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
      <p className="text-[13px] -mt-2 mb-5" style={{ color: "var(--muted-foreground)" }}>
        {todayLabel} · <LastRefreshed since={stampIso} />
      </p>

      <MetricsRibbon groups={ribbonGroups} columns={4} numeralFont="fraunces" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <Widget
            title="Booked meetings"
            count={scheduledThisMonth}
            right={
              <ViewToggle
                left="Calendar"
                right="List"
                rightEnabled={scheduledThisMonth > 0}
              />
            }
            link={{ label: "See all", href: "/admin/meetings" }}
          >
            {/* The calendar grid always renders, booked or not (Issy
                2026-06-12) — an empty month reads as the empty state. */}
            <BookedMeetingsCalendar
              bookedByMonth={bookedByMonth}
              todayKey={todayKey}
              todayDate={now.getUTCDate()}
            />
          </Widget>
        </div>
        <div className="lg:col-span-4">
          <Widget
            title="Pending requests"
            count={pendingRows.length}
            link={{ label: "All", href: "/admin/requests" }}
            state={pendingRows.length === 0 ? "empty" : "ready"}
            emptyText="No pending requests."
          >
            <PendingRequestsList rows={pendingRows} />
          </Widget>
        </div>

        <div className="lg:col-span-8">
          <Widget
            title="Needs action"
            count={needsCapped.length}
            link={{ label: "See all", href: "/admin/meetings" }}
            state={needsCapped.length === 0 ? "empty" : "ready"}
            emptyText="Nothing needs action right now."
          >
            <NeedsActionList
              rows={needsCapped}
              openCount={needsRows.length}
              assignedCount={assignedToMe}
            />
          </Widget>
        </div>
        <div className="lg:col-span-4">
          <Widget
            title="Distributions"
            link={{ label: "Details", href: "/admin/reports" }}
          >
            <DistributionsBars groups={distributions} />
          </Widget>
        </div>

        <div className="lg:col-span-4">
          <Widget
            title="Unresponded comms"
            count={0}
            link={{ label: "Inbox", href: "/admin/inbox" }}
            state="empty"
            emptyText="No unresponded threads."
            emptyAction={
              <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                Wired through the Admin Inbox port.
              </span>
            }
          >
            <UnrespondedCommsList rows={[]} />
          </Widget>
        </div>
        <div className="lg:col-span-4">
          <Widget
            title="Recent onboards"
            link={{ label: "All", href: "/admin/vendors" }}
            state={onboards.length === 0 ? "empty" : "ready"}
            emptyText="No vendor users joined in the last 30 days."
          >
            <RecentOnboardsList rows={onboards} />
          </Widget>
        </div>
        <div className="lg:col-span-4">
          <Widget
            title="Gifts sent"
            count={giftsTotalCount}
            link={{ label: "Catalogue", href: "/admin/giving" }}
            state={gifts.length === 0 ? "empty" : "ready"}
            emptyText="No gifts recorded yet."
          >
            <GiftsSentList rows={gifts} />
          </Widget>
        </div>
      </div>
    </PortalPage>
  );
}
