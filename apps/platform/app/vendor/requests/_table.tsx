"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, Badge, DataTable, type DataTableColumn } from "@thegoodintro/ui";
import { requestStatusPill } from "@/app/admin/requests/_status";
import { statusPill as meetingStatusPill } from "@/app/admin/meetings/_status";
import type { VendorRequestRow } from "./_rows";

/**
 * Read-only list of the requests this vendor's team has sent. Reuses the admin
 * request + meeting status pills so the status language is identical across
 * portals; the only vendor-specific column is "What's next". Vendor T3 density
 * (the locked Executives-list register), no rowHref — there is no request detail
 * surface and this view sets no state. The server component owns fetching, the
 * status filter, and slicing; this wrapper only drives ?page/?per.
 */

interface VendorRequestsTableProps {
  rows: VendorRequestRow[];
  page: number;
  pageCount: number;
  rangeLabel: string;
  perPage: number;
  /** true = the team has sent no requests at all; false = the filter emptied the page. */
  isUnfiltered: boolean;
}

export function VendorRequestsTable({
  rows,
  page,
  pageCount,
  rangeLabel,
  perPage,
  isUnfiltered,
}: VendorRequestsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/vendor/requests");
  };

  const onPage = (next: number) => setParams({ page: next <= 1 ? null : String(next) });
  const onPerPage = (n: number) => setParams({ per: n === 25 ? null : String(n), page: null });

  const muted = { color: "var(--muted-foreground)" };
  const dash = <span className="text-[13px]" style={muted}>—</span>;

  const columns: DataTableColumn<VendorRequestRow>[] = [
    {
      key: "executive",
      header: "Executive",
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.execName ?? "?"} size={36} />
          <div className="min-w-0">
            <div className="text-[14px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
              {r.execName ?? "Executive"}
            </div>
            {r.execDetail && (
              <div className="text-[12.5px] truncate" style={muted}>
                {r.execDetail}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "128px",
      render: (r) => {
        const p = requestStatusPill(r.status);
        return (
          <Badge tone={p.tone} dot>
            {p.label}
          </Badge>
        );
      },
    },
    {
      key: "created",
      header: "Sent",
      width: "132px",
      render: (r) => (
        <div>
          <div className="text-[13px]" style={{ color: "var(--portal-ink)" }}>
            {r.createdLabel}
          </div>
          <div className="font-mono text-[11.5px]" style={muted}>
            {r.ageLabel} ago
          </div>
        </div>
      ),
    },
    {
      key: "meeting",
      header: "Meeting",
      width: "132px",
      render: (r) => {
        if (!r.meeting) return dash;
        const p = meetingStatusPill(r.meeting.status);
        return (
          <Badge tone={p.tone} dot>
            {p.label}
          </Badge>
        );
      },
    },
    {
      key: "next",
      header: "What's next",
      render: (r) => (
        <span className="text-[12.5px] leading-snug" style={muted}>
          {r.nextStep}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      density="vendor"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      pagination={{ page, pageCount, onPage, rangeLabel, perPage, onPerPage }}
      state={rows.length === 0 ? "empty" : "ready"}
      emptyIcon={isUnfiltered ? "inbox" : undefined}
      emptyText={isUnfiltered ? "No requests sent yet" : "No requests match this status."}
      emptyHint={
        isUnfiltered
          ? "When your team asks to meet an executive, the request shows here with its status and what happens next."
          : undefined
      }
    />
  );
}
