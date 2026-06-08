/**
 * Initials block (default) or photo. Initials are extracted from `name`; the
 * background uses --portal-amber-soft with ink colour for an antique-gold chip.
 * Production photos read from a record's photo_url field; mockups may use a src
 * literal but production never does.
 */

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  /** Override the default amber-soft chip background. */
  className?: string;
}

export function initialsOf(name: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

export function Avatar({ name, src, size = 32, className = "" }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-mono uppercase font-semibold shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        background: "var(--portal-amber-soft)",
        color: "var(--portal-amber-ink)",
        fontSize: Math.max(10, Math.round(size * 0.36)),
        letterSpacing: "0.04em",
      }}
      aria-label={name}
    >
      {initialsOf(name)}
    </span>
  );
}
