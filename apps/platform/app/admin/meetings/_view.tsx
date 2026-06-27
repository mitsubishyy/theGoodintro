"use client";

import { useMemo, useState } from "react";
import { Avatar, Badge, Button, Icon, Popover } from "@thegoodintro/ui";
import {
  creditLabel,
  giftLabel,
  relativeDateLabel,
  statusPill,
  timeWithZone,
  type MeetingItem,
  type MeetingStatusEnum,
} from "./_status";
import { MeetingsCalendar } from "./_calendar";
import { MeetingDrawer } from "./_drawer";

/**
 * Admin Meetings working surface (Admin Meetings list T3). One client shell
 * owns the Calendar | List toggle, the shared Search / Filter / Sort controls
 * (they apply to BOTH views), and the right-side drawer that every chip and row
 * opens. The server hands down every meeting once, so view + month paging +
 * filtering are instant and never round-trip — the same model the dashboard
 * mini-calendar uses, so the two stay in lock-step.
 */

type View = "calendar" | "list";
type Sort = "newest" | "oldest";
const PER_PAGE = 13;

const STATUS_ORDER: MeetingStatusEnum[] = [
  "proposed",
  "confirmed",
  "held",
  "no_show",
  "cancelled",
  "reversed",
];

export function MeetingsView({
  meetings,
  nowIso,
  actionsEnabled,
  initialView = "calendar",
  initialKey,
  initialStatus = null,
}: {
  meetings: MeetingItem[];
  nowIso: string;
  actionsEnabled: boolean;
  initialView?: View;
  initialKey?: string | null;
  /** Seed the status filter from the sidebar sub-nav (?status=confirmed/held/…),
   *  so Scheduled / Completed / Cancellations actually land pre-filtered. */
  initialStatus?: MeetingStatusEnum | null;
}) {
  const [view, setView] = useState<View>(initialView);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<MeetingStatusEnum>>(
    initialStatus ? new Set([initialStatus]) : new Set(),
  );
  const [sort, setSort] = useState<Sort>("newest");
  const [page, setPage] = useState(1);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    const counts = { all: meetings.length } as Record<string, number>;
    for (const s of STATUS_ORDER) counts[s] = 0;
    for (const m of meetings) counts[m.status] = (counts[m.status] ?? 0) + 1;
    return counts;
  }, [meetings]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return meetings.filter((m) => {
      if (statusFilter.size > 0 && !statusFilter.has(m.status)) return false;
      if (!q) return true;
      return (
        m.vendorName.toLowerCase().includes(q) ||
        (m.execName ?? "").toLowerCase().includes(q) ||
        m.execLabel.toLowerCase().includes(q) ||
        (m.charityName ?? "").toLowerCase().includes(q)
      );
    });
  }, [meetings, query, statusFilter]);

  const sortedList = useMemo(() => {
    const copy = [...filtered];
    copy.sort((a, b) => {
      const av = a.scheduledIso ?? "";
      const bv = b.scheduledIso ?? "";
      return sort === "newest" ? bv.localeCompare(av) : av.localeCompare(bv);
    });
    return copy;
  }, [filtered, sort]);

  const drawerMeeting = useMemo(() => meetings.find((m) => m.id === drawerId) ?? null, [meetings, drawerId]);

  const toggleStatus = (s: MeetingStatusEnum) => {
    setPage(1);
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  };

  return (
    <div>
      {/* Controls bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented value={view} onChange={setView} />
        <div className="flex items-center gap-2.5">
          <SearchBox value={query} onChange={(v) => { setQuery(v); setPage(1); }} />
          <FilterPopover counts={statusCounts} selected={statusFilter} onToggle={toggleStatus} onClear={() => { setStatusFilter(new Set()); setPage(1); }} />
          <SortButton value={sort} onChange={setSort} />
        </div>
      </div>

      {view === "calendar" ? (
        <MeetingsCalendar meetings={filtered} nowIso={nowIso} initialKey={initialKey} onOpen={setDrawerId} />
      ) : (
        <MeetingsList rows={sortedList} nowIso={nowIso} page={page} onPage={setPage} onOpen={setDrawerId} />
      )}

      <MeetingDrawer key={drawerId ?? "closed"} meeting={drawerMeeting} actionsEnabled={actionsEnabled} onClose={() => setDrawerId(null)} />
    </div>
  );
}

// ── List ─────────────────────────────────────────────────────────────────────

function MeetingsList({
  rows,
  nowIso,
  page,
  onPage,
  onOpen,
}: {
  rows: MeetingItem[];
  nowIso: string;
  page: number;
  onPage: (p: number) => void;
  onOpen: (id: string) => void;
}) {
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(page, pageCount);
  const start = (current - 1) * PER_PAGE;
  const slice = rows.slice(start, start + PER_PAGE);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
      <table className="w-full">
        <thead>
          <tr style={{ borderBottom: "1px solid var(--portal-line)" }}>
            {["Vendor", "Executive", "Date", "Status", "Credit", "Gift"].map((h) => (
              <th key={h} className="px-5 py-3 text-left text-[10.5px] font-mono uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slice.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-5 py-16 text-center text-[13.5px] italic" style={{ color: "var(--muted-foreground)" }}>
                No meetings match the current filters.
              </td>
            </tr>
          ) : (
            slice.map((m) => {
              const pill = statusPill(m.status);
              const credit = creditLabel(m);
              const awaiting = credit === "Awaiting payment";
              return (
                <tr
                  key={m.id}
                  onClick={() => onOpen(m.id)}
                  className="cursor-pointer hover:bg-[var(--portal-amber-soft)]"
                  style={{ borderBottom: "1px solid var(--portal-line)" }}
                >
                  <td className="px-5 py-4 align-middle">
                    <span className="text-[13.5px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                      {m.vendorName}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    {m.execName ? (
                      <div className="flex items-center gap-2.5">
                        <Avatar name={m.execName} src={m.execPhotoUrl ?? undefined} size={28} />
                        <span className="text-[13.5px]" style={{ color: "var(--portal-ink)" }}>
                          {m.execName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                        No exec assigned
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="text-[13.5px] font-medium" style={{ color: "var(--portal-ink)" }}>
                      {relativeDateLabel(m.scheduledIso, nowIso)}
                    </div>
                    {m.scheduledIso && (
                      <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                        {timeWithZone(m.scheduledIso)}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <Badge tone={pill.tone} dot>
                      {pill.label}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className="text-[13px]"
                      style={{ color: awaiting ? "var(--portal-amber-ink)" : "var(--portal-ink)" }}
                    >
                      {credit}
                    </span>
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span
                      className="inline-grid min-w-[72px] place-items-center rounded-lg px-3 py-2 text-[13px] font-medium"
                      style={{
                        background: "var(--portal-card-reading)",
                        border: "1px solid var(--portal-line)",
                        color: m.status === "held" ? "var(--primary)" : "var(--muted-foreground)",
                      }}
                    >
                      {giftLabel(m)}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Pagination footer */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderTop: "1px solid var(--portal-line)" }}>
        <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
          {total === 0 ? "No meetings" : <>Showing <b style={{ color: "var(--portal-ink)" }}>{start + 1}</b> to <b style={{ color: "var(--portal-ink)" }}>{start + slice.length}</b> of {total} meetings</>}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            Page {current} of {pageCount}
          </span>
          <div className="flex items-center gap-1">
            <PagerBtn label="First page" icon="chevron-left" extra onClick={() => onPage(1)} disabled={current <= 1} />
            <PagerBtn label="Previous page" icon="chevron-left" onClick={() => onPage(current - 1)} disabled={current <= 1} />
            <PagerBtn label="Next page" icon="chevron-right" onClick={() => onPage(current + 1)} disabled={current >= pageCount} />
            <PagerBtn label="Last page" icon="chevron-right" extra onClick={() => onPage(pageCount)} disabled={current >= pageCount} />
          </div>
        </div>
      </div>
    </div>
  );
}

