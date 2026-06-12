"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Icon, type IconName } from "../icons";
import { EmptyState } from "../primitives/EmptyState";
import { ErrorInline } from "../primitives/ErrorInline";
import { Skeleton } from "../primitives/Skeleton";
import type { Column, LoadState } from "../types";

/**
 * T3 index list (BLUEPRINT T3 + UI_KIT_DESIGN_LOG). One template; two locked
 * densities:
 *   - "admin" (default): 44px rows, dense, white card, mono uppercase headers.
 *   - "vendor" (LOCKED 2026-06-06 on Vendor Executives List): 76px rows,
 *     --portal-card-reading white table card, whole-row click target with a
 *     subtle hover-lift shadow, right-aligned chevron column replacing a
 *     "View →" text link.
 *
 * Sortable column chevron (LOCKED 2026-06-06): default sort has no chevron;
 * when a column becomes the active sort, a 10px chevron-up/down appears after
 * the header text in --portal-amber-ink. Cursor pointer on sortable headers
 * only; pass `sortable: true` on the Column for that column to be clickable.
 *
 * State matrix: ready / loading / empty / error — auto-rendered.
 */

export type DataTableDensity = "admin" | "vendor";

export interface SortState {
  key: string;
  direction: "asc" | "desc";
}

export interface DataTableColumn<T> extends Column<T> {
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  /** Stable row id for keys; defaults to `String(row.id)` or the row index. */
  rowKey?: (row: T) => string;
  /** Make the whole row a click target; renders a right chevron in vendor density. */
  rowHref?: (row: T) => string;
  /** Right-side row-action menu slot per row. */
  rowActions?: (row: T) => ReactNode;
  /** Bulk checkbox column. */
  selectable?: boolean;
  selectedKeys?: ReadonlySet<string>;
  onSelectionChange?: (next: Set<string>) => void;
  /** Top-right filter slot (single-row inline filter bar lives ABOVE the table
   *  on the page; pass the trigger button here). */
  filter?: ReactNode;
  /** Top-right primary action ("+ New X"). */
  newAction?: ReactNode;
  /** Pagination footer state. Rows-per-page dropdown (T3 lock: 10/25/50/100)
   *  renders when `perPage` + `onPerPage` are provided. */
  pagination?: {
    page: number;
    pageCount: number;
    onPage: (p: number) => void;
    rangeLabel?: string;
    perPage?: number;
    perPageOptions?: number[];
    onPerPage?: (n: number) => void;
  };
  /** Current sort + sort handler (used only when a column has sortable=true). */
  sort?: SortState | null;
  onSort?: (next: SortState) => void;
  state?: LoadState;
  /** Skeleton rows while loading (T3 lock: header + 8 rows). Default 5. */
  loadingLines?: number;
  emptyText?: string;
  emptyAction?: ReactNode;
  /** T3 centred empty state: 48px antique-gold icon + muted body (locked 2026-06-02). */
  emptyIcon?: IconName;
  emptyHint?: string;
  onRetry?: () => void;
  errorMessage?: string;
  density?: DataTableDensity;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  rowHref,
  rowActions,
  selectable,
  selectedKeys,
  onSelectionChange,
  filter,
  newAction,
  pagination,
  sort,
  onSort,
  state = "ready",
  loadingLines = 5,
  emptyText,
  emptyAction,
  emptyIcon,
  emptyHint,
  onRetry,
  errorMessage,
  density = "admin",
  className = "",
}: DataTableProps<T>) {
  const router = useRouter();
  const isVendor = density === "vendor";
  const rowHeight = isVendor ? "h-[76px]" : "h-11"; // 76px vs 44px
  const cellPad = isVendor ? "px-4" : "px-3";
  const cardBg = isVendor ? "var(--portal-card-reading)" : "var(--portal-card)";
  const rowHoverShadow = isVendor ? "hover:shadow-[0_1px_3px_rgba(20,40,30,0.06)]" : "";
  const rowHover = "hover:bg-[var(--portal-card-hover)]";

  const keyOf = (row: T, i: number): string =>
    rowKey ? rowKey(row) : String((row as { id?: string | number })?.id ?? i);

  const Header = (
    <thead>
      <tr style={{ borderBottom: "1px solid var(--portal-line)" }}>
        {selectable && (
          <th className={`${cellPad} py-3 w-10`}>
            <input
              type="checkbox"
              aria-label="Select all"
              checked={!!selectedKeys && rows.length > 0 && rows.every((r, i) => selectedKeys.has(keyOf(r, i)))}
              onChange={(e) => {
                if (!onSelectionChange) return;
                const next = new Set(selectedKeys ?? []);
                if (e.target.checked) rows.forEach((r, i) => next.add(keyOf(r, i)));
                else rows.forEach((r, i) => next.delete(keyOf(r, i)));
                onSelectionChange(next);
              }}
            />
          </th>
        )}
        {columns.map((c) => {
          const isSortable = !!c.sortable;
          const isActive = isSortable && sort?.key === String(c.key);
          const onClick = () => {
            if (!isSortable || !onSort) return;
            onSort({
              key: String(c.key),
              direction: isActive && sort?.direction === "asc" ? "desc" : "asc",
            });
          };
          return (
            <th
              key={String(c.key)}
              className={`${cellPad} py-3 text-left text-[10.5px] font-mono uppercase tracking-[0.16em] select-none ${isSortable ? "cursor-pointer" : ""}`}
              style={{ color: "var(--muted-foreground)", width: c.width, textAlign: c.align ?? "left" }}
              onClick={onClick}
            >
              <span className="inline-flex items-center gap-1.5">
                {c.header}
                {isActive && (
                  <Icon name={sort?.direction === "asc" ? "chevron-up" : "chevron-down"} size={10} className="opacity-80" />
                )}
              </span>
            </th>
          );
        })}
        {rowActions && <th className="w-10" aria-hidden="true" />}
        {isVendor && rowHref && <th className="w-12" aria-hidden="true" />}
      </tr>
    </thead>
  );

  const Body = (() => {
    if (state === "loading") {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + (isVendor && rowHref ? 1 : 0)} className="p-0">
              <Skeleton variant="row" lines={loadingLines} />
            </td>
          </tr>
        </tbody>
      );
    }
    if (state === "error") {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + (isVendor && rowHref ? 1 : 0)} className="p-0">
              <ErrorInline message={errorMessage} onRetry={onRetry} />
            </td>
          </tr>
        </tbody>
      );
    }
    if (state === "empty" || rows.length === 0) {
      return (
        <tbody>
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0) + (rowActions ? 1 : 0) + (isVendor && rowHref ? 1 : 0)} className="p-0">
              <EmptyState
                title={emptyText ?? "Nothing here yet."}
                action={emptyAction}
                icon={emptyIcon}
                hint={emptyHint}
                align={emptyIcon ? "center" : "start"}
              />
            </td>
          </tr>
        </tbody>
      );
    }
    return (
      <tbody>
        {rows.map((row, i) => {
          const k = keyOf(row, i);
          const selected = selectedKeys?.has(k);
          const href = rowHref?.(row);
          return (
            <tr
              key={k}
              className={`${rowHeight} ${rowHover} ${rowHoverShadow} ${href ? "cursor-pointer" : ""}`}
              style={{ borderBottom: "1px solid var(--portal-line)" }}
              onClick={href ? () => router.push(href) : undefined}
            >
              {selectable && (
                <td className={`${cellPad} py-2.5 w-10`} onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    aria-label="Select row"
                    checked={!!selected}
                    onChange={(e) => {
                      if (!onSelectionChange) return;
                      const next = new Set(selectedKeys ?? []);
                      if (e.target.checked) next.add(k);
                      else next.delete(k);
                      onSelectionChange(next);
                    }}
                  />
                </td>
              )}
              {columns.map((c) => (
                <td
                  key={String(c.key)}
                  className={`${cellPad} py-2.5 text-[13.5px] align-middle`}
                  style={{ color: "var(--portal-ink)", textAlign: c.align ?? "left" }}
                >
                  {c.render
                    ? c.render(row)
                    : (((row as Record<string, unknown>)[String(c.key)] as ReactNode) ?? "")}
                </td>
              ))}
              {rowActions && (
                <td className="w-10 pr-3" onClick={(e) => e.stopPropagation()}>
                  {rowActions(row)}
                </td>
              )}
              {isVendor && href && (
                <td className="w-12 pr-4 text-right">
                  <Icon name="chevron-right" size={20} className="opacity-50" />
                </td>
              )}
            </tr>
          );
        })}
      </tbody>
    );
  })();

  return (
    <div className={className}>
      {(filter || newAction) && (
        <div className="flex items-center justify-end gap-3 mb-3">
          {filter}
          {newAction}
        </div>
      )}
      <div
        className={`rounded-2xl border overflow-hidden ${isVendor ? "" : ""}`}
        style={{ background: cardBg, borderColor: "var(--portal-line)" }}
      >
        <table className="w-full">
          {Header}
          {Body}
        </table>
      </div>
      {pagination && (
        <div className="mt-3 flex items-center justify-between text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
          {pagination.rangeLabel && <span>{pagination.rangeLabel}</span>}
          <div className="flex items-center gap-4">
            <Pager {...pagination} />
            {pagination.perPage !== undefined && pagination.onPerPage && (
              <label className="flex items-center gap-2">
                <span>Rows per page</span>
                <select
                  value={pagination.perPage}
                  onChange={(e) => pagination.onPerPage?.(Number(e.target.value))}
                  className="h-8 rounded-md border px-2 text-[12.5px] bg-[var(--portal-card)] cursor-pointer"
                  style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
                >
                  {(pagination.perPageOptions ?? [10, 25, 50, 100]).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Pager({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (p: number) => void }) {
  if (pageCount <= 1) return null;
  const window: (number | "ellipsis")[] = [];
  const push = (n: number | "ellipsis") => window.push(n);
  push(1);
  if (page > 3) push("ellipsis");
  for (let p = Math.max(2, page - 1); p <= Math.min(pageCount - 1, page + 1); p++) push(p);
  if (page < pageCount - 2) push("ellipsis");
  if (pageCount > 1) push(pageCount);
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onPage(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="size-8 grid place-items-center rounded-md disabled:opacity-40 hover:bg-[var(--portal-card-hover)]"
        aria-label="Previous page"
      >
        <Icon name="chevron-left" size={16} />
      </button>
      {window.map((n, i) =>
        n === "ellipsis" ? (
          <span key={`e${i}`} className="px-1 opacity-60">…</span>
        ) : (
          <button
            key={n}
            type="button"
            onClick={() => onPage(n)}
            className="size-8 grid place-items-center rounded-md text-[12.5px]"
            style={{
              background: n === page ? "var(--portal-ink)" : "transparent",
              color: n === page ? "var(--portal-card)" : "var(--portal-ink)",
            }}
          >
            {n}
          </button>
        ),
      )}
      <button
        type="button"
        onClick={() => onPage(Math.min(pageCount, page + 1))}
        disabled={page >= pageCount}
        className="size-8 grid place-items-center rounded-md disabled:opacity-40 hover:bg-[var(--portal-card-hover)]"
        aria-label="Next page"
      >
        <Icon name="chevron-right" size={16} />
      </button>
    </div>
  );
}

// Re-export the generic-friendly cell renderer signature for callers; e.g.:
//   { key: "status", header: "STATUS", render: (r) => <Badge tone="amber" dot>Request sent</Badge> }
export type { Column } from "../types";
