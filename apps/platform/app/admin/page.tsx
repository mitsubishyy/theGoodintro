import type { Metadata } from "next";
import { Suspense } from "react";
import { PortalPage, Button } from "@thegoodintro/ui";
import {
  RibbonSkeleton,
  WidgetCardSkeleton,
} from "@/app/_components/loading-skeletons";
import { LastRefreshed } from "./_lib/LastRefreshed";
import {
  RibbonSection,
  BookedMeetingsWidget,
  PendingRequestsWidget,
  NeedsActionWidget,
  DistributionsWidget,
  UnrespondedCommsWidget,
  RecentOnboardsWidget,
  GiftsSentWidget,
} from "./_widgets/sections";

export const metadata: Metadata = {
  title: "Dashboard — TheGoodIntro admin",
  robots: { index: false, follow: false },
};

const SYDNEY_TZ = "Australia/Sydney";

/**
 * Admin dashboard. The PortalPage chrome + the widget grid structure paint on
 * the first frame; the ribbon and each heavy widget are independent async server
 * components that STREAM into their Suspense slots, so a slow widget never blocks
 * the whole page (BLUEPRINT §0 — "loading uses real skeletons"). Every widget's
 * data source + calculation is unchanged; the fetches were lifted verbatim into
 * `_widgets/sections.tsx`. Keeps all widgets (none dropped) per the reproduce rule.
 */
export default async function AdminDashboard() {
  const now = new Date();
  const todayLabel = new Intl.DateTimeFormat("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SYDNEY_TZ,
  }).format(now);
  const stampIso = now.toISOString();

  return (
    <PortalPage
      title="Dashboard"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Dashboard" }]}
      action={
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" href="/admin/reports">
            Export
          </Button>
          <Button variant="primary" size="md" href="/admin/meetings/new">
            + New meeting
          </Button>
        </div>
      }
    >
      <p className="text-[13px] -mt-2 mb-5" style={{ color: "var(--muted-foreground)" }}>
        {todayLabel} · <LastRefreshed since={stampIso} />
      </p>

      <Suspense fallback={<RibbonSkeleton groups={8} columns={4} />}>
        <RibbonSection />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <Suspense fallback={<WidgetCardSkeleton lines={5} />}>
            <BookedMeetingsWidget />
          </Suspense>
        </div>
        <div className="lg:col-span-4">
          <Suspense fallback={<WidgetCardSkeleton lines={4} />}>
            <PendingRequestsWidget />
          </Suspense>
        </div>

        <div className="lg:col-span-8">
          <Suspense fallback={<WidgetCardSkeleton lines={4} />}>
            <NeedsActionWidget />
          </Suspense>
        </div>
        <div className="lg:col-span-4">
          <Suspense fallback={<WidgetCardSkeleton lines={3} />}>
            <DistributionsWidget />
          </Suspense>
        </div>

        <div className="lg:col-span-4">
          {/* Static empty state — no fetch, renders immediately. */}
          <UnrespondedCommsWidget />
        </div>
        <div className="lg:col-span-4">
          <Suspense fallback={<WidgetCardSkeleton lines={3} />}>
            <RecentOnboardsWidget />
          </Suspense>
        </div>
        <div className="lg:col-span-4">
          <Suspense fallback={<WidgetCardSkeleton lines={3} />}>
            <GiftsSentWidget />
          </Suspense>
        </div>
      </div>
    </PortalPage>
  );
}
