"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  Menu,
  StatusDot,
  type DataTableColumn,
  type MenuItemSpec,
} from "@thegoodintro/ui";
import { archiveVendorsAction } from "./actions";
import { vendorStatusPill, type VendorStatusEnum } from "./_status";

/**
 * Admin Vendors list T3 (LOCKED 2026-06-02; chunk A 2026-06-10, chunk B
 * 2026-06-12). Renders the locked six-column table inside the kit's
 * <DataTable> admin density with row checkboxes, the bulk-actions bar, the
 * row overflow menu, and the locked empty state. The server component
 * upstream owns data fetching, filtering, sorting, and slicing; this client
 * wrapper drives ?page/?per navigation and the mutating actions.
 *
 * Locked actions whose backing isn't built yet (vendor welcome email
 * template, a paused/call-done vendor state, tags, bulk status change) render
 * DISABLED with a parked note rather than disappearing (rule 2b). Each is
 * listed as an open question in the session report; none was silently
 * resolved.
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
  /** Raw vendor_status enum; the pill label + tone come from vendorStatusPill so
   *  the list and the detail header never drift. */
  status: VendorStatusEnum;
}

interface AdminVendorsTableProps {
  rows: VendorRow[];
  page: number;
  pageCount: number;
  rangeLabel: string;
  perPage: number;
  /** admin_vendors_actions flag: mutating actions disabled until Issy flips it. */
  actionsEnabled: boolean;
  /** true = no vendors exist at all (locked empty state); false = filters emptied the page. */
  isUnfiltered: boolean;
}

export function AdminVendorsTable({
  rows,
  page,
  pageCount,
  rangeLabel,
  perPage,
  actionsEnabled,
  isUnfiltered,
}: AdminVendorsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [archiving, startArchive] = useTransition();

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/admin/vendors");
  };

  const onPage = (next: number) => setParams({ page: next <= 1 ? null : String(next) });
  const onPerPage = (n: number) => setParams({ per: n === 25 ? null : String(n), page: null });

  const archive = (ids: string[]) => {
    const noun = ids.length === 1 ? "this vendor" : `these ${ids.length} vendors`;
    if (!window.confirm(`Archive ${noun}? They drop off every list and report. Reversible by support.`)) return;
    startArchive(async () => {
      await archiveVendorsAction(ids);
      setSelected(new Set());
      router.refresh();
    });
  };

  const rowMenu = (r: VendorRow): MenuItemSpec[] => [
    { label: "Open profile", href: `/admin/vendors/${r.id}` },
    {
      label: "Send onboarding email",
      disabled: true,
      note: "Parked: the vendor welcome template is not written yet.",
    },
    // "Mark vetting call done" removed per Issy 2026-06-12: Approve/Decline on
    // the vendor profile IS the call outcome (lock amendment recorded by the
    // planning chat on the admin-vendors-list README).
    {
      label: "Pause vendor",
      disabled: true,
      note: "Parked: the vendor lifecycle has no paused status.",
    },
    { label: "Add credit manually", href: `/admin/vendors/${r.id}` },
    {
      label: "Archive",
      danger: true,
      separatorBefore: true,
      disabled: !actionsEnabled,
      note: actionsEnabled ? undefined : "Behind the admin_vendors_actions flag (off by default).",
      onSelect: () => archive([r.id]),
    },
  ];

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
      render: (r) => <StatusPill status={r.status} />,
    },
  ];

  const selectedRows = rows.filter((r) => selected.has(r.id));

  return (
    <div>
      {selected.size > 0 && (
        <BulkBar
          count={selected.size}
          busy={archiving}
          actionsEnabled={actionsEnabled}
          onArchive={() => archive([...selected])}
          onExport={() => downloadCsv(selectedRows)}
          onCancel={() => setSelected(new Set())}
        />
      )}
      <DataTable
        density="admin"
        columns={columns}
        rows={rows}
        rowKey={(r) => r.id}
        rowHref={(r) => `/admin/vendors/${r.id}`}
        rowActions={(r) => <Menu items={rowMenu(r)} label={`Actions for ${r.name}`} />}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        pagination={{
          page,
          pageCount,
          onPage,
          rangeLabel,
          perPage,
          onPerPage,
        }}
        state={rows.length === 0 ? "empty" : "ready"}
        emptyIcon={isUnfiltered ? "box" : undefined}
        emptyText={isUnfiltered ? "No vendors yet" : "No vendors match the current filters."}
        emptyHint={
          isUnfiltered
            ? "Vendors arrive through the public sign-up and the vetting call. You can also add one by hand."
            : undefined
        }
        emptyAction={
          isUnfiltered ? (
            <Button variant="primary" size="md" href="/admin/vendors/new">
              + Add a vendor manually
            </Button>
          ) : undefined
        }
      />
    </div>
  );
}

