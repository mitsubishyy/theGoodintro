"use client";

import { useMemo, useState } from "react";
import { Icon } from "@thegoodintro/ui";
import type { MeetingListRow, MeetingStatusDisplay } from "../../data";

/**
 * Calendar month view (exec-meetings-list lock 2026-06-10). Editorial header on
 * a functional grid. The Month|Week toggle is DROPPED in v1 (ratified
 * 2026-06-12) — Month only. Today gets the emerald circle; weekends carry a
 * cream tint; meeting chips (company name) open the same drawer as the list.
 *
 * Date-number arithmetic runs on UTC anchors so the rendered day never drifts;
 * meetings bucket onto cells by their date in the exec timezone.
 */

const SERIF = "var(--font-display), Georgia, serif";
const DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function chipTone(s: MeetingStatusDisplay): { bg: string; ink: string } {
  if (s === "held") return { bg: "oklch(0.93 0.04 155)", ink: "oklch(0.42 0.10 155)" };
  if (s === "cancelled") return { bg: "var(--portal-card-hover)", ink: "color-mix(in oklch, var(--portal-ink) 45%, transparent)" };
  return { bg: "oklch(0.94 0.04 155)", ink: "var(--portal-emerald)" };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
function dateKey(iso: string, tz: string): string {
  // "YYYY-MM-DD" in the exec timezone (en-CA yields ISO order).
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

export function MeetingsCalendar({ meetings, tz, nowIso, onOpen }: { meetings: MeetingListRow[]; tz: string; nowIso: string; onOpen: (id: string) => void }) {
  const todayKey = dateKey(nowIso, tz);
  const initial = todayKey.split("-");
  const [year, setYear] = useState(Number(initial[0]));
  const [month, setMonth] = useState(Number(initial[1]) - 1); // 0-indexed

  const byDate = useMemo(() => {
    const m = new Map<string, MeetingListRow[]>();
    for (const mtg of meetings) {
      if (!mtg.scheduledIso) continue;
      const k = dateKey(mtg.scheduledIso, tz);
      const list = m.get(k) ?? [];
      list.push(mtg);
      m.set(k, list);
    }
    return m;
  }, [meetings, tz]);

  const monthLabel = new Intl.DateTimeFormat("en-AU", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)));

  // Monday-first 6x7 grid.
  const firstDow = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const cells = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(Date.UTC(year, month, 1 - firstDow + i));
    const y = d.getUTCFullYear();
    const mo = d.getUTCMonth();
    const day = d.getUTCDate();
    const key = `${y}-${pad(mo + 1)}-${pad(day)}`;
    const dow = d.getUTCDay();
    return { key, day, inMonth: mo === month, weekend: dow === 0 || dow === 6, isToday: key === todayKey, meetings: byDate.get(key) ?? [] };
  });

  const step = (delta: number) => {
    const m = month + delta;
    setYear(year + Math.floor(m / 12));
    setMonth(((m % 12) + 12) % 12);
  };

  return (
    <div className="rounded-xl border p-6" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
      {/* Month header */}
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Previous month" onClick={() => step(-1)} className="opacity-70 hover:opacity-100" style={{ color: "var(--portal-ink)" }}>
          <Icon name="chevron-left" size={16} />
        </button>
        <h2 className="text-[28px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          {monthLabel}
        </h2>
        <button type="button" aria-label="Next month" onClick={() => step(1)} className="opacity-70 hover:opacity-100" style={{ color: "var(--portal-ink)" }}>
          <Icon name="chevron-right" size={16} />
        </button>
      </div>

      <div className="mt-5 border-t" style={{ borderColor: "var(--portal-line)" }} />

      {/* Day-of-week header */}
      <div className="grid grid-cols-7">
        {DOW.map((d) => (
          <div key={d} className="px-2 py-2 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            {d}
          </div>
        ))}
      </div>

      {/* Date grid */}
      <div className="grid grid-cols-7" style={{ borderTop: "1px solid var(--portal-line)", borderLeft: "1px solid var(--portal-line)" }}>
        {cells.map((c) => (
          <div
            key={c.key}
            className="min-h-[120px] p-2"
            style={{
              borderRight: "1px solid var(--portal-line)",
              borderBottom: "1px solid var(--portal-line)",
              background: c.weekend ? "var(--portal-card-hover)" : "transparent",
              opacity: c.inMonth ? 1 : 0.4,
            }}
          >
            {c.isToday ? (
              <span className="grid size-8 place-items-center rounded-full text-[16px] font-semibold text-white" style={{ fontFamily: SERIF, background: "var(--portal-emerald)" }}>
                {c.day}
              </span>
            ) : (
              <span className="text-[18px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
                {c.day}
              </span>
            )}
            <div className="mt-1.5 flex flex-col gap-1.5">
              {c.meetings.map((m) => {
                const tone = chipTone(m.statusDisplay);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onOpen(m.id)}
                    className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-left text-[11.5px] font-medium"
                    style={{ background: tone.bg, color: tone.ink }}
                  >
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: tone.ink }} />
                    <span className="truncate">{m.company || m.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-5 flex items-center justify-center gap-5 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
        <LegendDot color="var(--portal-emerald)" label="Confirmed" />
        <LegendDot color="oklch(0.78 0.06 155)" label="Held" />
        <LegendDot color="color-mix(in oklch, var(--portal-ink) 30%, transparent)" label="Cancelled" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="size-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
