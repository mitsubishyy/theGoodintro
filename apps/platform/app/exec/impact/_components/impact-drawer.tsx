"use client";

import { useEffect, useState } from "react";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { GiftDrawerData } from "../../data";

/**
 * Gift drawer (exec-impact-list lock 2026-06-11). Same drawer-as-detail pattern
 * as Meetings; gift-specific eyebrow ("Gift sent"), a soft-green Released accent
 * bar, and footer CTAs: Primary "Learn about [charity]" (opens the locked
 * charity detail modal — deferred placeholder until the charity-content schema
 * lands) and Ghost "Share on LinkedIn" (one-click share intent). The share copy
 * is a default pending Issy's sign-off.
 *
 * Gift figures are frozen-at-Held (exact), never "approximately".
 */

const SERIF = "var(--font-display), Georgia, serif";
const RELEASED = "oklch(0.78 0.06 155)";
const SITE = "https://thegoodintro.com";

export function ImpactDrawer({ gift, onClose, onLearn }: { gift: GiftDrawerData | null; onClose: () => void; onLearn: (charityId: string) => void }) {
  const [showPitch, setShowPitch] = useState(false);

  useEffect(() => {
    if (!gift) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gift, onClose]);

  if (!gift) return null;
  const shareHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE)}&text=${encodeURIComponent(gift.shareText)}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      <div
        className="absolute inset-0"
        style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      />

      <div className="relative h-full w-full max-w-[540px] overflow-y-auto border-l" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
        <div className="h-[3px] w-full" style={{ background: RELEASED }} />

        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 opacity-60 hover:opacity-100" style={{ color: "var(--muted-foreground)" }}>
          <Icon name="x" size={20} />
        </button>

        {/* Header */}
        <div className="px-7 pt-8">
          <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Gift sent
          </p>
          <div className="mt-4">
            <Avatar name={gift.name} src={gift.photoUrl ?? undefined} size={64} />
          </div>
          <h2 className="mt-5 text-[28px] font-semibold leading-tight tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
            {gift.name}
          </h2>
          <p className="mt-1 text-[14px]" style={{ color: "var(--muted-foreground)" }}>
            {[gift.role, gift.company].filter(Boolean).join(" · ")}
          </p>
          {gift.credibility && (
            <p className="mt-3 text-[13px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {gift.credibility}
            </p>
          )}
          {gift.linkedinUrl && (
            <a href={gift.linkedinUrl} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
              View {gift.name.split(/\s+/)[0]} on LinkedIn ↗
            </a>
          )}
        </div>

        <div className="mt-7 border-t" style={{ borderColor: "var(--portal-line)" }} />

        {/* Body */}
        <div className="px-7 py-7 flex flex-col gap-8 pb-28">
          <section>
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              When
            </p>
            <p className="mt-2 text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
              {gift.whenLong ?? "Date on record"}
            </p>
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              {gift.durationProvider}
            </p>
            {gift.releasedLine && (
              <p className="mt-3 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                {gift.releasedLine}
              </p>
            )}
          </section>

          <section>
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              Your gift
            </p>
            <div
              className="mt-3 flex items-center gap-4 rounded-xl p-5"
              style={{ background: "color-mix(in oklab, var(--portal-emerald) 6%, white)", border: "1px solid color-mix(in oklab, var(--portal-emerald) 18%, var(--portal-line))" }}
            >
              <GiftLogo name={gift.charityName} />
              <div className="min-w-0">
                <div className="text-[20px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-emerald)" }}>
                  {gift.amount} to {gift.charityName}
                </div>
                <div className="mt-1 text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
                  {gift.giftStatusLine}
                </div>
              </div>
            </div>
            <p className="mt-3 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              Frozen at Held · no longer editable.
            </p>
          </section>

          {(gift.q1 || gift.q2) && (
            <section>
              <div className="rounded-xl border p-4" style={{ borderColor: "var(--portal-line)", background: showPitch ? "var(--portal-card-hover)" : "var(--portal-card-reading)" }}>
                <button type="button" onClick={() => setShowPitch((v) => !v)} className="flex w-full items-center justify-between">
                  <span className="text-[13px] italic" style={{ color: "var(--portal-ink)" }}>
                    {showPitch ? "Hide what they wanted to discuss" : "Show what they wanted to discuss"}
                  </span>
                  <Icon name={showPitch ? "chevron-up" : "chevron-down"} size={12} style={{ color: "var(--muted-foreground)" }} />
                </button>
                {showPitch && (
                  <div className="mt-6">
                    <PitchBlock eyebrow="What they wanted to discuss" head={gift.q1Head} body={gift.q1} />
                    <div className="my-6 border-t" style={{ borderColor: "var(--portal-line)" }} />
                    <PitchBlock eyebrow="Why you, specifically" head={gift.q2Head} body={gift.q2} indented />
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sticky footer */}
        <div className="sticky bottom-0 flex gap-3 border-t px-6 py-5" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
          <button
            type="button"
            onClick={() => gift.charityId && onLearn(gift.charityId)}
            className="flex-[2] grid place-items-center h-12 rounded-[10px] text-[13.5px] font-semibold text-white"
            style={{ background: "var(--portal-emerald)" }}
          >
            Learn about {gift.charityName} →
          </button>
          <a
            href={shareHref}
            target="_blank"
            rel="noreferrer"
            className="flex-1 grid place-items-center h-12 rounded-[10px] text-[13.5px] font-semibold"
            style={{ background: "transparent", color: "var(--portal-ink)", border: "1px solid var(--portal-line)" }}
          >
            Share on LinkedIn ↗
          </a>
        </div>
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

function GiftLogo({ name }: { name: string }) {
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 4)
    .join("")
    .toUpperCase();
  return (
    <span className="size-11 shrink-0 grid place-items-center rounded-full text-[14px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}
