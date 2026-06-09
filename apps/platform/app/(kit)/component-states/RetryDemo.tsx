"use client";

import { Widget } from "@thegoodintro/ui";

/** Tiny client wrapper so the error variant can demo the Retry button — the
 *  Widget's error state calls `onRetry` on click, which needs a client island.
 *  No-op retry; the kit reference is presentational only. */
export function DistributionsErrorDemo() {
  return (
    <Widget
      title="Distributions"
      state="error"
      errorMessage="Could not load distributions."
      lastRefresh="18 minutes ago"
      onRetry={() => {}}
      link={{ label: "Details", href: "/admin/reports" }}
    />
  );
}
