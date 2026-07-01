import { Skeleton } from "@thegoodintro/ui";

/**
 * Shared route-loading skeletons for the admin + vendor portals.
 *
 * These render INSIDE the already-resolved portal shell (the sidebar + topbar
 * persist across a client navigation), so they only shape the content area. They
 * reuse the locked `--portal-*` density (dark ribbon, card radius, the `Skeleton`
 * primitive) and add no new visual language — BLUEPRINT §0: "loading uses real
 * skeletons, not spinners." Presentational only, so any `loading.tsx` can use them.
 */

const INK_BAR =
  "rounded animate-pulse bg-[color-mix(in_oklch,var(--portal-ink)_10%,transparent)]";

/** Dark metrics-ribbon shimmer with `groups` stat columns (T1 shape). */
export function RibbonSkeleton({
  groups = 4,
  columns = 4,
}: {
  groups?: number;
  columns?: number;
}) {
  return (
    <div
      className="rounded-2xl grid gap-x-2 gap-y-6 px-6 py-5 mb-5"
      style={{
        background: "var(--portal-ribbon)",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
      aria-hidden="true"
    >
      {Array.from({ length: groups }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-2.5 w-28 rounded animate-pulse bg-white/15" />
          <div className="h-7 w-20 rounded animate-pulse bg-white/25" />
          <div className="h-2.5 w-24 rounded animate-pulse bg-white/10" />
        </div>
      ))}
    </div>
  );
}

/** A locked T3 card table: header line + `rows` skeleton rows. */
export function TableCardSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
    >
      <div className="px-5 py-3 border-b" style={{ borderColor: "var(--portal-line)" }}>
        <div className={`h-2.5 w-2/3 ${INK_BAR}`} />
      </div>
      <Skeleton variant="row" lines={rows} />
    </div>
  );
}

/** A widget-card tile shimmer (T2): header row + N body rows. */
export function WidgetCardSkeleton({
  lines = 4,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border ${className}`}
      style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
      aria-hidden="true"
    >
      <div
        className="px-5 py-3.5 border-b flex items-center justify-between"
        style={{ borderColor: "var(--portal-line)" }}
      >
        <div className={`h-2.5 w-28 ${INK_BAR}`} />
        <div className={`h-2.5 w-10 ${INK_BAR}`} />
      </div>
      <div className="p-5">
        <Skeleton variant="row" lines={lines} />
      </div>
    </div>
  );
}

/**
 * A pre-blueprint page skeleton for the legacy `max-w-3xl` admin screens
 * (Reports / Giving / Charities): H1 shimmer + lede + a plain bordered table,
 * matching their non-ribbon layout so the header does not jump on resolve.
 */
export function LegacyPageSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="max-w-3xl px-8 py-6" aria-hidden="true">
      <div className={`h-6 w-40 ${INK_BAR}`} />
      <div className={`mt-3 h-3 w-3/4 ${INK_BAR}`} />
      <div
        className="mt-6 overflow-hidden rounded-xl border"
        style={{ borderColor: "var(--portal-line)" }}
      >
        <div className="px-4 py-2.5 border-b" style={{ borderColor: "var(--portal-line)" }}>
          <div className={`h-2.5 w-1/2 ${INK_BAR}`} />
        </div>
        <Skeleton variant="row" lines={rows} />
      </div>
    </div>
  );
}

/**
 * Centered placeholder skeleton matching the vendor `ComingSoon` layout, so
 * routes still in the locked IA but not yet ported give instant feedback while
 * their (cached) `getVendor()` auth round-trip resolves.
 */
export function CenteredSkeleton() {
  return (
    <main className="flex-1 min-w-0 px-8 py-6 grid place-items-center min-h-[60vh]" aria-hidden="true">
      <div className="max-w-md w-full flex flex-col items-center">
        <span className={`size-16 rounded-full ${INK_BAR}`} />
        <div className={`mt-5 h-2.5 w-24 ${INK_BAR}`} />
        <div className={`mt-3 h-4 w-40 ${INK_BAR}`} />
        <div className={`mt-3 h-3 w-64 ${INK_BAR}`} />
      </div>
    </main>
  );
}
