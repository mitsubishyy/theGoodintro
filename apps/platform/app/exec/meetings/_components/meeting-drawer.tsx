"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { MeetingDrawerData, MeetingStatusDisplay } from "../../data";

/**
 * Meeting drawer — the detail surface (exec-meetings-list lock 2026-06-10). A
 * standalone /exec/meetings/[id] page is explicitly killed by the lock; the
 * 540px right slide-over IS the detail. Backdrop reuses the locked exec
 * dashboard charity-picker pattern (20% ink + 2px blur). Status-aware accent
 * bar, eyebrow, and sticky footer. Pitch context is a collapsible defaulting
 * closed. "Request reschedule" is a deferred admin-task action (surfaced as an
 * honest notice until that backend lands).
 *
 * Money: held meetings show the EXACT frozen gift; confirmed show the projected
 * "approximately $N" (giftApprox) — the money-rule resolution applied portal-wide.
 */

const SERIF = "var(--font-display), Georgia, serif";

function statusColor(s: MeetingStatusDisplay): string {
  return s === "held"
    ? "oklch(0.78 0.06 155)"
    : s === "cancelled"
      ? "color-mix(in oklch, var(--portal-ink) 30%, transparent)"
      : "var(--portal-emerald)";
}

export function MeetingDrawer({ meeting, onClose, onReschedule }: { meeting: MeetingDrawerData | null; onClose: () => void; onReschedule: () => void }) {
  const [showPitch, setShowPitch] = useState(false);

  useEffect(() => {
    if (!meeting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [meeting, onClose]);

  if (!meeting) return null;
  const accent = statusColor(meeting.statusDisplay);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      {/* Backdrop — same as the locked charity-picker modal backdrop. */}
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
        {/* 3px status accent bar */}
        <div className="h-[3px] w-full" style={{ background: accent }} />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-6 top-6 opacity-60 hover:opacity-100"
          style={{ color: "var(--muted-foreground)" }}
        >
          <Icon name="x" size={20} />
        </button>

        {/* Header */}
        <div className="px-7 pt-8">
          <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            {meeting.eyebrow}
          </p>
          <div className="mt-4">
            <Avatar name={meeting.name} src={meeting.photoUrl ?? undefined} size={64} />
          </div>
          <h2 className="mt-5 text-[28px] font-semibold leading-tight tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
            {meeting.name}
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            {[meeting.role, meeting.company].filter(Boolean).join(" · ")}
          </p>
          {meeting.credibility && (
            <p className="mt-3 text-[13px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {meeting.credibility}
            </p>
          )}
          {meeting.linkedinUrl && (
            <a
              href={meeting.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-[13px] italic hover:underline underline-offset-2"
              style={{ color: "var(--portal-ink)" }}
            >
              View {meeting.name.split(/\s+/)[0]} on LinkedIn ↗
            </a>
          )}
        </div>

        <div className="mt-7 border-t" style={{ borderColor: "var(--portal-line)" }} />

        {/* Body */}
        <div className="px-7 py-7 flex flex-col gap-8 pb-28">
          {/* When */}
          <section>
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              When
            </p>
            <p className="mt-2 text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
              {meeting.whenLong ?? "To be confirmed"}
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              {meeting.durationProvider}
            </p>
            {meeting.acceptedLine && (
              <p className="mt-3 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                {meeting.acceptedLine}
              </p>
            )}
          </section>

          {/* Your gift */}
          <section>
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              Your gift
            </p>
            <div
              className="mt-3 flex items-center gap-4 rounded-xl p-5"
              style={{
                background: "color-mix(in oklab, var(--portal-emerald) 6%, white)",
                border: "1px solid color-mix(in oklab, var(--portal-emerald) 18%, var(--portal-line))",
              }}
            >
              <GiftLogo name={meeting.charityName} src={meeting.charityLogoUrl} />
              <div className="min-w-0">
                <div className="text-[20px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-emerald)" }}>
                  {meeting.giftApprox ? "approximately " : ""}
                  {meeting.giftAmount} to {meeting.charityName}
                </div>
                <div className="mt-1 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                  {meeting.isOverride ? `For this meeting only · Your standing nomination (${meeting.standingCharityName}) stays` : "Your standing nomination"}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              {meeting.giftHelper}
            </p>
          </section>

          {/* Pitch context (collapsible, defaults closed) */}
          {(meeting.q1 || meeting.q2) && (
            <section>
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--portal-line)", background: showPitch ? "var(--portal-card-hover)" : "var(--portal-card-reading)" }}>
                <button type="button" onClick={() => setShowPitch((v) => !v)} className="flex w-full items-center justify-between">
                  <span className="text-[13px] italic" style={{ color: "var(--portal-ink)" }}>
                    {showPitch ? "Hide pitch context" : "Show pitch context"}
                  </span>
                  <Icon name={showPitch ? "chevron-up" : "chevron-down"} size={12} style={{ color: "var(--muted-foreground)" }} />
                </button>
                {showPitch && (
                  <div className="mt-6">
                    <PitchBlock eyebrow="What they want to discuss" head={meeting.q1Head} body={meeting.q1} />
                    <div className="my-6 border-t" style={{ borderColor: "var(--portal-line)" }} />
                    <PitchBlock eyebrow="Why you, specifically" head={meeting.q2Head} body={meeting.q2} indented />
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sticky footer — status-aware */}
        {meeting.statusDisplay !== "cancelled" && (
          <div
            className="sticky bottom-0 flex gap-3 border-t px-6 py-5"
            style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
          >
            {meeting.statusDisplay === "confirmed" ? (
              <>
                {meeting.joinUrl ? (
                  <a
                    href={meeting.joinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-[2] grid place-items-center h-12 rounded-[10px] text-[13.5px] font-semibold text-white"
                    style={{ background: "var(--portal-emerald)" }}
                  >
                    Join meeting in {meeting.provider}
                  </a>
                ) : (
                  <span className="flex-[2] grid place-items-center h-12 rounded-[10px] text-[13.5px] italic" style={{ color: "var(--muted-foreground)", border: "1px solid var(--portal-line)" }}>
                    Join link to come
                  </span>
                )}
                <button
                  type="button"
                  onClick={onReschedule}
                  className="flex-1 h-12 rounded-[10px] text-[13.5px] font-semibold"
                  style={{ background: "transparent", color: "var(--portal-ink)", border: "1px solid var(--portal-line)" }}
                >
                  Request reschedule
                </button>
              </>
            ) : (
              <Link
                href={`/exec/impact#gift_${meeting.id}`}
                className="flex-1 grid place-items-center h-12 rounded-[10px] text-[13.5px] font-semibold text-white"
                style={{ background: "var(--portal-emerald)" }}
              >
                View charity impact
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PitchBlock({ eyebrow, head, body, indented }: { eyebrow: string; head: string | null; body: string; indented?: boolean }) {
  return (
    <div>
      <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
        {eyebrow}
      </p>
      {head && (
        <h3 className="mt-1.5 text-[17px] font-semibold leading-snug" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
          {head}
        </h3>
      )}
      <div className={indented ? "mt-3 pl-4" : "mt-3"} style={indented ? { borderLeft: "2px solid var(--portal-emerald)" } : undefined}>
        <p className="text-[14px] leading-relaxed" style={{ color: "var(--portal-ink)" }}>
          {body}
        </p>
      </div>
    </div>
  );
}

function GiftLogo({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={44} height={44} className="size-11 shrink-0 rounded-full object-cover" style={{ border: "1px solid var(--portal-line)" }} />;
  }
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return (
    <span className="size-11 shrink-0 grid place-items-center rounded-full text-[14px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}
