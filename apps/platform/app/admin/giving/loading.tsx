import { LegacyPageSkeleton } from "@/app/_components/loading-skeletons";

/** Admin Giving loading state (legacy max-w-3xl page: H1 + table skeleton). */
export default function AdminGivingLoading() {
  return <LegacyPageSkeleton rows={8} />;
}
