import { PortalPage, Skeleton } from "@thegoodintro/ui";

/**
 * Admin Vendors list loading state (locked 2026-06-02): stat ribbon shimmer
 * bars on the dark band, then the table header row + 8 skeleton rows.
 */
export default function VendorsLoading() {
  return (
    <PortalPage
      title="Vendors"
      breadcrumb={[{ label: "Home", href: "/admin" }, { label: "Vendors" }]}
    >
      <div
        className="rounded-2xl grid grid-cols-3 gap-x-2 px-6 py-5 mb-5"
        style={{ background: "var(--portal-ribbon)" }}
        aria-hidden="true"
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-2.5 w-28 rounded animate-pulse bg-white/15" />
            <div className="h-7 w-20 rounded animate-pulse bg-white/25" />
            <div className="h-2.5 w-24 rounded animate-pulse bg-white/10" />
          </div>
        ))}
      </div>
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
      >
        <div className="px-5 py-3 border-b" style={{ borderColor: "var(--portal-line)" }}>
          <div className="h-2.5 w-2/3 rounded animate-pulse bg-[color-mix(in_oklch,var(--portal-ink)_10%,transparent)]" />
        </div>
        <Skeleton variant="row" lines={8} />
      </div>
    </PortalPage>
  );
}
