import type { Metadata } from "next";
import { MetricsRibbon, PortalPage, type RibbonGroup } from "@thegoodintro/ui";
import { createClient } from "@/lib/supabase/server";
import { AdminRequestsTable } from "./_table";
import { shapeRequestRow, type RawRequest } from "./_rows";
import { REQUEST_STATUSES, requestStatusPill, type RequestStatusEnum } from "./_status";

/**
 * Admin Requests list — read-only loop visibility for the Request → Meeting →
 * GiftRecord lifecycle. Linked from the dashboard "Pending requests" widget and
 * the Meetings sidebar sub-nav (both already point at /admin/requests). Shows
 * vendor, requester, executive, request status, created age, and the linked
 * meeting's status if one exists.
 *
 * Staff-only + feature-flagged via the admin shell: the /admin layout gates the
 * whole surface behind requireStaff() + the admin_shell flag (off by default),
 * and reads run under the caller's RLS-scoped session, so no per-page flag or
 * auth check is needed (mirrors /admin/meetings + /admin/vendors).
 *
 * Sets NO state and adds NO transitions or scheduling: it only reads and labels.
 * All requests load in one query and filter/slice in memory so the counts and
 * pagination agree; move to DB-level pagination once request volume grows.
 */

export const metadata: Metadata = {
  title: "Requests — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const PER_PAGE_OPTIONS = [10, 25, 50, 100];

function parsePerPage(v: string | undefined): number {
  const n = Number(v);
  return PER_PAGE_OPTIONS.includes(n) ? n : 25;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const statusParam = first(sp.status);
  const status: RequestStatusEnum | null = REQUEST_STATUSES.includes(
    statusParam as RequestStatusEnum,
  )
    ? (statusParam as RequestStatusEnum)
    : null;
  const page = Math.max(1, Number(first(sp.page) ?? "1") || 1);
  const perPage = parsePerPage(first(sp.per));

  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };

  const [submittedC, acceptedC, declinedC, closedC, allResp] = await Promise.all([
    supabase.from("request").select("id", head).eq("status", "submitted"),
    supabase.from("request").select("id", head).eq("status", "accepted"),
    supabase.from("request").select("id", head).eq("status", "declined"),
    supabase.from("request").select("id", head).eq("status", "closed"),
    // One fetch feeds the list. The linked meeting(s) ride along as a reverse
    // embed; _rows.pickLatestMeeting keeps the newest (a reversal spawns a new one).
    supabase
      .from("request")
      .select(
        "id, status, created_at, vendor:vendor_id ( name ), requester:requested_by_user_id ( name, role, email ), executive:executive_id ( name, title, company ), meeting ( status, scheduled_at, created_at )",
      )
      .order("created_at", { ascending: false })
      .limit(2000),
  ]);

  const allRows = ((allResp.data ?? []) as unknown as RawRequest[]).map(shapeRequestRow);
  const filtered = status ? allRows.filter((r) => r.status === status) : allRows;

  const totalCount = allRows.length;
  const filteredCount = filtered.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / perPage));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  const counts: Record<RequestStatusEnum, number> = {
    submitted: submittedC.count ?? 0,
    accepted: acceptedC.count ?? 0,
    declined: declinedC.count ?? 0,
    closed: closedC.count ?? 0,
  };

  const ribbonGroups: RibbonGroup[] = [
    { label: "Submitted", stats: [{ value: String(counts.submitted), sub: "awaiting review", big: true }] },
    { label: "Accepted", stats: [{ value: String(counts.accepted), sub: "progressing to a meeting", big: true }] },
    { label: "Declined", stats: [{ value: String(counts.declined), sub: "executive said no", big: true }] },
    { label: "Closed", stats: [{ value: String(counts.closed), sub: "stale or withdrawn", big: true }] },
  ];

  const visibleStart = filteredCount === 0 ? 0 : start + 1;
  const visibleEnd = Math.min(start + rows.length, filteredCount);
  const rangeLabel =
    filteredCount === 0
      ? "No requests"
      : `Showing ${visibleStart} to ${visibleEnd} of ${filteredCount}`;

  return (
    <PortalPage
      title="Requests"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Requests" }]}
      count={status ? `${filteredCount} ${requestStatusPill(status).label.toLowerCase()} / ${totalCount} all` : `${totalCount} all`}
      action={<StatusFilter active={status} counts={counts} total={totalCount} perPage={perPage} />}
    >
      <MetricsRibbon groups={ribbonGroups} columns={4} numeralFont="fraunces" />

      <AdminRequestsTable
        rows={rows}
        page={safePage}
        pageCount={pageCount}
        rangeLabel={rangeLabel}
        perPage={perPage}
        isUnfiltered={status === null}
      />
    </PortalPage>
  );
}

/**
 * Server-rendered status filter (plain links, no client JS): All + the four
 * request states, each with a live count. Read navigation only. Changing the
 * filter resets the page (the result set changed, so ?page is dropped) but
 * KEEPS the chosen page size (?per carries over), so a filter switch doesn't
 * silently snap the rows-per-page back to the default.
 */
function StatusFilter({
  active,
  counts,
  total,
  perPage,
}: {
  active: RequestStatusEnum | null;
  counts: Record<RequestStatusEnum, number>;
  total: number;
  perPage: number;
}) {
  const items: { key: RequestStatusEnum | null; label: string; count: number }[] = [
    { key: null, label: "All", count: total },
    ...REQUEST_STATUSES.map((s) => ({ key: s, label: requestStatusPill(s).label, count: counts[s] })),
  ];
  const hrefFor = (key: RequestStatusEnum | null): string => {
    const params = new URLSearchParams();
    if (key) params.set("status", key);
    if (perPage !== 25) params.set("per", String(perPage)); // 25 is the default; omit it
    const qs = params.toString();
    return qs ? `/admin/requests?${qs}` : "/admin/requests";
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
