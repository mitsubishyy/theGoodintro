import type { ReactNode } from "react";

// 5-step flow used on /vendors ("How it works for vendors") and /how-it-works
// ("The model"). Ported from the Claude Design handoff (Vendors Flow Section.html,
// Variant B, number-above-card layout). Styles live in globals.css under `.vflow-*`.
// Each step: mono number → square white tile with a single icon → copy below.
// Emerald arrows sit in the gaps; step 05 is the emerald "destination" card.
// The artwork is shared; eyebrow / title / lede / step copy are passed in.

const STEP_ART: ReactNode[] = [
  (
      <svg viewBox="0 0 160 132" fill="none">
        {/* doc, head-on */}
        <rect x="40" y="32" width="68" height="84" rx="4" fill="var(--tan-1)" />
        <rect x="40" y="32" width="68" height="84" rx="4" className="ic-stroke" />
        {/* three short content lines */}
        <path d="M50 76 H94 M50 88 H86 M50 100 H72" className="ic-stroke" strokeWidth="1.3" />
        {/* emerald tag clipped to top-right of doc */}
        <path d="M70 40 L114 40 L126 50 L114 60 L70 60 Z" fill="var(--em)" />
        <path d="M70 40 L114 40 L126 50 L114 60 L70 60 Z" className="ic-stroke" />
        <circle cx="116" cy="50" r="2.2" fill="var(--tan-1)" />
        <circle cx="116" cy="50" r="2.2" className="ic-stroke" strokeWidth="1.1" />
      </svg>
  ),
  (
      <svg viewBox="0 0 160 132" fill="none">
        {/* left card */}
        <rect x="18" y="40" width="50" height="56" rx="4" fill="var(--tan-1)" />
        <rect x="18" y="40" width="50" height="56" rx="4" className="ic-stroke" />
        <path d="M28 62 H60 M28 74 H54" className="ic-stroke" strokeWidth="1.3" />
        {/* right card */}
        <rect x="92" y="40" width="50" height="56" rx="4" fill="var(--tan-1)" />
        <rect x="92" y="40" width="50" height="56" rx="4" className="ic-stroke" />
        <path d="M102 62 H134 M102 74 H128" className="ic-stroke" strokeWidth="1.3" />
        {/* emerald connector node */}
        <line x1="68" y1="68" x2="92" y2="68" stroke="var(--em)" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 3" />
        <circle cx="80" cy="68" r="5" fill="var(--em)" />
        <circle cx="80" cy="68" r="5" className="ic-stroke" strokeWidth="1.1" />
        <circle cx="80" cy="68" r="1.6" fill="var(--tan-1)" />
      </svg>
  ),
  (
      <svg viewBox="0 0 160 132" fill="none">
        {/* envelope body */}
        <rect x="32" y="40" width="84" height="60" rx="4" fill="var(--tan-1)" />
        <rect x="32" y="40" width="84" height="60" rx="4" className="ic-stroke" />
        {/* V flap */}
        <path d="M32 40 L74 76 L116 40" className="ic-stroke" />
        {/* emerald check badge */}
        <circle cx="124" cy="36" r="13" fill="var(--em)" />
        <circle cx="124" cy="36" r="13" className="ic-stroke" strokeWidth="1.1" />
        <path d="M118 37 L122.5 41.5 L130 33" className="ic-stroke-cream" strokeWidth="2.2" />
      </svg>
  ),
  (
      <svg viewBox="0 0 160 132" fill="none">
        {/* calendar */}
        <rect x="38" y="32" width="84" height="86" rx="6" fill="var(--tan-1)" />
        <rect x="38" y="32" width="84" height="86" rx="6" className="ic-stroke" />
        <path d="M38 52 H122" className="ic-stroke" />
        {/* binding rings */}
        <path d="M58 22 V42 M102 22 V42" className="ic-stroke" strokeWidth="1.4" />
        {/* date grid dots */}
        <g fill="var(--ink)">
          <circle cx="54" cy="68" r="1.5" /><circle cx="68" cy="68" r="1.5" /><circle cx="82" cy="68" r="1.5" /><circle cx="96" cy="68" r="1.5" /><circle cx="110" cy="68" r="1.5" />
          <circle cx="54" cy="84" r="1.5" /><circle cx="68" cy="84" r="1.5" /><circle cx="96" cy="84" r="1.5" /><circle cx="110" cy="84" r="1.5" />
          <circle cx="54" cy="100" r="1.5" /><circle cx="68" cy="100" r="1.5" /><circle cx="82" cy="100" r="1.5" /><circle cx="110" cy="100" r="1.5" />
        </g>
        {/* emerald booked slot */}
        <rect x="76" y="78" width="14" height="12" rx="2" fill="var(--em)" />
        <rect x="76" y="78" width="14" height="12" rx="2" className="ic-stroke" strokeWidth="1.1" />
      </svg>
  ),
  (
      <svg viewBox="0 0 160 132" fill="none">
        {/* heart above box */}
        <path d="M80 32 C 75 24, 65 24, 65 32 C 65 40, 75 47, 80 50 C 85 47, 95 40, 95 32 C 95 24, 85 24, 80 32 Z" fill="var(--tan-1)" />
        <path d="M80 32 C 75 24, 65 24, 65 32 C 65 40, 75 47, 80 50 C 85 47, 95 40, 95 32 C 95 24, 85 24, 80 32 Z" className="ic-stroke-cream" />
        {/* gift box */}
        <rect x="48" y="60" width="64" height="52" rx="4" className="ic-stroke-cream" />
        <line x1="48" y1="78" x2="112" y2="78" className="ic-stroke-cream" />
        <line x1="80" y1="60" x2="80" y2="112" className="ic-stroke-cream" />
        {/* bow */}
        <ellipse cx="74" cy="58" rx="6" ry="4" transform="rotate(-22 74 58)" className="ic-stroke-cream" />
        <ellipse cx="86" cy="58" rx="6" ry="4" transform="rotate(22 86 58)" className="ic-stroke-cream" />
        <circle cx="80" cy="58" r="2.4" fill="var(--tan-1)" />
      </svg>
  ),
];

