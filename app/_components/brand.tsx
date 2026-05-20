type BrandProps = {
  className?: string;
};

export default function Brand({ className }: BrandProps) {
  return (
    <span className={className}>
      the
      <span
        style={{
          color: "var(--primary)",
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontWeight: 700,
          letterSpacing: "0.01em",
        }}
      >
        Good
      </span>
      intro
    </span>
  );
}
