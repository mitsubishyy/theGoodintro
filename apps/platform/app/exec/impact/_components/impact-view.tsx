"use client";

import { useMemo, useState } from "react";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { CharityGroup, ExecImpactData, GiftRow } from "../../data";
import { ImpactDrawer } from "./impact-drawer";
import { CharityChangeModal } from "../../_components/charity-change-modal";

/**
 * Exec Impact List (exec-impact-list lock 2026-06-11). Reuses the Meetings
 * pattern set: three-stat mini-strip, collapsible section cards, controls bar,
 * drawer-as-detail. Two views — List (This FY open / Previous years collapsed)
 * and By charity (cards by lifetime DESC, top expanded). View / time-range /
 * sort / collapsibles / drawer are client state, seeded from the URL.
 *
 * Header counts + totals are real lifetime/bucket figures (frozen-at-Held); the
 * time-range toggle filters which gift ROWS render, never the header totals.
 */

const SERIF = "var(--font-display), Georgia, serif";
const RELEASED = "oklch(0.78 0.06 155)";

type View = "list" | "charity";
type Range = "all" | "fy" | "12m";
type Sort = "recent" | "largest" | "charity_az";

export function ImpactView({ data, nowIso, initialView, initialDrawerId }: { data: ExecImpactData; nowIso: string; initialView: View; initialDrawerId: string | null }) {
  const [view, setView] = useState<View>(initialView);
  const [range, setRange] = useState<Range>("fy");
  const [sort, setSort] = useState<Sort>("recent");
  const [prevOpen, setPrevOpen] = useState(false);
  const [openCharities, setOpenCharities] = useState<Set<string>>(() => new Set(data.byCharity[0] ? [data.byCharity[0].charityId] : []));
  const [drawerId, setDrawerId] = useState<string | null>(initialDrawerId);
  const [learnCharity, setLearnCharity] = useState<string | null>(null);

  const allRows = useMemo(() => [...data.thisFy, ...data.previous], [data]);
  const drawerGift = useMemo(() => allRows.find((r) => r.id === drawerId)?.drawer ?? null, [allRows, drawerId]);

  const fyStartIso = useMemo(() => {
    const d = new Date(nowIso);
    const y = d.getUTCFullYear();
    return `${d.getUTCMonth() >= 6 ? y : y - 1}-07-01`;
  }, [nowIso]);
  const twelveAgoIso = useMemo(() => {
    const d = new Date(nowIso);
    d.setUTCFullYear(d.getUTCFullYear() - 1);
    return d.toISOString().slice(0, 10);
  }, [nowIso]);

  const inRange = (satIso: string | null): boolean => {
    if (range === "all") return true;
    if (!satIso) return false;
    return range === "fy" ? satIso >= fyStartIso : satIso >= twelveAgoIso;
  };
  const sortRows = (rows: GiftRow[]): GiftRow[] => {
    const c = rows.filter((r) => inRange(r.satIso));
    if (sort === "recent") c.sort((a, b) => (b.satIso ?? "").localeCompare(a.satIso ?? ""));
    else if (sort === "largest") c.sort((a, b) => b.amountCents - a.amountCents);
    else c.sort((a, b) => a.charityName.localeCompare(b.charityName));
    return c;
  };

  const thisFyRows = sortRows(data.thisFy);
  const prevRows = sortRows(data.previous);

  return (
    <div>
      {/* ── Header ── */}
      <header>
        <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          Your giving
        </p>
        <h1 className="mt-1 text-[32px] font-semibold tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          Impact
        </h1>
        <div className="mt-5 flex items-center">
          <Stat value={data.stats.fyAmount} label="this financial year" emerald />
          <StatDivider />
          <Stat value={String(data.stats.fyMeetings)} label="meetings held" />
          <StatDivider />
          <Stat value={data.stats.lifetimeAmount} label="lifetime" />
        </div>
      </header>

      {/* ── Controls ── */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <Segmented
          value={view}
          onChange={(v) => setView(v as View)}
          options={[
            { label: "List", value: "list" },
            { label: "By charity", value: "charity" },
          ]}
        />
        <div className="flex items-center gap-3">
          <Segmented
            value={range}
            onChange={(v) => setRange(v as Range)}
            options={[
              { label: "All time", value: "all" },
              { label: "This FY", value: "fy" },
              { label: "Last 12 months", value: "12m" },
            ]}
          />
          <SortDropdown value={sort} onChange={setSort} />
        </div>
      </div>

      {/* ── Body ── */}
      {view === "list" ? (
        <div className="mt-6 flex flex-col gap-8">
          <SectionCard label={`This financial year · ${data.thisFy.length} gifts`} rightLabel={data.thisFyTotalLabel} alwaysOpen>
            {thisFyRows.length === 0 ? <EmptyRow>No gifts in this range.</EmptyRow> : thisFyRows.map((r, i) => <GiftRowView key={r.id} row={r} first={i === 0} onOpen={() => setDrawerId(r.id)} />)}
          </SectionCard>
          <SectionCard label={`Previous years · ${data.previous.length} gifts`} rightLabel={data.previousTotalLabel} open={prevOpen} onToggle={() => setPrevOpen((v) => !v)}>
            {prevRows.length === 0 ? <EmptyRow>No gifts in this range. Switch the time range to All time to see earlier years.</EmptyRow> : prevRows.map((r, i) => <GiftRowView key={r.id} row={r} first={i === 0} onOpen={() => setDrawerId(r.id)} />)}
          </SectionCard>
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {data.byCharity.length === 0 ? (
            <EmptyRow>No gifts yet.</EmptyRow>
          ) : (
            data.byCharity.map((g, i) => (
              <CharityCard
                key={g.charityId}
                group={g}
                emerald={i === 0}
                open={openCharities.has(g.charityId)}
                onToggle={() =>
                  setOpenCharities((prev) => {
                    const next = new Set(prev);
                    if (next.has(g.charityId)) next.delete(g.charityId);
                    else next.add(g.charityId);
                    return next;
                  })
                }
                rows={sortRows(g.gifts)}
                onOpenGift={setDrawerId}
              />
            ))
          )}
        </div>
      )}

      <ImpactDrawer key={drawerId ?? "closed"} gift={drawerGift} onClose={() => setDrawerId(null)} onLearn={(c) => setLearnCharity(c)} />
      <CharityChangeModal open={learnCharity !== null} variant="learn" charityName={learnCharity ?? ""} onClose={() => setLearnCharity(null)} />
    </div>
  );
}

// ── Header stats ─────────────────────────────────────────────────────────────

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
            style={{ background: active ? "var(--portal-emerald)" : "transparent", color: active ? "#fff" : "var(--portal-ink)", borderLeft: i === 0 ? undefined : "1px solid var(--portal-line)" }}
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
  const opts: { v: Sort; l: string }[] = [
    { v: "recent", l: "Most recent first" },
    { v: "largest", l: "Largest amount first" },
    { v: "charity_az", l: "Charity A-Z" },
  ];
  const label = opts.find((o) => o.v === value)!.l;
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((v) => !v)} onBlur={() => setTimeout(() => setOpen(false), 120)} className="inline-flex h-9 items-center gap-2 rounded-lg px-3.5 text-[13px]" style={{ border: "1px solid var(--portal-line)", color: "var(--portal-ink)" }}>
        {label}
        <Icon name="chevron-down" size={12} style={{ color: "var(--muted-foreground)" }} />
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-1.5 w-52 overflow-hidden rounded-lg py-1" style={{ background: "var(--portal-card-reading)", border: "1px solid var(--portal-line)" }}>
          {opts.map((o) => (
            <button
              key={o.v}
              type="button"
              onMouseDown={() => {
                onChange(o.v);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3.5 py-2 text-left text-[13px] hover:bg-[var(--portal-card-hover)]"
              style={{ color: "var(--portal-ink)", fontWeight: value === o.v ? 600 : 400 }}
            >
              {o.l}
              {value === o.v && <Icon name="check" size={14} style={{ color: "var(--portal-emerald)" }} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ label, rightLabel, children, alwaysOpen, open, onToggle }: { label: string; rightLabel?: string; children: React.ReactNode; alwaysOpen?: boolean; open?: boolean; onToggle?: () => void }) {
  const expanded = alwaysOpen || open;
  return (
    <section className="overflow-hidden rounded-xl" style={{ background: "var(--portal-card-reading)", border: "1px solid var(--portal-line)" }}>
      <button type="button" onClick={alwaysOpen ? undefined : onToggle} className="flex h-14 w-full items-center justify-between px-6" style={{ background: "var(--portal-card-hover)", borderBottom: expanded ? "1px solid var(--portal-line)" : undefined, cursor: alwaysOpen ? "default" : "pointer" }}>
        <span className="text-[14px] italic" style={{ color: "var(--portal-ink)" }}>
          {label}
        </span>
        <span className="flex items-center gap-4">
          {rightLabel && (
            <span className="text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
              {rightLabel}
            </span>
          )}
          {!alwaysOpen && <Icon name={expanded ? "chevron-up" : "chevron-down"} size={16} style={{ color: "var(--muted-foreground)" }} />}
        </span>
      </button>
      {expanded && <div>{children}</div>}
    </section>
  );
}

// ── By charity card ──────────────────────────────────────────────────────────

function CharityCard({ group, emerald, open, onToggle, rows, onOpenGift }: { group: CharityGroup; emerald: boolean; open: boolean; onToggle: () => void; rows: GiftRow[]; onOpenGift: (id: string) => void }) {
  return (
    <section className="overflow-hidden rounded-xl" style={{ background: "var(--portal-card-reading)", border: "1px solid var(--portal-line)" }}>
      <button type="button" onClick={onToggle} className="flex min-h-[88px] w-full items-center justify-between px-6 py-4" style={{ background: "var(--portal-card-hover)", borderBottom: open ? "1px solid var(--portal-line)" : undefined }}>
        <span className="flex items-center gap-4">
          <CharityMark name={group.name} />
          <span className="text-left">
            <span className="block text-[20px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
              {group.name}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-4">
          <span className="text-right">
            <span className="block text-[20px] font-semibold" style={{ fontFamily: SERIF, color: emerald ? "var(--portal-emerald)" : "var(--portal-ink)" }}>
              {group.amount}
            </span>
            <span className="block text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              {group.meetings} meeting{group.meetings === 1 ? "" : "s"} · {group.isStanding ? "standing nomination" : "override"}
            </span>
          </span>
          <Icon name={open ? "chevron-up" : "chevron-down"} size={16} style={{ color: "var(--muted-foreground)" }} />
        </span>
      </button>
      {open && (rows.length === 0 ? <EmptyRow>No gifts in this range.</EmptyRow> : rows.map((r, i) => <GiftRowView key={r.id} row={r} first={i === 0} hideCharityInMeta onOpen={() => onOpenGift(r.id)} />))}
    </section>
  );
}

function CharityMark({ name }: { name: string }) {
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 4)
    .join("")
    .toUpperCase();
  return (
    <span className="size-11 shrink-0 grid place-items-center rounded-full text-[13px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}

// ── Gift row ─────────────────────────────────────────────────────────────────

function GiftRowView({ row, first, hideCharityInMeta, onOpen }: { row: GiftRow; first: boolean; hideCharityInMeta?: boolean; onOpen: () => void }) {
  const meta = hideCharityInMeta ? `Held ${row.heldDateLabel}` : `Held ${row.heldDateLabel} · ${row.amount} to ${row.charityShort}${row.isOverride ? " (overridden)" : ""}`;
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
          {meta}
        </div>
      </div>
      <div className="hidden w-[120px] shrink-0 items-center gap-2 sm:flex">
        <span className="size-2 shrink-0 rounded-full" style={{ background: RELEASED }} />
        <span className="text-[13px] italic" style={{ color: "var(--portal-ink)" }}>
          Released
        </span>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-[17px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          {row.heldDateLabel}
        </div>
        <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          {row.amount} to {row.charityShort}
        </div>
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