const VENDOR_COPY = [
  "You state the specific initiative.",
  "It is matched to a leader’s stated priorities.",
  "The leader sees the reason and decides.",
  "The meeting happens. One focused conversation.",
  "A gift goes to the leader’s chosen charity.",
];

type VendorsFlowProps = {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lede?: string;
  /** Five strings, one per step. Defaults to the vendor-voiced copy. */
  steps?: string[];
};

export function VendorsFlow({
  id = "how-vendors",
  eyebrow = "How it works for vendors",
  title = (
    <>
      From stated initiative to a{" "}
      <span className="serif-italic">funded conversation</span>.
    </>
  ),
  lede = "Five steps. Nothing speculative, no surprises. The leader sees the same words you wrote.",
  steps = VENDOR_COPY,
}: VendorsFlowProps = {}) {
  return (
    <section
      className="vflow-section border-y"
      id={id}
      aria-labelledby="vflow-title"
      style={{ borderColor: "var(--border)" }}
    >
      <header className="vflow-head">
        <span className="vflow-eyebrow">
          <span className="dot" aria-hidden="true" />
          {eyebrow}
        </span>
        <h2 id="vflow-title">{title}</h2>
        <p>{lede}</p>
      </header>

      <div className="vflow">
        <ol className="vflow-cards">
          {STEP_ART.map((art, i) => {
            const n = String(i + 1).padStart(2, "0");
            const dest = i === STEP_ART.length - 1;
            return (
              <li
                key={n}
                className={"vflow-card" + (dest ? " vflow-card--dest" : "")}
              >
                <span className="vflow-num">{n}</span>
                <div className="vflow-card-inner">
                  <div className="vflow-art" aria-hidden="true">
                    {art}
                  </div>
                </div>
                <p className="vflow-copy">{steps[i]}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
