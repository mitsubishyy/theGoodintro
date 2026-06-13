"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@thegoodintro/ui";
import { DeclineReasonPicker } from "../../_components/decline-reason-picker";
import { actOnToken, saveDeclineReason, saveEaNote } from "./actions";

/**
 * The locked action-page states (exec-request-email lock 2026-06-12, VP2-VP4).
 * Act-instantly pattern: the email link's GET renders this, the action fires
 * immediately on mount (a POSTed server action, so mail-scanner prefetch of
 * the GET never triggers it), and the page reports the DONE state. Reasons
 * and notes are optional follow-ups, never gates.
 *
 * Mobile-first at 390px; desktop just centers the column. No portal chrome,
 * no CTAs into the portal: the email surface stands alone.
 */

const SERIF = "var(--font-display), Georgia, serif";

export interface ActionPageData {
  requesterFirst: string;
  eaName: string | null;
  charityName: string;
  /** Formatted band amount, e.g. "$1,000" — always rendered "approximately $X". */
  indicativeAmount: string;
  /** Pre-action read: false = this is the exec's first-ever action, so the
   *  consent footnote renders (the action itself writes the record). */
  hasConsent: boolean;
}

export function ActionRunner({
  token,
  intent,
  data,
}: {
  token: string;
  intent: "accept" | "decline" | "send_to_ea";
  data: ActionPageData;
}) {
  const fired = useRef(false);
  const [outcome, setOutcome] = useState<"pending" | "accepted" | "declined" | "forwarded" | "already" | "error">(
    "pending",
  );

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void actOnToken(token, intent).then((r) => {
      if (r.result === "accepted" || r.result === "declined" || r.result === "forwarded") {
        setOutcome(r.result);
      } else if (r.error && /token_not_active|request_not_open/.test(r.error)) {
        setOutcome("already");
      } else {
        setOutcome("error");
      }
    });
  }, [token, intent]);

  if (outcome === "pending") {
    return <Italic center>One moment.</Italic>;
  }
  if (outcome === "already") {
    return (
      <div className="text-center">
        <Head>Already taken care of.</Head>
        <Italic center className="mt-3">
          This request has been actioned. Nothing further is needed. Questions? Just reply to the email.
        </Italic>
      </div>
    );
  }
  if (outcome === "error") {
    return (
      <div className="text-center">
        <Head>Something went wrong.</Head>
        <Italic center className="mt-3">
          Please try the button in the email again, or just reply to it. It reaches a real person.
        </Italic>
      </div>
    );
  }
  if (outcome === "accepted") return <AcceptView data={data} />;
  if (outcome === "declined") return <DeclineView token={token} data={data} />;
  return <ForwardView token={token} data={data} />;
}

/** VP2 — Accept confirmation. */
function AcceptView({ data }: { data: ActionPageData }) {
  const steps = [
    "We read your calendar's free/busy and propose a slot.",
    "We confirm the time with you, and invites go to both sides.",
    `After the meeting, approximately ${data.indicativeAmount} goes to ${data.charityName} in your name.`,
  ];
  return (
    <div className="text-center">
      <IconCircle>
        <Icon name="check" size={26} style={{ color: "var(--primary)" }} />
      </IconCircle>
      <Head className="mt-5">Done. We&rsquo;re finding a time.</Head>
      <Italic center className="mt-3">
        Nothing lands in your calendar until you confirm the time.
      </Italic>
      <ol className="mt-7 flex flex-col gap-4 text-left">
        {steps.map((s, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span
              className="shrink-0 size-7 rounded-full border grid place-items-center text-[12.5px] font-medium"
              style={{ borderColor: "var(--portal-ink)", color: "var(--portal-ink)" }}
            >
              {i + 1}
            </span>
            <span className="text-[14px] leading-relaxed" style={{ color: "var(--portal-ink)" }}>
              {s}
            </span>
          </li>
        ))}
      </ol>
      <ConsentFootnote show={!data.hasConsent} />
    </div>
  );
}

