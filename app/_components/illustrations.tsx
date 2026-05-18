/* ─────────────────────────────────────────────────────────────────────
   Brand illustrations for TheBigIntro.
   Multi-color, slightly isometric, Employment-Hero-style depth. All
   inline SVG using brand tokens so colors stay coherent and assets
   ship at zero weight.
   ───────────────────────────────────────────────────────────────────── */

type Props = { className?: string };

/* ─── Hero illustration: a calendar/card with a heart and coin
   stacked, surrounded by a soft halo. The "meeting becomes a gift"
   metaphor in one composition. */
export function HeroIllustration({ className }: Props) {
  return (
    <svg
      viewBox="0 0 520 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      {/* soft halo */}
      <ellipse
        cx="260"
        cy="240"
        rx="240"
        ry="200"
        fill="var(--ill-emerald-light)"
        opacity="0.18"
      />

      {/* back card — second meeting */}
      <g transform="translate(110, 80) rotate(-6 140 100)">
        <rect width="280" height="200" rx="20" fill="var(--ill-tan-light)" />
        <rect x="22" y="22" width="120" height="10" rx="5" fill="var(--ill-ink)" opacity="0.2" />
        <rect x="22" y="46" width="180" height="8" rx="4" fill="var(--ill-ink)" opacity="0.12" />
        <rect x="22" y="64" width="160" height="8" rx="4" fill="var(--ill-ink)" opacity="0.12" />
        <rect x="22" y="120" width="60" height="50" rx="10" fill="var(--ill-tan-deep)" />
        <text x="52" y="152" textAnchor="middle" fontFamily="sans-serif" fontSize="22" fontWeight="700" fill="var(--ill-cream)">10:00</text>
      </g>

      {/* front card — the active meeting */}
      <g transform="translate(160, 140) rotate(3 140 100)">
        <rect width="280" height="200" rx="20" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
        <rect x="22" y="22" width="60" height="10" rx="5" fill="var(--ill-emerald)" />
        <rect x="22" y="46" width="200" height="14" rx="4" fill="var(--ill-ink)" />
        <rect x="22" y="70" width="240" height="8" rx="4" fill="var(--ill-ink)" opacity="0.4" />
        <rect x="22" y="86" width="180" height="8" rx="4" fill="var(--ill-ink)" opacity="0.4" />
        <rect x="22" y="120" width="100" height="50" rx="10" fill="var(--ill-emerald)" />
        <text x="72" y="153" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="700" fill="var(--ill-cream)">Confirm</text>
        {/* small heart icon on right */}
        <g transform="translate(220, 132)">
          <circle r="20" fill="var(--ill-tan-light)" />
          <path
            d="M-9 -2 c-3 -3, 1 -8, 4 -5 l5 4 l5 -4 c3 -3, 7 2, 4 5 l-9 8 z"
            fill="var(--ill-emerald-deep)"
          />
        </g>
      </g>

      {/* floating coin top right */}
      <g transform="translate(420, 90)">
        <circle r="36" fill="var(--ill-tan)" />
        <circle r="36" fill="var(--ill-tan-deep)" opacity="0.2" transform="translate(3 3)" />
        <text textAnchor="middle" y="9" fontFamily="serif" fontSize="34" fontWeight="700" fill="var(--ill-cream)">$</text>
      </g>

      {/* floating coin bottom left */}
      <g transform="translate(75, 360)">
        <circle r="28" fill="var(--ill-emerald)" />
        <text textAnchor="middle" y="8" fontFamily="serif" fontSize="26" fontWeight="700" fill="var(--ill-cream)">$</text>
      </g>

      {/* small floating heart */}
      <g transform="translate(460, 320)">
        <circle r="24" fill="var(--ill-emerald-light)" opacity="0.6" />
        <path
          d="M-8 -1 c-3 -3, 1 -8, 4 -5 l4 3 l4 -3 c3 -3, 7 2, 4 5 l-8 8 z"
          fill="var(--ill-emerald-deep)"
        />
      </g>
    </svg>
  );
}

/* ─── About page: signature / handwritten note vibe */
export function AboutIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="260" cy="210" rx="220" ry="180" fill="var(--ill-tan-light)" opacity="0.4" />

      {/* envelope back */}
      <g transform="translate(110, 80)">
        <rect width="300" height="200" rx="14" fill="var(--ill-tan)" />
        <path d="M0 14 L150 130 L300 14" stroke="var(--ill-tan-deep)" strokeWidth="2" fill="none" />
        <path d="M0 14 L150 130 L300 14 L300 200 L0 200 Z" fill="var(--ill-tan-deep)" opacity="0.15" />
      </g>

      {/* letter sliding out */}
      <g transform="translate(135, 120) rotate(-4 130 90)">
        <rect width="260" height="180" rx="10" fill="var(--ill-cream)" stroke="var(--border)" strokeWidth="1" />
        <rect x="22" y="24" width="100" height="10" rx="5" fill="var(--ill-emerald)" />
        <rect x="22" y="50" width="216" height="6" rx="3" fill="var(--ill-ink)" opacity="0.35" />
        <rect x="22" y="64" width="200" height="6" rx="3" fill="var(--ill-ink)" opacity="0.35" />
        <rect x="22" y="78" width="180" height="6" rx="3" fill="var(--ill-ink)" opacity="0.35" />
        <rect x="22" y="92" width="160" height="6" rx="3" fill="var(--ill-ink)" opacity="0.35" />
        {/* signature swoop */}
        <path
          d="M22 130 Q60 110 100 130 T180 130"
          stroke="var(--ill-emerald-deep)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* coin */}
      <g transform="translate(420, 320)">
        <circle r="32" fill="var(--ill-emerald)" />
        <text textAnchor="middle" y="9" fontFamily="serif" fontSize="30" fontWeight="700" fill="var(--ill-cream)">$</text>
      </g>
    </svg>
  );
}

