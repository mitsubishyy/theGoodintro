"use client";

import { useEffect, useRef } from "react";

/**
 * Pinned scroll-scrub impact section.
 *
 * The outer .hp-impact-scroll is 300vh tall; the inner .hp-impact-pinned uses
 * position: sticky to stay glued to the viewport across that runway. Scroll
 * progress through the runway drives a single rAF-coalesced update that touches
 * only transform + opacity on the animated elements — keeps the scrub silky.
 *
 * Timeline (0–1 across the 300vh runway):
 *   0.00 – 0.12  Stat 1 counter runs $24,000 → $80,000
 *   0.20 – 0.40  Oat arch (1) rises behind stat 1
 *   0.29 – 0.31  Stat 1 → Stat 2 cross-fade
 *   0.40 – 0.52  Stat 2 shows the 10:1 ratio (static, no counter)
 *   0.60 – 0.80  Warm-white arch (2) rises behind stat 2
 *   0.69 – 0.71  Stat 2 → Stat 3 (map) cross-fade
 *   0.80 – 1.00  Map outline visible + four pins drop in (staggered, scrubbable)
 *
 * Reduced motion: render final state with no scrub or scroll listener.
 */

const CITIES = [
  { id: "sydney", label: "Sydney", x: 895, y: 553, labelX: 912, labelY: 558, anchor: "start" as const },
  { id: "melbourne", label: "Melbourne", x: 758, y: 660, labelX: 758, labelY: 708, anchor: "middle" as const },
  { id: "brisbane", label: "Brisbane", x: 935, y: 411, labelX: 952, labelY: 416, anchor: "start" as const },
  { id: "perth", label: "Perth", x: 124, y: 511, labelX: 110, labelY: 516, anchor: "end" as const },
];

const CITY_ORDER = ["sydney", "melbourne", "brisbane", "perth"] as const;

