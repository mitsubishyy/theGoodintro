import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { MetricsRibbon, PortalPage, type RibbonGroup } from "@thegoodintro/ui";
import { ComingSoon } from "../_components/coming-soon";
import { VendorMeetingsTable } from "./_table";
import {
  shapeVendorMeetingRow,
  sortVendorMeetings,
  MEETING_GROUPS,
  MEETING_GROUP_LABEL,
  type RawVendorMeeting,
  type MeetingGroup,
} from "./_rows";

/**
 * Vendor Meetings — read-only view of this vendor's own meetings, grouped into
 * Upcoming (confirmed, time ahead), Pending (proposed, being scheduled), Past
 * (held, or confirmed past its time), and Cancelled (no-show / cancelled /
 * reversed). Shows the executive, time, provider + join link if present, the
 * charity and gift status where already recorded, and what happens next.
 *
 * Vendor-scoped purely by RLS: the meeting select runs under the vendor session
 * (createClient), and the 0003 meeting select policy restricts to meetings whose
 * request belongs to vendor_id = current_vendor_id(), so no vendor_id filter is
 * needed and no other tenant's rows (or embedded request/gift) are reachable.
 *
 * Gating mirrors /vendor/requests (active vendor + request_loop); with the locked
 * vendor_shell flag off it keeps the pre-port ComingSoon placeholder. Sets NO
 * state and adds NO edit / cancel / reschedule / transition — it only reads and
 * labels, reusing the admin meeting status pill for one shared status language.
 */

export const metadata: Metadata = {
  title: "Meetings — TheGoodIntro",
  robots: { index: false, follow: false },
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}
function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
function parsePerPage(v: string | undefined): number {
  const n = Number(v);
  return PER_PAGE_OPTIONS.includes(n) ? n : 25;
}

export default async function VendorMeetingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const result = await getVendor();
  if (!result?.user) redirect("/login");
  if (!result.vendorUser) redirect("/vendor");
  const vendor = one<{ status: string }>(result.vendorUser.vendor);
  if (vendor?.status !== "active") redirect("/vendor");
  if (!(await getFlag("request_loop"))) redirect("/vendor");

  if (!(await getFlag("vendor_shell"))) {
    return (
      <ComingSoon
        icon="calendar"
        title="Meetings"
        body="Upcoming and past meetings will live here. Your dashboard's Upcoming meetings widget covers this for now."
      />
    );
  }

  const sp = await searchParams;
  // The sidebar sub-nav links ?when=upcoming / ?when=past; we also accept the
  // other two groups. Anything else (or absent) = the unfiltered "All" view.
  const whenParam = first(sp.when);
  const group: MeetingGroup | null = MEETING_GROUPS.includes(whenParam as MeetingGroup)
    ? (whenParam as MeetingGroup)
    : null;
  const page = Math.max(1, Number(first(sp.page) ?? "1") || 1);
  const perPage = parsePerPage(first(sp.per));

  // RLS scopes to this vendor; the embedded request/executive + gift are likewise
  // restricted by their own select policies.
  const supabase = await createClient();
  const { data } = await supabase
    .from("meeting")
    .select(
      "id, status, scheduled_at, join_url, created_at, charity:charity_id ( name ), request:request_id ( executive:executive_id ( name, title, company ) ), gift:gift_record ( status, charity_amount_cents )",
    )
    .limit(1000);

  const now = new Date();
  const allRows = sortVendorMeetings(
    ((data ?? []) as unknown as RawVendorMeeting[]).map((m) => shapeVendorMeetingRow(m, now)),
  );
  const filtered = group ? allRows.filter((r) => r.group === group) : allRows;

  const totalCount = allRows.length;
  const filteredCount = filtered.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / perPage));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  const counts: Record<MeetingGroup, number> = {
    upcoming: allRows.filter((r) => r.group === "upcoming").length,
    pending: allRows.filter((r) => r.group === "pending").length,
    past: allRows.filter((r) => r.group === "past").length,
    cancelled: allRows.filter((r) => r.group === "cancelled").length,
  };
  const heldCount = allRows.filter((r) => r.status === "held").length;

  const ribbonGroups: RibbonGroup[] = [
    { label: "Upcoming", stats: [{ value: String(counts.upcoming), sub: "confirmed, time locked in", big: true }] },
    { label: "Pending", stats: [{ value: String(counts.pending), sub: "a time is being arranged", big: true }] },
    { label: "Meetings held", stats: [{ value: String(heldCount), sub: "completed to date", big: true }] },
  ];

  const visibleStart = filteredCount === 0 ? 0 : start + 1;
  const visibleEnd = Math.min(start + rows.length, filteredCount);
  const rangeLabel =
    filteredCount === 0 ? "No meetings" : `Showing ${visibleStart} to ${visibleEnd} of ${filteredCount}`;

  return (
    <PortalPage
      title="Meetings"
      breadcrumb={[{ label: "Dashboard", href: "/vendor" }, { label: "Meetings" }]}
      count={group ? `${filteredCount} ${MEETING_GROUP_LABEL[group].toLowerCase()} / ${totalCount} all` : `${totalCount} all`}
      action={<GroupFilter active={group} counts={counts} total={totalCount} perPage={perPage} />}
    >
      <MetricsRibbon groups={ribbonGroups} columns={3} numeralFont="fraunces" />

      <VendorMeetingsTable
        rows={rows}
        page={safePage}
        pageCount={pageCount}
        rangeLabel={rangeLabel}
        perPage={perPage}
        isUnfiltered={group === null}
      />
    </PortalPage>
  );
}

/**
 * Server-rendered group filter (plain links): All + the four meeting groups with
 * live counts. Read navigation only. Changing the filter resets the page (drops
 * ?page) but keeps the chosen page size (carries ?per), matching the requests
 * filter behaviour. Uses ?when to stay compatible with the sidebar sub-nav.
 */
function GroupFilter({
  active,
  counts,
  total,
  perPage,
}: {
  active: MeetingGroup | null;
  counts: Record<MeetingGroup, number>;
  total: number;
  perPage: number;
}) {
  const items: { key: MeetingGroup | null; label: string; count: number }[] = [
    { key: null, label: "All", count: total },
    ...MEETING_GROUPS.map((g) => ({ key: g, label: MEETING_GROUP_LABEL[g], count: counts[g] })),
  ];
  const hrefFor = (key: MeetingGroup | null): string => {
    const params = new URLSearchParams();
    if (key) params.set("when", key);
    if (perPage !== 25) params.set("per", String(perPage));
    const qs = params.toString();
    return qs ? `/vendor/meetings?${qs}` : "/vendor/meetings";
  };
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {items.map((it) => {
        const on = it.key === active;
        return (
          <a
            key={it.key ?? "all"}
            href={hrefFor(it.key)}
            aria-current={on ? "page" : undefined}
            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[12.5px] font-medium transition-colors"
            style={
              on
                ? { background: "var(--portal-ink)", color: "#fff" }
                : { border: "1px solid var(--portal-line)", color: "var(--muted-foreground)" }
            }
          >
            {it.label}
            <span
              className="font-mono text-[11px] tabular-nums"
              style={{ color: on ? "rgba(255,255,255,0.7)" : "var(--portal-amber-ink)" }}
            >
              {it.count}
            </span>
          </a>
        );
      })}
    </div>
  );
}
