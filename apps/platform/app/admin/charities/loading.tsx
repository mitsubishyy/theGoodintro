import { LegacyPageSkeleton } from "@/app/_components/loading-skeletons";

/** Admin Charities loading state (legacy max-w-3xl page: H1 + table skeleton). */
export default function AdminCharitiesLoading() {
  return <LegacyPageSkeleton rows={8} />;
}
