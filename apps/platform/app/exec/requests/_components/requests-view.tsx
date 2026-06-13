"use client";

import { useState } from "react";
import Link from "next/link";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { ExecRequestsData, RequestCardData } from "../../data";
import { DeclineRequestModal } from "../../_components/decline-request-modal";

/**
 * Exec Incoming Requests — the all-pending batch review surface
 * (design/locked/exec-incoming-requests, LOCKED 2026-06-09; route /exec/requests).
 * The locked twin of the request email (design/locked/exec-request-email): the
 * SAME request rendered as a portal card; the Q1/Q2 heads + bodies must never
 * drift from the email. Editorial concierge register: Fraunces heads, italic
 * muted eyebrows, plain italic status, single emerald accent, hairlines not
 * shadows, no pills, no mono, "·" separators.
 *
 * READ surface. The three locked actions render per the lock, but the live
 * accept/decline/forward MUTATION is the consent-gated Phase-2 state-machine
 * work (act_on_request_token is token-bound; the executive-actor + logged-in
 * consent model is deliberately a later migration — see migration 0011 and the
 * VP1 dashboard commit). Until it lands the actions surface an honest notice
 * rather than faking a state change; the locked decline modal is shown so the
 * full flow can be signed off.
 *
 * GIFT FIGURE: rendered "approximately $N" per the request-email lock anti-list
 * (2026-06-12: "the gift is ALWAYS approximately $X ... in any email or page"),
 * which post-dates this screen's flat "$N" mockup. Flagged to Issy at port.
 */

const SERIF = "var(--font-display), Georgia, serif";
const DEFER_NOTICE =
  "This is the review surface. Accept, decline, and forward go live with executive sign-in.";

const Q1_EYEBROW = "What they want to discuss";
const Q2_EYEBROW = "Why you, specifically";

export function ExecRequestsView({ data }: { data: ExecRequestsData }) {
  const [declining, setDeclining] = useState<RequestCardData | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  if (data.count === 0) {
    return (
      <div>
        <BackRow />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <BackRow />

      {/* Page hero — plain Fraunces ink, no emerald highlight (locked anti-list). */}
      <h1
        className="mt-12 text-center text-[48px] font-semibold leading-[1.05] tracking-tight"
        style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}
      >
        {data.countWord} {data.count === 1 ? "request" : "requests"}
      </h1>

      {/* 32px below the hero; 24px between cards. */}
      <div className="mt-8 flex flex-col gap-6">
        {data.cards.map((card) => (
          <RequestCard
            key={card.id}
            card={card}
            eaFirstName={data.eaFirstName}
            onAccept={() => setNotice(DEFER_NOTICE)}
            onDecline={() => setDeclining(card)}
            onForward={() => setNotice(DEFER_NOTICE)}
          />
        ))}
      </div>

      <UpToDateFooter />

      <DeclineRequestModal
        open={declining !== null}
        requesterFirst={declining?.requesterFirst ?? ""}
        onCancel={() => setDeclining(null)}
        onDecline={() => {
          setDeclining(null);
          setNotice(DEFER_NOTICE);
        }}
      />

      {notice && <Notice text={notice} onClose={() => setNotice(null)} />}
    </div>
  );
}

// ── Back row (portal blueprint §2) ───────────────────────────────────────────

function BackRow() {
  return (
    <Link
      href="/exec"
      className="inline-flex items-center gap-2 -ml-1.5 px-1.5 py-1 rounded-md text-[14px] font-semibold hover:bg-[var(--portal-card-hover)]"
      style={{ color: "var(--portal-ink)" }}
    >
      <Icon name="chevron-left" size={24} />
      Back
    </Link>
  );
}

// ── Request card — single-request-detail anatomy (locked 2026-06-09) ─────────

