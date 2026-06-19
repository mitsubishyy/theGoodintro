"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@thegoodintro/ui";

/**
 * Booked Meetings calendar (Admin Dashboard). Issy 2026-06-13: behaves like a
 * real calendar — the current month is named, and ‹ › arrows move backward
 * and forward a month at a time. The server passes every booked day grouped
 * by month ("YYYY-MM" → [day numbers]), so navigation is instant and needs no
 * round trip. The grid always renders; an empty month simply has no dots.
 *
 * Connected to the full /admin/meetings calendar (Issy 2026-06-19): a booked
 * day deep-links into the big calendar at the same month, so the dashboard
 * widget and the Meetings screen read as one calendar.
 */

export function BookedMeetingsCalendar({
  bookedByMonth,
  todayKey,
  todayDate,
}: {
  /** "YYYY-MM" (UTC) → unique day-of-month numbers with confirmed/held meetings. */
  bookedByMonth: Record<string, number[]>;
  /** The current month key, e.g. "2026-06" — the initial view + today-pill scope. */
  todayKey: string;
  /** Today's day-of-month (UTC), highlighted only when viewing todayKey. */
  todayDate: number;
}) {
  const [viewKey, setViewKey] = useState(todayKey);
  const [yearStr, monthStr] = viewKey.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1; // 0-based

  const shift = (delta: number) => {
    const d = new Date(Date.UTC(year, month + delta, 1));
    setViewKey(
      `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
    );
  };

  const monthLabel = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month, 1)));

  const booked = new Set(bookedByMonth[viewKey] ?? []);
  // Mon-Sun grid per the lock; getUTCDay returns 0=Sun..6=Sat so we shift.
  const firstWeekday = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="size-8 grid place-items-center rounded-md hover:bg-[var(--portal-card-hover)]"
          style={{ color: "var(--portal-ink)" }}
        >
          <Icon name="chevron-left" size={16} />
        </button>
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
            {monthLabel}
          </span>
          {viewKey !== todayKey && (
            <button
              type="button"
              onClick={() => setViewKey(todayKey)}
              className="text-[11px] font-medium hover:underline underline-offset-4"
              style={{ color: "var(--portal-amber-ink)" }}
            >
              Today
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="size-8 grid place-items-center rounded-md hover:bg-[var(--portal-card-hover)]"
          style={{ color: "var(--portal-ink)" }}
        >
          <Icon name="chevron-right" size={16} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="text-[10px] uppercase tracking-[0.12em] pb-1"
            style={{ color: "var(--muted-foreground)" }}
          >
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const isBooked = booked.has(day);
          const isToday = viewKey === todayKey && day === todayDate;
          const cellStyle = isToday
            ? { background: "var(--portal-ink)", color: "#fff", fontWeight: 600 }
            : { color: "var(--foreground)" };
          const cellClass = "h-12 rounded-lg flex flex-col items-center justify-center text-[12.5px]";
          const dot = isBooked && (
            <span className="mt-0.5 size-1.5 rounded-full" style={{ background: "var(--portal-amber)" }} />
          );
          // Booked days deep-link into the full meetings calendar at this month.
          return isBooked ? (
            <Link
              key={i}
              href={`/admin/meetings?view=calendar&m=${viewKey}`}
              aria-label={`View meetings on ${day} ${monthLabel}`}
              className={`${cellClass} ${isToday ? "" : "hover:bg-[var(--portal-card-hover)]"}`}
              style={cellStyle}
            >
              {day}
              {dot}
            </Link>
          ) : (
            <div key={i} className={cellClass} style={cellStyle}>
              {day}
            </div>
          );
        })}
      </div>
      <div
        className="mt-3 flex items-center gap-2 text-[11px]"
        style={{ color: "var(--muted-foreground)" }}
      >
        <span
          className="size-1.5 rounded-full"
          style={{ background: "var(--portal-amber)" }}
        />{" "}
        days with booked meetings
      </div>
    </div>
  );
}
