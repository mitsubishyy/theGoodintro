import { PortalPage } from "@thegoodintro/ui";
import { RibbonSkeleton, TableCardSkeleton } from "@/app/_components/loading-skeletons";

/** Admin Meetings list loading state: 3-stat ribbon + T3 table skeleton. */
export default function AdminMeetingsLoading() {
  return (
    <PortalPage
      title="Meetings"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Meetings" }]}
    >
      <RibbonSkeleton groups={3} columns={3} />
      <TableCardSkeleton rows={8} />
    </PortalPage>
  );
}
