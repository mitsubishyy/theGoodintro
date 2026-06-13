"use client";

import { useMemo, useState } from "react";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { ExecMeetingsData, MeetingListRow, MeetingStatusDisplay } from "../../data";
import { MeetingsCalendar } from "./meetings-calendar";
import { MeetingDrawer } from "./meeting-drawer";

/**
 * Exec Meetings List (exec-meetings-list lock 2026-06-10). "Editorial chrome,
 * SaaS structures inside": editorial typography + hairlines on the chrome, but
 * the list, calendar, toggles, and collapsibles function as proper SaaS.
 *
 * Read surface. View / range / sort / collapsibles / drawer are client state
 * (seeded from the URL for deep links); the loader returns every meeting so the
 * calendar and filters work without a round-trip. Calendar OAuth and "Request
 * reschedule" are deferred actions surfaced as honest notices.
 */

const SERIF = "var(--font-display), Georgia, serif";
const CONNECT_NOTICE = "Calendar connection goes live with the integrations work.";
const RESCHEDULE_NOTICE = "Reschedule requests go live with executive sign-in.";

type View = "list" | "calendar";
type Range = "all" | "upcoming" | "past";
type Sort = "recent" | "oldest";

export function MeetingsView({ data, nowIso, tz, initialView, initialDrawerId }: { data: ExecMeetingsData; nowIso: string; tz: string; initialView: View; initialDrawerId: string | null }) {
  const [view, setView] = useState<View>(initialView);
  const [range, setRange] = useState<Range>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [pastOpen, setPastOpen] = useState(false);
  const [cancelledOpen, setCancelledOpen] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(initialDrawerId);
  const [notice, setNotice] = useState<string | null>(null);

  const allRows = useMemo(() => [...data.upcoming, ...data.past, ...data.cancelled], [data]);
  const drawerMeeting = useMemo(() => allRows.find((r) => r.id === drawerId)?.drawer ?? null, [allRows, drawerId]);

  const sortRows = (rows: MeetingListRow[]): MeetingListRow[] => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a.scheduledIso ?? "";
      const bv = b.scheduledIso ?? "";
      return sort === "recent" ? bv.localeCompare(av) : av.localeCompare(bv);
    });
    return copy;
  };

  const showUpcoming = range === "all" || range === "upcoming";
  const showPast = range === "all" || range === "past";
  const showCancelled = (range === "all" || range === "past") && data.cancelledTotal > 0;

  return (
    <div>
      {/* ── Page header — three-stat mini-strip (naked text, hairline dividers) ── */}
      <header>
        <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          Your meetings
        </p>
        <h1 className="mt-1 text-[32px] font-semibold tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          Meetings
        </h1>
        <div className="mt-5 flex items-center">
          <Stat value={data.stats.heldFy} label="held this financial year" emerald />
          <StatDivider />
          <Stat value={data.stats.comingUp} label="coming up" />
          <StatDivider />
          <Stat value={data.stats.lifetime} label="lifetime" />
        </div>
      </header>

      {/* ── Connect-your-calendar banner ── */}
      <div className="mt-8">
        {data.calendar.connected ? (
          <div className="flex items-center gap-3 rounded-xl px-6 py-4 text-[13px]" style={{ background: "var(--portal-card-hover)", border: "1px solid var(--portal-line)" }}>
            <Icon name="calendar" size={18} style={{ color: "var(--portal-emerald)" }} />
            <span style={{ color: "var(--portal-ink)" }}>
              {data.calendar.provider === "outlook" ? "Outlook" : "Google Calendar"} connected
              {data.calendar.lastSyncedLabel ? ` · last synced ${data.calendar.lastSyncedLabel}` : ""}. Free and busy only, never event details.
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-4 rounded-xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between" style={{ background: "var(--portal-card-reading)", border: "1px solid var(--portal-line)" }}>
            <div className="flex items-start gap-4">
              <Icon name="calendar" size={20} className="mt-0.5 shrink-0" style={{ color: "var(--portal-ink)" }} />
              <div>
                <div className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                  Connect your calendar
                </div>
                <p className="mt-1 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                  See TheGoodIntro meetings alongside your other meetings. We push and pull updates automatically.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-3">
              <button type="button" onClick={() => setNotice(CONNECT_NOTICE)} className="rounded-lg px-4.5 py-2.5 text-[13px] font-semibold text-white" style={{ background: "var(--portal-emerald)" }}>
                Connect Google Calendar
              </button>
              <button type="button" onClick={() => setNotice(CONNECT_NOTICE)} className="rounded-lg px-4.5 py-2.5 text-[13px] font-semibold" style={{ background: "transparent", color: "var(--portal-ink)", border: "1px solid var(--portal-line)" }}>
                Connect Outlook
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Segmented
          value={view}
          onChange={(v) => setView(v as View)}
          options={[
            { label: "Calendar", value: "calendar" },
            { label: "List", value: "list" },
          ]}
        />
        {view === "list" && (
          <div className="flex items-center gap-3">
            <Segmented
              value={range}
              onChange={(v) => setRange(v as Range)}
              options={[
                { label: "All", value: "all" },
                { label: "Upcoming", value: "upcoming" },
                { label: "Past", value: "past" },
              ]}
            />
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        )}
      </div>

      {/* ── Body ── */}
      {view === "calendar" ? (
        <div className="mt-6">
          <MeetingsCalendar meetings={allRows} tz={tz} nowIso={nowIso} onOpen={setDrawerId} />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {showUpcoming && (
            <SectionCard label={`Upcoming · ${data.upcoming.length}`} alwaysOpen>
              {data.upcoming.length === 0 ? (
                <EmptyRow>Nothing coming up.</EmptyRow>
              ) : (
                sortRows(data.upcoming).map((r, i) => <Row key={r.id} row={r} first={i === 0} onOpen={() => setDrawerId(r.id)} />)
              )}
            </SectionCard>
          )}
          {showPast && (
            <SectionCard label={`Past · ${data.pastTotal}`} open={pastOpen} onToggle={() => setPastOpen((v) => !v)}>
              {data.past.length === 0 ? <EmptyRow>No past meetings yet.</EmptyRow> : sortRows(data.past).map((r, i) => <Row key={r.id} row={r} first={i === 0} onOpen={() => setDrawerId(r.id)} />)}
            </SectionCard>
          )}
          {showCancelled && (
            <SectionCard label={`Cancelled · ${data.cancelledTotal}`} open={cancelledOpen} onToggle={() => setCancelledOpen((v) => !v)}>
              {sortRows(data.cancelled).map((r, i) => (
                <Row key={r.id} row={r} first={i === 0} onOpen={() => setDrawerId(r.id)} />
              ))}
            </SectionCard>
          )}
        </div>
      )}

      <MeetingDrawer key={drawerId ?? "closed"} meeting={drawerMeeting} onClose={() => setDrawerId(null)} onReschedule={() => setNotice(RESCHEDULE_NOTICE)} />
      {notice && <Notice text={notice} onClose={() => setNotice(null)} />}
    </div>
  );
}

// ── Header stats ─────────────────────────────────────────────────────────────

function Stat({ value, label, emerald }: { value: number; label: string; emerald?: boolean }) {
  return (
    <div>
      <div className="text-[28px] font-medium leading-none tracking-tight" style={{ fontFamily: SERIF, color: emerald ? "var(--portal-emerald)" : "var(--portal-ink)" }}>
        {value}
      </div>
      <div className="mt-1.5 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </div>
    </div>
  );
}

function StatDivider() {
  return <div className="mx-8 h-4 w-px self-start mt-1.5" style={{ background: "var(--portal-line)" }} />;
}

// ── Controls ─────────────────────────────────────────────────────────────────

function Segmented({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { label: string; value: string }[] }) {
  return (
    <div className="inline-flex h-9 overflow-hidden rounded-lg" style={{ border: "1px solid var(--portal-line)" }}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="px-3.5 text-[13px] font-semibold"
            style={{
              background: active ? "var(--portal-emerald)" : "transparent",
              color: active ? "#fff" : "var(--portal-ink)",
              borderLeft: i === 0 ? undefined : "1px solid var(--portal-line)",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function SortDropdown({ value, onChange }: { value: Sort; onChange: (v: Sort) => void }) {
  const [open, setOpen] = useState(false);
  const label = value === "recent" ? "Most recent first" : "Oldest first";
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        className="inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px]"
        style={{ border: "1px solid var(--portal-line)", color: "var(--portal-ink)" }}
      >
        {label}
        <Icon name="chevron-down" size={12} style={{ color: "var(--muted-foreground)" }} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1.5 w-44 overflow-hidden rounded-lg py-1" style={{ background: "var(--portal-card-reading)", border: "1px solid var(--portal-line)" }}>
          {(
            [
              { v: "recent", l: "Most recent first" },
              { v: "oldest", l: "Oldest first" },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onMouseDown={() => {
                onChange(o.v);
                setOpen(false);
              }}
              className="block w-full px-3.5 py-2 text-left text-[13px] hover:bg-[var(--portal-card-hover)]"
              style={{ color: "var(--portal-ink)", fontWeight: value === o.v ? 600 : 400 }}
            >
              {o.l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section card + rows ──────────────────────────────────────────────────────

function SectionCard({ label, children, alwaysOpen, open, onToggle }: { label: string; children: React.ReactNode; alwaysOpen?: boolean; open?: boolean; onToggle?: () => void }) {
  const expanded = alwaysOpen || open;
  return (
    <section className="overflow-hidden rounded-xl" style={{ background: "var(--portal-card-reading)", border: "1px solid var(--portal-line)" }}>
      <button
        type="button"
        onClick={alwaysOpen ? undefined : onToggle}
        className="flex h-14 w-full items-center justify-between px-6"
        style={{ background: "var(--portal-card-hover)", borderBottom: expanded ? "1px solid var(--portal-line)" : undefined, cursor: alwaysOpen ? "default" : "pointer" }}
      >
        <span className="text-[14px] italic" style={{ color: "var(--portal-ink)" }}>
          {label}
        </span>
        {!alwaysOpen && (
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} style={{ color: "var(--muted-foreground)" }} />
        )}
      </button>
      {expanded && <div>{children}</div>}
    </section>
  );
}

function statusTone(s: MeetingStatusDisplay): { dot: string; word: string } {
  if (s === "held") return { dot: "oklch(0.78 0.06 155)", word: "Held" };
  if (s === "cancelled") return { dot: "color-mix(in oklch, var(--portal-ink) 30%, transparent)", word: "Cancelled" };
  return { dot: "var(--portal-emerald)", word: "Confirmed" };
}

function Row({ row, first, onOpen }: { row: MeetingListRow; first: boolean; onOpen: () => void }) {
  const tone = statusTone(row.statusDisplay);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="flex min-h-[88px] cursor-pointer items-center gap-4 px-6 py-5 hover:bg-[var(--portal-card-hover)]"
      style={{ borderTop: first ? undefined : "1px solid var(--portal-line)" }}
    >
      <Avatar name={row.name} src={row.photoUrl ?? undefined} size={40} />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold" style={{ color: "var(--portal-ink)" }}>
          {row.name}
        </div>
        <div className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          {[row.role, row.company].filter(Boolean).join(" · ")}
        </div>
        <div className="mt-0.5 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          {row.metaLine}
        </div>
      </div>
      <div className="hidden w-[120px] shrink-0 items-center gap-2 sm:flex">
        <span className="size-2 shrink-0 rounded-full" style={{ background: tone.dot }} />
        <span className="text-[13px] italic" style={{ color: "var(--portal-ink)" }}>
          {tone.word}
        </span>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[17px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          {row.dateLabel}
        </div>
        {row.statusDisplay !== "cancelled" && (
          <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
            {[row.timeLabel, row.durationLabel, row.provider].filter(Boolean).join(" · ")}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-6 py-8 text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
      {children}
    </p>
  );
}

// ── Deferred-action notice (not locked chrome) ───────────────────────────────

function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div className="flex items-center gap-3 rounded-full border px-5 py-3 text-[13px] shadow-sm" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}>
        <span className="italic">{text}</span>
        <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
