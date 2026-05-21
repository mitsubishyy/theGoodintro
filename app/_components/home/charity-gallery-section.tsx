"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/**
 * Inspiring giving in action — infinite-loop horizontal marquee of charity
 * cards. Default state is B&W; hover (or tap on touch) snaps the card to
 * colour. Set B is aria-hidden + tabindex=-1 so screen readers don't
 * double-announce and keyboard nav skips duplicates.
 */

const CHARITIES = [
  {
    slug: "beyond-blue",
    name: "Beyond Blue",
    cause: "Mental health support",
    directed: "$42,000 directed",
    pct: 62,
  },
  {
    slug: "ozharvest",
    name: "OzHarvest",
    cause: "Rescuing surplus food",
    directed: "$38,500 directed",
    pct: 55,
  },
  {
    slug: "rfds",
    name: "Royal Flying Doctor Service",
    cause: "Remote emergency medical",
    directed: "$51,200 directed",
    pct: 71,
  },
  {
    slug: "smith-family",
    name: "The Smith Family",
    cause: "Education for kids in need",
    directed: "$33,800 directed",
    pct: 48,
  },
  {
    slug: "mission-australia",
    name: "Mission Australia",
    cause: "Homelessness services",
    directed: "$28,400 directed",
    pct: 41,
  },
  {
    slug: "cancer-council",
    name: "Cancer Council",
    cause: "Research and patient care",
    directed: "$44,700 directed",
    pct: 64,
  },
  {
    slug: "lifeline",
    name: "Lifeline",
    cause: "24/7 crisis support",
    directed: "$36,200 directed",
    pct: 53,
  },
  {
    slug: "foodbank",
    name: "Foodbank Australia",
    cause: "Hunger relief, nationwide",
    directed: "$29,900 directed",
    pct: 44,
  },
];

type Charity = (typeof CHARITIES)[number];

function Card({
  c,
  duplicate = false,
}: {
  c: Charity;
  duplicate?: boolean;
}) {
  const href = `/giving#${c.slug}`;
  return (
    <Link
      className="hp-gallery-card"
      href={href}
      aria-hidden={duplicate || undefined}
      tabIndex={duplicate ? -1 : 0}
    >
      <div className="hp-gallery-image">
        <span className="shape" aria-hidden="true" />
        <span className="wm">{c.name}</span>
      </div>
      <div className="hp-gallery-card-info">
        <p className="hp-gallery-name">{c.name}</p>
        <p className="hp-gallery-cause">{c.cause}</p>
        <div className="hp-gallery-bar-row">
          <span>{c.directed}</span>
          <span className="pct">{c.pct}%</span>
        </div>
        <div className="hp-gallery-bar">
          <div className="fill" style={{ width: `${c.pct}%` }} />
        </div>
      </div>
    </Link>
  );
}

export default function CharityGallerySection() {
  const sectionRef = useRef<HTMLElement | null>(null);

  /**
   * On touch (no hover capability), surface the active state by requiring
   * one tap before the link actually navigates. Same UX trick as the bundle.
   */
  useEffect(() => {
    if (!window.matchMedia("(hover: none)").matches) return;
    const section = sectionRef.current;
    if (!section) return;
    const cards = Array.from(
      section.querySelectorAll<HTMLAnchorElement>(".hp-gallery-card")
    );
    const onClick = (card: HTMLAnchorElement) => (e: MouseEvent) => {
      if (!card.classList.contains("is-active")) {
        e.preventDefault();
        cards.forEach((c) => c.classList.remove("is-active"));
        card.classList.add("is-active");
      }
    };
    const handlers: Array<[HTMLAnchorElement, (e: MouseEvent) => void]> = [];
    cards.forEach((card) => {
      const h = onClick(card);
      card.addEventListener("click", h);
      handlers.push([card, h]);
    });
    return () => {
      handlers.forEach(([card, h]) => card.removeEventListener("click", h));
    };
  }, []);

  return (
    <section
      className="hp-gallery-section"
      id="gallery"
      aria-labelledby="gallery-title"
      ref={sectionRef}
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
        className="hp-gallery-viewport"
        aria-label="Charities funded via theGoodintro"
      >
        <div className="hp-gallery-track">
          {CHARITIES.map((c) => (
            <Card key={`a-${c.slug}`} c={c} />
          ))}
          {CHARITIES.map((c) => (
            <Card key={`b-${c.slug}`} c={c} duplicate />
          ))}
        </div>
      </div>
    </section>
  );
}
