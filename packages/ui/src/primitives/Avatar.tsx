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
  // Drop parenthetical annotations (the "(synthetic)" in seed/demo names) and
  // keep only whitespace-separated tokens that contain a letter, taking each
  // token's first *letter*. Without this, "Issy (synthetic)" yields "I(" — a
  // punctuation char leaks in as an initial across every avatar surface.
  const words = name
    .replace(/\([^)]*\)/g, " ")
    .split(/\s+/)
    .map((w) => w.match(/[A-Za-z][A-Za-z'-]*/)?.[0])
    .filter((w): w is string => Boolean(w));
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0]!.slice(0, 2).toUpperCase();
  return (words[0]![0]! + words[words.length - 1]![0]!).toUpperCase();
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
