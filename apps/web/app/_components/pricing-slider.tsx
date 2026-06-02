"use client";

import { useState } from "react";
import { MEETING_FEE_AUD, CHARITY_BANDS } from "@thegoodintro/pricing";

const FEE = MEETING_FEE_AUD;
const MIN = 1;
// The worked example caps at 20 so every band is a clean run of five
// meetings (1–5, 6–10, 11–15, 16–20). Band 4 is actually 16+ in the pricing
// model; beyond 20 the rate simply stays at the band-4 figure.
const MAX = 20;

// The numeric band model (rates + ranges) comes from the shared
// @thegoodintro/pricing single source of truth; only the presentation (labels,
// range text, bar fills) lives here, so the slider can never drift from the
// platform ledger.
const BAND_FILLS = [
  "oklch(0.62 0.11 158)",
  "oklch(0.54 0.13 158)",
  "oklch(0.47 0.13 158)",
  "oklch(0.40 0.13 158)",
];
// Partnership level shown beside the slider.
// NOTE: these four level names ("Supporter" … "Major partner") are a first
// pass — rename to match brand language once locked.
const TIER_NAMES = ["Supporter", "Partner", "Lead partner", "Major partner"];

const BANDS = CHARITY_BANDS.map((b, i) => ({
  label: `Band ${b.band}`,
  // Cap the open-ended top band at MAX for the worked example range text.
  range: b.hi === null ? `${b.lo}–${MAX}` : `${b.lo}–${b.hi}`,
  rate: b.rateAud,
  lo: b.lo,
  hi: b.hi === null ? Infinity : b.hi,
  fill: BAND_FILLS[i],
}));

const money = (n: number) => "$" + n.toLocaleString("en-US");

function countInBand(meetings: number, lo: number, hi: number) {
  if (meetings < lo) return 0;
  return Math.min(meetings, hi) - lo + 1;
}

export function PricingSlider() {
  const [meetings, setMeetings] = useState(1);

  const rows = BANDS.map((b) => {
    const count = countInBand(meetings, b.lo, b.hi);
    return { ...b, count, amount: count * b.rate };
  });
  const charity = rows.reduce((sum, r) => sum + r.amount, 0);
  const pay = meetings * FEE;
  const sharePct = Math.round((charity / pay) * 100);
  const currentBand =
    meetings <= 5 ? 1 : meetings <= 10 ? 2 : meetings <= 15 ? 3 : 4;
  const tier = TIER_NAMES[currentBand - 1];
  const pct = ((meetings - MIN) / (MAX - MIN)) * 100;

  return (
    <div
      className="rounded-3xl border p-6 md:p-10 grid lg:grid-cols-2 gap-10 lg:gap-14"
      style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
    >
      {/* ── Left: the headline figure + the control ─────────────────── */}
      <div>
        <h3 className="text-base md:text-lg font-semibold tracking-tight text-foreground">
          Charity receives
        </h3>
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
          {sharePct}% of your fees reach charity at this volume
        </div>
        <p className="mt-4 text-[14px] leading-relaxed text-foreground/70 max-w-sm">
          Donated across {meetings} {meetings === 1 ? "meeting" : "meetings"} to
          the charities your executives choose. Each gift is paid after the
          meeting and confirmed in writing.
        </p>

        <div className="mt-10 flex items-baseline justify-between">
          <div className="font-mono text-sm tracking-[0.02em]">
            <span className="text-foreground font-bold text-base">{meetings}</span>{" "}
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              meetings / year
            </span>
          </div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--primary)" }}
          >
            {tier}
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

        {/* Ticks sit at each value's true track position. With MAX = 20 the
            five bands divide evenly, so 1/5/10/15/20 mark the band edges. */}
        <div className="relative mt-3 h-4 font-mono text-[11px] tabular-nums text-muted-foreground">
          {[1, 5, 10, 15, 20].map((n) => {
            const left = ((n - MIN) / (MAX - MIN)) * 100;
            return (
              <span
                key={n}
                className="absolute top-0"
                style={{
                  left: `${left}%`,
                  transform:
                    n === MIN
                      ? "translateX(0)"
                      : n === MAX
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {n}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Right: how the giving builds across the year, band by band ── */}
      <div
        className="rounded-2xl border p-6 md:p-7"
        style={{ background: "var(--paper-white)", borderColor: "var(--hair)" }}
      >
        <h3 className="font-bold text-[15px] tracking-[-0.01em]">
          How the giving builds across the year
        </h3>

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
                  <div className="text-[14px] font-semibold leading-snug">
                    Meetings {r.range}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {money(r.rate)} each
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
      </div>
    </div>
  );
}
