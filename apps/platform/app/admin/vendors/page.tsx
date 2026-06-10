import type { Metadata } from "next";
import { bandForMeetingNumber } from "@thegoodintro/pricing";
import { Button, MetricsRibbon, PortalPage, type RibbonGroup } from "@thegoodintro/ui";
import { createClient } from "@/lib/supabase/server";
import { formatAudCompact, formatDate } from "@/lib/format";
import { monthWindow, revenueForPeriod } from "@/lib/reporting";
import { AdminVendorsTable, type VendorRow } from "./_table";

/**
 * Admin Vendors list — port of the locked T3 (UI_KIT_DESIGN_LOG +
 * design/locked/admin-vendors-list/README.md, locked 2026-06-02).
 *
 * Chunk A 2026-06-10 (this commit):
 *  - PortalPage chrome with breadcrumb + H1 + mono count + presentational
 *    Filter button + Sort dropdown + primary "+ New vendor".
 *  - 3-stat MetricsRibbon (ACTIVE VENDORS / CREDITS RESERVED / REVENUE MTD,
 *    money via @thegoodintro/pricing + lib/reporting.ts).
 *  - T3 DataTable with the locked six columns; per-vendor Tier computed live
 *    from the rolling 12-month `cycle.held_meetings_count` (no schema change
 *    per Issy's "do not define the tier schema yet" call 2026-06-08).
 *  - URL-driven pagination (?page=N, 25 rows per page).
 *  - Row click → /admin/vendors/{id}.
 *
 * Chunk B (deferred): filter popover (9 sections), sort dropdown popover,
 * row overflow menu (6 actions), bulk-actions toolbar (7 actions). The
 * filter / sort triggers in this commit are presentational only.
 */

export const metadata: Metadata = {
  title: "Vendors — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 25;

interface VendorOwner {
  name: string | null;
  email: string | null;
}
interface VendorCreditLot {
  quantity_remaining: number;
}

type VendorStatusEnum =
  | "signed_up"
  | "call_booked"
  | "approved"
  | "paid"
  | "active"
  | "dormant"
  | "churned";

function statusDisplayFor(s: VendorStatusEnum): VendorRow["statusDisplay"] {
  switch (s) {
    case "active":
      return "Active";
    case "dormant":
      return "Dormant";
    case "churned":
      return "Churned";
    default:
      // signed_up · call_booked · approved · paid all roll up to "Onboarding"
      // for the admin list display per the locked status pill mapping.
      return "Onboarding";
  }
}

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const pageParam = Array.isArray(sp.page) ? sp.page[0] : sp.page;
  const page = Math.max(1, Number(pageParam ?? "1") || 1);

  const supabase = await createClient();
  const now = new Date();
  const nowIso = now.toISOString();
  const head = { count: "exact" as const, head: true };
  const mtdWindow = monthWindow(now);

  const [
    activeVendorsC,
    confirmedMeetingsC,
    mtdRev,
    vendorsResp,
    cyclesResp,
  ] = await Promise.all([
    // Ribbon row
    supabase.from("vendor").select("id", head).eq("status", "active"),
    supabase.from("meeting").select("id", head).eq("status", "confirmed"),
    revenueForPeriod(supabase, mtdWindow),

    // List rows — load all vendors so the in-memory slice + page count are
    // accurate against the locked "14 active / 17 all" mono count. Move to a
    // DB-level pagination once vendor count grows past a few hundred.
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

  // ── Per-vendor row build ─────────────────────────────────────────────────
  const all = vendorsResp.data ?? [];
  const totalCount = all.length;
  const activeCount = activeVendorsC.count ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const slice = all.slice(start, start + PAGE_SIZE);

  const rows: VendorRow[] = slice.map((v) => {
    const owner = one<VendorOwner>(v.owner);
    const lots = (v.credit_lot ?? []) as VendorCreditLot[];
    const status = v.status as VendorStatusEnum;
    const statusDisplay = statusDisplayFor(status);
    const creditsRemaining =
      lots.length === 0 && statusDisplay === "Onboarding"
        ? null
        : lots.reduce((s, l) => s + (l.quantity_remaining ?? 0), 0);
    return {
      id: v.id as string,
      name: v.name as string,
      contactName: owner?.name ?? null,
      contactEmail: owner?.email ?? null,
      tier: tierByVendor.get(v.id as string) ?? null,
      creditsRemaining,
      renewsLabel: formatDate(v.access_expires_at as string | null),
      joinedLabel: formatDate(v.created_at as string),
      statusDisplay,
    };
  });

  // ── Ribbon ───────────────────────────────────────────────────────────────
  const ribbonGroups: RibbonGroup[] = [
    {
      label: "Active vendors",
      stats: [
        { value: String(activeCount), sub: `of ${totalCount} total`, big: true },
      ],
    },
    {
      label: "Credits reserved",
      stats: [
        {
          value: String(confirmedMeetingsC.count ?? 0),
          sub: "across confirmed meetings",
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
  ];

  // ── Pagination label ─────────────────────────────────────────────────────
  const visibleStart = totalCount === 0 ? 0 : start + 1;
  const visibleEnd = Math.min(start + slice.length, totalCount);
  const rangeLabel =
    totalCount === 0
      ? "No vendors"
      : `Showing ${visibleStart} to ${visibleEnd} of ${totalCount}`;

  return (
    <PortalPage
      title="Vendors"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Vendors" }]}
      count={`${activeCount} active / ${totalCount} all`}
      action={
        <div className="flex items-center gap-2">
          {/* Chunk B will wire the popovers; chrome stays so the visual lock
              renders today and the buttons are discoverable. */}
          <Button variant="ghost" size="md">
            Filters
          </Button>
          <Button variant="ghost" size="md">
            Sort · Newest first
          </Button>
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
      />
    </PortalPage>
  );
}
