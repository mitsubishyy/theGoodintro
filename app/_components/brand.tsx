type BrandProps = {
  className?: string;
};

/**
 * theGoodintro wordmark. "Good" is the brand accent — rendered in Fraunces
 * italic emerald, matching the hp-brand-mark dot at the same emerald hue.
 *
 * The optional brand mark (a small emerald disc with a cream centre) is shown
 * via the surrounding component when it makes sense (nav, footer); plain
 * wordmark usage skips it.
 */
export default function Brand({ className }: BrandProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-inter), system-ui, sans-serif",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        // --foreground is dark ink in both the HopeRise and legacy themes;
        // --cream-11 means "light" in the legacy theme and turned the
        // "the"/"intro" text near-white on /apply.
        color: "var(--foreground)",
      }}
    >
      the
      <span
        style={{
          fontFamily: "var(--font-fraunces), Georgia, serif",
          fontStyle: "italic",
          fontWeight: 500,
          color: "var(--primary)",
        }}
      >
        Good
      </span>
      intro
    </span>
  );
}
