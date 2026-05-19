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
      {/* layered halo */}
      <ellipse cx="270" cy="240" rx="250" ry="210" fill="var(--ill-emerald-light)" opacity="0.16" />
      <ellipse cx="270" cy="240" rx="168" ry="150" fill="var(--ill-emerald-light)" opacity="0.12" />

      {/* depth card behind */}
      <g transform="translate(96, 92) rotate(-5 144 106)">
        <rect width="288" height="212" rx="22" fill="var(--ill-tan-light)" />
        <rect width="288" height="212" rx="22" fill="var(--ill-tan-deep)" opacity="0.12" transform="translate(6 8)" />
      </g>

      {/* primary meeting card */}
      <g transform="translate(132, 132) rotate(3 144 104)">
        <rect width="288" height="208" rx="22" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
        <rect x="26" y="26" width="74" height="12" rx="6" fill="var(--ill-emerald)" />
        <circle cx="262" cy="32" r="11" fill="var(--ill-emerald)" opacity="0.16" />
        <path d="M256 32 l4 4 l7 -8" stroke="var(--ill-emerald-deep)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="26" y="58" width="220" height="13" rx="5" fill="var(--ill-ink)" />
        <rect x="26" y="84" width="236" height="8" rx="4" fill="var(--ill-ink)" opacity="0.32" />
        <rect x="26" y="100" width="196" height="8" rx="4" fill="var(--ill-ink)" opacity="0.32" />
        <g transform="translate(26, 130)">
          <rect width="86" height="54" rx="12" fill="var(--ill-emerald)" />
          <rect width="86" height="16" rx="12" fill="var(--ill-emerald-deep)" opacity="0.5" />
          <text x="43" y="41" textAnchor="middle" fontFamily="sans-serif" fontSize="19" fontWeight="700" fill="var(--ill-cream)">Mtg</text>
        </g>
        <rect x="128" y="142" width="134" height="42" rx="21" fill="var(--ill-tan)" />
        <text x="195" y="168" textAnchor="middle" fontFamily="sans-serif" fontSize="15" fontWeight="700" fill="var(--ill-cream)">Confirmed</text>
      </g>

      {/* flow arc from card to medallion */}
      <path d="M408 286 Q452 310 444 352" stroke="var(--ill-emerald-deep)" strokeWidth="2.4" strokeDasharray="2 7" strokeLinecap="round" fill="none" opacity="0.5" />

      {/* $1,000 medallion */}
      <g transform="translate(428, 384)">
        <circle r="52" fill="var(--ill-emerald-deep)" opacity="0.15" transform="translate(4 6)" />
        <circle r="52" fill="var(--ill-emerald)" />
        <text textAnchor="middle" y="-3" fontFamily="serif" fontSize="22" fontWeight="700" fill="var(--ill-cream)">$1,000</text>
        <text textAnchor="middle" y="17" fontFamily="sans-serif" fontSize="9" fontWeight="700" fill="var(--ill-cream)" opacity="0.85" letterSpacing="1.5">TO CHARITY</text>
      </g>

      {/* heart cause badge */}
      <g transform="translate(74, 384)">
        <circle r="34" fill="var(--ill-tan-light)" />
        <circle r="34" fill="none" stroke="var(--ill-tan-deep)" strokeWidth="1.5" opacity="0.5" />
        <path d="M-13 -3 c-5 -5, 3 -13, 7 -6 l6 5 l6 -5 c4 -7, 12 1, 7 6 l-13 13 z" fill="var(--ill-emerald-deep)" />
      </g>

      {/* small floating coin */}
      <g transform="translate(456, 122)">
        <circle r="26" fill="var(--ill-tan)" />
        <text textAnchor="middle" y="8" fontFamily="serif" fontSize="24" fontWeight="700" fill="var(--ill-cream)">$</text>
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
      <ellipse cx="260" cy="200" rx="222" ry="172" fill="var(--ill-emerald-light)" opacity="0.16" />

      {/* node 1: vendor request */}
      <g transform="translate(70, 178)">
        <circle r="46" fill="var(--ill-tan)" />
        <rect x="-15" y="-18" width="30" height="36" rx="4" fill="var(--ill-cream)" />
        <rect x="-15" y="-18" width="30" height="8" rx="2" fill="var(--ill-tan-deep)" />
        <rect x="-9" y="-1" width="18" height="3" rx="1.5" fill="var(--ill-ink)" opacity="0.4" />
        <rect x="-9" y="7" width="18" height="3" rx="1.5" fill="var(--ill-ink)" opacity="0.4" />
      </g>
      <text x="70" y="252" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="var(--ill-ink)" letterSpacing="1">VENDOR</text>

      {/* arc 1 with $1,000 */}
      <path d="M120 168 Q186 116 252 168" stroke="var(--ill-emerald-deep)" strokeWidth="2.4" strokeDasharray="2 7" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M245 160 l8 9 l9 -7" stroke="var(--ill-emerald-deep)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
      <g transform="translate(186, 102)">
        <rect x="-35" y="-17" width="70" height="31" rx="15" fill="var(--ill-emerald)" />
        <text textAnchor="middle" y="5" fontFamily="serif" fontSize="15" fontWeight="700" fill="var(--ill-cream)">$1,000</text>
      </g>

      {/* node 2: hub */}
      <g transform="translate(262, 178)">
        <rect x="-46" y="-46" width="92" height="92" rx="20" fill="var(--ill-emerald)" />
        <circle cx="0" cy="-10" r="13" fill="var(--ill-cream)" opacity="0.95" />
        <path d="M-13 8 Q0 -3 13 8 L13 20 L-13 20 Z" fill="var(--ill-cream)" opacity="0.95" />
      </g>
      <text x="262" y="258" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="var(--ill-ink)" letterSpacing="1">THEBIGINTRO</text>

      {/* arc 2 with 100% */}
      <path d="M324 168 Q390 116 456 168" stroke="var(--ill-emerald-deep)" strokeWidth="2.4" strokeDasharray="2 7" strokeLinecap="round" fill="none" opacity="0.55" />
      <path d="M449 160 l8 9 l9 -7" stroke="var(--ill-emerald-deep)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
      <text x="390" y="104" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="var(--ill-ink)" opacity="0.6">100%</text>

      {/* node 3: charity */}
      <g transform="translate(456, 178)">
        <circle r="46" fill="var(--ill-tan-light)" />
        <circle r="46" fill="none" stroke="var(--ill-tan-deep)" strokeWidth="1.5" opacity="0.5" />
        <path d="M-16 -5 c-6 -6, 3 -16, 8 -7 l8 6 l8 -6 c5 -9, 14 1, 8 7 l-16 16 z" fill="var(--ill-emerald-deep)" />
      </g>
      <text x="456" y="252" textAnchor="middle" fontFamily="sans-serif" fontSize="13" fontWeight="700" fill="var(--ill-ink)" letterSpacing="1">CHARITY</text>
    </svg>
  );
}

