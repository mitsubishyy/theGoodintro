"use client";

import Link from "next/link";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { CHARITIES as CHARITY_PROFILES } from "@/lib/charities";
import { HIGHLIGHT_SLUG, DIM_STYLE } from "@/lib/demo";

/**
 * Inspiring giving in action — a native horizontal scroller that loops
 * infinitely in both directions (three copies + a normalize step keep
 * scrollLeft parked in the middle copy, so there is never an edge). It
 * auto-drifts when idle and pauses on hover; hovering or focusing a card
 * glides it to the centre of the viewport. Cards are B&W and snap to colour
 * on hover. Real photos live at /charities/photos/<slug>.{webp,jpg}; a
 * missing file falls back to the abstract shape + name.
 */

// Names are drawn EXCLUSIVELY from the CHARITY_FLOW.md shortlist.
// `logo: true` cards show the charity's logo contained on a clean ground;
// photo cards (logo: false) get the full-bleed B&W-to-colour treatment.
// A missing asset falls back to the abstract shape + name by design.
const CHARITIES = [
  {
    slug: "headspace",
    name: "headspace",
    cause: "Youth mental health",
    logo: true,
    img: "/charities/headspace.png",
  },
  {
    slug: "cancer-council-australia",
    name: "Cancer Council Australia",
    cause: "Every area of every cancer",
    logo: true,
    img: "/charities/cancer-council.png",
  },
  {
    slug: "rfds",
    name: "Royal Flying Doctor Service",
    cause: "Remote emergency medical",
    logo: true,
    img: "/charities/royal-flying-doctor-service.png",
  },
  {
    slug: "ruok",
    name: "R U OK?",
    cause: "Suicide prevention",
    logo: true,
    img: "/charities/r-u-ok.png",
  },
  {
    slug: "starlight",
    name: "Starlight Children's Foundation",
    cause: "Supporting seriously ill children",
    logo: true,
    img: "/charities/starlight-children-s-foundation.png",
  },
  {
    slug: "rspca-australia",
    name: "RSPCA Australia",
    cause: "Animal welfare",
    logo: true,
    img: "/charities/rspca-australia.png",
  },
  {
    slug: "wwf-australia",
    name: "WWF-Australia",
    cause: "Conservation and wildlife",
    logo: true,
    img: "/charities/wwf-australia.png",
  },
  {
    slug: "vinnies",
    name: "St Vincent de Paul Society",
    cause: "Poverty and crisis support",
    logo: true,
    img: "/charities/st-vincent-de-paul-society.png",
  },
  {
    slug: "childrens-ground",
    name: "Children's Ground",
    cause: "First Nations-led change",
    logo: true,
    img: "/charities/children-s-ground.png",
  },
];

type Charity = (typeof CHARITIES)[number];

// Charities with a published profile page (lib/charities.ts) deep-link to it;
// the rest anchor into /giving until their profile exists.
const PROFILED = new Set(CHARITY_PROFILES.map((p) => p.slug));

function Card({ c, duplicate = false }: { c: Charity; duplicate?: boolean }) {
  const href = PROFILED.has(c.slug)
    ? `/charities/${c.slug}`
    : `/giving#${c.slug}`;
  /**
   * Try a real photo at /charities/photos/<slug>.{webp,jpg}. If neither
   * loads, fall back to the abstract shape + name watermark so the card
   * never looks broken.
   */
  const [photoFailed, setPhotoFailed] = useState(false);
  const hi = c.slug === HIGHLIGHT_SLUG;
  return (
    <Link
      className={`hp-gallery-card${c.logo ? " is-logo" : ""}`}
      href={href}
      aria-hidden={duplicate || !hi || undefined}
      tabIndex={duplicate || !hi ? -1 : 0}
      draggable={false}
      data-hi={hi ? "" : undefined}
      style={hi ? { boxShadow: "0 0 0 2px var(--primary)" } : DIM_STYLE}
    >
      <div className="hp-gallery-image">
        {!photoFailed && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="hp-gallery-photo"
            src={c.img ?? `/charities/photos/${c.slug}.webp`}
            alt={`${c.name} — ${c.cause}`}
            loading="lazy"
            draggable={false}
            onError={(e) => {
              const img = e.currentTarget;
              if (c.img) {
                setPhotoFailed(true);
              } else if (img.src.endsWith(".webp")) {
                img.src = `/charities/photos/${c.slug}.jpg`;
              } else if (img.src.endsWith(".jpg")) {
                img.src = `/charities/photos/${c.slug}.png`;
              } else {
                setPhotoFailed(true);
              }
            }}
          />
        )}
        <span className="shape" aria-hidden="true" />
        <span className="wm">{c.name}</span>
      </div>
      <div className="hp-gallery-card-info">
        <p className="hp-gallery-name">{c.name}</p>
        <p className="hp-gallery-cause">{c.cause}</p>
        <div className="hp-gallery-bar-row">
          <span>Each meeting</span>
          <span className="pct">up to $1,200</span>
        </div>
        <div className="hp-gallery-bar">
          <span className="fill" style={{ width: "12%" }} />
        </div>
        <p className="hp-gallery-goal">toward a $10,000 goal</p>
      </div>
    </Link>
  );
}

/** Closing tile of each set: routes to the charity profile index. */
function ViewAllCard({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <Link
      className="hp-gallery-card is-viewall"
      href="/charities"
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : 0}
      draggable={false}
    >
      <div className="hp-gallery-image">
        <div className="hp-gallery-viewall">
          <span className="circle" aria-hidden="true">
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M3 9 L9 3 M4.5 3 H9 V7.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="label">View all charity profiles</span>
        </div>
      </div>
    </Link>
  );
}

