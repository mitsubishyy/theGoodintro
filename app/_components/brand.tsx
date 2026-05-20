type BrandProps = {
  className?: string;
};

export default function Brand({ className }: BrandProps) {
  return (
    <span
      className={className}
      style={{
        fontFamily:
          "var(--font-libre-caslon), Georgia, 'Times New Roman', serif",
        fontWeight: 700,
        letterSpacing: "0",
      }}
    >
      the
      <span style={{ color: "var(--primary)" }}>Good</span>
      intro
    </span>
  );
}