/* ─── Opportunity page: building blocks */
export function OpportunityIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="260" cy="220" rx="220" ry="178" fill="var(--ill-tan-light)" opacity="0.38" />

      {/* foundation */}
      <rect x="150" y="286" width="220" height="56" rx="10" fill="var(--ill-ink)" />
      <text x="260" y="320" textAnchor="middle" fontFamily="sans-serif" fontSize="12" fontWeight="700" fill="var(--ill-cream)" letterSpacing="1">FOUNDER</text>

      {/* tier two */}
      <rect x="166" y="220" width="92" height="56" rx="10" fill="var(--ill-tan)" />
      <text x="212" y="254" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="var(--ill-cream)" letterSpacing="1">MODEL</text>
      <rect x="262" y="220" width="92" height="56" rx="10" fill="var(--ill-emerald)" />
      <text x="308" y="254" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="var(--ill-cream)" letterSpacing="1">GIVING</text>

      {/* tier three */}
      <rect x="210" y="154" width="100" height="56" rx="10" fill="var(--ill-tan-deep)" />
      <text x="260" y="188" textAnchor="middle" fontFamily="sans-serif" fontSize="11" fontWeight="700" fill="var(--ill-cream)" letterSpacing="1">NETWORK</text>

      {/* the missing block — the role on offer */}
      <path d="M260 154 L260 132" stroke="var(--ill-emerald-deep)" strokeWidth="2.4" strokeDasharray="2 6" strokeLinecap="round" opacity="0.6" />
      <rect x="210" y="74" width="100" height="56" rx="10" fill="var(--ill-emerald-light)" opacity="0.18" />
      <rect x="210" y="74" width="100" height="56" rx="10" fill="none" stroke="var(--ill-emerald-deep)" strokeWidth="2.5" strokeDasharray="7 5" />
      <text x="260" y="108" textAnchor="middle" fontFamily="sans-serif" fontSize="15" fontWeight="800" fill="var(--ill-emerald-deep)">YOU?</text>

      {/* accent coin */}
      <g transform="translate(408, 122)">
        <circle r="24" fill="var(--ill-tan)" />
        <text textAnchor="middle" y="7" fontFamily="serif" fontSize="22" fontWeight="700" fill="var(--ill-cream)">$</text>
      </g>
    </svg>
  );
}

