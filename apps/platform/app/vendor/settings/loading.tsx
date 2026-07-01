import { WidgetCardSkeleton } from "@/app/_components/loading-skeletons";

const INK_BAR =
  "rounded animate-pulse bg-[color-mix(in_oklch,var(--portal-ink)_10%,transparent)]";

/**
 * Vendor Settings loading state. Matches the settings page wrapper
 * (`px-6 py-8` → centered `max-w-[680px]`): eyebrow + H1 + lede shimmer, then
 * the stacked profile/company cards, so the header does not jump on resolve.
 */
export default function VendorSettingsLoading() {
  return (
    <div className="px-6 py-8" aria-hidden="true">
      <div className="mx-auto max-w-[680px]">
        <header className="mb-7">
          <div className={`h-2.5 w-40 ${INK_BAR}`} />
          <div className={`mt-3 h-6 w-32 ${INK_BAR}`} />
          <div className={`mt-2 h-3 w-72 ${INK_BAR}`} />
        </header>
        <div className="flex flex-col gap-5">
          <WidgetCardSkeleton lines={4} />
          <WidgetCardSkeleton lines={3} />
        </div>
      </div>
    </div>
  );
}