/* ─── Executives page: portfolio / time / calendar */
export function ExecutivesIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="260" cy="210" rx="220" ry="180" fill="var(--ill-emerald-light)" opacity="0.2" />

      {/* portfolio / briefcase */}
      <g transform="translate(140, 110)">
        <rect width="240" height="200" rx="14" fill="var(--ill-ink)" />
        <rect x="20" y="20" width="200" height="160" rx="8" fill="var(--ill-cream)" />
        <rect x="40" y="40" width="80" height="10" rx="5" fill="var(--ill-emerald)" />
        <rect x="40" y="60" width="160" height="6" rx="3" fill="var(--ill-ink)" opacity="0.3" />
        <rect x="40" y="76" width="140" height="6" rx="3" fill="var(--ill-ink)" opacity="0.3" />
        {/* mini gauge */}
        <circle cx="80" cy="130" r="22" fill="none" stroke="var(--ill-tan-light)" strokeWidth="6" />
        <path d="M80 108 A22 22 0 0 1 100 138" fill="none" stroke="var(--ill-emerald)" strokeWidth="6" strokeLinecap="round" />
        <rect x="120" y="110" width="60" height="8" rx="4" fill="var(--ill-ink)" opacity="0.4" />
        <rect x="120" y="124" width="70" height="8" rx="4" fill="var(--ill-ink)" opacity="0.25" />
        <rect x="120" y="138" width="50" height="8" rx="4" fill="var(--ill-ink)" opacity="0.25" />
        {/* handle */}
        <path d="M100 0 L100 -14 Q100 -24 110 -24 L130 -24 Q140 -24 140 -14 L140 0" stroke="var(--ill-ink)" strokeWidth="6" fill="none" />
      </g>

      {/* floating check */}
      <g transform="translate(420, 100)">
        <circle r="30" fill="var(--ill-emerald)" />
        <path d="M-10 0 l6 7 l14 -14" stroke="var(--ill-cream)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* floating clock */}
      <g transform="translate(80, 320)">
        <circle r="32" fill="var(--ill-tan-light)" />
        <circle r="32" fill="none" stroke="var(--ill-tan-deep)" strokeWidth="2" />
        <path d="M0 -20 L0 0 L14 8" stroke="var(--ill-ink)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/* ─── Vendors page: stack of cards with stamp */
export function VendorsIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="260" cy="210" rx="220" ry="180" fill="var(--ill-tan-light)" opacity="0.4" />

      {/* stack of letters */}
      <g transform="translate(120, 80)">
        <rect x="0" y="40" width="240" height="140" rx="10" fill="var(--ill-tan)" transform="rotate(-8 120 110)" />
        <rect x="20" y="50" width="240" height="140" rx="10" fill="var(--ill-tan-deep)" opacity="0.5" transform="rotate(-2 120 110)" />
        <rect x="40" y="60" width="240" height="180" rx="10" fill="var(--card)" stroke="var(--border)" />
        <rect x="60" y="84" width="100" height="10" rx="5" fill="var(--ill-emerald)" />
        <rect x="60" y="110" width="200" height="6" rx="3" fill="var(--ill-ink)" opacity="0.3" />
        <rect x="60" y="124" width="180" height="6" rx="3" fill="var(--ill-ink)" opacity="0.3" />
        <rect x="60" y="138" width="160" height="6" rx="3" fill="var(--ill-ink)" opacity="0.3" />
        {/* "qualified" stamp */}
        <g transform="translate(220, 188) rotate(-12 0 0)">
          <rect x="-44" y="-16" width="88" height="32" rx="4" fill="none" stroke="var(--ill-emerald-deep)" strokeWidth="2" />
          <text textAnchor="middle" y="6" fontFamily="sans-serif" fontSize="13" fontWeight="800" fill="var(--ill-emerald-deep)" letterSpacing="2">QUALIFIED</text>
        </g>
      </g>

      {/* floating coin */}
      <g transform="translate(440, 110)">
        <circle r="32" fill="var(--ill-emerald)" />
        <text textAnchor="middle" y="10" fontFamily="serif" fontSize="30" fontWeight="700" fill="var(--ill-cream)">$</text>
      </g>
    </svg>
  );
}

