"use client";

import { useEffect, useRef } from "react";

/**
 * "Our impact" — single-viewport section that auto-cycles through three
 * states when ≥60% of the section is in view:
 *
 *   State 1 — $48,300 directed (warm white)
 *   State 2 — 42 introductions (oat, rises up over state 1)
 *   State 3 — Australian map with pin-drops (warm white, rises up over state 2)
 *
 * The full sequence is ~9s, time-driven (no scroll dependency). Reduced-motion
 * users get a static 2-column layout with all values shown immediately.
 *
 * The Australia outline is hand-traced from real geography — Cape York
 * Peninsula, Gulf of Carpentaria, Top End, Western Australia coastal bulge,
 * Great Australian Bight, south-east corner, and Tasmania as a separate
 * triangular island south of Victoria.
 */

const CITIES = [
  { id: "sydney", label: "Sydney", x: 878, y: 555, labelX: 895, labelY: 560, anchor: "start" as const },
  { id: "melbourne", label: "Melbourne", x: 745, y: 655, labelX: 745, labelY: 700, anchor: "middle" as const },
  { id: "brisbane", label: "Brisbane", x: 873, y: 470, labelX: 890, labelY: 475, anchor: "start" as const },
  { id: "perth", label: "Perth", x: 118, y: 540, labelX: 105, labelY: 545, anchor: "end" as const },
];

