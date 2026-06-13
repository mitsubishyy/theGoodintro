import { Badge, StatusDot, Avatar, EmptyState, type Tone } from "@thegoodintro/ui";
import { formatAud } from "@/lib/format";

/* ─────────────────────────────────────────────────────────────────────────
   Admin Dashboard widget content (Admin Dashboard README 2026-06-09).
   Each component is the BODY inside a <Widget> shell — the shell ships
   the header (mono eyebrow + count chip + link) and the loading / empty /
   error state matrix. These components render the row contents only.
   ───────────────────────────────────────────────────────────────────── */

/* ── Booked Meetings calendar moved to ./calendar.tsx ─────────────────────
   It grew month navigation (Issy 2026-06-13), which needs client state, and
   this module stays server-only for the rest of the widget bodies. */

export function ViewToggle({
  left,
  right,
  rightEnabled = true,
}: {
  left: string;
  right: string;
  /** List view only becomes available once at least one meeting is booked
   *  (Issy 2026-06-12); until then the right half renders disabled. */
  rightEnabled?: boolean;
}) {
  // Presentational toggle; Calendar/List swap wires in a follow-up port.
  return (
    <span
      className="inline-flex rounded-lg overflow-hidden text-[11px] font-medium"
      style={{ border: "1px solid var(--portal-line)" }}
    >
      <span className="px-2.5 py-1" style={{ background: "var(--portal-ink)", color: "#fff" }}>
        {left}
      </span>
      <span
        className="px-2.5 py-1"
        style={
          rightEnabled
            ? { color: "var(--muted-foreground)" }
            : { color: "var(--muted-foreground)", opacity: 0.45, cursor: "not-allowed" }
        }
        aria-disabled={!rightEnabled || undefined}
        title={rightEnabled ? undefined : "List view is available once a meeting is booked"}
      >
        {right}
      </span>
    </span>
  );
}

/* ── Pending Requests (4-col, locked tone mapping) ────────────────────── */

// The locked dashboard imagined a review/match/exec/block triage, but
// request_status only expresses submitted/accepted/declined/closed and there
// is no triage sub-state column. This widget shows *submitted* (pending)
// requests, which are all awaiting admin review, so the only driveable tone is
// "review". The other three were never assigned by any caller; restore them
// only alongside a real schema column.
export type RequestTone = "review";
export interface PendingRequestRow {
  vendor: string;
  exec: string;
  detail: string;       // "Submitted 14h ago · Brief attached"
  tone: RequestTone;
}

const REQUEST_TONE: Record<RequestTone, { tone: Tone; label: string }> = {
  review: { tone: "amber", label: "Review" },
};

export function PendingRequestsList({ rows }: { rows: PendingRequestRow[] }) {
  return (
    <div>
      {rows.map((r, i) => {
        const initials = (r.vendor || "?")
          .trim()
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const t = REQUEST_TONE[r.tone];
        return (
          <div
            key={`${r.vendor}-${i}`}
            className="px-5 py-3.5 flex items-center gap-3"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
          >
            <Avatar name={initials} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate">
                <span style={{ color: "var(--portal-ink)" }}>{r.vendor}</span>
                <span className="font-normal" style={{ color: "var(--muted-foreground)" }}>
                  {" → "}
                  {r.exec}
                </span>
              </div>
              <div
                className="text-[12px] italic mt-0.5 truncate"
                style={{ color: "var(--muted-foreground)" }}
              >
                {r.detail}
              </div>
            </div>
            <Badge tone={t.tone} dot>
              {t.label}
            </Badge>
          </div>
        );
      })}
    </div>
  );
}

/* ── Needs Action (8-col) ─────────────────────────────────────────────── */

export interface NeedsActionRow {
  manual: boolean;         // red dot when true
  lead: string;            // "Vendor agreement unsigned, Atelier Ridgeway"
  detail: string;          // sub-line
  age: string;             // "9d" / "2d" / "6h"
  ageTone: "red" | "amber" | "ink";
}

