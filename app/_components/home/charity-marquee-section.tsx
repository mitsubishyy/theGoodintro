/**
 * Where your gift can go — dark emerald band with a continuous, non-interactive
 * loop of charity logos on clean white chips.
 *
 * The marquee track holds two identical copies of the charity list; the CSS
 * animation translates the track from 0 → -50%, which lands set B in set A's
 * starting position for a seamless loop. It simply always rotates — no hover,
 * pause, or centring logic.
 */

// Real brand-colour logos on clean white tiles, so dark-text logos stay legible
// against the emerald band.
const CHARITIES = [
  { name: "Beyond Blue", img: "/charities/beyond-blue.png" },
  { name: "Cancer Council", img: "/charities/cancer-council.png" },
  {
    name: "Royal Flying Doctor Service",
    img: "/charities/royal-flying-doctor-service.png",
  },
  { name: "The Smith Family", img: "/charities/the-smith-family.png" },
  { name: "Mission Australia", img: "/charities/mission-australia.png" },
  { name: "Lifeline", img: "/charities/lifeline.png" },
  { name: "Foodbank Australia", img: "/charities/foodbank-australia.png" },
];

export default function CharityMarqueeSection() {
  return (
    <section
      className="hp-marquee-section"
      id="charities"
      aria-labelledby="marquee-title"
    >
      <span className="hp-eyebrow" id="marquee-title">
        <span className="dot" aria-hidden="true" />
        Where your gift can go
      </span>

      <div className="hp-marquee" aria-label="Example Australian DGR charities">
        <div className="hp-marquee-track">
          {CHARITIES.map((c) => (
            <span key={`a-${c.name}`} className="hp-marquee-chip">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt={c.name} loading="lazy" draggable={false} />
            </span>
          ))}
          {CHARITIES.map((c) => (
            <span
              key={`b-${c.name}`}
              className="hp-marquee-chip"
              aria-hidden="true"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.img} alt="" loading="lazy" draggable={false} />
            </span>
          ))}
        </div>
      </div>

      <p className="hp-marquee-note">
        Illustrative Australian charities, all DGR-endorsed. You choose your
        own.
      </p>
    </section>
  );
}