/* ─── How it works page: flow diagram */
export function HowItWorksIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="260" cy="210" rx="220" ry="180" fill="var(--ill-emerald-light)" opacity="0.2" />

      {/* three nodes */}
      <g transform="translate(60, 180)">
        <circle r="40" fill="var(--ill-tan)" />
        <rect x="-12" y="-14" width="24" height="20" rx="3" fill="var(--ill-cream)" />
        <rect x="-12" y="-14" width="24" height="6" rx="1" fill="var(--ill-tan-deep)" />
      </g>
      <path d="M105 180 Q160 130 215 180" stroke="var(--ill-ink)" strokeWidth="2" strokeDasharray="4 4" fill="none" />

      <g transform="translate(260, 180)">
        <rect x="-44" y="-44" width="88" height="88" rx="14" fill="var(--ill-emerald)" />
        <circle cx="0" cy="-12" r="14" fill="var(--ill-cream)" opacity="0.95" />
        <path d="M-12 6 Q0 -2 12 6 L12 18 L-12 18 Z" fill="var(--ill-cream)" opacity="0.95" />
      </g>
      <path d="M310 180 Q360 230 415 180" stroke="var(--ill-ink)" strokeWidth="2" strokeDasharray="4 4" fill="none" />

      <g transform="translate(460, 180)">
        <circle r="40" fill="var(--ill-tan-light)" />
        <path d="M-15 -4 c-5 -5, 2 -14, 7 -7 l8 6 l8 -6 c5 -7, 12 2, 7 7 l-15 14 z" fill="var(--ill-emerald-deep)" />
      </g>

      {/* dollar labels */}
      <g transform="translate(60, 280)">
        <text textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="var(--ill-ink)">VENDOR</text>
      </g>
      <g transform="translate(260, 280)">
        <text textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="var(--ill-ink)">THEBIGINTRO</text>
      </g>
      <g transform="translate(460, 280)">
        <text textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="var(--ill-ink)">CHARITY</text>
      </g>

      <text x="155" y="125" textAnchor="middle" fontFamily="sans-serif" fontSize="20" fontWeight="800" fill="var(--ill-emerald-deep)">$1,000</text>
      <text x="365" y="245" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="var(--ill-ink)" opacity="0.55">routes 100%</text>
    </svg>
  );
}

/* ─── Opportunity page: building blocks */
export function OpportunityIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="260" cy="210" rx="220" ry="180" fill="var(--ill-tan-light)" opacity="0.4" />

      {/* foundation block */}
      <rect x="160" y="270" width="200" height="60" rx="6" fill="var(--ill-ink)" />

      {/* middle blocks */}
      <rect x="180" y="200" width="80" height="60" rx="6" fill="var(--ill-tan)" />
      <rect x="270" y="200" width="80" height="60" rx="6" fill="var(--ill-emerald)" />

      {/* top block */}
      <rect x="220" y="130" width="100" height="60" rx="6" fill="var(--ill-tan-deep)" />

      {/* missing block (looking for partner) — dashed outline */}
      <rect x="220" y="60" width="100" height="60" rx="6" fill="none" stroke="var(--ill-emerald-deep)" strokeWidth="2.5" strokeDasharray="6 4" />
      <text x="270" y="98" textAnchor="middle" fontFamily="sans-serif" fontSize="14" fontWeight="700" fill="var(--ill-emerald-deep)">YOU?</text>

      {/* labels on existing blocks */}
      <text x="220" y="234" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="var(--ill-cream)">MODEL</text>
      <text x="310" y="234" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="var(--ill-cream)">GIVING</text>
      <text x="270" y="164" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="var(--ill-cream)">NETWORK</text>
      <text x="260" y="305" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="var(--ill-cream)">FOUNDER</text>
    </svg>
  );
}

/* ─── Spot illustration: trust shield */
export function TrustSpot({ className }: Props) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <path d="M40 8 L66 18 L66 40 Q66 60 40 72 Q14 60 14 40 L14 18 Z" fill="var(--ill-emerald)" />
      <path d="M26 40 l10 10 l18 -22" stroke="var(--ill-cream)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* ─── Spot illustration: stacked coins */
export function CoinsSpot({ className }: Props) {
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="40" cy="58" rx="28" ry="8" fill="var(--ill-tan-deep)" />
      <rect x="12" y="38" width="56" height="20" rx="4" fill="var(--ill-tan)" />
      <ellipse cx="40" cy="38" rx="28" ry="8" fill="var(--ill-tan-light)" />
      <ellipse cx="40" cy="38" rx="28" ry="8" fill="none" stroke="var(--ill-tan-deep)" strokeWidth="1.5" />
      <text x="40" y="42" textAnchor="middle" fontFamily="serif" fontSize="14" fontWeight="700" fill="var(--ill-ink)">$</text>
    </svg>
  );
}
