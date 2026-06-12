"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Avatar, Button, Icon, RadioCard } from "@thegoodintro/ui";
import { submitRequestAction, type RequestState } from "../../actions";

/**
 * Vendor Request Form — ported component-for-component from the locked design
 * (UI_KIT_DESIGN_LOG "Vendor Request Form" LOCKED 2026-06-06 +
 * design/locked/vendor-request-form/README.md). Vendor T5 variant:
 *
 *   - Back row → /vendor/executives (parent route, never browser history).
 *   - 720px centered column. Block A context strip (48px photo + mono
 *     "REQUESTING A MEETING WITH" + identity).
 *   - Block B white form card with warm-cream textareas inside, hairline
 *     dividers, "QUESTION N OF 3" mono eyebrows, colour-shifting character
 *     counters (muted → amber at 80% → dark red past 300).
 *   - Q3 radio-card pattern (kit). "Someone else" expands the Name / Title /
 *     Email fields inline beneath the card (the Pass B spec text, built now
 *     so the choice keeps capturing what the pre-port form captured).
 *   - Block C (cost/charity strip) stays DELETED — Issy 2026-06-06. No money
 *     information renders on this surface; do not re-introduce.
 *   - Block D action row: Cancel ghost + primary ink "Send request to
 *     {First} →"; disabled while empty/over-limit (Pass B EMPTY state) and
 *     while submitting.
 *
 * Provisional copy pending Issy: the Q1/Q2/Q3 helper lines (the lock specs
 * the helper slot but not its words). The post-submit confirmation modal is
 * Pass B; submit keeps the existing redirect to /vendor?requested=1.
 */

const LIMIT = 300;

