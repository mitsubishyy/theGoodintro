import { MarqueeLogo, type MarqueeCharity } from "./marquee-logo";
import { HIGHLIGHT_NAME, DIM_STYLE } from "@/lib/demo";

/**
 * Where your gift can go — dark emerald band with a continuous, non-interactive
 * loop of charity logos on clean white chips.
 *
 * The marquee track holds two identical copies of the charity list; the CSS
 * animation translates the track from 0 → -50%, which lands set B in set A's
 * starting position for a seamless loop. It simply always rotates — no hover,
 * pause, or centring logic.
 *
 * Names are drawn EXCLUSIVELY from the CHARITY_FLOW.md shortlist. Logos
 * resolve client-side (local asset → charity's own domain → text chip), so a
 * chip never renders broken.
 */
const CHARITIES: MarqueeCharity[] = [
  {
    name: "Leukaemia Foundation",
    img: "/charities/leukaemia-foundation.png",
    domain: "leukaemia.org.au",
  },
  {
    name: "Royal Flying Doctor Service",
    img: "/charities/royal-flying-doctor-service.png",
    domain: "flyingdoctor.org.au",
  },
  {
    name: "R U OK?",
    img: "/charities/r-u-ok.png",
    domain: "ruok.org.au",
  },
  {
    name: "headspace",
    img: "/charities/headspace.png",
    domain: "headspace.org.au",
  },
  {
    name: "Starlight Children's Foundation",
    img: "/charities/starlight-children-s-foundation.png",
    domain: "starlight.org.au",
  },
  {
    name: "Ronald McDonald House Charities",
    img: "/charities/ronald-mcdonald-house-charities.png",
    domain: "rmhc.org.au",
  },
  {
    name: "St Vincent de Paul Society",
    img: "/charities/st-vincent-de-paul-society.png",
    domain: "vinnies.org.au",
  },
  {
    name: "Children's Ground",
    img: "/charities/children-s-ground.png",
    domain: "childrensground.org.au",
  },
  {
    name: "WWF-Australia",
    img: "/charities/wwf-australia.png",
    domain: "wwf.org.au",
  },
  {
    name: "RSPCA Australia",
    img: "/charities/rspca-australia.png",
    domain: "rspca.org.au",
  },
  {
    name: "Guide Dogs Australia",
    img: "/charities/guide-dogs-australia.png",
    domain: "guidedogs.com.au",
  },
  {
    name: "Save the Children Australia",
    img: "/charities/save-the-children-australia.png",
    domain: "savethechildren.org.au",
  },
  {
    name: "World Vision Australia",
    img: "/charities/world-vision-australia.png",
    domain: "worldvision.com.au",
  },
  {
    name: "Cerebral Palsy Alliance",
    img: "/charities/cerebral-palsy-alliance.png",
    domain: "cerebralpalsy.org.au",
  },
  {
    name: "Cancer Council Australia",
    img: "/charities/cancer-council.png",
    domain: "cancer.org.au",
  },
];

// Interleave the highlighted charity every couple of chips so a crisp RSPCA
// logo is always visible somewhere in the rotation, never scrolled fully off.
const RSPCA = CHARITIES.find((c) => c.name === HIGHLIGHT_NAME);
const OTHERS = CHARITIES.filter((c) => c.name !== HIGHLIGHT_NAME);
const DISPLAY: MarqueeCharity[] = [];
OTHERS.forEach((c, i) => {
  DISPLAY.push(c);
  if (RSPCA && i % 2 === 1) DISPLAY.push(RSPCA);
});

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
          {DISPLAY.map((c, i) => {
            const hi = c.name === HIGHLIGHT_NAME;
            return (
              <span
                key={`a-${i}-${c.name}`}
                className="hp-marquee-chip"
                style={hi ? { boxShadow: "0 0 0 2px var(--primary)" } : DIM_STYLE}
              >
                <MarqueeLogo charity={c} />
              </span>
            );
          })}
          {DISPLAY.map((c, i) => {
            const hi = c.name === HIGHLIGHT_NAME;
            return (
              <span
                key={`b-${i}-${c.name}`}
                className="hp-marquee-chip"
                aria-hidden="true"
                style={hi ? { boxShadow: "0 0 0 2px var(--primary)" } : DIM_STYLE}
              >
                <MarqueeLogo charity={c} decorative />
              </span>
            );
          })}
        </div>
      </div>

      <p className="hp-marquee-note">
        Executives choose from our curated shortlist and may nominate any
        DGR-endorsed Australian charity.
      </p>
    </section>
  );
}
