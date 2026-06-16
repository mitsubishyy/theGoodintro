"use client";

import { useEffect, useState } from "react";
import { Icon } from "@thegoodintro/ui";
import { getCharityContentAction } from "../actions";
import type { CharityContent } from "../data";

/**
 * Charity DETAIL modal — the locked read-only "Learn about [charity]" surface
 * (exec-dashboard VP4; re-rendered on My charity VP3 + opened from Impact's
 * gift drawer). Content scope is purpose / programmes / where-the-gift-goes +
 * quote / recent stories — NOT credentials (those live on the Direction Card +
 * hero). Sections whose curated content is empty render nothing. Fetches its
 * own content on open via getCharityContentAction (parent keys it by charityId
 * so each open remounts fresh). Backdrop reuses the locked 20% ink + 2px blur.
 *
 * The one allowed mono usage on this surface is the story date prefix.
 */

const SERIF = "var(--font-display), Georgia, serif";

function monoDate(iso: string | null): string {
  if (!iso) return "";
  const mon = new Intl.DateTimeFormat("en-AU", { month: "short", timeZone: "UTC" }).format(new Date(iso)).toUpperCase();
  return `${iso.slice(8, 10)} ${mon}`;
}

export function CharityDetailModal({ charityId, eyebrow = "About this charity", onClose }: { charityId: string | null; eyebrow?: string; onClose: () => void }) {
  const [content, setContent] = useState<CharityContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!charityId) return;
    let active = true;
    getCharityContentAction(charityId).then((c) => {
      if (active) {
        setContent(c);
        setLoading(false);
      }
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      active = false;
      window.removeEventListener("keydown", onKey);
    };
  }, [charityId, onClose]);

  if (!charityId) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4 py-8"
      style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
        {/* Sticky header */}
        <div className="relative shrink-0 border-b px-7 pt-6 pb-5" style={{ borderColor: "var(--portal-line)" }}>
          <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            {eyebrow}
          </p>
          <h2 className="mt-1 text-[24px] font-semibold leading-tight tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
            {content?.name ?? "Charity"}
          </h2>
          {content?.cause && (
            <p className="mt-1 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
              {content.cause}
            </p>
          )}
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 opacity-60 hover:opacity-100" style={{ color: "var(--muted-foreground)" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Scrolling content */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-7 py-16 text-center text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
              Loading…
            </p>
          ) : !content ? (
            <p className="px-7 py-16 text-center text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
              Details aren&apos;t available right now.
            </p>
          ) : (
            <>
              {/* Flush hero (image, or a soft emerald tint band when uncurated) */}
              {content.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={content.heroImageUrl} alt={content.name} className="h-[180px] w-full object-cover" />
              ) : (
                <div className="h-[120px] w-full" style={{ background: "color-mix(in oklab, var(--portal-emerald) 10%, var(--portal-card-hover))" }} />
              )}

              <div className="flex flex-col gap-8 px-7 py-7">
                {content.purpose && (
                  <Section eyebrow="Our purpose" head={`Why ${content.name} exists`}>
                    <Body>{content.purpose}</Body>
                  </Section>
                )}

                {content.programmes.length > 0 && (
                  <Section eyebrow="What the gift supports" head="Programmes on the ground">
                    <div className="mt-1">
                      {content.programmes.map((p, i) => (
                        <div key={p.label + i} className="py-3" style={{ borderTop: i === 0 ? undefined : "1px solid var(--portal-line)" }}>
                          <div className="text-[13px] font-semibold italic" style={{ color: "var(--portal-ink)" }}>
                            {p.label}
                          </div>
                          <p className="mt-1.5 text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                            {p.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                <Section eyebrow="Where each meeting goes" head="What your gift funds">
                  <Body>
                    Every meeting you accept sends a real gift of approximately {content.indicativeAmount} to {content.name}. It supports the work above, where it does the most good.
                  </Body>
                  {content.featuredQuote && (
                    <div className="mt-4 pl-5" style={{ borderLeft: "2px solid var(--portal-emerald)" }}>
                      <p className="text-[16px] italic leading-relaxed" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
                        {content.featuredQuote}
                      </p>
                      {content.featuredQuoteAttribution && (
                        <p className="mt-2 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                          {content.featuredQuoteAttribution}
                        </p>
                      )}
                    </div>
                  )}
                </Section>

                {content.stories.length > 0 && (
                  <Section eyebrow="From the field" head="Recent stories">
                    <div className="mt-1 flex flex-col gap-4">
                      {content.stories.map((s, i) => (
                        <div key={s.headline + i} className="rounded-xl border p-5" style={{ borderColor: "var(--portal-line)" }}>
                          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
                            {monoDate(s.publishedAt)}
                          </div>
                          <div className="mt-2 text-[16px] font-semibold leading-snug" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
                            {s.headline}
                          </div>
                          <p className="mt-2 text-[13px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                            {s.body}
                          </p>
                          {s.url && (
                            <a href={s.url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-[13px] italic hover:underline underline-offset-2" style={{ color: "var(--portal-ink)" }}>
                              Read full story ↗
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky footer */}
        <div className="shrink-0 border-t px-7 py-4" style={{ borderColor: "var(--portal-line)" }}>
          <div className="flex items-center justify-between gap-4">
            <span className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              Verified live against the ACNC DGR register.
            </span>
            <button type="button" onClick={onClose} className="h-11 rounded-full px-7 text-[14px] font-semibold text-white" style={{ background: "var(--portal-emerald)" }}>
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ eyebrow, head, children }: { eyebrow: string; head: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
        {eyebrow}
      </p>
      <h3 className="mt-1 text-[22px] font-semibold leading-snug" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
        {head}
      </h3>
      {children}
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--portal-ink)" }}>
      {children}
    </p>
  );
}
