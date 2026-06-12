import type { Metadata } from "next";
import { bandForMeetingNumber } from "@thegoodintro/pricing";
import { Button, MetricsRibbon, PortalPage, type RibbonGroup } from "@thegoodintro/ui";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { formatAudCompact, formatDate } from "@/lib/format";
import { financialYearWindow, monthWindow, revenueForPeriod } from "@/lib/reporting";
import { VendorListControls } from "./_controls";
import {
  activeFilterCount,
  parseFilters,
  parsePerPage,
  parseSort,
  type SortKey,
  type VendorListFilters,
} from "./_list-params";
import { AdminVendorsTable, type VendorRow } from "./_table";
import { isOnboardingStatus, ONBOARDING_STATUSES, type VendorStatusEnum } from "./_status";

/**
 * Admin Vendors list — port of the locked T3 (UI_KIT_DESIGN_LOG +
 * design/locked/admin-vendors-list/README.md, locked 2026-06-02).
 *
 * Chunk A 2026-06-10: PortalPage chrome, 3-stat MetricsRibbon, the locked
 * six-column DataTable, URL pagination, row click -> /admin/vendors/{id}.
 *
 * Chunk B 2026-06-12 (this commit):
 *  - Filter popover (URL-driven; live sections STATUS / TIER / CREDIT
 *    BALANCE / HAS OUTSTANDING INVOICE / HAS RECENT MEETING / RENEWS WITHIN
 *    / JOINED with per-section counts; INDUSTRY / COMPANY SIZE / REGION and
 *    saved views render parked until their data sources exist) + the
 *    active-count amber pill on the Filter button.
 *  - Sort dropdown (default "Date joined · Newest first").
 *  - Row overflow menu + bulk-actions bar; mutating actions behind the
 *    admin_vendors_actions flag (off by default).
 *  - Rows-per-page dropdown, locked empty state, loading.tsx skeleton.
 *  - Ribbon sub-lines per the lock: "N onboarding" / "across N vendors" /
 *    "YTD $..." (revenue via lib/reporting.ts, never recomputed here).
 *
 * All vendors load in one query and filter/sort/slice in memory so the mono
 * count, filter counts, and pagination agree; move to DB-level filtering
 * once vendor count grows past a few hundred.
 */

