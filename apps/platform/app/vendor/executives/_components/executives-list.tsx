"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Avatar,
  DataTable,
  Icon,
  InlineFilterBar,
  type DataTableColumn,
  type FilterPill,
  type SortState,
} from "@thegoodintro/ui";

/**
 * Vendor Executives List — ported component-for-component from the locked
 * design (UI_KIT_DESIGN_LOG "Vendor Executives List" LOCKED 2026-06-06 +
 * design/locked/vendor-executives-list/README.md).
 *
 *   - Header strip: counts ("240 active executives · 12 requested by your
 *     team · 8 met by your team") + 380px "Search company…" input + Filters
 *     button with active count + amber dot, chevron tracking bar open/closed.
 *   - Single-row inline filter bar (kit) with category + count pills; the
 *     per-pill multi-select popover was never designed, so a plain checkbox
 *     popover renders under the bar (engineering fill-in, restyle when the
 *     popover is designed).
 *   - Vendor T3 DataTable (76px photo-led rows, white card, whole-row click,
 *     chevron column). Row click opens the Executive Detail Drawer via the
 *     ?exec= param so the drawer is linkable and server-hydrated.
 *   - Status pills: Request sent (amber-soft) · Meeting complete (the locked
 *     soft-green tone) · Declined (muted) · blank for no history.
 *
 * The server page owns data, filtering, sorting, and paging; this component
 * renders and drives the URL.
 */

export type ExecStatusKey = "request_sent" | "meeting_complete" | "declined" | "none";

export interface ExecListRow {
  id: string;
  name: string;
  title: string;
  company: string;
  industry: string | null;
  country: string | null;
  photoUrl: string | null;
  status: ExecStatusKey;
  bio: string | null;
  charityName: string | null;
  memberSinceYear: number;
}

export interface FilterOptions {
  industry: string[];
  title: string[];
  location: string[];
  status: { value: ExecStatusKey; label: string }[];
}

interface ActiveFilters {
  q: string;
  industry: string[];
  title: string[];
  location: string[];
  status: string[];
}

const PILL_LABELS: Record<keyof Omit<ActiveFilters, "q">, string> = {
  industry: "Industry",
  title: "Title",
  location: "Location",
  status: "Status",
};

