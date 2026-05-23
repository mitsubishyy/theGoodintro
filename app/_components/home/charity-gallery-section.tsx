import Link from "next/link";

/**
 * Charity logo loop — a continuous, non-interactive marquee of charity logos
 * on clean white chips. Two identical copies of the set sit in one track; the
 * CSS animation translates it 0 -> -50% so copy B lands where copy A began,
 * for a seamless infinite loop. No hover, drift, or centring logic: it simply
 * always rotates. Logos live at /public/charities/<file>; respects
 * prefers-reduced-motion (the loop stops and the logos wrap into a static row).
 */

const CHARITIES = [
  { name: "Beyond Blue", img: "/charities/beyond-blue.png" },
  { name: "Cancer Council", img: "/charities/cancer-council.png" },
  { name: "Royal Flying Doctor Service", img: "/charities/royal-flying-doctor-service.png" },
  { name: "The Smith Family", img: "/charities/the-smith-family.png" },
  { name: "Mission Australia", img: "/charities/mission-australia.png" },
  { name: "Lifeline", img: "/charities/lifeline.png" },
  { name: "Foodbank Australia", img: "/charities/foodbank-australia.png" },
];

export default function CharityGallerySection() {
  // Two copies back to back so the -50% translate loops seamlessly.
  const loop = [...CHARITIES, ...CHARITIES];

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

      <div className="hp-logo-loop" aria-label="Example Australian DGR charities">
        <div className="hp-logo-loop-track">
          {loop.map((c, i) => (
            <span
              key={i}
              className="hp-logo-chip"
              aria-hidden={i >= CHARITIES.length || undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.name} loading="lazy" draggable={false} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
