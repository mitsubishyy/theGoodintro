import { RibbonSkeleton, WidgetCardSkeleton } from "@/app/_components/loading-skeletons";

/**
 * Vendor dashboard loading state. Renders inside the vendor shell (the topbar
 * carries the H1), so it shapes only the content column: the skinny ribbon
 * silhouette + a couple of widget cards at the locked density. Matches the
 * dashboard's `px-8 py-7 max-w-[1280px]` wrapper so nothing shifts on resolve.
 */
export default function VendorDashboardLoading() {
  return (
    <main className="flex-1 min-w-0 px-8 py-7 w-full max-w-[1280px]">
      <RibbonSkeleton groups={4} columns={4} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <WidgetCardSkeleton lines={4} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCardSkeleton lines={4} />
        </div>
        <div className="lg:col-span-8">
          <WidgetCardSkeleton lines={3} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCardSkeleton lines={3} />
        </div>
      </div>
    </main>
  );
}