function BulkBar({
  count,
  busy,
  actionsEnabled,
  onArchive,
  onExport,
  onCancel,
}: {
  count: number;
  busy: boolean;
  actionsEnabled: boolean;
  onArchive: () => void;
  onExport: () => void;
  onCancel: () => void;
}) {
  // Locked bulk set 2026-06-02. Items whose backing isn't built render
  // disabled with the reason in the tooltip (rule 2b), never dropped.
  const parked = (label: string, note: string) => (
    <Button key={label} variant="ghost" size="sm" disabled title={note}>
      {label}
    </Button>
  );
  return (
    <div
      className="mb-3 flex items-center gap-2 flex-wrap rounded-xl border px-3 py-2"
      style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
    >
      <span className="font-mono text-[12px] uppercase tracking-[0.12em] mr-1" style={{ color: "var(--portal-amber-ink)" }}>
        {count} selected
      </span>
      {parked("Apply tag", "Parked: tags ship with the Tags management page (TAGS_FEATURE.md).")}
      {parked("Change status to...", "Parked: status moves through guarded lifecycle transitions, not a bulk set.")}
      {parked("Send onboarding email", "Parked: the vendor welcome template is not written yet.")}
      {parked("Pause", "Parked: the vendor lifecycle has no paused status.")}
      {parked("Add credit manually", "Per vendor only: open the vendor profile to issue a credit invoice.")}
      <Button
        variant="ghost"
        size="sm"
        disabled={!actionsEnabled || busy}
        loading={busy}
        title={actionsEnabled ? undefined : "Behind the admin_vendors_actions flag (off by default)."}
        onClick={onArchive}
      >
        Archive
      </Button>
      <Button variant="ghost" size="sm" onClick={onExport}>
        Export selected (CSV)
      </Button>
      <Button variant="link" size="sm" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}

function StatusPill({ status }: { status: VendorStatusEnum }) {
  // Label + tone come from the shared vendorStatusPill mapping (see _status.ts),
  // so each of the four pre-active states shows its own label instead of one
  // collapsed "Onboarding" pill, and the detail header stays in lock-step.
  const { label, tone } = vendorStatusPill(status);
  return (
    <Badge tone={tone} dot>
      {label}
    </Badge>
  );
}

// ── CSV export (visible columns only; no money figures beyond the credit count) ──

function csvField(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

function downloadCsv(rows: VendorRow[]) {
  const header = ["Vendor", "Contact name", "Contact email", "Tier", "Credits", "Renews", "Joined", "Status"];
  const lines = rows.map((r) =>
    [
      r.name,
      r.contactName ?? "",
      r.contactEmail ?? "",
      r.tier === null ? "" : `Tier ${r.tier}`,
      r.creditsRemaining === null ? "" : String(r.creditsRemaining),
      r.renewsLabel,
      r.joinedLabel,
      vendorStatusPill(r.status).label,
    ]
      .map(csvField)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vendors-selected.csv";
  a.click();
  URL.revokeObjectURL(url);
}