export function NeedsActionList({
  rows,
  openCount,
  assignedCount,
}: {
  rows: NeedsActionRow[];
  openCount: number;
  assignedCount: number;
}) {
  return (
    <>
      <div>
        {rows.map((r, i) => (
          <div
            key={i}
            className="px-5 py-3.5 flex items-start gap-3"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
          >
            <span
              className="mt-1.5 size-2 rounded-full shrink-0"
              style={{
                background: r.manual
                  ? "oklch(0.55 0.18 25)"
                  : "var(--portal-amber)",
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px]" style={{ color: "var(--portal-ink)" }}>
                {r.lead}
              </div>
              <div className="text-[12px] mt-0.5 truncate" style={{ color: "var(--muted-foreground)" }}>
                {r.detail}
              </div>
            </div>
            <span
              className="text-[12px] shrink-0"
              style={{
                color:
                  r.ageTone === "red"
                    ? "oklch(0.55 0.18 25)"
                    : r.ageTone === "amber"
                      ? "var(--portal-amber-ink)"
                      : "var(--portal-ink)",
                fontWeight: r.ageTone === "red" ? 600 : 400,
              }}
            >
              {r.age}
            </span>
          </div>
        ))}
      </div>
      <footer
        className="px-5 py-3 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.18em]"
        style={{ borderTop: "1px solid var(--portal-line)", color: "var(--muted-foreground)" }}
      >
        <span>Manual follow-ups marked with a red dot</span>
        <span>
          {openCount} OPEN · {assignedCount} ASSIGNED TO YOU
        </span>
      </footer>
    </>
  );
}

/* ── Distributions (4-col horizontal bars) ────────────────────────────── */

export interface DistributionGroup {
  title: string;
  total: number;
  rows: { label: string; count: number; tone?: Tone }[];
  /** When false, render the group header + a single muted "—" line so the
   *  widget never drops a section even if the data isn't available yet. */
  available: boolean;
  unavailableHint?: string;
}

export function DistributionsBars({ groups }: { groups: DistributionGroup[] }) {
  return (
    <div className="px-5 py-4 space-y-4">
      {groups.map((g, gi) => (
        <div
          key={g.title}
          className="space-y-2"
          style={
            gi === 0
              ? undefined
              : { borderTop: "1px solid var(--portal-line)", paddingTop: 14 }
          }
        >
          <div className="flex items-baseline justify-between">
            <h3
              className="text-[11px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              {g.title}
            </h3>
            {g.available && (
              <span className="text-[11px] font-mono" style={{ color: "var(--muted-foreground)" }}>
                {g.total} total
              </span>
            )}
          </div>
          {!g.available ? (
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              {g.unavailableHint ?? "Awaiting data source."}
            </p>
          ) : (
            <div className="space-y-1.5">
              {g.rows.map((r) => {
                const pct = g.total > 0 ? Math.round((r.count / g.total) * 100) : 0;
                return (
                  <div key={r.label} className="grid grid-cols-[1fr_auto_120px] items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0 text-[12.5px]">
                      <StatusDot tone={r.tone ?? "amber"} size={6} />
                      <span className="truncate">{r.label}</span>
                    </div>
                    <span
                      className="text-[12px] font-mono tabular-nums"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      {r.count}
                    </span>
                    <div
                      className="h-1.5 rounded-full overflow-hidden"
                      style={{ background: "var(--portal-line)" }}
                    >
                      <div
                        className="h-full"
                        style={{ width: `${pct}%`, background: "var(--portal-amber)" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Unresponded Comms (4-col) ────────────────────────────────────────── */

export interface CommsRow {
  from: string;
  subject: string;
  age: string;
  overdue: boolean;
}

export function UnrespondedCommsList({ rows }: { rows: CommsRow[] }) {
  return (
    <div>
      {rows.map((c, i) => (
        <div
          key={`${c.from}-${i}`}
          className="px-5 py-3.5 flex items-start gap-3"
          style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
        >
          <Avatar name={c.from} size={32} />
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-medium truncate">{c.from}</div>
            <div className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
              {c.subject}
            </div>
          </div>
          <span
            className="text-[11px] shrink-0"
            style={{
              color: c.overdue ? "oklch(0.55 0.18 25)" : "var(--muted-foreground)",
              fontWeight: c.overdue ? 600 : 400,
            }}
          >
            {c.age}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Recent Onboards (4-col) ──────────────────────────────────────────── */

export interface OnboardRow {
  name: string;
  role: string;
  company: string;
  dateLabel: string; // "05 JUN"
}

export function RecentOnboardsList({ rows }: { rows: OnboardRow[] }) {
  return (
    <div>
      {rows.map((r, i) => (
        <div
          key={`${r.name}-${i}`}
          className="px-5 py-3.5 flex items-center gap-3"
          style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
        >
          <Avatar name={r.name} size={32} />
          <div className="min-w-0 flex-1">
            <div className="text-[13.5px] font-medium truncate">{r.name}</div>
            <div className="text-[12px] truncate" style={{ color: "var(--muted-foreground)" }}>
              {r.role} · {r.company}
            </div>
          </div>
          <span
            className="text-[11px] font-mono uppercase tracking-[0.18em] shrink-0"
            style={{ color: "var(--muted-foreground)" }}
          >
            {r.dateLabel}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Gifts Sent (4-col) ───────────────────────────────────────────────── */

export interface GiftRow {
  charity: string;
  count: number;
  totalCents: number;
}

export function GiftsSentList({ rows }: { rows: GiftRow[] }) {
  return (
    <div>
      {rows.map((r, i) => {
        const initials = r.charity
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 3)
          .toUpperCase();
        return (
          <div
            key={`${r.charity}-${i}`}
            className="px-5 py-3.5 flex items-center gap-3"
            style={{ borderTop: i === 0 ? "none" : "1px solid var(--portal-line)" }}
          >
            <span
              className="size-8 rounded-full grid place-items-center text-[10px] font-mono font-semibold shrink-0"
              style={{
                background: "var(--portal-card-reading)",
                color: "var(--portal-amber-ink)",
                border: "1px solid var(--portal-line)",
              }}
            >
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium truncate">{r.charity}</div>
              <div className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                {r.count} gift{r.count === 1 ? "" : "s"}
              </div>
            </div>
            <span
              className="text-[16px] shrink-0"
              style={{
                fontFamily: "var(--font-display), serif",
                fontWeight: 600,
                color: "var(--primary)",
              }}
            >
              {formatAud(r.totalCents)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Shared empty state hint ──────────────────────────────────────────── */

export function NoData({ title, hint }: { title: string; hint?: string }) {
  return <EmptyState title={title} hint={hint} />;
}
