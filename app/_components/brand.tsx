type BrandProps = {
  className?: string;
};

export default function Brand({ className }: BrandProps) {
  return (
    <span className={className}>
      the<span style={{ color: "var(--primary)" }}>Good</span>intro
    </span>
  );
}
