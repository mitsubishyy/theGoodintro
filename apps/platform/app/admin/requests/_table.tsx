"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, Badge, DataTable, type DataTableColumn } from "@thegoodintro/ui";
import { statusPill as meetingStatusPill } from "../meetings/_status";
import { requestStatusPill } from "./_status";
import type { RequestRow } from "./_rows";

/**
 * Read-only admin requests list — the booking loop made visible (vendor →
 * executive, who asked, request status, age, and the linked meeting if one
 * exists). Linked from the dashboard "Pending requests" widget + the sidebar
 * sub-nav. The server component owns fetching, the status filter, and slicing;
 * this client wrapper only drives ?page/?per navigation.
 *
 * Deliberately NOT interactive beyond paging: no row selection, no row actions,
 * no row click target (there is no request detail surface, and this list sets no
 * state — request transitions live in the email-action + close_request paths).
 */

interface AdminRequestsTableProps {
  rows: RequestRow[];
  page: number;
  pageCount: number;
  rangeLabel: string;
  perPage: number;
  /** true = no requests exist at all; false = the status filter emptied the page. */
  isUnfiltered: boolean;
}

export function AdminRequestsTable({
  rows,
  page,
  pageCount,
  rangeLabel,
  perPage,
  isUnfiltered,
}: AdminRequestsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/admin/requests");
  };

  const onPage = (next: number) => setParams({ page: next <= 1 ? null : String(next) });
  const onPerPage = (n: number) => setParams({ per: n === 25 ? null : String(n), page: null });

  const muted = { color: "var(--muted-foreground)" };
  const dash = <span className="text-[12.5px]" style={muted}>—</span>;

  const columns: DataTableColumn<RequestRow>[] = [
    {
      key: "vendor",
      header: "Vendor",
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.vendorName} size={32} />
          <div className="min-w-0">
            <div
              className="text-[13.5px] font-semibold truncate"
              style={{ color: "var(--portal-ink)" }}
            >
              {r.vendorName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "requester",
      header: "Requester",
      render: (r) =>
        r.requesterName || r.requesterDetail ? (
          <div className="min-w-0">
            <div className="text-[13px] truncate" style={{ color: "var(--portal-ink)" }}>
              {r.requesterName ?? "—"}
            </div>
            {r.requesterDetail && (
              <div className="text-[12px] truncate" style={muted}>
                {r.requesterDetail}
              </div>
            )}
          </div>
        ) : (
          dash
        ),
    },
    {
      key: "executive",
      header: "Executive",
      render: (r) =>
        r.execName || r.execDetail ? (
          <div className="min-w-0">
            <div className="text-[13px] truncate" style={{ color: "var(--portal-ink)" }}>
              {r.execName ?? "—"}
            </div>
            {r.execDetail && (
              <div className="text-[12px] truncate" style={muted}>
                {r.execDetail}
              </div>
            )}
          </div>
        ) : (
          dash
        ),
    },
    {
      key: "status",
      header: "Status",
      width: "124px",
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
      header: "Created",
      width: "110px",
      align: "right",
      render: (r) => (
        <span
          className="font-mono text-[12.5px] tabular-nums"
          style={{ color: "var(--portal-ink)" }}
          title={r.createdLabel}
        >
          {r.ageLabel}
        </span>
      ),
    },
    {
      key: "meeting",
      header: "Meeting",
      width: "150px",
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
  ];

  return (
    <DataTable
      density="admin"
      columns={columns}
      rows={rows}
      rowKey={(r) => r.id}
      pagination={{ page, pageCount, onPage, rangeLabel, perPage, onPerPage }}
      state={rows.length === 0 ? "empty" : "ready"}
      emptyIcon={isUnfiltered ? "inbox" : undefined}
      emptyText={isUnfiltered ? "No requests yet" : "No requests match this status."}
      emptyHint={
        isUnfiltered
          ? "Requests arrive when a vendor asks to meet an executive. They show here as they move through the loop."
          : undefined
      }
    />
  );
}