export default function ImpactSection() {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const num1Ref = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const arch1 = container.querySelector<SVGElement>(".hp-impact-arch-1");
    const arch2 = container.querySelector<SVGElement>(".hp-impact-arch-2");
    const layer1 = container.querySelector<HTMLElement>('.hp-stage-layer[data-state="1"]');
    const layer2 = container.querySelector<HTMLElement>('.hp-stage-layer[data-state="2"]');
    const layer3 = container.querySelector<HTMLElement>('.hp-stage-layer[data-state="3"]');
    const pinWraps = Array.from(
      container.querySelectorAll<SVGGElement>(".map-pin-wrap")
    );
    const labels = Array.from(
      container.querySelectorAll<SVGTextElement>(".map-label")
    );

    if (!arch1 || !arch2 || !layer1 || !layer2 || !layer3) return;

    pinWraps.forEach((w) => {
      const m = (w.getAttribute("transform") || "").match(
        /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/
      );
      w.dataset.x = m ? m[1] : "0";
      w.dataset.y = m ? m[2] : "0";
    });

    const fmtDollar = (v: number) => "$" + v.toLocaleString("en-AU");
    const clamp = (v: number, a: number, b: number) =>
      Math.min(b, Math.max(a, v));
    const smoothstep = (x: number, a: number, b: number) => {
      const t = clamp((x - a) / (b - a), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const easeOutBack = (t: number) => {
      const c = 1.70158 + 1;
      return 1 + c * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
    };

    if (reduce) {
      if (num1Ref.current) num1Ref.current.textContent = fmtDollar(80000);
      layer1.style.opacity = "1";
      layer2.style.opacity = "1";
      layer3.style.opacity = "1";
      pinWraps.forEach((w) => {
        w.setAttribute("transform", `translate(${w.dataset.x}, ${w.dataset.y})`);
        const pin = w.querySelector<SVGGElement>(".map-pin");
        if (pin) pin.style.opacity = "1";
      });
      labels.forEach((l) => {
        l.style.opacity = "1";
      });
      return;
    }

    // Initial pre-scrub state.
    arch1.style.transform = "translate3d(0, 100%, 0)";
    arch2.style.transform = "translate3d(0, 100%, 0)";
    layer1.style.opacity = "1";
    layer2.style.opacity = "0";
    layer3.style.opacity = "0";
    pinWraps.forEach((w) => {
      const x = w.dataset.x ?? "0";
      const y = parseFloat(w.dataset.y ?? "0");
      w.setAttribute("transform", `translate(${x}, ${y - 90})`);
      const pin = w.querySelector<SVGGElement>(".map-pin");
      if (pin) pin.style.opacity = "0";
    });
    labels.forEach((l) => {
      l.style.opacity = "0";
    });

    let rafId = 0;
    let lastP = -1;

    const update = () => {
      rafId = 0;
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const scrolled = -rect.top;
      const max = rect.height - vh;
      const p = max > 0 ? clamp(scrolled / max, 0, 1) : 0;

      if (Math.abs(p - lastP) < 0.0008) return;
      lastP = p;

      // Stat 1 ($) counter scrubs linearly (clamped) to a quick finish so the
      // user spends most of the phase on the final value, not waiting for it.
      // It starts at 30% of its final value so the user never sees $0. Stat 2
      // is the static 10:1 ratio, so it has no counter.
      const s1 = clamp(p / 0.12, 0, 1);
      const v1 = 0.3 + 0.7 * s1;
      if (num1Ref.current)
        num1Ref.current.textContent = fmtDollar(Math.round(80000 * v1));

      // Arches rise — translate3d only, no width/height churn.
      const a1 = clamp((p - 0.2) / 0.2, 0, 1);
      arch1.style.transform = `translate3d(0, ${(1 - a1) * 100}%, 0)`;
      const a2 = clamp((p - 0.6) / 0.2, 0, 1);
      arch2.style.transform = `translate3d(0, ${(1 - a2) * 100}%, 0)`;

      // Layer cross-fades happen at the moment each arch reaches the
      // centred number (~50% rise), not at full cover — feels instant.
      const fade12 = smoothstep(p, 0.29, 0.31);
      const fade23 = smoothstep(p, 0.69, 0.71);
      layer1.style.opacity = String(1 - fade12);
      layer2.style.opacity = String(fade12 * (1 - fade23));
      layer3.style.opacity = String(fade23);

      // Pins each open their own scrub window inside 0.80–1.00.
      for (let i = 0; i < CITY_ORDER.length; i++) {
        const start = 0.8 + i * 0.04;
        const end = start + 0.06;
        const pt = clamp((p - start) / (end - start), 0, 1);
        const eased = easeOutBack(pt);
        const wrap = container.querySelector<SVGGElement>(
          `.map-pin-wrap[data-pin="${CITY_ORDER[i]}"]`
        );
        if (!wrap) continue;
        const tx = parseFloat(wrap.dataset.x ?? "0");
        const ty = parseFloat(wrap.dataset.y ?? "0");
        const yOff = (1 - eased) * -90;
        wrap.setAttribute("transform", `translate(${tx}, ${ty + yOff})`);
        const pin = wrap.querySelector<SVGGElement>(".map-pin");
        if (pin) pin.style.opacity = String(Math.min(1, pt * 4));

        const label = container.querySelector<SVGTextElement>(
          `.map-label[data-label="${CITY_ORDER[i]}"]`
        );
        if (label) {
          const lt = clamp((p - start - 0.02) / 0.03, 0, 1);
          label.style.opacity = String(lt);
        }
      }
    };

    const onScroll = () => {
      if (!rafId) rafId = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    requestAnimationFrame(update);
    const onLoad = () => update();
    window.addEventListener("load", onLoad);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("load", onLoad);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section className="hp-impact-section" id="impact">
      <div className="hp-impact-scroll" ref={scrollRef}>
        <div className="hp-impact-pinned">
          <svg
            className="hp-impact-arch hp-impact-arch-1"
            preserveAspectRatio="none"
            viewBox="0 0 100 130"
            aria-hidden="true"
          >
            <path d="M 0 130 L 0 30 Q 50 -20 100 30 L 100 130 Z" />
          </svg>
          <svg
            className="hp-impact-arch hp-impact-arch-2"
            preserveAspectRatio="none"
            viewBox="0 0 100 130"
            aria-hidden="true"
          >
            <path d="M 0 130 L 0 30 Q 50 -20 100 30 L 100 130 Z" />
          </svg>

          <div className="hp-impact-pinned-content">
            <header className="hp-impact-head">
              <span className="hp-eyebrow">
                <span className="dot" aria-hidden="true" />
                Our founding pledge
              </span>
              <h2 className="hp-impact-title">
                Together, we&rsquo;re making{" "}
                <span className="hp-serif-italic">a difference</span>.
              </h2>
            </header>

            <div className="hp-impact-stage">
              <div className="hp-stage-layer" data-state="1">
                <p className="hp-stage-num" ref={num1Ref}>
                  $80,000
                </p>
                <p className="hp-stage-caption hp-stage-caption--pledge">
                  Founding-year{" "}
                  <span className="hp-serif-italic">goal</span> across
                  DGR-endorsed Australian charities.
                </p>
              </div>

              <div className="hp-stage-layer" data-state="2">
                <p className="hp-stage-num">10:1</p>
                <p className="hp-stage-caption">
                  Executives for every vendor admitted. No leader is ever the
                  whole room.
                </p>
              </div>

              <div className="hp-stage-layer" data-state="3">
                <h3 className="hp-stage-map-heading">
                  Across Australian states.
                </h3>
                <div className="hp-map-wrap">
                  <svg
                    className="hp-panel-map"
                    viewBox="0 0 1000 800"
                    fill="none"
                    aria-hidden="true"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    {/* Mainland — hand-traced outline from the v2 bundle */}
                    <path
                      className="au-outline"
                      d="M 111 565 L 115 530 L 122 510 L 115 480 L 100 450 L 90 420 L 78 395 L 70 382
                         L 75 355 L 82 335 L 88 310 L 89 286 L 105 268 L 130 250 L 160 240 L 187 252
                         L 215 232 L 245 218 L 266 199 L 296 184 L 320 165 L 345 140 L 367 105 L 380 118
                         L 393 138 L 410 132 L 415 125 L 430 110 L 452 78 L 470 72 L 490 78 L 510 70
                         L 530 78 L 555 65 L 580 55 L 583 45 L 590 45 L 595 58 L 593 75 L 583 95
                         L 575 130 L 572 156 L 605 165 L 640 170 L 660 178 L 674 189 L 686 178 L 695 145
                         L 702 100 L 706 38 L 720 48 L 728 78 L 740 108 L 752 138 L 770 165 L 785 195
                         L 800 229 L 815 244 L 832 257 L 852 269 L 870 290 L 881 320 L 905 340 L 922 358
                         L 935 388 L 948 435 L 945 460 L 938 480 L 928 500 L 920 518 L 909 535 L 895 553
                         L 889 564 L 882 582 L 877 600 L 870 620 L 855 638 L 825 658 L 791 668 L 770 660
                         L 760 656 L 745 660 L 728 664 L 712 660 L 695 650 L 680 645 L 660 638 L 645 615
                         L 632 595 L 622 575 L 615 580 L 605 585 L 595 580 L 588 568 L 578 555 L 575 545
                         L 570 558 L 565 568 L 552 568 L 540 558 L 528 540 L 525 525 L 510 515 L 480 510
                         L 440 504 L 411 504 L 380 510 L 350 522 L 320 535 L 291 553 L 265 558 L 235 565
                         L 200 575 L 172 578 L 145 575 L 125 572 L 111 565 Z"
                    />
                    {/* Tasmania */}
                    <path
                      className="au-outline"
                      d="M 758 705 L 832 705 L 833 716 L 826 735 L 820 758 L 808 770 L 790 770 L 770 765 L 762 750 L 760 730 L 758 705 Z"
                    />
                    {/* State borders */}
                    <path
                      className="au-state-border"
                      d="M 413 130 L 413 510"
                    />
                    <path
                      className="au-state-border"
                      d="M 413 378 L 609 378"
                    />
                    <path
                      className="au-state-border"
                      d="M 609 70 L 609 378"
                    />
                    <path
                      className="au-state-border"
                      d="M 674 378 L 674 638"
                    />
                    <path
                      className="au-state-border"
                      d="M 674 444 L 940 444"
                    />
                    <path
                      className="au-state-border"
                      d="M 674 633 L 855 633"
                    />

                    {CITIES.map((c) => (
                      <g
                        key={c.id}
                        className="map-pin-wrap"
                        data-pin={c.id}
                        transform={`translate(${c.x}, ${c.y})`}
                      >
                        <g className="map-pin">
                          <path d="M -1 0 C -10 -10, -10 -22, 0 -30 C 10 -22, 10 -10, 1 0 Z" />
                          <circle cx="0" cy="-20" r="3" />
                        </g>
                      </g>
                    ))}

                    {CITIES.map((c) => (
                      <text
                        key={`label-${c.id}`}
                        className="map-label"
                        data-label={c.id}
                        x={c.labelX}
                        y={c.labelY}
                        textAnchor={c.anchor}
                      >
                        {c.label}
                      </text>
                    ))}
                  </svg>
                </div>
                <p className="hp-stage-caption">
                  Launching across Sydney, Melbourne, Brisbane, and Perth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
