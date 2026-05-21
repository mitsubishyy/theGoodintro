/**
 * Where your gift can go — dark emerald band with scrolling charity wordmarks.
 *
 * The marquee track holds two identical copies of the charity list; the CSS
 * animation translates the track from 0 → -50%, which lands set B in set A's
 * starting position for a seamless loop. Pauses on hover.
 */

const CHARITIES = [
  "Beyond Blue",
  "OzHarvest",
  "Royal Flying Doctor Service",
  "The Smith Family",
  "Mission Australia",
  "Cancer Council",
  "Lifeline",
  "Australian Red Cross",
  "Foodbank Australia",
  "Black Dog Institute",
  "headspace",
  "The Salvation Army",
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
          {CHARITIES.map((name) => (
            <span key={`a-${name}`} className="hp-charity-wm">
              {name}
            </span>
          ))}
          {CHARITIES.map((name) => (
            <span key={`b-${name}`} className="hp-charity-wm" aria-hidden="true">
              {name}
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