/* ─── Pricing page: a statement with two clearly separated lines,
   the gift and the platform fee, never blended */
export function PricingIllustration({ className }: Props) {
  return (
    <svg viewBox="0 0 520 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <ellipse cx="260" cy="210" rx="220" ry="180" fill="var(--ill-emerald-light)" opacity="0.18" />

      {/* statement card */}
      <g transform="translate(120, 70)">
        <rect width="280" height="280" rx="18" fill="var(--card)" stroke="var(--border)" strokeWidth="1.5" />
        <rect x="28" y="30" width="120" height="12" rx="6" fill="var(--ill-ink)" opacity="0.7" />
        <rect x="28" y="52" width="80" height="8" rx="4" fill="var(--ill-ink)" opacity="0.25" />

        {/* line 1: the gift, emphasised */}
        <rect x="24" y="92" width="232" height="50" rx="10" fill="var(--ill-emerald)" opacity="0.12" />
        <circle cx="50" cy="117" r="12" fill="var(--ill-emerald)" />
        <path d="M45 117 l4 4 l8 -9" stroke="var(--ill-cream)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <rect x="72" y="110" width="92" height="9" rx="4" fill="var(--ill-ink)" opacity="0.5" />
        <text x="234" y="124" textAnchor="end" fontFamily="serif" fontSize="22" fontWeight="700" fill="var(--ill-emerald-deep)">$1,000</text>

        {/* line 2: the platform fee, separate */}
        <rect x="24" y="156" width="232" height="44" rx="10" fill="var(--ill-tan-light)" opacity="0.55" />
        <circle cx="50" cy="178" r="12" fill="var(--ill-tan)" />
        <rect x="72" y="171" width="108" height="9" rx="4" fill="var(--ill-ink)" opacity="0.4" />
        <rect x="206" y="173" width="46" height="12" rx="6" fill="var(--ill-tan-deep)" opacity="0.5" />

        {/* divider + footer note */}
        <rect x="24" y="222" width="232" height="2" rx="1" fill="var(--ill-ink)" opacity="0.12" />
        <rect x="24" y="240" width="150" height="8" rx="4" fill="var(--ill-ink)" opacity="0.2" />
      </g>

      {/* floating heart coin */}
      <g transform="translate(425, 108)">
        <circle r="30" fill="var(--ill-emerald)" />
        <path d="M-10 -2 c-4 -4, 2 -10, 6 -5 l4 4 l4 -4 c4 -5, 10 1, 6 5 l-10 9 z" fill="var(--ill-cream)" />
      </g>

      {/* floating coin */}
      <g transform="translate(82, 330)">
        <circle r="26" fill="var(--ill-tan)" />
        <text textAnchor="middle" y="8" fontFamily="serif" fontSize="24" fontWeight="700" fill="var(--ill-cream)">$</text>
      </g>
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
