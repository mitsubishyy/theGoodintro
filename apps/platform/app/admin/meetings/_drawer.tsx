"use client";

import { useEffect, useState } from "react";
import { Avatar, Badge, Icon } from "@thegoodintro/ui";
import {
  chipKind,
  CHIP_STYLE,
  creditFlat,
  creditLabel,
  giftLabel,
  longDateLabel,
  shortDateLabel,
  statusPill,
  timeWithZone,
  toDatetimeLocal,
  type MeetingItem,
} from "./_status";
import {
  confirmMeetingAction,
  markHeldAction,
  releaseMeetingAction,
  rescheduleMeetingAction,
  reverseHeldAction,
} from "./actions";
import { ConfirmSubmit } from "./confirm-submit";

/**
 * Admin meeting detail drawer — a 540px right slide-over (Issy 2026-06-19). Read
 * top-to-bottom in three tiers so it is easy to scan:
 *   1. ESSENTIALS (dark box) — the two parties, the time, the meeting link.
 *   2. WHAT THE VENDOR SENT — the SaaS vendor's pitch to the executive (Q1/Q2).
 *   3. ABOUT THE EXECUTIVE — the qualified context (what they care about).
 * Money (credit + gift) sits below, then the status-aware actions. Backdrop
 * reuses the locked drawer pattern (20% ink + 2px blur). Money reads from the
 * shared _status rules; nothing is hardcoded.
 */

const inputStyle = { background: "var(--portal-card)", borderColor: "var(--portal-line)" } as const;
const inkBtn = { background: "var(--portal-ink)", color: "var(--portal-card)" } as const;
const ghostBtn = { borderColor: "var(--portal-line)", color: "var(--portal-ink)" } as const;
const W = (o: number) => `rgba(255,255,255,${o})`;