/** VP3 / VP3b — Decline confirmation; reason is an optional follow-up. */
function DeclineView({ token, data }: { token: string; data: ActionPageData }) {
  const [phase, setPhase] = useState<"ask" | "thanks" | "skipped">("ask");
  return (
    <div className="text-center">
      <Head>Declined.</Head>
      <Italic center className="mt-3">
        {data.requesterFirst} will be told politely. Your name is never attached to a reason.
      </Italic>
      {phase === "ask" && (
        <>
          <p className="mt-7 text-[14px] font-medium" style={{ color: "var(--portal-ink)" }}>
            Want to tell us why? It shapes our reply and is never sent word-for-word.
          </p>
          <div className="mt-4">
            <DeclineReasonPicker
              mode="immediate"
              onSubmit={async (reason) => {
                await saveDeclineReason(token, reason);
                setPhase("thanks");
              }}
            />
          </div>
          <button
            type="button"
            onClick={() => setPhase("skipped")}
            className="mt-5 text-[13px] underline-offset-4 hover:underline"
            style={{ color: "var(--muted-foreground)" }}
          >
            Skip
          </button>
        </>
      )}
      {phase === "thanks" && (
        <Italic center className="mt-6">
          Thank you. That helps.
        </Italic>
      )}
      <ConsentFootnote show={!data.hasConsent} />
    </div>
  );
}

/** VP4 — Send-to-EA confirmation; note is an optional follow-up. */
function ForwardView({ token, data }: { token: string; data: ActionPageData }) {
  const eaFull = data.eaName ?? "your EA";
  const eaFirst = (data.eaName ?? "").split(/\s+/)[0] || "them";
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  return (
    <div className="text-center">
      <IconCircle>
        <Icon name="arrow-right" size={26} style={{ color: "var(--primary)" }} />
      </IconCircle>
      <Head className="mt-5">Sent to {eaFull}.</Head>
      <Italic center className="mt-3">
        They can accept, decline, or pick a time on your behalf. We included everything they need.
      </Italic>
      {!sent ? (
        <div className="mt-7 text-left">
          <Italic>Anything {eaFirst} should know? (optional)</Italic>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="A line of context goes a long way."
            maxLength={500}
            className="mt-2 w-full rounded-xl border px-4 py-3 text-[14px]"
            style={{
              background: "var(--cream-1, #f6f2e8)",
              borderColor: "var(--portal-line)",
              color: "var(--portal-ink)",
            }}
          />
          <button
            type="button"
            disabled={busy || note.trim().length === 0}
            onClick={async () => {
              setBusy(true);
              try {
                await saveEaNote(token, note.trim());
                setSent(true);
              } finally {
                setBusy(false);
              }
            }}
            className="mt-3 min-h-12 px-6 rounded-full border text-[14px] font-semibold disabled:opacity-60"
            style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)", background: "transparent" }}
          >
            Send note to {eaFirst}
          </button>
        </div>
      ) : (
        <Italic center className="mt-6">
          Passed along to {eaFirst}.
        </Italic>
      )}
    </div>
  );
}

// ── Locked register pieces ───────────────────────────────────────────────────

function Head({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <h1
      className={`text-[26px] leading-tight font-semibold ${className}`}
      style={{ fontFamily: SERIF, color: "var(--portal-ink)", letterSpacing: "-0.01em" }}
    >
      {children}
    </h1>
  );
}

function Italic({
  children,
  center,
  className = "",
}: {
  children: ReactNode;
  center?: boolean;
  className?: string;
}) {
  return (
    <p
      className={`text-[14px] leading-relaxed ${center ? "text-center" : ""} ${className}`}
      style={{ fontFamily: SERIF, fontStyle: "italic", color: "var(--muted-foreground)" }}
    >
      {children}
    </p>
  );
}

function IconCircle({ children }: { children: ReactNode }) {
  return (
    <span
      className="mx-auto size-14 rounded-full grid place-items-center"
      style={{ background: "var(--mint-tint, #e7f2ea)" }}
    >
      {children}
    </span>
  );
}

/** Renders only on the exec's first-ever action (the action that wrote consent). */
function ConsentFootnote({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="mt-8 text-[11.5px]" style={{ color: "var(--muted-foreground)" }}>
      By continuing you accept TheGoodIntro&rsquo;s{" "}
      <a
        href="https://thegoodintro.com/terms"
        className="underline underline-offset-2"
        style={{ color: "var(--muted-foreground)" }}
      >
        Terms
      </a>
      .
    </p>
  );
}
