"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, Badge, DataTable, type DataTableColumn, type Tone } from "@thegoodintro/ui";
import { statusPill as meetingStatusPill } from "@/app/admin/meetings/_status";
import type { VendorMeetingRow, GiftStatusEnum } from "./_rows";

/**
 * Read-only list of this vendor's own meetings. Reuses the admin meeting status
 * pill so the status language is identical across portals; the gift pill and the
 * "What's next" column are vendor-facing. Vendor T3 density, no rowHref — there is
 * no meeting detail surface and this view sets no state (no edit / cancel /
 * reschedule / transition). The server component owns fetching, grouping, the
 * filter, and slicing; this wrapper only drives ?page/?per.
 */

// Gift status -> pill. Only released/paid reach here (voided reads as no gift).
const GIFT_PILL: Record<Exclude<GiftStatusEnum, "voided">, { label: string; tone: Tone }> = {
  released: { label: "Gift pending", tone: "amber" },
  paid: { label: "Gift sent", tone: "green" },
};

interface VendorMeetingsTableProps {
  rows: VendorMeetingRow[];
  page: number;
  pageCount: number;
  rangeLabel: string;
  perPage: number;
  /** true = the vendor has no meetings at all; false = the filter emptied the page. */
  isUnfiltered: boolean;
}

export function VendorMeetingsTable({
  rows,
  page,
  pageCount,
  rangeLabel,
  perPage,
  isUnfiltered,
}: VendorMeetingsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/vendor/meetings");
  };

  const onPage = (next: number) => setParams({ page: next <= 1 ? null : String(next) });
  const onPerPage = (n: number) => setParams({ per: n === 25 ? null : String(n), page: null });

  const muted = { color: "var(--muted-foreground)" };
  const dash = <span className="text-[13px]" style={muted}>—</span>;

  const columns: DataTableColumn<VendorMeetingRow>[] = [
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
      width: "124px",
      render: (r) => {
        const p = meetingStatusPill(r.status);
        return (
          <Badge tone={p.tone} dot>
            {p.label}
          </Badge>
        );
      },
    },
    {
      key: "when",
      header: "When",
      width: "210px",
      render: (r) => (
        <div className="min-w-0">
          <div className="text-[13px] truncate" style={{ color: "var(--portal-ink)" }}>
            {r.whenLabel}
          </div>
          {r.joinUrl ? (
            <a
              href={r.joinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium hover:underline"
              style={{ color: "var(--portal-amber-ink)" }}
            >
              {r.provider ?? "Join"} ↗
            </a>
          ) : (
            <span className="text-[12px]" style={muted}>
              No join link yet
            </span>
          )}
        </div>
      ),
    },
    {
      key: "charity",
      header: "Charity / gift",
      width: "180px",
      render: (r) => {
        if (!r.charityName && !r.giftStatus) return dash;
        const gp = r.giftStatus ? GIFT_PILL[r.giftStatus] : null;
        return (
          <div className="min-w-0">
            <div className="text-[13px] truncate" style={{ color: "var(--portal-ink)" }}>
              {r.charityName ?? "—"}
            </div>
            {gp && (
              <span className="mt-0.5 inline-block">
                <Badge tone={gp.tone} dot>
                  {gp.label}
                </Badge>
              </span>
            )}
          </div>
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
      emptyIcon={isUnfiltered ? "calendar" : undefined}
      emptyText={isUnfiltered ? "No meetings yet" : "No meetings in this view."}
      emptyHint={
        isUnfiltered
          ? "Once an executive accepts a request and a time is set, the meeting shows here with its status and what happens next."
          : undefined
      }
    />
  );
}
