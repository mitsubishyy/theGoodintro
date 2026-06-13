"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { ExecHomeData, IncomingRow, UpcomingRow, ImpactRow } from "../data";
import { CharityChangeModal } from "./charity-change-modal";

/**
 * Exec dashboard VP1 (design/locked/exec-dashboard, LOCKED 2026-06-08 + the
 * 2026-06-09 compact-incoming rework). Editorial concierge register: Fraunces
 * section heads (never mono eyebrows), italic muted inline eyebrows, plain
 * italic status copy (no pills/chips/badges), single emerald accent, hairlines
 * not shadows. Mono uppercase appears in exactly one place — the Recent Impact
 * date prefix.
 *
 * Charity-change / learn triggers open the deferred Pass-B modal (the real
 * picker + detail modal need the parked charity-content schema). The incoming
 * quick actions + "Review all" route to /exec/requests where the in-portal
 * accept/decline/forward backend will live with that screen.
 */

const SERIF = "var(--font-display), Georgia, serif";

export function ExecHomeView({ data }: { data: ExecHomeData }) {
  const [modal, setModal] = useState<{ variant: "standing" | "override" | "learn"; charity: string } | null>(null);
  const { exec, metrics, standing, incoming, upcoming, impact } = data;

  // Greeting with the capital "Good" in emerald (locked).
  const greetingRest = data.greeting.replace(/^Good/, "");

  return (
    <div>
      {/* ── Greeting ─────────────────────────────────────────────────────── */}
      <header>
        <h1 className="text-[32px] font-semibold tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          <span style={{ color: "var(--portal-emerald)" }}>Good</span>
          {greetingRest}
        </h1>
        <p className="mt-2 text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
          {data.greetingDate}.
        </p>
      </header>

      {/* ── Dark metric strip ────────────────────────────────────────────── */}
      <section
        className="mt-10 rounded-2xl px-7 py-6 grid grid-cols-2 lg:grid-cols-4 gap-y-6"
        style={{ background: "var(--portal-ribbon)", color: "var(--primary-foreground)" }}
      >
        <MetricGroup label="Incoming" value={String(metrics.incoming)} sub="awaiting your answer" />
        <MetricGroup label="Upcoming" value={String(metrics.upcoming)} sub="this month" divided />
        <MetricGroup
          label="This financial year"
          value={metrics.fyAmount}
          sub={`to Good · ${metrics.fyMeetings} meetings held`}
          emerald
          divided
        />
        <MetricGroup
          label="Lifetime"
          value={metrics.lifetimeAmount}
          sub={`${metrics.lifetimeMeetings} meetings · ${metrics.lifetimeCharities} charities`}
          emerald
          divided
        />
      </section>

      {/* ── Equal-height row: Direction Card (left) + Incoming widget (right) ── */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5">
          <DirectionCard standing={standing} onLearn={() => standing && setModal({ variant: "learn", charity: standing.name })} onChange={() => standing && setModal({ variant: "standing", charity: standing.name })} />
        </div>
        <div className="lg:col-span-7">
          <IncomingWidget rows={incoming} count={metrics.incoming} />
        </div>
      </section>

      {/* ── Lifetime mini-card (below the matched row, left column only) ────── */}
      <section className="mt-4 grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <LifetimeMini fyAmount={metrics.fyAmount} fyMeetings={metrics.fyMeetings} lifetimeAmount={metrics.lifetimeAmount} lifetimeMeetings={metrics.lifetimeMeetings} />
        </div>
      </section>

      {/* ── Upcoming meetings ────────────────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          Upcoming meetings
        </h2>
        <div className="mt-5 flex flex-col gap-4">
          {upcoming.length === 0 ? (
            <QuietEmpty>No upcoming meetings yet.</QuietEmpty>
          ) : (
            upcoming.map((m) => <UpcomingCard key={m.id} m={m} onChangeCharity={() => setModal({ variant: "override", charity: m.charityName })} />)
          )}
        </div>
        {upcoming.length > 0 && (
          <div className="mt-4 text-right">
            <GhostLink href="/exec/meetings">View all meetings →</GhostLink>
          </div>
        )}
      </section>

      {/* ── Recent impact ────────────────────────────────────────────────── */}
      <section className="mt-16">
        <h2 className="text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          Recent impact
        </h2>
        <p className="mt-1.5 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
          Three most recent gifts. {metrics.fyMeetings} held this financial year.
        </p>
        <div className="mt-5">
          {impact.length === 0 ? (
            <QuietEmpty>No gifts yet. They appear here once a meeting is held.</QuietEmpty>
          ) : (
            impact.map((g) => <ImpactRowView key={g.id} g={g} />)
          )}
        </div>
        {impact.length > 0 && (
          <div className="mt-4 text-right">
            <GhostLink href="/exec/impact">View all impact →</GhostLink>
          </div>
        )}
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="mt-20 pb-4 text-center">
        <p className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          Signed in as {exec.email}
        </p>
        <p className="mt-1.5 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          <Link href="/exec/profile" className="hover:underline underline-offset-2">
            Pause requests
          </Link>
          {" · "}
          <Link href="https://thegoodintro.com/privacy" className="hover:underline underline-offset-2">
            Privacy
          </Link>
          {" · "}
          <Link href="https://thegoodintro.com/terms" className="hover:underline underline-offset-2">
            Terms
          </Link>
        </p>
      </footer>

      <CharityChangeModal
        open={modal !== null}
        variant={modal?.variant ?? "standing"}
        charityName={modal?.charity ?? ""}
        onClose={() => setModal(null)}
      />
    </div>
  );
}

// ── Metric strip group ───────────────────────────────────────────────────────

function MetricGroup({ label, value, sub, emerald, divided }: { label: string; value: string; sub: string; emerald?: boolean; divided?: boolean }) {
  return (
    <div className={divided ? "lg:pl-6 lg:border-l" : ""} style={{ borderColor: "rgba(255,255,255,0.10)" }}>
      <div className="text-[12px] italic" style={{ color: "rgba(255,255,255,0.82)" }}>
        {label}
      </div>
      <div className="mt-2 text-[32px] font-semibold leading-none" style={{ fontFamily: SERIF, color: emerald ? "var(--portal-emerald-sidebar-good)" : "#fff" }}>
        {value}
      </div>
      <div className="mt-2 text-[12px]" style={{ color: "rgba(255,255,255,0.60)" }}>
        {emerald && sub.startsWith("to Good") ? (
          <>
            to <span style={{ color: "var(--portal-emerald-sidebar-good)" }}>Good</span>
            {sub.slice("to Good".length)}
          </>
        ) : (
          sub
        )}
      </div>
    </div>
  );
}

// ── Direction Card ───────────────────────────────────────────────────────────

function DirectionCard({ standing, onLearn, onChange }: { standing: ExecHomeData["standing"]; onLearn: () => void; onChange: () => void }) {
  if (!standing) {
    return (
      <CardShell className="h-full flex flex-col items-center justify-center text-center py-16">
        <p className="text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
          No standing charity nominated yet.
        </p>
      </CardShell>
    );
  }
  const credentials = [standing.abn ? `ABN ${standing.abn}` : null, standing.dgrItem, standing.dgrStatus === "endorsed" ? "DGR endorsed" : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <CardShell className="h-full flex flex-col" padding="p-10">
      <div className="flex flex-col items-start">
        <CharityLogo name={standing.name} src={standing.logoUrl} />
        <p className="mt-8 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          {standing.sinceLabel ? `Standing nomination since ${standing.sinceLabel}` : "Standing nomination"}
        </p>
        <h3 className="mt-5 text-[40px] font-semibold leading-[1.05] tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          {standing.name}
        </h3>
        {standing.cause && (
          <p className="mt-2 text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            {standing.cause}
          </p>
        )}
        <p className="mt-6 text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Each meeting you accept sends a real gift here. You can direct any individual meeting to a different DGR-endorsed charity at the moment it is confirmed.
        </p>
      </div>
      <div className="mt-6 border-t" style={{ borderColor: "var(--portal-line)" }} />
      {credentials && (
        <p className="mt-5 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          {credentials}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-3">
        <GhostButton onClick={onLearn}>Learn about {standing.name} →</GhostButton>
        <GhostButton onClick={onChange}>Change standing charity →</GhostButton>
      </div>
    </CardShell>
  );
}

function CharityLogo({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // Scraped charity logo (object-fit cover in the 96px circle). Plain <img>
    // like the kit Avatar — these are small, remote, and not LCP-critical.
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
    <span className="size-24 rounded-full grid place-items-center text-[20px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}

// ── Lifetime mini-card ───────────────────────────────────────────────────────

function LifetimeMiniRow({ label, amount, meetings, divided }: { label: string; amount: string; meetings: number; divided?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between px-7 py-5 ${divided ? "border-t" : ""}`} style={{ borderColor: "var(--portal-line)" }}>
      <span className="text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span className="text-right">
        <span className="text-[18px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-emerald)" }}>
          {amount}
        </span>{" "}
        <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          {meetings} meetings
        </span>
      </span>
    </div>
  );
}

function LifetimeMini({ fyAmount, fyMeetings, lifetimeAmount, lifetimeMeetings }: { fyAmount: string; fyMeetings: number; lifetimeAmount: string; lifetimeMeetings: number }) {
  return (
    <CardShell padding="">
      <LifetimeMiniRow label="This financial year" amount={fyAmount} meetings={fyMeetings} />
      <LifetimeMiniRow label="Lifetime" amount={lifetimeAmount} meetings={lifetimeMeetings} divided />
    </CardShell>
  );
}

// ── Incoming widget ──────────────────────────────────────────────────────────

function IncomingWidget({ rows, count }: { rows: IncomingRow[]; count: number }) {
  const empty = rows.length === 0;
  return (
    <CardShell className="h-full flex flex-col" padding="p-7">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          Incoming requests
        </span>
        <span className="text-[18px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          {empty ? "None awaiting" : `${count} awaiting`}
        </span>
      </div>
      {!empty && (
        <p className="mt-1 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          Respond from here or open the full request.
        </p>
      )}
      <div className="mt-5 border-t" style={{ borderColor: "var(--portal-line)" }} />

      {empty ? (
        <div className="flex-1 grid place-items-center py-12 text-center">
          <div>
            <p className="text-[14px] italic" style={{ color: "var(--portal-ink)" }}>
              Nothing awaiting your answer.
            </p>
            <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
              New requests arrive by email and appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1">
            {rows.map((r, i) => (
              <IncomingRowView key={r.id} r={r} first={i === 0} />
            ))}
          </div>
          <div className="mt-3 border-t pt-4 text-right" style={{ borderColor: "var(--portal-line)" }}>
            <GhostLink href="/exec/requests">{`Review all ${count} request${count === 1 ? "" : "s"} →`}</GhostLink>
          </div>
        </>
      )}
    </CardShell>
  );
}

function IncomingRowView({ r, first }: { r: IncomingRow; first: boolean }) {
  const identity = [r.name, r.role, r.company].filter(Boolean).join(" · ");
  return (
    <div className={`flex items-start gap-3.5 py-4 ${first ? "" : "border-t"}`} style={{ borderColor: "var(--portal-line)" }}>
      <Avatar name={r.name} src={r.photoUrl ?? undefined} size={40} />
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
          {r.name}
          {(r.role || r.company) && (
            <span className="font-normal" style={{ color: "var(--muted-foreground)" }}>
              {" · "}
              {[r.role, r.company].filter(Boolean).join(" · ")}
            </span>
          )}
        </div>
        <div className="mt-1 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          {r.timeLabel}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <ActionButton href="/exec/requests" tone="primary">
            Accept
          </ActionButton>
          <ActionButton href="/exec/requests" tone="ghost">
            Decline
          </ActionButton>
          <ActionButton href="/exec/requests" tone="ghost">
            Forward
          </ActionButton>
        </div>
        <Link href="/exec/requests" className="text-[12px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
          More about {r.company || r.name} →
        </Link>
      </div>
      <span className="sr-only">{identity}</span>
    </div>
  );
}

// ── Upcoming meeting card ────────────────────────────────────────────────────

function UpcomingCard({ m, onChangeCharity }: { m: UpcomingRow; onChangeCharity: () => void }) {
  return (
    <CardShell padding="p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-5 min-w-0">
          <div className="shrink-0">
            <div className="text-[20px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
              {m.dateLabel}
            </div>
            <div className="text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              {m.timeLabel}
            </div>
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={m.name} src={m.photoUrl ?? undefined} size={40} />
            <div className="min-w-0">
              <div className="text-[15px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
                {m.name}
              </div>
              <div className="text-[13px] truncate" style={{ color: "var(--muted-foreground)" }}>
                {[m.role, m.company].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
        </div>
        {m.joinUrl ? (
          <a
            href={m.joinUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 inline-flex items-center rounded-full px-5 py-2.5 text-[13px] font-semibold text-white"
            style={{ background: "var(--portal-emerald)" }}
          >
            Join {m.provider} →
          </a>
        ) : (
          <span className="shrink-0 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Link to come
          </span>
        )}
      </div>

      <div className="mt-5 border-t pt-5 flex items-start justify-between gap-4" style={{ borderColor: "var(--portal-line)" }}>
        <div className="flex items-start gap-2.5 min-w-0">
          <Icon name="heart" size={16} className="mt-0.5 shrink-0" style={{ color: "var(--portal-emerald)" }} />
          <div className="min-w-0">
            <div className="text-[13px]" style={{ color: "var(--portal-ink)" }}>
              {m.amount} to {m.charityName}
            </div>
            <div className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              {m.isOverride ? `For this meeting only · Your standing nomination (${m.standingCharityName}) stays` : "Your standing nomination"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 shrink-0">
          <button type="button" onClick={onChangeCharity} className="text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
            Change charity →
          </button>
          <Link href={`/exec/meetings?drawer=${m.id}`} className="text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
            View detail →
          </Link>
        </div>
      </div>
    </CardShell>
  );
}

// ── Recent impact row ────────────────────────────────────────────────────────

function ImpactRowView({ g }: { g: ImpactRow }) {
  return (
    <div className="flex items-center gap-4 py-6 border-t first:border-t-0" style={{ borderColor: "var(--portal-line)" }}>
      <Avatar name={g.name} src={g.photoUrl ?? undefined} size={32} />
      <span className="text-[11px] font-mono uppercase tracking-[0.16em] shrink-0 w-16" style={{ color: "var(--muted-foreground)" }}>
        {g.datePrefix}
      </span>
      <span className="flex-1 text-[14px]" style={{ color: "var(--portal-ink)" }}>
        {g.body}
      </span>
      <span className="text-[12px] italic shrink-0" style={{ color: "var(--muted-foreground)" }}>
        {g.status}
      </span>
    </div>
  );
}

// ── Shared pieces ────────────────────────────────────────────────────────────

function CardShell({ children, className = "", padding = "p-7" }: { children: React.ReactNode; className?: string; padding?: string }) {
  return (
    <div className={`rounded-2xl border ${padding} ${className}`} style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
      {children}
    </div>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 px-5 rounded-lg border flex items-center justify-between text-[14px] font-semibold"
      style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)", background: "var(--portal-card)" }}
    >
      {children}
    </button>
  );
}

function GhostLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
      {children}
    </Link>
  );
}

function ActionButton({ href, tone, children }: { href: string; tone: "primary" | "ghost"; children: React.ReactNode }) {
  const style =
    tone === "primary"
      ? { background: "var(--portal-emerald)", color: "#fff", border: "1px solid var(--portal-emerald)" }
      : { background: "transparent", color: "var(--portal-ink)", border: "1px solid var(--portal-line)" };
  return (
    <Link href={href} className="h-8 px-3.5 inline-flex items-center rounded-lg text-[12px] font-semibold" style={style}>
      {children}
    </Link>
  );
}

function QuietEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="py-6 text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
      {children}
    </p>
  );
}
