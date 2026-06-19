"use client";

import { useMemo, useState } from "react";
import { Badge, Icon } from "@thegoodintro/ui";
import {
  CALENDAR_LEGEND,
  CHIP_STYLE,
  chipKind,
  dayKey,
  needsAttention,
  statusPill,
  timeLabel,
  timeWithZone,
  type MeetingItem,
} from "./_status";

/**
 * Admin Meetings calendar (Admin Meetings list T3). Month / Week / Day, all
 * built this pass (Issy 2026-06-19). Same data + bucketing model as the
 * dashboard Booked-meetings widget so the two calendars never drift. Date
 * arithmetic runs on UTC anchors; meetings bucket onto cells by their Sydney
 * date. Chips and rows open the same right-side drawer the list opens.
 */

type CalView = "month" | "week" | "day";
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_CHIPS = 3; // per month cell before "+N more"

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function keyOf(y: number, m: number, d: number): string {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}
function addDays(y: number, m: number, d: number, delta: number) {
  const dt = new Date(Date.UTC(y, m, d + delta));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth(), d: dt.getUTCDate() };
}

export function MeetingsCalendar({
  meetings,
  nowIso,
  initialView = "month",
  initialKey,
  onOpen,
}: {
  meetings: MeetingItem[];
  nowIso: string;
  initialView?: CalView;
  /** "YYYY-MM-DD" deep-link anchor; defaults to today. */
  initialKey?: string | null;
  onOpen: (id: string) => void;
}) {
  const todayKey = dayKey(nowIso);
  const seed = (initialKey ?? todayKey).split("-").map(Number);
  const [view, setView] = useState<CalView>(initialView);
  const [anchor, setAnchor] = useState({ y: seed[0]!, m: seed[1]! - 1, d: seed[2]! });

  // Bucket every dated meeting onto its Sydney day, sorted by time within a day.
  const byDate = useMemo(() => {
    const map = new Map<string, MeetingItem[]>();
    for (const m of meetings) {
      if (!m.scheduledIso) continue;
      const k = dayKey(m.scheduledIso);
      const list = map.get(k);
      if (list) list.push(m);
      else map.set(k, [m]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => (a.scheduledIso ?? "").localeCompare(b.scheduledIso ?? ""));
    }
    return map;
  }, [meetings]);

  // Summary line (over all passed/filtered meetings, like the locked footer).
  const summary = useMemo(() => {
    let scheduled = 0;
    let held = 0;
    let attn = 0;
    for (const m of meetings) {
      if (m.scheduledIso) scheduled += 1;
      if (m.status === "held") held += 1;
      if (needsAttention(m)) attn += 1;
    }
    return { scheduled, held, attn };
  }, [meetings]);

  const step = (delta: number) => {
    if (view === "month") {
      setAnchor((a) => {
        const total = a.m + delta;
        return { y: a.y + Math.floor(total / 12), m: ((total % 12) + 12) % 12, d: 1 };
      });
    } else {
      setAnchor((a) => addDays(a.y, a.m, a.d, view === "week" ? delta * 7 : delta));
    }
  };
  const goToday = () => {
    const [ty, tm, td] = todayKey.split("-").map(Number);
    setAnchor({ y: ty!, m: tm! - 1, d: td! });
  };
  const goToDay = (k: string) => {
    const [y, m, d] = k.split("-").map(Number);
    setAnchor({ y: y!, m: m! - 1, d: d! });
    setView("day");
  };

  // Period label + count.
  const periodLabel = useMemo(() => {
    if (view === "month") {
      return new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(Date.UTC(anchor.y, anchor.m, 1)),
      );
    }
    if (view === "day") {
      return new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
        new Date(Date.UTC(anchor.y, anchor.m, anchor.d)),
      );
    }
    // week → "26 May – 1 Jun 2026"
    const start = new Date(Date.UTC(anchor.y, anchor.m, anchor.d));
    const startDow = (start.getUTCDay() + 6) % 7;
    const monday = new Date(Date.UTC(anchor.y, anchor.m, anchor.d - startDow));
    const sunday = new Date(Date.UTC(anchor.y, anchor.m, anchor.d - startDow + 6));
    const f = (dt: Date, withYear: boolean) =>
      new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC", ...(withYear ? { year: "numeric" } : {}) }).format(dt);
    return `${f(monday, false)} – ${f(sunday, true)}`;
  }, [view, anchor]);

  const periodCount = useMemo(() => {
    if (view === "month") return meetings.filter((m) => m.scheduledIso && dayKey(m.scheduledIso).startsWith(keyOf(anchor.y, anchor.m, 1).slice(0, 7))).length;
    if (view === "day") return (byDate.get(keyOf(anchor.y, anchor.m, anchor.d)) ?? []).length;
    const start = new Date(Date.UTC(anchor.y, anchor.m, anchor.d));
    const startDow = (start.getUTCDay() + 6) % 7;
    let n = 0;
    for (let i = 0; i < 7; i++) {
      const c = new Date(Date.UTC(anchor.y, anchor.m, anchor.d - startDow + i));
      n += (byDate.get(keyOf(c.getUTCFullYear(), c.getUTCMonth(), c.getUTCDate())) ?? []).length;
    }
    return n;
  }, [view, anchor, meetings, byDate]);

  return (
    <div className="rounded-2xl border overflow-hidden" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
      {/* Header: nav + period + count · Today + view toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5" style={{ borderBottom: "1px solid var(--portal-line)" }}>
        <div className="flex items-center gap-2">
          <NavButton label="Previous" icon="chevron-left" onClick={() => step(-1)} />
          <NavButton label="Next" icon="chevron-right" onClick={() => step(1)} />
          <h2 className="ml-1 text-[18px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
            {periodLabel}
          </h2>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
            {periodCount} meeting{periodCount === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToday}
            className="h-8 rounded-lg border px-3 text-[12.5px] font-medium hover:bg-[var(--portal-card-hover)]"
            style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
          >
            Today
          </button>
          <ViewToggle value={view} onChange={setView} />
        </div>
      </div>

      {view === "month" && <MonthGrid anchor={anchor} todayKey={todayKey} byDate={byDate} onOpen={onOpen} onMore={goToDay} />}
      {view === "week" && <WeekGrid anchor={anchor} todayKey={todayKey} byDate={byDate} onOpen={onOpen} />}
      {view === "day" && <DayAgenda anchor={anchor} byDate={byDate} onOpen={onOpen} />}

      {/* Legend + summary */}
      <div
        className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 px-5 py-3"
        style={{ borderTop: "1px solid var(--portal-line)" }}
      >
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {CALENDAR_LEGEND.map((l) => (
            <span key={l.kind} className="flex items-center gap-1.5 text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
              <span className="size-2 rounded-full" style={{ background: CHIP_STYLE[l.kind].bar }} />
              {l.label}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
          {summary.scheduled} scheduled, {summary.held} held, {summary.attn} attn
        </span>
      </div>
    </div>
  );
}

// ── Month ────────────────────────────────────────────────────────────────────

function MonthGrid({
  anchor,
  todayKey,
  byDate,
  onOpen,
  onMore,
}: {
  anchor: { y: number; m: number; d: number };
  todayKey: string;
  byDate: Map<string, MeetingItem[]>;
  onOpen: (id: string) => void;
  onMore: (key: string) => void;
}) {
  const firstDow = (new Date(Date.UTC(anchor.y, anchor.m, 1)).getUTCDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => {
    const dt = new Date(Date.UTC(anchor.y, anchor.m, 1 - firstDow + i));
    const key = keyOf(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
    return { key, day: dt.getUTCDate(), inMonth: dt.getUTCMonth() === anchor.m, isToday: key === todayKey, list: byDate.get(key) ?? [] };
  });

  return (
    <div>
      <div className="grid grid-cols-7">
        {DOW.map((d) => (
          <div key={d} className="px-2.5 py-2 text-[10.5px] font-mono uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7" style={{ borderTop: "1px solid var(--portal-line)", borderLeft: "1px solid var(--portal-line)" }}>
        {cells.map((c) => {
          const extra = c.list.length - MAX_CHIPS;
          return (
            <div
              key={c.key}
              className="min-h-[132px] p-1.5"
              style={{ borderRight: "1px solid var(--portal-line)", borderBottom: "1px solid var(--portal-line)" }}
            >
              <div className="flex items-center justify-between px-1">
                {c.isToday ? (
                  <span className="grid size-6 place-items-center rounded-full text-[12px] font-semibold text-white" style={{ background: "var(--portal-ink)" }}>
                    {c.day}
                  </span>
                ) : (
                  <span className="text-[12.5px] font-medium" style={{ color: c.inMonth ? "var(--portal-ink)" : "var(--muted-foreground)", opacity: c.inMonth ? 1 : 0.55 }}>
                    {c.day}
                  </span>
                )}
                {c.list.length > 0 && (
                  <span className="font-mono text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                    {c.list.length}
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-col gap-0.5">
                {c.list.slice(0, MAX_CHIPS).map((m) => (
                  <Chip key={m.id} m={m} onOpen={onOpen} />
                ))}
                {extra > 0 && (
                  <button
                    type="button"
                    onClick={() => onMore(c.key)}
                    className="px-1.5 py-0.5 text-left text-[11px] hover:underline underline-offset-2"
                    style={{ color: "var(--muted-foreground)" }}
                  >
                    +{extra} more
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week ─────────────────────────────────────────────────────────────────────

function WeekGrid({
  anchor,
  todayKey,
  byDate,
  onOpen,
}: {
  anchor: { y: number; m: number; d: number };
  todayKey: string;
  byDate: Map<string, MeetingItem[]>;
  onOpen: (id: string) => void;
}) {
  const startDow = (new Date(Date.UTC(anchor.y, anchor.m, anchor.d)).getUTCDay() + 6) % 7;
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(Date.UTC(anchor.y, anchor.m, anchor.d - startDow + i));
    const key = keyOf(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
    return { key, dow: DOW[i]!, day: dt.getUTCDate(), isToday: key === todayKey, list: byDate.get(key) ?? [] };
  });

  return (
    <div className="grid grid-cols-7" style={{ borderLeft: "1px solid var(--portal-line)" }}>
      {days.map((c) => (
        <div key={c.key} className="min-h-[420px]" style={{ borderRight: "1px solid var(--portal-line)" }}>
          <div className="flex items-center gap-2 px-2.5 py-2.5" style={{ borderBottom: "1px solid var(--portal-line)" }}>
            <span className="text-[10.5px] font-mono uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
              {c.dow}
            </span>
            {c.isToday ? (
              <span className="grid size-6 place-items-center rounded-full text-[12px] font-semibold text-white" style={{ background: "var(--portal-ink)" }}>
                {c.day}
              </span>
            ) : (
              <span className="text-[13px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                {c.day}
              </span>
            )}
          </div>
          <div className="flex flex-col gap-1 p-1.5">
            {c.list.length === 0 ? (
              <span className="px-1.5 py-2 text-[11.5px] italic" style={{ color: "var(--muted-foreground)" }}>
                —
              </span>
            ) : (
              c.list.map((m) => <Chip key={m.id} m={m} onOpen={onOpen} />)
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Day ──────────────────────────────────────────────────────────────────────

function DayAgenda({
  anchor,
  byDate,
  onOpen,
}: {
  anchor: { y: number; m: number; d: number };
  byDate: Map<string, MeetingItem[]>;
  onOpen: (id: string) => void;
}) {
  const key = keyOf(anchor.y, anchor.m, anchor.d);
  const list = byDate.get(key) ?? [];

  if (list.length === 0) {
    return (
      <p className="px-6 py-16 text-center text-[13.5px] italic" style={{ color: "var(--muted-foreground)" }}>
        No meetings on this day.
      </p>
    );
  }
  return (
    <div>
      {list.map((m, i) => {
        const kind = chipKind(m);
        const style = CHIP_STYLE[kind];
        const pill = statusPill(m.status);
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onOpen(m.id)}
            className="flex w-full items-center gap-4 px-6 py-4 text-left hover:bg-[var(--portal-amber-soft)]"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
          >
            <div className="w-20 shrink-0">
              <div className="font-mono text-[13px] tabular-nums" style={{ color: "var(--portal-ink)" }}>
                {m.scheduledIso ? timeLabel(m.scheduledIso) : "—"}
              </div>
              <div className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                {m.scheduledIso ? timeWithZone(m.scheduledIso).split(" ").slice(-1)[0] : ""}
              </div>
            </div>
            <span className="h-9 w-[3px] shrink-0 rounded-[1px]" style={{ background: style.bar }} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium" style={{ color: "var(--portal-ink)", textDecoration: style.strike ? "line-through" : undefined, opacity: style.strike ? 0.65 : 1 }}>
                {m.vendorName}
              </div>
              <div className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
                {m.execName ?? m.execLabel}
              </div>
            </div>
            <Badge tone={pill.tone} dot>
              {pill.label}
            </Badge>
          </button>
        );
      })}
    </div>
  );
}

// ── Chip ─────────────────────────────────────────────────────────────────────

function Chip({ m, onOpen }: { m: MeetingItem; onOpen: (id: string) => void }) {
  const kind = chipKind(m);
  const style = CHIP_STYLE[kind];
  return (
    <button
      type="button"
      onClick={() => onOpen(m.id)}
      title={`${m.vendorName}${m.execName ? ` → ${m.execName}` : ""}`}
      className="flex w-full items-stretch gap-1.5 overflow-hidden rounded-[5px] pr-1.5 text-left hover:bg-[var(--portal-amber-soft)]"
      style={{ background: style.bg }}
    >
      {/* straight accent bar (a filled child, not a rounded border) */}
      <span className="w-[3px] shrink-0" style={{ background: style.bar }} />
      <span className="flex min-w-0 flex-1 items-center gap-1.5 py-1">
        {m.scheduledIso && (
          <span className="font-mono text-[10.5px] tabular-nums shrink-0" style={{ color: "var(--muted-foreground)" }}>
            {timeLabel(m.scheduledIso)}
          </span>
        )}
        <span
          className="truncate text-[12px]"
          style={{ color: "var(--portal-ink)", textDecoration: style.strike ? "line-through" : undefined, opacity: style.strike ? 0.6 : 1 }}
        >
          {m.vendorName}
        </span>
      </span>
    </button>
  );
}

// ── Controls ─────────────────────────────────────────────────────────────────

function NavButton({ label, icon, onClick }: { label: string; icon: "chevron-left" | "chevron-right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={`${label} period`}
      onClick={onClick}
      className="size-8 grid place-items-center rounded-md border hover:bg-[var(--portal-card-hover)]"
      style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
    >
      <Icon name={icon} size={16} />
    </button>
  );
}

function ViewToggle({ value, onChange }: { value: CalView; onChange: (v: CalView) => void }) {
  const opts: { v: CalView; label: string }[] = [
    { v: "month", label: "Month" },
    { v: "week", label: "Week" },
    { v: "day", label: "Day" },
  ];
  return (
    <div className="inline-flex h-8 overflow-hidden rounded-lg" style={{ border: "1px solid var(--portal-line)" }}>
      {opts.map((o, i) => {
        const active = o.v === value;
        return (
          <button
            key={o.v}
            type="button"
            onClick={() => onChange(o.v)}
            className="px-3 text-[12.5px] font-medium"
            style={{
              background: active ? "var(--portal-ink)" : "transparent",
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