export function ExecutivesList({
  rows,
  totals,
  matchCount,
  filterOptions,
  active,
  sort,
  page,
  pageCount,
  rangeLabel,
}: {
  rows: ExecListRow[];
  totals: { active: number; requested: number; met: number };
  matchCount: number;
  filterOptions: FilterOptions;
  active: ActiveFilters;
  sort: SortState | null;
  page: number;
  pageCount: number;
  rangeLabel: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeCount =
    active.industry.length + active.title.length + active.location.length + active.status.length;
  const [barOpen, setBarOpen] = useState(activeCount > 0);
  const [openPill, setOpenPill] = useState<keyof typeof PILL_LABELS | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const push = (mutate: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    mutate(params);
    params.delete("page"); // any filter/sort/search change resets paging
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const toggleValue = (key: keyof typeof PILL_LABELS, value: string) =>
    push((p) => {
      const current = p.get(key)?.split(",").filter(Boolean) ?? [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      if (next.length) p.set(key, next.join(","));
      else p.delete(key);
    });

  const pills: FilterPill[] = (Object.keys(PILL_LABELS) as (keyof typeof PILL_LABELS)[]).map(
    (key) => ({
      key,
      label: PILL_LABELS[key],
      activeCount: active[key].length,
      onOpen: () => setOpenPill((p) => (p === key ? null : key)),
    }),
  );

  const columns: DataTableColumn<ExecListRow>[] = [
    {
      key: "name",
      header: "Executive",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={r.name} src={r.photoUrl} size={48} />
          <div className="min-w-0 leading-tight">
            <div className="text-[15px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
              {r.name}
            </div>
            <div className="text-[13px] truncate" style={{ color: "var(--muted-foreground)" }}>
              {r.title}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "company",
      header: "Company",
      sortable: true,
      width: "180px",
      render: (r) => <span className="text-[13px]">{r.company}</span>,
    },
    {
      key: "industry",
      header: "Industry",
      width: "140px",
      render: (r) => (
        <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
          {r.industry ?? "—"}
        </span>
      ),
    },
    {
      key: "country",
      header: "Country",
      render: (r) =>
        r.country ? (
          <span className="inline-flex items-center gap-1.5 text-[13px]">
            <Icon name="pin" size={12} style={{ color: "var(--muted-foreground)" }} />
            {r.country}
          </span>
        ) : (
          <span style={{ color: "var(--muted-foreground)" }}>—</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      width: "160px",
      render: (r) => <StatusPill status={r.status} />,
    },
  ];

  return (
    <main className="flex-1 min-w-0 px-8 py-6 w-full max-w-[1280px]">
      {/* Header strip */}
      <div className="h-16 flex items-center gap-4">
        <div className="flex items-baseline gap-2 min-w-0 whitespace-nowrap">
          <span className="text-[14.5px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            {totals.active} active executive{totals.active === 1 ? "" : "s"}
          </span>
          <Dot />
          <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            {totals.requested} requested by your team
          </span>
          <Dot />
          <span className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            {totals.met} met by your team
          </span>
        </div>
        <div className="flex-1 flex justify-center">
          <form
            className="w-[380px] max-w-full"
            onSubmit={(e) => {
              e.preventDefault();
              push((p) => {
                const v = searchRef.current?.value.trim() ?? "";
                if (v) p.set("q", v);
                else p.delete("q");
              });
            }}
          >
            <div
              className="h-9 flex items-center gap-2 px-3 rounded-lg border"
              style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
            >
              <Icon name="search" size={16} style={{ color: "var(--muted-foreground)" }} />
              <input
                ref={searchRef}
                defaultValue={active.q}
                placeholder="Search company…"
                className="flex-1 bg-transparent text-[13px] outline-none"
                style={{ color: "var(--portal-ink)" }}
              />
            </div>
          </form>
        </div>
        <button
          type="button"
          onClick={() => setBarOpen((o) => !o)}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border text-[13px] font-semibold shrink-0"
          style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
        >
          {activeCount > 0 && (
            <span className="size-1.5 rounded-full" style={{ background: "var(--portal-amber)" }} />
          )}
          Filters{activeCount > 0 ? ` · ${activeCount}` : ""}
          <Icon name={barOpen ? "chevron-up" : "chevron-down"} size={12} />
        </button>
      </div>

      {/* Single-row inline filter bar + the undesigned value popover */}
      {barOpen && (
        <div className="relative">
          <InlineFilterBar
            pills={pills}
            matchLabel={`${matchCount} of ${totals.active} match`}
            onClearAll={() =>
              push((p) => {
                p.delete("industry");
                p.delete("title");
                p.delete("location");
                p.delete("status");
              })
            }
          />
          {openPill && (
            <div
              className="absolute z-30 top-14 left-24 w-72 max-h-80 overflow-y-auto rounded-xl border p-2 shadow-lg"
              style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
            >
              <div
                className="px-2 py-1.5 text-[10px] font-mono uppercase tracking-[0.18em] flex items-center justify-between"
                style={{ color: "var(--muted-foreground)" }}
              >
                {PILL_LABELS[openPill]}
                <button type="button" onClick={() => setOpenPill(null)} aria-label="Close">
                  <Icon name="x" size={12} />
                </button>
              </div>
              {(openPill === "status"
                ? filterOptions.status.map((s) => ({ value: s.value as string, label: s.label }))
                : filterOptions[openPill].map((v) => ({ value: v, label: v }))
              ).map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] cursor-pointer hover:bg-[var(--portal-card-hover)]"
                  style={{ color: "var(--portal-ink)" }}
                >
                  <input
                    type="checkbox"
                    checked={active[openPill].includes(opt.value)}
                    onChange={() => toggleValue(openPill, opt.value)}
                  />
                  {opt.label}
                </label>
              ))}
              {openPill !== "status" && filterOptions[openPill].length === 0 && (
                <p className="px-2 py-1.5 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                  Nothing to filter on yet.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="mt-3">
        <DataTable<ExecListRow>
          density="vendor"
          columns={columns}
          rows={rows}
          rowKey={(r) => r.id}
          rowHref={(r) => {
            const params = new URLSearchParams(searchParams?.toString() ?? "");
            params.set("exec", r.id);
            return `${pathname}?${params.toString()}`;
          }}
          sort={sort}
          onSort={(next) =>
            push((p) => {
              p.set("sort", next.key);
              p.set("dir", next.direction);
            })
          }
          state={rows.length === 0 ? "empty" : "ready"}
          emptyText={
            activeCount > 0 || active.q
              ? "No executives match these filters."
              : "No executives are available right now."
          }
          pagination={{
            page,
            pageCount,
            rangeLabel,
            onPage: (p) =>
              push((params) => {
                if (p <= 1) params.delete("page");
                else params.set("page", String(p));
              }),
          }}
        />
      </div>
    </main>
  );
}

function Dot() {
  return (
    <span aria-hidden="true" style={{ color: "var(--muted-foreground)" }}>
      ·
    </span>
  );
}

/** Locked vendor status pill tones (filled variant, 2026-06-06). */
export function StatusPill({ status }: { status: ExecStatusKey }) {
  if (status === "none") return null;
  const tone =
    status === "request_sent"
      ? { bg: "var(--portal-amber-soft)", ink: "var(--portal-amber-ink)", dot: "var(--portal-amber)", label: "Request sent" }
      : status === "meeting_complete"
        ? { bg: "var(--vendor-complete-soft)", ink: "var(--vendor-complete-ink)", dot: "var(--vendor-complete-ink)", label: "Meeting complete" }
        : { bg: "color-mix(in oklch, var(--portal-line) 50%, transparent)", ink: "var(--muted-foreground)", dot: "var(--muted-foreground)", label: "Declined" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] whitespace-nowrap"
      style={{ background: tone.bg, color: tone.ink }}
    >
      <span className="size-1.5 rounded-full shrink-0" style={{ background: tone.dot }} />
      {tone.label}
    </span>
  );
}