function PagerBtn({ label, icon, onClick, disabled, extra }: { label: string; icon: "chevron-left" | "chevron-right"; onClick: () => void; disabled: boolean; extra?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="size-8 grid place-items-center rounded-md disabled:opacity-35 hover:bg-[var(--portal-card-hover)]"
      style={{ color: "var(--portal-ink)" }}
    >
      <span className="flex">
        <Icon name={icon} size={16} />
        {extra && <Icon name={icon} size={16} className="-ml-2.5" />}
      </span>
    </button>
  );
}

// ── Controls ─────────────────────────────────────────────────────────────────

function Segmented({ value, onChange }: { value: View; onChange: (v: View) => void }) {
  const opts: { v: View; label: string; icon: "calendar" | "list" }[] = [
    { v: "calendar", label: "Calendar", icon: "calendar" },
    { v: "list", label: "List", icon: "list" },
  ];
  return (
    <div className="inline-flex h-9 overflow-hidden rounded-lg" style={{ border: "1px solid var(--portal-line)" }}>
      {opts.map((o, i) => {
        const active = o.v === value;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className="flex items-center gap-1.5 px-3.5 text-[12.5px] font-medium"
            style={{
              background: active ? "var(--portal-ink)" : "transparent",
              color: active ? "#fff" : "var(--portal-ink)",
              borderLeft: i === 0 ? undefined : "1px solid var(--portal-line)",
            }}
          >
            {o.icon === "calendar" ? <Icon name="calendar" size={14} /> : <ListGlyph />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-lg border px-3" style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)" }}>
      <Icon name="search" size={15} style={{ color: "var(--muted-foreground)" }} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search vendor, executive, charity"
        className="w-48 bg-transparent text-[13px] outline-none"
        style={{ color: "var(--portal-ink)" }}
      />
    </div>
  );
}

function FilterPopover({
  counts,
  selected,
  onToggle,
  onClear,
}: {
  counts: Record<string, number>;
  selected: Set<MeetingStatusEnum>;
  onToggle: (s: MeetingStatusEnum) => void;
  onClear: () => void;
}) {
  const active = selected.size;
  return (
    <Popover
      align="end"
      width={300}
      trigger={({ ref, open, toggle }) => (
        <Button ref={ref} variant="ghost" size="md" onClick={toggle} aria-expanded={open} leftIcon={<FilterGlyph />}>
          Filter
          {active > 0 && (
            <span
              className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold"
              style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
            >
              {active}
            </span>
          )}
        </Button>
      )}
    >
      {() => (
        <div className="p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
              Status
            </span>
            <button type="button" onClick={onClear} className="text-[12px] hover:underline underline-offset-2" style={{ color: "var(--portal-amber-ink)" }}>
              Clear
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusChip label="All" count={counts.all ?? 0} selected={active === 0} onClick={onClear} />
            {STATUS_ORDER.map((s) => (
              <StatusChip
                key={s}
                label={statusPill(s).label}
                count={counts[s] ?? 0}
                selected={selected.has(s)}
                onClick={() => onToggle(s)}
              />
            ))}
          </div>
        </div>
      )}
    </Popover>
  );
}

function StatusChip({ label, count, selected, onClick }: { label: string; count: number; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[12.5px] font-medium"
      style={{
        background: selected ? "var(--portal-ink)" : "transparent",
        borderColor: selected ? "var(--portal-ink)" : "var(--portal-line)",
        color: selected ? "#fff" : "var(--portal-ink)",
      }}
    >
      {label}
      <span className="font-mono text-[11px]" style={{ color: selected ? "rgba(255,255,255,0.7)" : "var(--muted-foreground)" }}>
        {count}
      </span>
    </button>
  );
}

function SortButton({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  return (
    <Popover
      align="end"
      width={200}
      trigger={({ ref, open, toggle }) => (
        <Button ref={ref} variant="ghost" size="md" onClick={toggle} aria-expanded={open} leftIcon={<SortGlyph />}>
          {value === "newest" ? "Newest first" : "Oldest first"}
        </Button>
      )}
    >
      {({ close }) => (
        <div role="menu" className="py-1.5">
          {(
            [
              { v: "newest", l: "Newest first" },
              { v: "oldest", l: "Oldest first" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              role="menuitemradio"
              aria-checked={o.v === value}
              onClick={() => { onChange(o.v); close(); }}
              className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-[13px] hover:bg-[var(--portal-card-hover)]"
              style={{ color: "var(--portal-ink)" }}
            >
              <span className="flex-1">{o.l}</span>
              {o.v === value && <Icon name="check" size={14} style={{ color: "var(--portal-amber-ink)" }} />}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}

// ── Inline glyphs (no kit icon for list / filter / sort) ─────────────────────

function ListGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <line x1="8" y1="6" x2="20" y2="6" />
      <line x1="8" y1="12" x2="20" y2="12" />
      <line x1="8" y1="18" x2="20" y2="18" />
      <line x1="4" y1="6" x2="4" y2="6" />
      <line x1="4" y1="12" x2="4" y2="12" />
      <line x1="4" y1="18" x2="4" y2="18" />
    </svg>
  );
}

function FilterGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5h16l-6 8v5l-4 2v-7z" />
    </svg>
  );
}

function SortGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v16M7 20l-3-3M7 4l3 3" />
      <line x1="13" y1="7" x2="20" y2="7" />
      <line x1="13" y1="12" x2="18" y2="12" />
      <line x1="13" y1="17" x2="16" y2="17" />
    </svg>
  );
}