export function LockedRequestForm({
  exec,
  meLine,
}: {
  exec: { id: string; name: string; title: string; company: string; photoUrl: string | null };
  meLine: string;
}) {
  const [state, formAction, pending] = useActionState<RequestState, FormData>(
    submitRequestAction,
    {},
  );
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [attendee, setAttendee] = useState<"me" | "other">("me");
  const [other, setOther] = useState({ name: "", title: "", email: "" });

  const firstName = exec.name.split(" ")[0] || exec.name;
  const valid =
    q1.trim().length > 0 &&
    q1.length <= LIMIT &&
    q2.trim().length > 0 &&
    q2.length <= LIMIT &&
    (attendee === "me" || (other.name.trim() && other.email.trim()));

  return (
    <main className="flex-1 min-w-0 px-8 py-6">
      <Link
        href="/vendor/executives"
        className="inline-flex items-center gap-2 h-8 text-[14px] font-semibold hover:bg-[var(--portal-card-hover)] rounded-md -ml-2 pl-2 pr-3"
        style={{ color: "var(--portal-ink)" }}
      >
        <Icon name="chevron-left" size={20} />
        Back
      </Link>

      <div className="mx-auto w-full max-w-[720px] mt-6">
        {/* Block A — context strip */}
        <div className="flex items-center gap-4">
          <Avatar name={exec.name} src={exec.photoUrl} size={48} />
          <div className="min-w-0 leading-tight">
            <p
              className="text-[10.5px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              Requesting a meeting with
            </p>
            <p className="mt-0.5 text-[17px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
              {exec.name}
            </p>
            <p className="text-[13px] truncate" style={{ color: "var(--muted-foreground)" }}>
              {exec.title} · {exec.company}
            </p>
          </div>
        </div>

        <form action={formAction}>
          <input type="hidden" name="executive_id" value={exec.id} />

          {/* Block B — form card */}
          <div
            className="mt-6 rounded-2xl border p-8"
            style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
          >
            <Question
              n={1}
              label="Who are we?"
              helper="A short, plain-words introduction to your company and what you do."
              name="q1"
              value={q1}
              onChange={setQ1}
              disabled={pending}
            />

            <Divider />

            <Question
              n={2}
              label={`Why ${firstName}, specifically?`}
              helper={`What makes this conversation worth ${firstName}'s time right now.`}
              name="q2"
              value={q2}
              onChange={setQ2}
              disabled={pending}
            />

            <Divider />

            <div>
              <p
                className="text-[10.5px] font-mono uppercase tracking-[0.18em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Question 3 of 3
              </p>
              <p className="mt-2 text-[16px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                Who will {firstName} be meeting with?
              </p>
              <p className="mt-1 mb-4 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                The person who joins the meeting if {firstName} accepts.
              </p>
              <RadioCard<"me" | "other">
                name="attendee"
                value={attendee}
                onChange={setAttendee}
                options={[
                  { value: "me", title: "Me", subtitle: meLine },
                  {
                    value: "other",
                    title: "Someone else on the team",
                    subtitle: "We'll capture their name, title, and email next.",
                  },
                ]}
              />
              {attendee === "other" && (
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <AttendeeInput placeholder="Name" name="att_name" value={other.name} onChange={(v) => setOther((o) => ({ ...o, name: v }))} disabled={pending} />
                  <AttendeeInput placeholder="Title" name="att_title" value={other.title} onChange={(v) => setOther((o) => ({ ...o, title: v }))} disabled={pending} />
                  <AttendeeInput placeholder="Work email" name="att_email" type="email" value={other.email} onChange={(v) => setOther((o) => ({ ...o, email: v }))} disabled={pending} />
                </div>
              )}
            </div>
          </div>

          {state.error ? (
            <p
              className="mt-4 rounded-lg px-4 py-3 text-[13px]"
              style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
            >
              {state.error}
            </p>
          ) : null}

          {/* Block D — action row */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button variant="ghost" href="/vendor/executives">
              Cancel
            </Button>
            <button
              type="submit"
              disabled={!valid || pending}
              className="inline-flex items-center gap-2 h-10 rounded-lg px-5 text-[13px] font-semibold"
              style={
                !valid || pending
                  ? { background: "var(--portal-line)", color: "var(--muted-foreground)", cursor: "not-allowed" }
                  : { background: "var(--portal-ink)", color: "var(--portal-card)" }
              }
            >
              {pending ? "Sending…" : `Send request to ${firstName}`}
              {!pending && <Icon name="arrow-right" size={16} />}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Question({
  n,
  label,
  helper,
  name,
  value,
  onChange,
  disabled,
}: {
  n: number;
  label: string;
  helper: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const counterColor =
    value.length > LIMIT
      ? "oklch(0.45 0.16 25)" // dark red past the cap
      : value.length >= LIMIT * 0.8
        ? "var(--portal-amber-ink)"
        : "var(--muted-foreground)";
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p
          className="text-[10.5px] font-mono uppercase tracking-[0.18em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Question {n} of 3
        </p>
        <span className="text-[11.5px] font-mono tabular-nums" style={{ color: counterColor }}>
          {value.length} / {LIMIT}
        </span>
      </div>
      <p className="mt-2 text-[16px] font-semibold" style={{ color: "var(--portal-ink)" }}>
        {label}
      </p>
      <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
        {helper}
      </p>
      <textarea
        name={name}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
        className="mt-3 w-full rounded-lg border p-3.5 text-[13.5px] leading-[1.55] outline-none focus:ring-1"
        style={{
          background: "var(--portal-page)",
          borderColor: "var(--portal-line)",
          color: "var(--portal-ink)",
          ["--tw-ring-color" as string]: "var(--portal-amber)",
        }}
      />
    </div>
  );
}

function AttendeeInput({
  placeholder,
  name,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  placeholder: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-lg border px-3 py-2 text-[13px] outline-none focus:ring-1"
      style={{
        background: "var(--portal-page)",
        borderColor: "var(--portal-line)",
        color: "var(--portal-ink)",
        ["--tw-ring-color" as string]: "var(--portal-amber)",
      }}
    />
  );
}

function Divider() {
  return <div className="my-8 border-t" style={{ borderColor: "var(--portal-line)" }} />;
}
