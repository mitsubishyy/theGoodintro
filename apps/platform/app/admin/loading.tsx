import { PortalPage } from "@thegoodintro/ui";
import { RibbonSkeleton, WidgetCardSkeleton } from "@/app/_components/loading-skeletons";

/**
 * Admin dashboard loading state: PortalPage chrome + the dark 8-stat ribbon
 * silhouette + the locked 8/4 widget grid, so a client navigation into the
 * cockpit paints the full structure immediately (the page itself then streams
 * each widget in). Matches the locked T1+T2 density, no new visual language.
 */
export default function AdminDashboardLoading() {
  return (
    <PortalPage
      title="Dashboard"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Dashboard" }]}
    >
      <RibbonSkeleton groups={8} columns={4} />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <WidgetCardSkeleton lines={5} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCardSkeleton lines={4} />
        </div>
        <div className="lg:col-span-8">
          <WidgetCardSkeleton lines={4} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCardSkeleton lines={4} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCardSkeleton lines={3} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCardSkeleton lines={3} />
        </div>
        <div className="lg:col-span-4">
          <WidgetCardSkeleton lines={3} />
        </div>
      </div>
    </PortalPage>
  );
}
