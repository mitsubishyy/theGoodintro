import { ExecChromeSkeleton } from "./_components/exec-chrome-skeleton";

/**
 * Exec dashboard loading state. Exec pages render their own ExecShell (there is
 * no shared exec layout), so the skeleton mirrors the full charcoal shell
 * silhouette + a calm content placeholder, matching the sibling exec routes
 * (/exec/impact, /exec/meetings, ...) that already ship this.
 */
export default function ExecHomeLoading() {
  return <ExecChromeSkeleton title="Home" />;
}