export const metadata: Metadata = {
  title: "Vendors — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

interface VendorOwner {
  name: string | null;
  email: string | null;
}
interface VendorCreditLot {
  quantity_remaining: number;
}

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

const DAY_MS = 24 * 60 * 60 * 1000;

interface EnrichedVendor {
  row: VendorRow;
  createdAt: string;
  accessExpiresAt: string | null;
  hasOutstandingInvoice: boolean;
  lastHeldAt: string | null;
}

function applyFilters(
  vendors: EnrichedVendor[],
  f: VendorListFilters,
  now: Date,
): EnrichedVendor[] {
  const within = (iso: string | null, days: number, future: boolean): boolean => {
    if (!iso) return false;
    const t = new Date(iso).getTime();
    return future
      ? t >= now.getTime() && t <= now.getTime() + days * DAY_MS
      : t >= now.getTime() - days * DAY_MS && t <= now.getTime();
  };
  return vendors.filter((v) => {
    if (f.status.length && !f.status.includes(v.row.status)) return false;
    if (f.tier.length && (v.row.tier === null || !f.tier.includes(v.row.tier))) return false;
    if (f.credits) {
      const c = v.row.creditsRemaining;
      if (f.credits === "zero" && c !== 0) return false;
      if (f.credits === "low" && (c === null || c < 1 || c > 2)) return false;
      if (f.credits === "3plus" && (c === null || c < 3)) return false;
    }
    if (f.invoice === "yes" && !v.hasOutstandingInvoice) return false;
    if (f.invoice === "no" && v.hasOutstandingInvoice) return false;
    if (f.meeting === "30" && !within(v.lastHeldAt, 30, false)) return false;
    if (f.meeting === "90" && !within(v.lastHeldAt, 90, false)) return false;
    if (f.meeting === "none" && within(v.lastHeldAt, 90, false)) return false;
    if (f.renews && !within(v.accessExpiresAt, parseInt(f.renews, 10), true)) return false;
    if (f.joined && !within(v.createdAt, parseInt(f.joined, 10), false)) return false;
    return true;
  });
}

function applySort(vendors: EnrichedVendor[], sort: SortKey): EnrichedVendor[] {
  const sorted = [...vendors];
  switch (sort) {
    case "joined_asc":
      return sorted.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    case "name_asc":
      return sorted.sort((a, b) => a.row.name.localeCompare(b.row.name));
    case "name_desc":
      return sorted.sort((a, b) => b.row.name.localeCompare(a.row.name));
    case "renews_asc":
      // Soonest renewal first; vendors with no access window sort last.
      return sorted.sort((a, b) =>
        (a.accessExpiresAt ?? "9999").localeCompare(b.accessExpiresAt ?? "9999"),
      );
    case "joined_desc":
    default:
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);
  const filters = parseFilters(sp);
  const sort = parseSort(sp);
  const perPage = parsePerPage(sp);

  const supabase = await createClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const head = { count: "exact" as const, head: true };
  const mtdWindow = monthWindow(now);
  const fyWindow = financialYearWindow(now);
  const heldCutoffIso = new Date(now.getTime() - 90 * DAY_MS).toISOString();

  const [
    activeVendorsC,
    confirmedMeetingsResp,
    mtdRev,
    fyRev,
    vendorsResp,
    cyclesResp,
    outstandingResp,
    heldResp,
    actionsEnabled,
  ] = await Promise.all([
    // Ribbon row
    supabase.from("vendor").select("id", head).eq("status", "active"),
    // Reserved credits = confirmed meetings; the request join gives the
    // distinct-vendor sub-line ("across N vendors").
    supabase
      .from("meeting")
      .select("id, request:request_id ( vendor_id )")
      .eq("status", "confirmed"),
    revenueForPeriod(supabase, mtdWindow),
    revenueForPeriod(supabase, fyWindow),

    // List rows — load all vendors so the in-memory filter + slice + page
    // count are accurate against the locked "14 active / 17 all" mono count.
    // Move to a DB-level pagination once vendor count grows past a few hundred.
    supabase
      .from("vendor")
      .select(
        "id, name, status, access_expires_at, created_at, owner:owner_user_id ( name, email ), credit_lot ( quantity_remaining )",
      )
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),

    // Current cycle per vendor → drives the Tier pill via the rolling 12-month
    // band aggregator. No vendor.tier column yet (Issy 2026-06-08); read
    // cycle.held_meetings_count which the markHeld path already maintains.
    supabase
      .from("cycle")
      .select("vendor_id, held_meetings_count")
      .lte("started_at", nowIso)
      .gt("ends_at", nowIso),

    // HAS OUTSTANDING INVOICE filter: an issued, unpaid invoice.
    supabase.from("invoice").select("vendor_id").eq("status", "sent"),

    // HAS RECENT MEETING filter: meetings held in the last 90 days.
    supabase
      .from("meeting")
      .select("scheduled_at, request:request_id ( vendor_id )")
      .eq("status", "held")
      .gte("scheduled_at", heldCutoffIso),

    getFlag("admin_vendors_actions"),
  ]);

  // ── Tier map ─────────────────────────────────────────────────────────────
  const tierByVendor = new Map<string, 1 | 2 | 3 | 4>();
  for (const c of cyclesResp.data ?? []) {
    const held = (c.held_meetings_count as number) ?? 0;
    tierByVendor.set(
      c.vendor_id as string,
      bandForMeetingNumber(held + 1).band,
    );
  }

  // ── Filter lookups ───────────────────────────────────────────────────────
  const outstandingVendors = new Set(
    (outstandingResp.data ?? []).map((r) => r.vendor_id as string),
  );
  const lastHeldByVendor = new Map<string, string>();
  for (const m of heldResp.data ?? []) {
    const vendorId = one<{ vendor_id: string }>(m.request)?.vendor_id;
    const at = m.scheduled_at as string | null;
    if (!vendorId || !at) continue;
    const prev = lastHeldByVendor.get(vendorId);
    if (!prev || at > prev) lastHeldByVendor.set(vendorId, at);
  }

  // ── Per-vendor row build (all vendors; filter/sort/slice after) ──────────
  const all = vendorsResp.data ?? [];
  const enriched: EnrichedVendor[] = all.map((v) => {
    const owner = one<VendorOwner>(v.owner);
    const lots = (v.credit_lot ?? []) as VendorCreditLot[];
    const status = v.status as VendorStatusEnum;
    const creditsRemaining =
      lots.length === 0 && isOnboardingStatus(status)
        ? null
        : lots.reduce((s, l) => s + (l.quantity_remaining ?? 0), 0);
    return {
      row: {
        id: v.id as string,
        name: v.name as string,
        contactName: owner?.name ?? null,
        contactEmail: owner?.email ?? null,
        tier: tierByVendor.get(v.id as string) ?? null,
        creditsRemaining,
        renewsLabel: formatDate(v.access_expires_at as string | null),
        joinedLabel: formatDate(v.created_at as string),
        status,
      },
      createdAt: v.created_at as string,
      accessExpiresAt: v.access_expires_at as string | null,
      hasOutstandingInvoice: outstandingVendors.has(v.id as string),
      lastHeldAt: lastHeldByVendor.get(v.id as string) ?? null,
    };
  });

  // ── Filter-popover counts (always over the unfiltered set) ───────────────
  const statusCounts: Record<string, number> = {};
  const tierCounts: Record<number, number> = {};
  for (const v of enriched) {
    statusCounts[v.row.status] = (statusCounts[v.row.status] ?? 0) + 1;
    if (v.row.tier !== null) tierCounts[v.row.tier] = (tierCounts[v.row.tier] ?? 0) + 1;
  }

  // ── Filter → sort → slice ────────────────────────────────────────────────
  const filtered = applySort(applyFilters(enriched, filters, now), sort);
  const totalCount = all.length;
  const filteredCount = filtered.length;
  const activeCount = activeVendorsC.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(filteredCount / perPage));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * perPage;
  const rows: VendorRow[] = filtered.slice(start, start + perPage).map((v) => v.row);

  // ── Ribbon (locked sub-lines 2026-06-02) ─────────────────────────────────
  const onboardingCount = enriched.filter((v) =>
    (ONBOARDING_STATUSES as readonly string[]).includes(v.row.status),
  ).length;
  const confirmedMeetings = confirmedMeetingsResp.data ?? [];
  const reservedVendors = new Set(
    confirmedMeetings
      .map((m) => one<{ vendor_id: string }>(m.request)?.vendor_id)
      .filter(Boolean),
  );
  const ribbonGroups: RibbonGroup[] = [
    {
      label: "Active vendors",
      stats: [
        { value: String(activeCount), sub: `${onboardingCount} onboarding`, big: true },
      ],
    },
    {
      label: "Credits reserved",
      stats: [
        {
          value: String(confirmedMeetings.length),
          sub: `across ${reservedVendors.size} vendor${reservedVendors.size === 1 ? "" : "s"}`,
          big: true,
        },
      ],
    },
    {
      label: "Revenue MTD",
      stats: [
        {
          value: formatAudCompact(mtdRev.netCents),
          sub: `YTD ${formatAudCompact(fyRev.netCents)}`,
          big: true,
        },
      ],
    },
  ];

  // ── Pagination label ─────────────────────────────────────────────────────
  const visibleStart = filteredCount === 0 ? 0 : start + 1;
  const visibleEnd = Math.min(start + rows.length, filteredCount);
  const rangeLabel =
    filteredCount === 0
      ? "No vendors"
      : `Showing ${visibleStart} to ${visibleEnd} of ${filteredCount}`;

  return (
    <PortalPage
      title="Vendors"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Vendors" }]}
      count={`${activeCount} active / ${totalCount} all`}
      action={
        <div className="flex items-center gap-2">
          <VendorListControls
            filters={filters}
            sort={sort}
            statusCounts={statusCounts}
            tierCounts={tierCounts}
          />
          <Button variant="primary" size="md" href="/admin/vendors/new">
            + New vendor
          </Button>
        </div>
      }
    >
      <MetricsRibbon groups={ribbonGroups} columns={3} numeralFont="fraunces" />

      <AdminVendorsTable
        rows={rows}
        page={safePage}
        pageCount={pageCount}
        rangeLabel={rangeLabel}
        perPage={perPage}
        actionsEnabled={actionsEnabled}
        isUnfiltered={totalCount === 0 || activeFilterCount(filters) === 0}
      />
    </PortalPage>
  );
}
