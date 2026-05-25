"use client";

import { useState } from "react";

const FEE = 1500;
const MIN = 1;
const MAX = 25;

const BANDS = [
  { label: "Band 1", range: "1–5", rate: 900, lo: 1, hi: 5, fill: "oklch(0.62 0.11 158)" },
  { label: "Band 2", range: "6–10", rate: 1000, lo: 6, hi: 10, fill: "oklch(0.54 0.13 158)" },
  { label: "Band 3", range: "11–15", rate: 1100, lo: 11, hi: 15, fill: "oklch(0.47 0.13 158)" },
  { label: "Band 4", range: "16+", rate: 1200, lo: 16, hi: Infinity, fill: "oklch(0.40 0.13 158)" },
];

const money = (n: number) => "$" + n.toLocaleString("en-US");

function countInBand(meetings: number, lo: number, hi: number) {
  if (meetings < lo) return 0;
  return Math.min(meetings, hi) - lo + 1;
}

export function PricingSlider() {
  const [meetings, setMeetings] = useState(10);

  const rows = BANDS.map((b) => {
    const count = countInBand(meetings, b.lo, b.hi);
    return { ...b, count, amount: count * b.rate };
  });
  const charity = rows.reduce((sum, r) => sum + r.amount, 0);
  const pay = meetings * FEE;
  const sharePct = Math.round((charity / pay) * 100);
  const currentBand =
    meetings <= 5 ? 1 : meetings <= 10 ? 2 : meetings <= 15 ? 3 : 4;
  const pct = ((meetings - MIN) / (MAX - MIN)) * 100;

  return (
    <div
      className="rounded-3xl border p-6 md:p-10 grid lg:grid-cols-2 gap-10 lg:gap-14"
      style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
    >
      {/* ── Left: the headline figure + the control ─────────────────── */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          Charity receives
        </div>
        <div
          className="mt-2 display-serif leading-none tabular-nums"
          style={{ color: "var(--primary)", fontSize: "clamp(3rem, 7vw, 4.75rem)" }}
        >
          {money(charity)}
        </div>
        <div
          className="mt-3 font-mono text-[11px] uppercase tracking-[0.16em]"
          style={{ color: "var(--primary)" }}
        >
          {sharePct}% of your fees reach charity
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-foreground/70 max-w-sm">
          Across {meetings} {meetings === 1 ? "meeting" : "meetings"} in the year,
          to the charities the executives choose. Paid to the chosen charity
          within 14 days of each meeting.
        </p>

        <div className="mt-10 flex items-baseline justify-between">
          <div className="font-mono text-sm tracking-[0.02em]">
            <span className="text-foreground font-bold text-base">{meetings}</span>{" "}
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              meetings / year
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Band {currentBand}
          </div>
        </div>

        <input
          type="range"
          min={MIN}
          max={MAX}
          value={meetings}
          onChange={(e) => setMeetings(Number(e.target.value))}
          aria-label="Meetings per year"
          className="price-slider mt-3"
          style={{
            background: `linear-gradient(to right, var(--primary) ${pct}%, var(--stone-soft) ${pct}%)`,
          }}
        />

        <div className="mt-3 flex justify-between font-mono text-[11px] tabular-nums text-muted-foreground">
          {[1, 6, 11, 16, 25].map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
      </div>

      {/* ── Right: where the figure comes from, band by band ────────── */}
      <div
        className="rounded-2xl border p-6 md:p-7"
        style={{ background: "var(--paper-white)", borderColor: "var(--hair)" }}
      >
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-bold text-[15px] tracking-[-0.01em]">
            Where the {money(charity)} comes from
          </h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground whitespace-nowrap">
            Total · {money(charity)}
          </span>
        </div>

        {/* segmented bar */}
        <div className="mt-4 flex h-3 gap-0.5 rounded-full overflow-hidden">
          {rows.map((r) =>
            r.amount > 0 ? (
              <div
                key={r.label}
                style={{
                  flexGrow: r.amount,
                  background: r.fill,
                }}
              />
            ) : null,
          )}
        </div>

        <ul className="mt-5 divide-y" style={{ borderColor: "var(--border)" }}>
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex items-center justify-between gap-4 py-3"
              style={{ opacity: r.count === 0 ? 0.4 : 1 }}
            >
              <div className="flex items-start gap-3 min-w-0">
                <span
                  className="mt-1.5 size-2 rounded-full shrink-0"
                  style={{ background: r.fill }}
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold leading-snug">
                    {r.label} · {r.range} × {money(r.rate)}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {r.count} {r.count === 1 ? "meeting" : "meetings"} counted
                  </div>
                </div>
              </div>
              <span
                className="display-serif text-lg tabular-nums shrink-0"
                style={{ color: r.count === 0 ? "var(--cream-9)" : "var(--primary)" }}
              >
                {money(r.amount)}
              </span>
            </li>
          ))}
        </ul>

        <div
          className="mt-4 pt-4 border-t flex items-end justify-between"
          style={{ borderColor: "var(--border)" }}
        >
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              You pay
            </div>
            <div className="font-black text-xl tabular-nums tracking-[-0.02em]">
              {money(pay)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Charity receives
            </div>
            <div
              className="font-black text-xl tabular-nums tracking-[-0.02em]"
              style={{ color: "var(--primary)" }}
            >
              {money(charity)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
