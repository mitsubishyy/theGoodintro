import { LegacyPageSkeleton } from "@/app/_components/loading-skeletons";

/** Admin Reports loading state (legacy max-w-3xl page: H1 + table skeleton). */
export default function AdminReportsLoading() {
  return <LegacyPageSkeleton rows={6} />;
}
