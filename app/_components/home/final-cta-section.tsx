"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Final CTA — illustrative executive avatar bubbles drift around the headline.
 *
 * Two motions add per frame:
 *   - drift = scroll-tied parallax based on section position in viewport
 *   - float = continuous sine-wave wander on each bubble's own phase
 * Together they give a "calmly alive" composition that keeps moving even when
 * the user has stopped scrolling.
 *
 * Avatars use DiceBear Lorelei (same library used in /mockup/email). Names and
 * roles are illustrative founding-cohort placeholders — disclaimer line below
 * the buttons makes that explicit.
 */

type Bubble = {
  size: number;
  position: { left?: string; right?: string; top?: string; bottom?: string };
  dy: number;
  dx: number;
  name: string;
  role: string;
  hideSm?: boolean;
};

const BUBBLES: Bubble[] = [
  {
    size: 140,
    position: { left: "4%", top: "16%" },
    dy: -36,
    dx: 12,
    name: "Sarah Chen",
    role: "CFO · ASX 200 industrials",
  },
  {
    size: 110,
    position: { left: "10%", top: "50%" },
    dy: 28,
    dx: -9,
    name: "Michael Reed",
    role: "COO · regional bank",
  },
  {
    size: 100,
    position: { right: "5%", top: "26%" },
    dy: -30,
    dx: -15,
    name: "Priya Patel",
    role: "CFO · Series B fintech",
  },
  {
    size: 130,
    position: { right: "9%", top: "58%" },
    dy: 34,
    dx: 10,
    name: "James Walker",
    role: "MD · healthcare group",
  },
  {
    size: 90,
    hideSm: true,
    position: { left: "22%", bottom: "4%" },
    dy: -20,
    dx: 18,
    name: "Emma Taylor",
    role: "COO · ASX 100 logistics",
  },
  {
    size: 165,
    hideSm: true,
    position: { right: "14%", top: "4%" },
    dy: 36,
    dx: -18,
    name: "Dan Sullivan",
    role: "CFO · infrastructure",
  },
];

const DICEBEAR_BG = "F4ECDC,E7DBC2,D8E6D4,E3D8C1";

function avatarUrl(name: string) {
  const u = new URL("https://api.dicebear.com/9.x/lorelei/svg");
  u.searchParams.set("seed", name);
  u.searchParams.set("backgroundColor", DICEBEAR_BG);
  u.searchParams.set("backgroundType", "solid");
  u.searchParams.set("radius", "50");
  return u.toString();
}

export default function FinalCtaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    // The floating bubbles are hidden under 760px (see globals.css), so there's
    // nothing to animate on mobile — skip the scroll-drift + float loop there.
    if (window.matchMedia("(max-width: 760px)").matches) return;

    const bubbles = Array.from(
      section.querySelectorAll<HTMLDivElement>(".hp-cta-bubble")
    );
    if (!bubbles.length) return;

    const TAU = Math.PI * 2;
    // Per-bubble float parameters — irrational ratios keep them from
    // synchronising into a throb.
    interface BubbleEl extends HTMLDivElement {
      _phaseY: number;
      _phaseX: number;
      _periodY: number;
      _periodX: number;
      _ampY: number;
      _ampX: number;
    }
    bubbles.forEach((b, i) => {
      const bx = b as BubbleEl;
      bx._phaseY = (i * 1.37) % TAU;
      bx._phaseX = (i * 0.91 + 1.2) % TAU;
      bx._periodY = 7000 + i * 850;
      bx._periodX = 9000 + i * 730;
      bx._ampY = 6 + (i % 3) * 2;
      bx._ampX = 4 + ((i + 1) % 3) * 2;
    });

    let scrollOffset = 0;
    let inView = false;
    let rafScroll = 0;
    let stepId = 0;

    const computeScroll = () => {
      rafScroll = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const raw = (vh - rect.top) / (vh + rect.height);
      const p = Math.min(1, Math.max(0, raw));
      scrollOffset = (p - 0.5) * 2;
      inView = rect.bottom > -200 && rect.top < vh + 200;
    };
    const onScroll = () => {
      if (!rafScroll) rafScroll = requestAnimationFrame(computeScroll);
    };

    const step = (now: number) => {
      if (inView) {
        bubbles.forEach((b) => {
          const bx = b as BubbleEl;
          const sx = parseFloat(b.dataset.dx ?? "0") * scrollOffset;
          const sy = parseFloat(b.dataset.dy ?? "0") * scrollOffset;
          const fx = Math.sin((now / bx._periodX) * TAU + bx._phaseX) * bx._ampX;
          const fy = Math.sin((now / bx._periodY) * TAU + bx._phaseY) * bx._ampY;
          b.style.transform = `translate3d(${sx + fx}px, ${sy + fy}px, 0)`;
        });
      }
      stepId = requestAnimationFrame(step);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    computeScroll();
    stepId = requestAnimationFrame(step);
    const onLoad = () => onScroll();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onLoad);
      if (rafScroll) cancelAnimationFrame(rafScroll);
      if (stepId) cancelAnimationFrame(stepId);
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
              "hp-cta-bubble" + (b.hideSm ? " hp-cta-bubble--hide-sm" : "")
            }
            style={{
              width: b.size,
              ...b.position,
            }}
            data-dy={b.dy}
            data-dx={b.dx}
          >
            <div className="hp-cta-bubble-avatar">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" loading="lazy" src={avatarUrl(b.name)} />
            </div>
            <div className="hp-cta-bubble-caption">
              <span className="hp-cta-bubble-name">{b.name}</span>
              <span className="hp-cta-bubble-role">{b.role}</span>
            </div>
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
          <a className="hp-btn-primary">
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
        <p className="hp-cta-disclaimer">
          Illustrative founding-cohort placeholders. Real names with permission,
          on launch.
        </p>
      </div>
    </section>
  );
}
