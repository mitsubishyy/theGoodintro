import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { MetricsRibbon, PortalPage, type RibbonGroup } from "@thegoodintro/ui";
import { ComingSoon } from "../_components/coming-soon";
import { VendorRequestsTable } from "./_table";
import { shapeVendorRequestRow, type RawVendorRequest } from "./_rows";
import { REQUEST_STATUSES, requestStatusPill, type RequestStatusEnum } from "@/app/admin/requests/_status";

/**
 * Vendor Requests — read-only view of the requests this vendor's team has sent,
 * with status, executive, sent date, the current meeting state if any, and what
 * happens next. Vendor-scoped purely by RLS: the request + meeting SELECTs run
 * under the vendor session (createClient), and the request/meeting select
 * policies (0003) restrict to vendor_id = current_vendor_id(), so no vendor_id
 * filter is needed and no other tenant's rows are reachable.
 *
 * Gating mirrors the sibling /vendor/executives page: active vendor + the
 * request_loop flag. Until the locked vendor shell (vendor_shell) is on, it
 * keeps the pre-port ComingSoon placeholder (CHANGE_SAFETY: flag off = unchanged).
 *
 * Sets NO state and adds NO actions, transitions, or scheduling; it only reads
 * and labels, reusing the admin request + meeting status pills for one shared
 * status language.
 */

export const metadata: Metadata = {
  title: "Requests — TheGoodIntro",
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

export default async function VendorRequestsPage({
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
    // Pre-port placeholder, unchanged until the locked vendor shell is enabled.
    return (
      <ComingSoon
        icon="inbox"
        title="Requests"
        body="Every request your team has sent, with its status, will live here. Until this view lands, the Pending widget on your dashboard shows what is in flight."
      />
    );
  }

  const sp = await searchParams;
  const statusParam = first(sp.status);
  const status: RequestStatusEnum | null = REQUEST_STATUSES.includes(statusParam as RequestStatusEnum)
    ? (statusParam as RequestStatusEnum)
    : null;
  const page = Math.max(1, Number(first(sp.page) ?? "1") || 1);
  const perPage = parsePerPage(first(sp.per));

  // RLS scopes this to the vendor's own requests; the embedded meeting(s) are
  // likewise restricted to this vendor by the meeting select policy.
  const supabase = await createClient();
  const { data } = await supabase
    .from("request")
    .select(
      "id, status, created_at, executive:executive_id ( name, title, company ), meeting ( status, scheduled_at, created_at )",
    )
    .order("created_at", { ascending: false })
    .limit(1000);

  const allRows = ((data ?? []) as unknown as RawVendorRequest[]).map(shapeVendorRequestRow);
  const filtered = status ? allRows.filter((r) => r.status === status) : allRows;

  const totalCount = allRows.length;
  const filteredCount = filtered.length;
  const pageCount = Math.max(1, Math.ceil(filteredCount / perPage));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * perPage;
  const rows = filtered.slice(start, start + perPage);

  const counts: Record<RequestStatusEnum, number> = {
    submitted: allRows.filter((r) => r.status === "submitted").length,
    accepted: allRows.filter((r) => r.status === "accepted").length,
    declined: allRows.filter((r) => r.status === "declined").length,
    closed: allRows.filter((r) => r.status === "closed").length,
  };
  const heldCount = allRows.filter((r) => r.meeting?.status === "held").length;

  const ribbonGroups: RibbonGroup[] = [
    { label: "Awaiting reply", stats: [{ value: String(counts.submitted), sub: "with the executive", big: true }] },
    { label: "Accepted", stats: [{ value: String(counts.accepted), sub: "a time is being set or booked", big: true }] },
    { label: "Meetings held", stats: [{ value: String(heldCount), sub: "request complete", big: true }] },
  ];

  const visibleStart = filteredCount === 0 ? 0 : start + 1;
  const visibleEnd = Math.min(start + rows.length, filteredCount);
  const rangeLabel =
    filteredCount === 0 ? "No requests" : `Showing ${visibleStart} to ${visibleEnd} of ${filteredCount}`;

  return (
    <PortalPage
      title="Requests"
      breadcrumb={[{ label: "Dashboard", href: "/vendor" }, { label: "Requests" }]}
      count={status ? `${filteredCount} ${requestStatusPill(status).label.toLowerCase()} / ${totalCount} all` : `${totalCount} all`}
      action={<StatusFilter active={status} counts={counts} total={totalCount} perPage={perPage} />}
    >
      <MetricsRibbon groups={ribbonGroups} columns={3} numeralFont="fraunces" />

      <VendorRequestsTable
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
 * Server-rendered status filter (plain links): All + the four request states
 * with live counts. Read navigation only. Changing the filter resets the page
 * (drops ?page) but keeps the chosen page size (carries ?per), matching the
 * admin requests filter behaviour.
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
    if (perPage !== 25) params.set("per", String(perPage));
    const qs = params.toString();
    return qs ? `/vendor/requests?${qs}` : "/vendor/requests";
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
