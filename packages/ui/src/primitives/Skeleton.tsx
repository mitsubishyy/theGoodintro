/**
 * Real skeletons at row / card / text shape — never spinners (BLUEPRINT §0).
 * Use as the loading state of any list / row / card. Uses Tailwind's built-in
 * `animate-pulse` so no global keyframe is required.
 */

export type SkeletonVariant = "text" | "row" | "card" | "circle";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  /** Number of skeleton lines/rows; default 1 for text, 4 for row, 3 for card. */
  lines?: number;
  /** Tailwind className for sizing overrides. */
  className?: string;
}

const BAR =
  "rounded animate-pulse bg-[color-mix(in_oklch,var(--portal-ink)_10%,transparent)]";

export function Skeleton({ variant = "text", lines, className = "" }: SkeletonProps) {
  if (variant === "circle") {
    return <span className={`block rounded-full animate-pulse ${className || "size-8"}`} style={{ background: "color-mix(in oklch, var(--portal-ink) 10%, transparent)" }} aria-hidden="true" />;
  }
  if (variant === "card") {
    const n = lines ?? 3;
    return (
      <div className={`rounded-2xl border p-5 ${className}`} style={{ borderColor: "var(--portal-line)" }} aria-hidden="true">
        <div className={`h-4 w-1/3 ${BAR}`} />
        <div className="mt-4 space-y-2">
          {Array.from({ length: n }).map((_, i) => (
            <div key={i} className={`h-3 ${BAR}`} style={{ width: `${80 - i * 10}%` }} />
          ))}
        </div>
      </div>
    );
  }
  if (variant === "row") {
    const n = lines ?? 4;
    return (
      <div className="divide-y" style={{ borderColor: "var(--portal-line)" }} aria-hidden="true">
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} className="px-5 py-3.5 flex items-center gap-3">
            <span className={`size-6 rounded-full ${BAR}`} />
            <span className={`h-3 flex-1 ${BAR}`} style={{ maxWidth: 240 }} />
            <span className={`h-3 w-12 ${BAR}`} />
          </div>
        ))}
      </div>
    );
  }
  // text
  const n = lines ?? 1;
  return (
    <div className={`space-y-2 ${className}`} aria-hidden="true">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className={`h-3 ${BAR}`} style={{ width: `${85 - i * 8}%` }} />
      ))}
    </div>
  );
}
