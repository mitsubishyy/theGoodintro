"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  DataTable,
  type DataTableColumn,
} from "@thegoodintro/ui";
import { execStatusPill, type ExecStatusEnum } from "./_status";

/**
 * Admin Executives list, ported onto the kit's <DataTable> admin density to
 * match the Admin Vendors list (UI_KIT_DESIGN_LOG T3, admin density). The
 * server page upstream owns fetching and slicing; this client wrapper renders
 * the five-column table, the status pills, the whole-row click target, and
 * drives ?page / ?per navigation.
 */

export interface ExecRow {
  id: string;
  name: string;
  email: string | null;
  photoUrl: string | null;
  /** "Title, Company" (either side may be missing). */
  role: string;
  charityName: string | null;
  /** Meetings held with this executive (lifetime). */
  meetingsHeld: number;
  addedLabel: string;
  status: ExecStatusEnum;
}

interface AdminExecutivesTableProps {
  rows: ExecRow[];
  page: number;
  pageCount: number;
  rangeLabel: string;
  perPage: number;
  /** New-executive route, or null when the exec_onboarding flag is off. */
  newHref: string | null;
}

const Dash = () => (
  <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
    —
  </span>
);

export function AdminExecutivesTable({
  rows,
  page,
  pageCount,
  rangeLabel,
  perPage,
  newHref,
}: AdminExecutivesTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParams = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    for (const [k, v] of Object.entries(updates)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    const qs = params.toString();
    router.push(qs ? `?${qs}` : "/admin/executives");
  };

  const onPage = (next: number) => setParams({ page: next <= 1 ? null : String(next) });
  const onPerPage = (n: number) => setParams({ per: n === 25 ? null : String(n), page: null });

  const columns: DataTableColumn<ExecRow>[] = [
    {
      key: "executive",
      header: "Executive",
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.name} src={r.photoUrl} size={32} />
          <div className="min-w-0">
            <div className="text-[13.5px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
              {r.name}
            </div>
            {r.email && (
              <div className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
                {r.email}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      width: "240px",
      render: (r) =>
        r.role ? (
          <span className="text-[13px]" style={{ color: "var(--portal-ink)" }}>
            {r.role}
          </span>
        ) : (
          <Dash />
        ),
    },
    {
      key: "charity",
      header: "Charity",
      width: "200px",
      render: (r) =>
        r.charityName ? (
          <span className="text-[13px]" style={{ color: "var(--portal-ink)" }}>
            {r.charityName}
          </span>
        ) : (
          <Dash />
        ),
    },
    {
      key: "meetings",
      header: "Meetings",
      width: "104px",
      align: "right",
      render: (r) =>
        r.meetingsHeld === 0 ? (
          <Dash />
        ) : (
          <span className="font-mono text-[13px] tabular-nums" style={{ color: "var(--portal-ink)" }}>
            {r.meetingsHeld}
          </span>
        ),
    },
    {
      key: "added",
      header: "Added",
      width: "120px",
      align: "right",
      render: (r) => (
        <span className="font-mono text-[12.5px]" style={{ color: "var(--portal-ink)" }}>
          {r.addedLabel}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "128px",
      render: (r) => {
        const { label, tone } = execStatusPill(r.status);
        return (
          <Badge tone={tone} dot>
            {label}
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
      rowHref={(r) => `/admin/executives/${r.id}`}
      pagination={{ page, pageCount, onPage, rangeLabel, perPage, onPerPage }}
      state={rows.length === 0 ? "empty" : "ready"}
      emptyIcon="user"
      emptyText="No executives yet"
      emptyHint="Senior leaders you set up appear here, ready to receive and accept requests."
      emptyAction={
        newHref ? (
          <Button variant="primary" size="md" href={newHref}>
            + New executive
          </Button>
        ) : undefined
      }
    />
  );
}