export function MeetingDrawer({
  meeting,
  actionsEnabled,
  onClose,
}: {
  meeting: MeetingItem | null;
  actionsEnabled: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!meeting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [meeting, onClose]);

  if (!meeting) return null;
  const accent = CHIP_STYLE[chipKind(meeting)].bar;
  const pill = statusPill(meeting.status);
  const execFirst = meeting.execName?.split(/\s+/)[0] ?? "the exec";
  const execSub = [meeting.execTitle, meeting.execCompany].filter(Boolean).join(", ");
  const execFacts = buildExecFacts(meeting);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0"
        style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      <div
        className="relative h-full w-full max-w-[540px] overflow-y-auto border-l"
        style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
      >
        <div className="h-[3px] w-full" style={{ background: accent }} />

        <div className="flex flex-col gap-5 px-6 py-6 pb-28">
          {/* ── TIER 1 · Essentials (dark box) ──────────────────────────────── */}
          <div className="rounded-2xl px-5 py-5" style={{ background: "var(--portal-ribbon)", color: "#fff" }}>
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: W(0.5) }}>
                Meeting
              </span>
              <div className="flex items-center gap-2">
                <Badge tone={pill.tone} dot>
                  {pill.label}
                </Badge>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="grid size-7 place-items-center rounded-full hover:bg-white/10"
                  style={{ color: "#fff" }}
                >
                  <Icon name="x" size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4">
              <DarkEyebrow>Vendor</DarkEyebrow>
              <p className="text-[16px] font-semibold leading-tight">{meeting.vendorName}</p>
            </div>

            <Hairline />

            <div className="flex items-center gap-3">
              {meeting.execName ? <Avatar name={meeting.execName} src={meeting.execPhotoUrl ?? undefined} size={36} /> : null}
              <div className="min-w-0">
                <DarkEyebrow>Executive</DarkEyebrow>
                <p className="text-[15px] font-semibold leading-tight">{meeting.execName ?? "No executive assigned"}</p>
                {execSub && (
                  <p className="mt-0.5 text-[12.5px]" style={{ color: W(0.6) }}>
                    {execSub}
                  </p>
                )}
              </div>
            </div>

            <Hairline />

            <div className="flex flex-col gap-4">
              <div>
                <DarkEyebrow>When</DarkEyebrow>
                <p className="text-[14px] font-semibold">
                  {meeting.scheduledIso ? longDateLabel(meeting.scheduledIso) : "No time set"}
                </p>
                {meeting.scheduledIso && (
                  <p className="mt-0.5 text-[12.5px]" style={{ color: W(0.6) }}>
                    {timeWithZone(meeting.scheduledIso)}
                  </p>
                )}
              </div>

              <div>
                <DarkEyebrow>Meeting link</DarkEyebrow>
                {meeting.joinUrl ? (
                  <div>
                    <a
                      href={meeting.joinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-[9px] px-3.5 py-2 text-[13px] font-semibold"
                      style={{ background: "var(--portal-amber)", color: "var(--portal-ink)" }}
                    >
                      Join meeting ↗
                    </a>
                    <p className="mt-2 break-all font-mono text-[11px]" style={{ color: W(0.45) }}>
                      {meeting.joinUrl}
                    </p>
                  </div>
                ) : (
                  <p className="text-[13px] italic" style={{ color: W(0.55) }}>
                    No meeting link yet{meeting.status === "proposed" ? " — add one when you confirm the time." : "."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── TIER 2 · What the vendor sent ───────────────────────────────── */}
          <Card title={`What ${meeting.vendorName} sent`}>
            {meeting.requestQ1 || meeting.requestQ2 ? (
              <div className="flex flex-col gap-4">
                {meeting.requestQ1 && <Qa label="What they want to discuss" body={meeting.requestQ1} accent />}
                {meeting.requestQ2 && <Qa label="Why this executive specifically" body={meeting.requestQ2} accent />}
              </div>
            ) : (
              <Empty>No pitch on file for this meeting.</Empty>
            )}

            {(meeting.requesterName || meeting.requestSubmittedIso) && (
              <div className="mt-4 flex items-center gap-2.5 border-t pt-3.5" style={{ borderColor: "var(--portal-line)" }}>
                {meeting.requesterName && <Avatar name={meeting.requesterName} size={28} />}
                <div className="min-w-0 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                  {meeting.requesterName && (
                    <span style={{ color: "var(--portal-ink)" }}>{meeting.requesterName}</span>
                  )}
                  {[roleLabel(meeting.requesterRole), meeting.requesterEmail].filter(Boolean).length > 0 && (
                    <span> · {[roleLabel(meeting.requesterRole), meeting.requesterEmail].filter(Boolean).join(" · ")}</span>
                  )}
                  {meeting.requestSubmittedIso && (
                    <div className="mt-0.5 italic">
                      Submitted {shortDateLabel(meeting.requestSubmittedIso)} · not visible to {execFirst}
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* ── TIER 3 · About the executive (the qualified part) ───────────── */}
          <Card title={`About ${meeting.execName ? execFirst : "the executive"}`}>
            {execFacts.length > 0 ? (
              <div className="flex flex-col gap-4">
                {execFacts.map((f) => (
                  <Qa key={f.label} label={f.label} body={f.body} />
                ))}
              </div>
            ) : (
              <Empty>No executive context on file yet.</Empty>
            )}
            {meeting.execLinkedinUrl && (
              <a
                href={meeting.execLinkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-[13px] hover:underline underline-offset-2"
                style={{ color: "var(--portal-amber-ink)" }}
              >
                View {execFirst} on LinkedIn ↗
              </a>
            )}
          </Card>

          {/* ── Money ───────────────────────────────────────────────────────── */}
          <Card title="Money">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                  Credit
                </p>
                <p className="mt-0.5 text-[13.5px]" style={{ color: "var(--portal-ink)" }}>
                  {creditLabel(meeting)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-medium" style={{ color: "var(--muted-foreground)" }}>
                  Gift
                </p>
                <p className="mt-0.5 text-[13.5px]" style={{ color: "var(--portal-ink)" }}>
                  {meeting.charityName ?? "Charity not set"}
                  {meeting.status === "held" && meeting.giftAmountCents != null && (
                    <span style={{ color: "var(--primary)" }}> · {giftLabel(meeting)}</span>
                  )}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
              One meeting consumes one credit ({creditFlat()}); a released meeting returns it. The gift is the
              per-band charity share, frozen at completion — never the meeting fee.
            </p>
          </Card>
        </div>

        {/* Sticky footer — status-aware actions */}
        <div
          className="sticky bottom-0 border-t px-6 py-5"
          style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
        >
          {!actionsEnabled ? (
            <p className="text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>
              Meeting actions are behind the <code>request_loop</code> flag (off by default).
            </p>
          ) : (
            <Actions meeting={meeting} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Tier 3 fact builder ──────────────────────────────────────────────────────

function buildExecFacts(m: MeetingItem): { label: string; body: string }[] {
  const facts: { label: string; body: string }[] = [];
  const push = (label: string, body: string | null) => {
    if (body && body.trim()) facts.push({ label, body });
  };
  push("What they care about", m.execInterestedIn);
  push("Current projects", m.execCurrentProjects);
  push("Timeline", m.execTimeline);
  push("Seniority signal", m.execSenioritySignal);
  push("Not looking for", m.execNotInterestedIn);
  // context_notes is the free-text catch-all; label it as the headline only when
  // no structured "what they care about" field exists, else as general context.
  push(m.execInterestedIn ? "Context" : "What they care about", m.execContextNotes);
  return facts;
}

// ── Actions (unchanged behaviour; status-aware) ──────────────────────────────

function Actions({ meeting }: { meeting: MeetingItem }) {
  if (meeting.status === "proposed") {
    return (
      <form action={confirmMeetingAction} className="flex flex-col gap-2.5">
        <input type="hidden" name="meeting_id" value={meeting.id} />
        <div className="flex flex-wrap gap-2">
          <input name="scheduled_at" type="datetime-local" className="flex-1 rounded-lg border px-2.5 py-2 text-[13px]" style={inputStyle} />
          <input name="join_url" placeholder="Join URL (optional)" className="flex-1 rounded-lg border px-2.5 py-2 text-[13px]" style={inputStyle} />
        </div>
        <button type="submit" className="h-11 rounded-[10px] text-[13.5px] font-semibold" style={inkBtn}>
          Confirm time
        </button>
      </form>
    );
  }

  if (meeting.status === "confirmed") {
    return <ConfirmedActions meeting={meeting} />;
  }

  if (meeting.status === "held") {
    return (
      <form action={reverseHeldAction}>
        <input type="hidden" name="meeting_id" value={meeting.id} />
        <ConfirmSubmit
          message="Reverse this held meeting? The credit returns to the vendor, the gift is voided if it has not been paid, and a rebook is created with the same executive."
          className="h-11 w-full rounded-[10px] border text-[13.5px] font-medium"
          style={ghostBtn}
        >
          Reverse held
        </ConfirmSubmit>
      </form>
    );
  }

  return (
    <p className="text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>
      This meeting is {statusPill(meeting.status).label.toLowerCase()}. No further action.
    </p>
  );
}

/**
 * Confirmed meeting actions. The forward path (Mark held) plus the outcomes
 * (No-show / Cancel), and — Issy 2026-06-19 — an Edit affordance to reschedule
 * the date / time / link of a future booking without re-running the credit flow.
 */
function ConfirmedActions({ meeting }: { meeting: MeetingItem }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <form action={rescheduleMeetingAction} className="flex flex-col gap-2.5">
        <input type="hidden" name="meeting_id" value={meeting.id} />
        <div className="flex flex-wrap gap-2">
          <label className="flex-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Date &amp; time
            <input
              name="scheduled_at"
              type="datetime-local"
              defaultValue={toDatetimeLocal(meeting.scheduledIso)}
              className="mt-1 w-full rounded-lg border px-2.5 py-2 text-[13px]"
              style={inputStyle}
            />
          </label>
          <label className="flex-1 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
            Meeting link
            <input
              name="join_url"
              defaultValue={meeting.joinUrl ?? ""}
              placeholder="Join URL (optional)"
              className="mt-1 w-full rounded-lg border px-2.5 py-2 text-[13px]"
              style={inputStyle}
            />
          </label>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="h-11 flex-1 rounded-[10px] text-[13.5px] font-semibold" style={inkBtn}>
            Save changes
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="h-11 rounded-[10px] border px-4 text-[13.5px] font-medium"
            style={ghostBtn}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 gap-2">
        <form action={markHeldAction}>
          <input type="hidden" name="meeting_id" value={meeting.id} />
          <button type="submit" className="h-11 w-full rounded-[10px] text-[13.5px] font-semibold" style={inkBtn}>
            Mark held
          </button>
        </form>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="h-11 w-full rounded-[10px] border text-[13.5px] font-medium"
          style={ghostBtn}
        >
          Edit date &amp; time
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <form action={releaseMeetingAction}>
          <input type="hidden" name="meeting_id" value={meeting.id} />
          <input type="hidden" name="outcome" value="no_show" />
          <ConfirmSubmit
            message="Mark this meeting as a no-show? The reserved credit returns to the vendor and no gift is recorded."
            className="h-11 w-full rounded-[10px] border text-[13.5px] font-medium"
            style={ghostBtn}
          >
            No-show
          </ConfirmSubmit>
        </form>
        <form action={releaseMeetingAction}>
          <input type="hidden" name="meeting_id" value={meeting.id} />
          <input type="hidden" name="outcome" value="cancelled" />
          <ConfirmSubmit
            message="Cancel this meeting? The reserved credit returns to the vendor."
            className="h-11 w-full rounded-[10px] border text-[13.5px] font-medium"
            style={ghostBtn}
          >
            Cancel
          </ConfirmSubmit>
        </form>
      </div>
    </div>
  );
}

// ── Small building blocks ────────────────────────────────────────────────────

function DarkEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[9.5px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.45)" }}>
      {children}
    </p>
  );
}

function Hairline() {
  return <div className="my-4 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />;
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border p-5" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
      <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Qa({ label, body, accent }: { label: string; body: string; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] font-medium" style={{ color: accent ? "var(--portal-amber-ink)" : "var(--muted-foreground)" }}>
        {label}
      </p>
      <p className="mt-1 text-[13.5px] leading-relaxed" style={{ color: "var(--portal-ink)" }}>
        {body}
      </p>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
      {children}
    </p>
  );
}

/** vendor_user_role enum → readable label (e.g. "owner" → "Owner"). */
function roleLabel(role: string | null): string {
  if (!role) return "";
  return role
    .split(/[_\s]+/)
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : ""))
    .join(" ");
}
