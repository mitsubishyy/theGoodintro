// Brand cue: any "good" in customer copy is rendered as "Good" in the
// brand emerald and the same Georgia serif used by the wordmark. The
// surface-specific weight is intentionally not set so it stays at the
// regular weight, matching the email header treatment.

export default function Good() {
  return (
    <span
      style={{
        color: "var(--primary)",
        fontFamily: "Georgia, 'Times New Roman', serif",
        letterSpacing: "0.01em",
      }}
    >
      Good
    </span>
  );
}