export default function ImpactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const state1NumRef = useRef<HTMLParagraphElement | null>(null);
  const state2NumRef = useRef<HTMLParagraphElement | null>(null);
  const playedRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const state1 = section.querySelector<HTMLElement>('.hp-impact-state[data-state="1"]');
    const state2 = section.querySelector<HTMLElement>('.hp-impact-state[data-state="2"]');
    const state3 = section.querySelector<HTMLElement>('.hp-impact-state[data-state="3"]');
    const cover2 = section.querySelector<SVGElement>(".hp-impact-cover-2");
    const cover3 = section.querySelector<SVGElement>(".hp-impact-cover-3");
    const auOutlines = section.querySelectorAll<SVGPathElement>(".hp-panel-map .au-outline");
    const auBorders = section.querySelectorAll<SVGPathElement>(".hp-panel-map .au-state-border");
    const pinWraps = section.querySelectorAll<SVGGElement>(".hp-panel-map .map-pin-wrap");
    const labels = section.querySelectorAll<SVGTextElement>(".hp-panel-map .map-label");

    if (!state1 || !state2 || !state3) return;

    const initDraw = (el: SVGPathElement) => {
      try {
        const len = el.getTotalLength();
        if (!len) return;
        el.style.strokeDasharray = String(len);
        el.style.strokeDashoffset = String(len);
        el.dataset.len = String(len);
      } catch {
        /* getTotalLength can throw if not yet rendered; ignore */
      }
    };
    auOutlines.forEach(initDraw);
    auBorders.forEach(initDraw);

    const fmtDollar = (v: number) => "$" + v.toLocaleString("en-AU");
    const fmtInt = (v: number) => String(v);
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOutBack = (t: number) => {
      const c = 1.70158 + 1;
      return 1 + c * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
    };

    const setFinal = () => {
      if (state1NumRef.current) state1NumRef.current.textContent = fmtDollar(48300);
      if (state2NumRef.current) state2NumRef.current.textContent = fmtInt(42);
      state1.classList.add("is-active");
      state2.classList.add("is-active");
      state3.classList.add("is-active");
      cover2?.classList.add("is-down");
      cover3?.classList.add("is-down");
      auOutlines.forEach((el) => {
        el.style.strokeDashoffset = "0";
      });
      auBorders.forEach((el) => {
        el.style.strokeDashoffset = "0";
      });
      pinWraps.forEach((w) => {
        const x = w.dataset.x ?? "0";
        const y = w.dataset.y ?? "0";
        w.setAttribute("transform", `translate(${x}, ${y})`);
        const pin = w.querySelector<SVGGElement>(".map-pin");
        if (pin) pin.style.opacity = "1";
      });
      labels.forEach((l) => {
        l.style.opacity = "1";
      });
    };

    // Capture each pin's anchor position from its initial transform attribute.
    pinWraps.forEach((wrap) => {
      const m = (wrap.getAttribute("transform") || "").match(
        /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/
      );
      wrap.dataset.x = m ? m[1] : "0";
      wrap.dataset.y = m ? m[2] : "0";
    });

    if (reduce) {
      setFinal();
      return;
    }

    // Initial pre-animation state.
    if (state1NumRef.current) state1NumRef.current.textContent = fmtDollar(0);
    if (state2NumRef.current) state2NumRef.current.textContent = fmtInt(0);
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

    // Re-init path lengths after layout settles (getTotalLength fails before).
    requestAnimationFrame(() => {
      [...auOutlines, ...auBorders].forEach((el) => {
        if (!el.dataset.len || parseFloat(el.dataset.len) === 0) initDraw(el);
      });
    });
    const onLoad = () => {
      [...auOutlines, ...auBorders].forEach(initDraw);
    };
    window.addEventListener("load", onLoad);

    const timeouts: number[] = [];

    const animateCount = (
      el: HTMLElement | null,
      from: number,
      to: number,
      duration: number,
      fmt: (v: number) => string
    ) => {
      if (!el) return;
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const v = Math.round(from + (to - from) * easeOutCubic(t));
        el.textContent = fmt(v);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const animateDraw = (elements: NodeListOf<SVGPathElement>, duration: number) => {
      const t0 = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = easeOutCubic(t);
        elements.forEach((el) => {
          const len = parseFloat(el.dataset.len || "0");
          el.style.strokeDashoffset = String(len * (1 - eased));
        });
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const animatePin = (wrap: SVGGElement, duration: number) => {
      const pin = wrap.querySelector<SVGGElement>(".map-pin");
      const t0 = performance.now();
      const targetX = parseFloat(wrap.dataset.x ?? "0");
      const targetY = parseFloat(wrap.dataset.y ?? "0");
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / duration);
        const eased = easeOutBack(t);
        const yOff = (1 - eased) * -90;
        wrap.setAttribute("transform", `translate(${targetX}, ${targetY + yOff})`);
        if (pin) pin.style.opacity = String(Math.min(1, t * 4));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const cityOrder = ["sydney", "melbourne", "brisbane", "perth"];

    const playTimeline = () => {
      animateCount(state1NumRef.current, 0, 48300, 1200, fmtDollar);

      timeouts.push(
        window.setTimeout(() => {
          cover2?.classList.add("is-down");
          state1.classList.remove("is-active");
          state2.classList.add("is-active");
        }, 2600)
      );

      timeouts.push(
        window.setTimeout(() => {
          animateCount(state2NumRef.current, 0, 42, 1200, fmtInt);
        }, 3200)
      );

      timeouts.push(
        window.setTimeout(() => {
          cover3?.classList.add("is-down");
          state2.classList.remove("is-active");
          state3.classList.add("is-active");
        }, 5800)
      );

      timeouts.push(
        window.setTimeout(() => animateDraw(auOutlines, 800), 6400)
      );
      timeouts.push(
        window.setTimeout(() => animateDraw(auBorders, 400), 7000)
      );

      cityOrder.forEach((city, i) => {
        const wrap = section.querySelector<SVGGElement>(
          `.map-pin-wrap[data-pin="${city}"]`
        );
        if (!wrap) return;
        timeouts.push(
          window.setTimeout(() => animatePin(wrap, 400), 7200 + i * 180)
        );
      });

      cityOrder.forEach((city, i) => {
        const label = section.querySelector<SVGTextElement>(
          `.map-label[data-label="${city}"]`
        );
        if (!label) return;
        timeouts.push(
          window.setTimeout(() => {
            label.style.transition = "opacity 400ms ease";
            label.style.opacity = "1";
          }, 8200 + i * 120)
        );
      });
    };

    const triggerOnce = () => {
      if (playedRef.current) return;
      playedRef.current = true;
      io?.disconnect();
      playTimeline();
    };

    // Fire only when section is genuinely centred (≥60% visible). Earlier
    // threshold caused stats 1 & 2 to fly past before the user looked.
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              for (const e of entries) {
                if (e.isIntersecting && e.intersectionRatio >= 0.6) {
                  triggerOnce();
                  return;
                }
              }
            },
            { threshold: [0, 0.3, 0.6, 0.9] }
          )
        : null;

    if (io) io.observe(section);

    // Safety net for deep-link landings where the section is already past
    // viewport top: require ≥60% visibility to auto-trigger.
    const checkInitial = () => {
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const visible = Math.min(rect.bottom, vh) - Math.max(rect.top, 0);
      if (visible / Math.min(vh, rect.height) >= 0.6) triggerOnce();
    };
    requestAnimationFrame(checkInitial);

    return () => {
      io?.disconnect();
      window.removeEventListener("load", onLoad);
      timeouts.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  return (
    <section
      className="hp-impact-section"
      id="impact"
      aria-labelledby="impact-title"
      ref={sectionRef}
    >
      <header className="hp-impact-head">
        <span className="hp-eyebrow">
          <span className="dot" aria-hidden="true" />
          Our impact
        </span>
        <h2 className="hp-impact-title" id="impact-title">
          Together, we&rsquo;re making{" "}
          <span className="hp-serif-italic">a difference</span>.
        </h2>
      </header>

      <div className="hp-impact-stage" aria-live="polite">
        <svg
          className="hp-impact-cover hp-impact-cover-2"
          preserveAspectRatio="none"
          viewBox="0 0 100 116"
          aria-hidden="true"
        >
          <path d="M 0 16 Q 50 0 100 16 L 100 116 L 0 116 Z" />
        </svg>
        <svg
          className="hp-impact-cover hp-impact-cover-3"
          preserveAspectRatio="none"
          viewBox="0 0 100 116"
          aria-hidden="true"
        >
          <path d="M 0 16 Q 50 0 100 16 L 100 116 L 0 116 Z" />
        </svg>

        <div className="hp-impact-state is-active" data-state="1">
          <p className="hp-panel-num" ref={state1NumRef}>
            $0
          </p>
          <p className="hp-panel-label">
            Directed to Australian charities through theGoodintro.
          </p>
        </div>

        <div className="hp-impact-state" data-state="2">
          <p className="hp-panel-num" ref={state2NumRef}>
            0
          </p>
          <p className="hp-panel-label">
            Qualified introductions between executives and vendors.
          </p>
        </div>

        <div className="hp-impact-state" data-state="3">
          <h3 className="hp-panel-heading">
            Across <span className="hp-serif-italic">four</span> Australian
            states.
          </h3>

          <div className="hp-map-wrap">
            <svg
              className="hp-panel-map"
              viewBox="0 0 1000 800"
              fill="none"
              aria-hidden="true"
              preserveAspectRatio="xMidYMid meet"
            >
              {/*
                Mainland Australia outline. Clockwise from Cape Leeuwin (SW tip).
                Hand-traced to hit recognisable landmarks: WA west-coast bulge,
                Kimberley NW, Top End, Gulf of Carpentaria, Cape York Peninsula,
                east coast through Brisbane/Sydney, SE corner / Wilsons Prom,
                Great Australian Bight.
              */}
              <path
                className="au-outline"
                d="M 115 615
                   C 100 612, 95 600, 105 580
                   C 115 555, 120 540, 125 525
                   L 125 470
                   C 115 445, 100 430, 90 410
                   C 85 380, 88 350, 90 320
                   C 88 295, 90 280, 95 270
                   L 110 255
                   C 130 235, 155 225, 180 220
                   C 215 200, 250 185, 290 180
                   C 325 170, 360 165, 395 160
                   L 425 145
                   C 432 130, 440 122, 450 120
                   L 460 130
                   L 470 142
                   C 478 155, 488 160, 495 165
                   L 500 180
                   C 502 195, 500 215, 502 235
                   C 510 260, 520 280, 530 295
                   C 535 290, 538 280, 540 270
                   C 545 245, 555 220, 568 200
                   C 575 188, 585 180, 590 175
                   L 600 165
                   C 605 145, 608 125, 615 105
                   C 620 90, 628 80, 635 80
                   L 640 90
                   L 645 110
                   C 648 130, 650 155, 655 175
                   C 665 195, 675 215, 688 235
                   C 705 270, 725 305, 750 335
                   C 780 370, 815 405, 845 435
                   C 858 455, 868 475, 875 495
                   C 880 520, 882 545, 880 570
                   L 875 590
                   C 868 610, 858 625, 845 640
                   C 825 655, 800 665, 775 668
                   L 760 670
                   C 745 668, 730 665, 715 660
                   L 700 658
                   C 680 660, 665 655, 650 648
                   C 625 635, 600 625, 575 620
                   L 545 615
                   C 510 615, 475 620, 440 622
                   C 395 625, 350 625, 305 620
                   C 265 615, 230 610, 195 605
                   L 160 605
                   C 140 605, 125 612, 115 615
                   Z"
              />

              {/* Tasmania — separate triangular-ish island south of Victoria. */}
              <path
                className="au-outline"
                d="M 760 695
                   C 770 690, 785 690, 800 695
                   L 810 705
                   C 815 720, 815 735, 810 750
                   L 800 765
                   C 785 772, 768 770, 758 760
                   L 750 745
                   C 748 730, 750 715, 755 705
                   Z"
              />

              {/* Faint internal state borders */}
              <path className="au-state-border" d="M 405 165 L 405 615" />
              <path className="au-state-border" d="M 405 425 L 600 425" />
              <path className="au-state-border" d="M 565 200 L 565 425" />
              <path className="au-state-border" d="M 600 200 L 600 620" />
              <path className="au-state-border" d="M 600 485 L 875 485" />
              <path className="au-state-border" d="M 600 595 L 870 600" />

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

          <p className="hp-panel-caption">
            Founding executives in Sydney, Melbourne, Brisbane, and Perth.
          </p>
        </div>
      </div>
    </section>
  );
}
