"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Badge,
  DataTable,
  StatusDot,
  type DataTableColumn,
} from "@thegoodintro/ui";

/**
 * Admin Vendors list T3 (LOCKED 2026-06-02; chunk A 2026-06-10). Renders the
 * locked six-column table inside the kit's <DataTable> admin density. The
 * server component upstream owns data fetching, per-vendor tier computation,
 * and slicing for pagination; this client wrapper builds the column render
 * functions and drives ?page navigation.
 *
 * Chunk B (deferred): row overflow menu, filter popover, sort dropdown
 * popover, bulk-actions toolbar. The filter / sort triggers in the page
 * header are presentational in this commit.
 */

export interface VendorRow {
  id: string;
  name: string;
  contactName: string | null;
  contactEmail: string | null;
  tier: 1 | 2 | 3 | 4 | null;
  /** Available credits across this vendor's lots. `null` = onboarding / not yet purchased. */
  creditsRemaining: number | null;
  renewsLabel: string;
  joinedLabel: string;
  /** Locked display bucket (mapped from `vendor.status` enum upstream). */
  statusDisplay: "Active" | "Onboarding" | "Dormant" | "Paused" | "Churned";
}

interface AdminVendorsTableProps {
  rows: VendorRow[];
  page: number;
  pageCount: number;
  rangeLabel: string;
}

export function AdminVendorsTable({ rows, page, pageCount, rangeLabel }: AdminVendorsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onPage = (next: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/admin/vendors");
  };

  const columns: DataTableColumn<VendorRow>[] = [
    {
      key: "vendor",
      header: "Vendor",
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.name} size={32} />
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
              {r.name}
            </div>
            {(r.contactName || r.contactEmail) && (
              <div className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
                {[r.contactName, r.contactEmail].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "tier",
      header: "Tier",
      width: "92px",
      render: (r) =>
        r.tier === null ? (
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>—</span>
        ) : (
          <Badge tone="amber" className="font-mono uppercase tracking-[0.12em]">
            Tier {r.tier}
          </Badge>
        ),
    },
    {
      key: "credits",
      header: "Credits",
      width: "104px",
      align: "right",
      render: (r) =>
        r.creditsRemaining === null ? (
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>—</span>
        ) : (
          <span className="inline-flex items-center gap-2 font-mono text-[13px] tabular-nums">
            {r.creditsRemaining === 0 && <StatusDot tone="danger" size={6} />}
            {r.creditsRemaining}
          </span>
        ),
    },
    {
      key: "renews",
      header: "Renews",
      width: "120px",
      align: "right",
      render: (r) => (
        <span className="font-mono text-[12.5px]" style={{ color: "var(--portal-ink)" }}>
          {r.renewsLabel}
        </span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      width: "120px",
      align: "right",
      render: (r) => (
        <span className="font-mono text-[12.5px]" style={{ color: "var(--portal-ink)" }}>
          {r.joinedLabel}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "128px",
      render: (r) => <StatusPill display={r.statusDisplay} />,
    },
  ];

  return (
    <DataTable
      density="admin"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      rowHref={(r) => `/admin/vendors/${r.id}`}
      pagination={{ page, pageCount, onPage, rangeLabel }}
      state={rows.length === 0 ? "empty" : "ready"}
      emptyText="No vendors yet."
    />
  );
}

function StatusPill({ display }: { display: VendorRow["statusDisplay"] }) {
  // Locked tones (UI_KIT_DESIGN_LOG "Admin Vendors list (T3)"):
  //   Active  → gold dot · amber-soft pill
  //   Onboarding → amber dot · amber-soft pill (visually shares the gold tone
  //     in this kit version; differentiated by label until --portal-gold
  //     lands as a separate token)
  //   Dormant → muted dot · muted pill (lower opacity)
  //   Paused  → muted dot · muted pill
  //   Churned → muted dot · muted pill (row opacity handled upstream)
  if (display === "Active" || display === "Onboarding") {
    return (
      <Badge tone="amber" dot>
        {display}
      </Badge>
    );
  }
  return (
    <Badge tone="muted" dot>
      {display}
    </Badge>
  );
}