function RequestCard({
  card,
  eaFirstName,
  onAccept,
  onDecline,
  onForward,
}: {
  card: RequestCardData;
  eaFirstName: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onForward: () => void;
}) {
  return (
    <article
      className="mx-auto w-full max-w-[960px] rounded-2xl border p-8"
      style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
    >
      {/* Two-column section: 280px left rail · 1px hairline · flex right column. */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1px_minmax(0,1fr)]">
        {/* LEFT RAIL */}
        <div>
          {/* Identity */}
          <div className="flex items-start gap-3">
            <Avatar name={card.name} src={card.photoUrl ?? undefined} size={48} />
            <div className="min-w-0">
              <div className="text-[15px] font-semibold leading-tight" style={{ color: "var(--portal-ink)" }}>
                {card.name}
              </div>
              <div className="mt-0.5 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
                {[card.role, card.company].filter(Boolean).join(" · ")}
              </div>
            </div>
          </div>
          {card.credibility && (
            <p className="mt-3 text-[13px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {card.credibility}
            </p>
          )}
          {card.linkedinUrl && (
            <a
              href={card.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[13px] hover:underline underline-offset-2"
              style={{ color: "var(--portal-emerald)" }}
            >
              View {card.requesterFirst} on LinkedIn ↗
            </a>
          )}

          <Hairline className="my-5" />

          {/* Proposed time — degraded honestly: proposed_at is not in schema yet. */}
          <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Proposed time
          </p>
          <p className="mt-1 text-[16px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
            To be confirmed
          </p>
          <p className="mt-0.5 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            {card.durationLabel} · we confirm the time with you
          </p>
          {card.submittedLabel && (
            <p className="mt-2 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              Submitted {card.submittedLabel}.
            </p>
          )}

          <Hairline className="my-5" />

          {/* Verification — degraded: granular vendor verification columns pending. */}
          <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Verification
          </p>
          {card.founderReviewed && (
            <div className="mt-2 flex items-center gap-2 text-[13px]" style={{ color: "var(--portal-ink)" }}>
              <Icon name="check" size={16} style={{ color: "var(--portal-emerald)" }} />
              Founder reviewed
            </div>
          )}
          <p className="mt-2 text-[12px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            ABN, references, and LinkedIn detail arrive with vendor onboarding.
          </p>
        </div>

        {/* VERTICAL HAIRLINE (spans the two-column section height only) */}
        <div className="hidden md:block" style={{ background: "var(--portal-line)" }} />

        {/* RIGHT COLUMN — Q1 then Q2 */}
        <div className="min-w-0">
          <QBlock eyebrow={Q1_EYEBROW} head={card.q1Head} body={card.q1} />
          <Hairline className="my-8" />
          <QBlock eyebrow={Q2_EYEBROW} head={card.q2Head} body={card.q2} indented />
        </div>
      </div>

      {/* FULL-WIDTH hairline below both columns */}
      <Hairline className="mt-8" />

      {/* GIFT BLOCK */}
      <div className="mt-8">
        <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
          If you accept
        </p>
        <div className="mt-2.5 flex items-center gap-4">
          <CharityLogo name={card.charityName} src={card.charityLogoUrl} />
          <div className="min-w-0">
            <div className="text-[20px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-emerald)" }}>
              approximately {card.amount} to {card.charityName}
            </div>
            <div className="mt-1 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
              Your standing nomination
            </div>
          </div>
        </div>
        <p className="mt-3 text-[13px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          You can direct this individual meeting to a different DGR-endorsed charity after it is confirmed.
        </p>
      </div>

      {/* ACTION ROW — three buttons, equal flex, 48px tall (named EA or nothing). */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <ActionButton tone="primary" onClick={onAccept}>
          Accept this meeting
        </ActionButton>
        <ActionButton tone="ghost" onClick={onDecline}>
          Decline
        </ActionButton>
        {eaFirstName && (
          <ActionButton tone="ghost" onClick={onForward}>
            Forward to {eaFirstName} (EA)
          </ActionButton>
        )}
      </div>
    </article>
  );
}

function QBlock({ eyebrow, head, body, indented }: { eyebrow: string; head: string | null; body: string; indented?: boolean }) {
  return (
    <div>
      <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
        {eyebrow}
      </p>
      <div
        className={indented ? "mt-2 pl-4" : "mt-2"}
        style={indented ? { borderLeft: "2px solid var(--portal-emerald)" } : undefined}
      >
        {head && (
          <h3 className="text-[18px] font-semibold leading-snug" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
            {head}
          </h3>
        )}
        <p className={`${head ? "mt-2" : ""} text-[14px] leading-relaxed`} style={{ color: "var(--portal-ink)" }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function CharityLogo({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={48} height={48} className="size-12 shrink-0 rounded-full object-cover" style={{ border: "1px solid var(--portal-line)" }} />;
  }
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return (
    <span
      className="size-12 shrink-0 grid place-items-center rounded-full text-[15px] font-semibold"
      style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}
    >
      {mark}
    </span>
  );
}

function ActionButton({ tone, onClick, children }: { tone: "primary" | "ghost"; onClick: () => void; children: React.ReactNode }) {
  const style =
    tone === "primary"
      ? { background: "var(--portal-emerald)", color: "#fff", border: "1px solid var(--portal-emerald)" }
      : { background: "transparent", color: "var(--portal-ink)", border: "1px solid var(--portal-line)" };
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-12 flex-1 rounded-[10px] text-[14px] font-semibold"
      style={style}
    >
      {children}
    </button>
  );
}

// ── Footer / empty state ─────────────────────────────────────────────────────

function UpToDateFooter() {
  return (
    <footer className="mt-12 pb-[72px] text-center">
      <p className="text-[20px] italic" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
        You&apos;re all caught up.
      </p>
      <p className="mt-2 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
        Nothing else awaiting your answer. We pace your queue so nothing piles up.
      </p>
    </footer>
  );
}

function EmptyState() {
  // VP2 — the ONLY sanctioned emoji in the whole portal (Issy approved 🎉 for
  // this empty state on 2026-06-09; do NOT propagate or swap it).
  return (
    <div className="grid place-items-center pt-[18vh] text-center">
      <div className="max-w-[520px]">
        <div className="text-[56px] leading-none" role="img" aria-label="Celebration">
          🎉
        </div>
        <p className="mt-8 text-[40px] font-semibold italic leading-tight tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          You&apos;re all caught up.
        </p>
        <p className="mt-4 text-[14px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          Nothing else awaiting your answer. We pace your queue so nothing piles up.
        </p>
      </div>
    </div>
  );
}

// ── Shared ───────────────────────────────────────────────────────────────────

function Hairline({ className = "" }: { className?: string }) {
  return <div className={`border-t ${className}`} style={{ borderColor: "var(--portal-line)" }} />;
}

/**
 * Honest build-state notice for the deferred live actions (not part of the
 * locked chrome). Removed when the consent-gated Phase-2 backend lands.
 */
function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div
        className="flex items-center gap-3 rounded-full border px-5 py-3 text-[13px] shadow-sm"
        style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
      >
        <span className="italic">{text}</span>
        <button type="button" onClick={onClose} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100">
          <Icon name="x" size={16} />
        </button>
      </div>
    </div>
  );
}
