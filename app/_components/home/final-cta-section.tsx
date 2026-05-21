"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { CALENDLY_URL } from "@/lib/config";

/**
 * Final CTA — giant headline with floating charity bubbles around it. Each
 * bubble has its own `dx` / `dy` magnitude; scroll position drives a small
 * translate so the bubbles drift relative to scroll progress through the
 * section.
 *
 * The bubbles are rendered as honest placeholders (charity wordmarks on
 * cream/mint discs) until real partner photography is available.
 */

type Bubble = {
  size: number;
  mint?: boolean;
  position: { left?: string; right?: string; top?: string; bottom?: string };
  dy: number;
  dx: number;
  label: React.ReactNode;
  hideSm?: boolean;
};

const BUBBLES: Bubble[] = [
  {
    size: 140,
    position: { left: "4%", top: "18%" },
    dy: -12,
    dx: 4,
    label: (
      <>
        Beyond
        <br />
        Blue
      </>
    ),
  },
  {
    size: 110,
    mint: true,
    position: { left: "9%", top: "62%" },
    dy: 9,
    dx: -3,
    label: "OzHarvest",
  },
  {
    size: 100,
    position: { right: "5%", top: "28%" },
    dy: -10,
    dx: -5,
    label: "RFDS",
  },
  {
    size: 130,
    mint: true,
    position: { right: "9%", top: "60%" },
    dy: 11,
    dx: 3,
    label: (
      <>
        The Smith
        <br />
        Family
      </>
    ),
  },
  {
    size: 90,
    hideSm: true,
    position: { left: "14%", bottom: "8%" },
    dy: -6,
    dx: 6,
    label: "Lifeline",
  },
  {
    size: 165,
    mint: true,
    hideSm: true,
    position: { right: "14%", top: "5%" },
    dy: 12,
    dx: -6,
    label: (
      <>
        Cancer
        <br />
        Council
      </>
    ),
  },
];

export default function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const bubbles = section.querySelectorAll<HTMLDivElement>(".hp-cta-bubble");
    if (!bubbles.length) return;

    let rafId = 0;
    const update = () => {
      rafId = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // 0 = section bottom just above viewport top, 1 = section top just
      // below viewport bottom, 0.5 = section centred.
      const raw = (vh - rect.top) / (vh + rect.height);
      const p = Math.min(1, Math.max(0, raw));
      const offset = (p - 0.5) * 2; // -1 to 1
      bubbles.forEach((b) => {
        const dy = parseFloat(b.dataset.dy ?? "0") * offset;
        const dx = parseFloat(b.dataset.dx ?? "0") * offset;
        b.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    };
    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section
      className="hp-cta-section"
      id="apply"
      aria-labelledby="cta-heading"
      ref={sectionRef}
    >
      <div className="hp-cta-bubbles" aria-hidden="true">
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className={
              "hp-cta-bubble" +
              (b.mint ? " hp-cta-bubble--mint" : "") +
              (b.hideSm ? " hp-cta-bubble--hide-sm" : "")
            }
            style={{
              width: b.size,
              height: b.size,
              ...b.position,
            }}
            data-dy={b.dy}
            data-dx={b.dx}
          >
            <span className="hp-cta-bubble-wm">{b.label}</span>
          </div>
        ))}
      </div>

      <div className="hp-cta-content">
        <span className="hp-eyebrow">
          <span className="dot" aria-hidden="true" />
          Take action
        </span>
        <h2 className="hp-cta-heading" id="cta-heading">
          Join us in{" "}
          <span className="hp-serif-italic">making a difference</span>.
        </h2>
        <div className="hp-cta-row">
          <a className="hp-btn-primary" href={CALENDLY_URL}>
            <span className="pulse" aria-hidden="true" />
            Apply as an executive
          </a>
          <Link className="hp-btn-ghost" href="/how-it-works">
            Learn more
            <span className="circle" aria-hidden="true">
              <svg viewBox="0 0 14 14" fill="none">
                <path
                  d="M3 11 L11 3 M5 3 H11 V9"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
