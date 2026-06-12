"use client";

import { usePathname } from "next/navigation";
import { PortalTopbar } from "@thegoodintro/ui";

/**
 * Vendor topbar — the vendor portal keeps the page H1 in the topbar (locked
 * Vendor Dashboard topbar: H1 + "ACME ROBOTICS · BAND 2" mono eyebrow +
 * search · bell · avatar). The shell layout renders one topbar for every
 * vendor route, so the title is derived from the pathname here.
 *
 * The search affordance destination and the bell's unread source are both
 * parked open decisions (Vendor Dashboard README); the affordances render per
 * the lock, inert for now.
 */

const TITLES: [test: (path: string) => boolean, title: string][] = [
  [(p) => p === "/vendor", "Dashboard"],
  [(p) => /^\/vendor\/executives\/[^/]+\/request$/.test(p), "Request a meeting"],
  [(p) => p.startsWith("/vendor/executives"), "Executives"],
  [(p) => p.startsWith("/vendor/requests"), "Requests"],
  [(p) => p.startsWith("/vendor/meetings"), "Meetings"],
  [(p) => p.startsWith("/vendor/giving"), "Giving"],
  [(p) => p.startsWith("/vendor/get-started"), "Get started"],
  [(p) => p.startsWith("/vendor/team"), "Team"],
  [(p) => p.startsWith("/vendor/billing"), "Billing & credits"],
  [(p) => p.startsWith("/vendor/settings"), "Settings"],
];

export function VendorTopbar({
  eyebrow,
  account,
}: {
  eyebrow: string;
  account: { name: string };
}) {
  const pathname = usePathname() ?? "/vendor";
  const title = TITLES.find(([test]) => test(pathname))?.[1] ?? "Dashboard";
  return (
    <PortalTopbar
      title={title}
      eyebrow={eyebrow}
      searchPlaceholder="Search"
      account={account}
    />
  );
}
