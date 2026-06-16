"use client";

import { useState } from "react";
import Link from "next/link";
import type { ExecMyCharityData } from "../../data";
import { CharityDetailModal } from "../../_components/charity-detail-modal";
import { CharityPickerModal } from "../../_components/charity-picker-modal";

/**
 * Exec My charity (exec-my-charity lock 2026-06-11) — the view-only home of the
 * standing nomination. FULL editorial register (no tables/filters/toggles). The
 * page hosts the detail + picker modals but never changes the charity itself;
 * the picker does. Hero is the page-scale sibling of the dashboard Direction
 * Card. nomination_history drives the "since" + history feed.
 */

const SERIF = "var(--font-display), Georgia, serif";

export function MyCharityView({ data }: { data: ExecMyCharityData }) {
  const [detailCharityId, setDetailCharityId] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { standing, stats, history } = data;

  const credentials = standing
    ? [standing.abn ? `ABN ${standing.abn}` : null, standing.dgrItem, standing.dgrEndorsed ? "Live" : null].filter(Boolean).join(" · ")
    : "";

  return (
    <div>
      {/* Header + mini-strip */}
      <header>
        <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          Your standing nomination
        </p>
        <h1 className="mt-1 text-[32px] font-semibold tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          My charity
        </h1>
        <div className="mt-5 flex items-center">
          <Stat value={stats.toStanding} label={standing ? `sent to ${standing.name}` : "sent to charity"} emerald />
          <StatDivider />
          <Stat value={String(stats.meetingsHere)} label="meetings directed here" />
          <StatDivider />
          <Stat value={String(stats.charitiesLifetime)} label="charities supported lifetime" />
        </div>
      </header>

      {/* Section A — current nomination hero */}
      <section className="mt-10 rounded-2xl border px-6 py-14" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
        {standing ? (
          <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
            <CharityLogo name={standing.name} src={standing.logoUrl} />
            <p className="mt-8 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              Standing nomination
            </p>
            <h2 className="mt-3 text-[40px] font-semibold leading-[1.05] tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
              {standing.name}
            </h2>
            {standing.cause && (
              <p className="mt-2 text-[14px]" style={{ color: "var(--muted-foreground)" }}>
                {standing.cause}
              </p>
            )}
            {standing.sinceLabel && (
              <p className="mt-4 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                Your standing nomination since {standing.sinceLabel}.
              </p>
            )}
            <p className="mt-6 max-w-[520px] text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              Each meeting you accept sends a real gift here. You can direct any individual meeting to a different DGR-endorsed charity before it begins.
            </p>
            {credentials && (
              <>
                <div className="mt-8 w-full max-w-[420px] border-t" style={{ borderColor: "var(--portal-line)" }} />
                <p className="mt-5 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
                  {credentials}
                </p>
              </>
            )}
            <div className="mt-7 flex w-full max-w-[420px] flex-col gap-3 sm:flex-row">
              <GhostButton onClick={() => setDetailCharityId(standing.charityId)}>Learn about {standing.name} →</GhostButton>
              <GhostButton onClick={() => setPickerOpen(true)}>Change standing charity →</GhostButton>
            </div>
          </div>
        ) : (
          <p className="text-center text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
            No standing charity nominated yet.
          </p>
        )}
      </section>

      {/* Section B — nomination history */}
      <section className="mt-16">
        <h2 className="text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          Nomination history
        </h2>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          Your standing nominations since joining. Per-meeting redirections are not shown here.
        </p>
        <div className="mt-5">
          {history.length === 0 ? (
            <p className="py-6 text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
              No nomination history yet.
            </p>
          ) : (
            history.map((h, i) => (
              <div key={`${h.charityId}-${i}`} className="flex items-center gap-4 py-5 border-t first:border-t-0" style={{ borderColor: "var(--portal-line)" }}>
                <CharityMark name={h.name} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                    {h.name}
                  </div>
                  <div className="text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                    {h.rangeLabel}
                  </div>
                </div>
                {h.isCurrent && (
                  <span className="shrink-0 text-[13px] italic" style={{ color: "var(--portal-emerald)" }}>
                    Current
                  </span>
                )}
              </div>
            ))
          )}
        </div>
        <div className="mt-4 text-right">
          <Link href="/exec/impact" className="text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
            See every gift on Impact →
          </Link>
        </div>
      </section>

      {/* Section C — how your nomination works */}
      <section className="mt-16 pb-12">
        <h2 className="text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          How your nomination works
        </h2>
        <div className="mt-6 flex flex-col gap-5">
          <Step n={1}>Every meeting you accept sends the gift to your standing nomination automatically. Nothing to do.</Step>
          <Step n={2}>You can direct any individual meeting to a different DGR-endorsed charity before the meeting begins. Your standing nomination stays in place for everything else.</Step>
          <Step n={3}>Once a meeting is held, the gift is locked in and sent. It never changes after that.</Step>
        </div>
        <p className="mt-8 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
          All charities are verified live against the ACNC DGR register.
        </p>
      </section>

      <CharityDetailModal key={detailCharityId ?? "closed"} charityId={detailCharityId} eyebrow="Standing nomination" onClose={() => setDetailCharityId(null)} />
      {pickerOpen && <CharityPickerModal onClose={() => setPickerOpen(false)} />}
    </div>
  );
}

function Stat({ value, label, emerald }: { value: string; label: string; emerald?: boolean }) {
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
  return <div className="mx-8 mt-1.5 h-4 w-px self-start" style={{ background: "var(--portal-line)" }} />;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid size-[18px] shrink-0 place-items-center rounded-full border text-[11px] font-semibold" style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}>
        {n}
      </span>
      <p className="text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
        {children}
      </p>
    </div>
  );
}

function GhostButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="h-12 flex-1 rounded-lg border px-5 text-[14px] font-semibold" style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)", background: "var(--portal-card)" }}>
      {children}
    </button>
  );
}

function CharityLogo({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={96} height={96} className="size-24 rounded-full object-cover" style={{ border: "1px solid var(--portal-line)" }} />;
  }
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return (
    <span className="size-24 grid place-items-center rounded-full text-[20px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}

function CharityMark({ name }: { name: string }) {
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return (
    <span className="size-8 shrink-0 grid place-items-center rounded-full text-[11px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}
