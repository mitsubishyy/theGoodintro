import { TableCardSkeleton } from "@/app/_components/loading-skeletons";

const INK_BAR =
  "rounded animate-pulse bg-[color-mix(in_oklch,var(--portal-ink)_10%,transparent)]";

/**
 * Vendor Executives list loading state. Shapes the content column to the locked
 * list: the three-stat header strip + the search/filter row + the T3 table,
 * matching the `px-8 py-6 max-w-[1280px]` wrapper so nothing shifts on resolve.
 */
export default function VendorExecutivesLoading() {
  return (
    <main className="flex-1 min-w-0 px-8 py-6 w-full max-w-[1280px]" aria-hidden="true">
      <div className="flex items-center gap-8 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className={`h-6 w-10 ${INK_BAR}`} />
            <div className={`h-2.5 w-24 ${INK_BAR}`} />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mb-5">
        <div className={`h-10 flex-1 max-w-md ${INK_BAR}`} />
        <div className={`h-10 w-24 ${INK_BAR}`} />
      </div>
      <TableCardSkeleton rows={10} />
    </main>
  );
}
