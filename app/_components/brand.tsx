type BrandProps = {
  className?: string;
};

export default function Brand({ className }: BrandProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-fraunces), Georgia, 'Times New Roman', serif",
        fontWeight: 500,
        letterSpacing: "0",
        fontVariationSettings: '"opsz" 144, "SOFT" 0, "WONK" 0',
      }}
    >
      the
      <span style={{ color: "var(--primary)" }}>Good</span>
      intro
    </span>
  );
}
