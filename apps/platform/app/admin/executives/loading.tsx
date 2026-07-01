import { PortalPage } from "@thegoodintro/ui";
import { RibbonSkeleton, TableCardSkeleton } from "@/app/_components/loading-skeletons";

/** Admin Executives list loading state: 3-stat ribbon + T3 table skeleton. */
export default function AdminExecutivesLoading() {
  return (
    <PortalPage
      title="Executives"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Executives" }]}
    >
      <RibbonSkeleton groups={3} columns={3} />
      <TableCardSkeleton rows={8} />
    </PortalPage>
  );
}