const SPEED = 0; // demo: no idle drift — RSPCA stays centred
const RESUME_MS = 1400; // pause auto-drift this long after interaction

export default function CharityGallerySection() {
  const scroller = useRef<HTMLDivElement | null>(null);
  const setW = useRef(0); // width of one copy of the set
  const hovering = useRef(false);
  const lastInteract = useRef(0);
  const reduced = useRef(false);

  const copies = [0, 1, 2];

  /** Keep scrollLeft inside the middle copy so the loop never reaches an edge. */
  const normalize = useCallback(() => {
    const el = scroller.current;
    const s = setW.current;
    if (!el || s <= 0) return;
    if (el.scrollLeft < s * 0.5) el.scrollLeft += s;
    else if (el.scrollLeft > s * 1.5) el.scrollLeft -= s;
  }, []);

  /** Glide a card to the horizontal centre of the viewport. */
  const centerCard = useCallback((card: HTMLElement) => {
    const el = scroller.current;
    if (!el) return;
    const elRect = el.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const delta =
      cardRect.left + cardRect.width / 2 - (elRect.left + elRect.width / 2);
    el.scrollTo({
      left: el.scrollLeft + delta,
      behavior: reduced.current ? "auto" : "smooth",
    });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const measure = () => {
      setW.current = el.scrollWidth / 3;
      if (el.scrollLeft < setW.current * 0.5) el.scrollLeft = setW.current;
    };
    // Demo: park the strip so the highlighted RSPCA card is centred on load.
    const centerHighlight = () => {
      const his = Array.from(el.querySelectorAll<HTMLElement>("[data-hi]"));
      const target = his[1] ?? his[0]; // the copy in the middle set
      if (!target) return;
      const er = el.getBoundingClientRect();
      const cr = target.getBoundingClientRect();
      el.scrollLeft += cr.left + cr.width / 2 - (er.left + er.width / 2);
    };
    measure();
    centerHighlight();
    requestAnimationFrame(() => {
      measure();
      centerHighlight();
    });
    const settle = setTimeout(() => {
      measure();
      centerHighlight();
    }, 350);
    const ro = new ResizeObserver(() => {
      measure();
      centerHighlight();
    });
    ro.observe(el);

    const note = () => {
      lastInteract.current = performance.now();
    };
    el.addEventListener("scroll", normalize, { passive: true });
    el.addEventListener("wheel", note, { passive: true });
    el.addEventListener("touchstart", note, { passive: true });
    el.addEventListener("pointerdown", note, { passive: true });

    // Hover / focus a card -> centre it; pointer over the strip pauses drift.
    const cards = Array.from(
      el.querySelectorAll<HTMLElement>(".hp-gallery-card")
    );
    const onEnter = (card: HTMLElement) => () => {
      note();
      if (!window.matchMedia("(hover: none)").matches) centerCard(card);
    };
    const cardHandlers: Array<[HTMLElement, () => void]> = [];
    cards.forEach((card) => {
      const h = onEnter(card);
      card.addEventListener("pointerenter", h);
      card.addEventListener("focus", h);
      cardHandlers.push([card, h]);
    });

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const idle =
        !hovering.current &&
        !reduced.current &&
        now - lastInteract.current > RESUME_MS &&
        setW.current > 0;
      if (idle) {
        el.scrollLeft += SPEED * dt;
        normalize();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      ro.disconnect();
      el.removeEventListener("scroll", normalize);
      el.removeEventListener("wheel", note);
      el.removeEventListener("touchstart", note);
      el.removeEventListener("pointerdown", note);
      cardHandlers.forEach(([card, h]) => {
        card.removeEventListener("pointerenter", h);
        card.removeEventListener("focus", h);
      });
    };
  }, [normalize, centerCard]);

  return (
    <section
      className="hp-gallery-section"
      id="gallery"
      aria-labelledby="gallery-title"
    >
      <div className="hp-gallery-head">
        <h2 className="hp-gallery-title" id="gallery-title">
          Inspiring <span className="hp-serif-italic">giving</span> in action.
        </h2>
        <Link className="hp-learn-more" href="/giving">
          See all charities
          <span className="circle" aria-hidden="true">
            <svg viewBox="0 0 12 12" fill="none">
              <path
                d="M3 9 L9 3 M4.5 3 H9 V7.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </Link>
      </div>

      <div
        ref={scroller}
        className="hp-gallery-viewport"
        role="region"
        aria-label="Example charities executives can choose"
        onPointerEnter={() => {
          hovering.current = true;
        }}
        onPointerLeave={() => {
          hovering.current = false;
        }}
      >
        <div className="hp-gallery-track">
          {copies.map((cp) => (
            <Fragment key={cp}>
              {CHARITIES.map((c) => (
                <Card key={`${cp}-${c.slug}`} c={c} duplicate={cp !== 0} />
              ))}
              <ViewAllCard duplicate={cp !== 0} />
            </Fragment>
          ))}
        </div>
      </div>

      <p
        className="text-center text-sm italic text-muted-foreground"
        style={{
          fontFamily: "var(--font-fraunces), serif",
          margin: "clamp(36px, 4vw, 56px) auto 0",
          padding: "0 clamp(28px, 5vw, 64px)",
          maxWidth: "60ch",
        }}
      >
        Executives choose from our curated shortlist and may nominate any
        DGR-endorsed Australian charity.
      </p>
    </section>
  );
}
