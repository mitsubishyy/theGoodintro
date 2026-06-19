import Image from "next/image";
import { getVendor } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { signOutAction } from "@/app/login/actions";
import { formatDate } from "@/lib/format";
import { bandForMeetingNumber } from "@thegoodintro/pricing";
import {
  PortalShell,
  PortalSidebar,
  Wordmark,
  initialsOf,
  type NavItem,
} from "@thegoodintro/ui";
import { VendorTopbar } from "./_components/topbar";

/**
 * Vendor portal shell — ported from the locked Vendor Dashboard
 * (UI_KIT_DESIGN_LOG LOCKED 2026-06-05 + design/locked/vendor-dashboard/).
 *
 *   - Deep teal-pine sidebar (`--vendor-sidebar`) with the locked IA:
 *     REQUEST (Dashboard · Executives · Requests ▾ · Meetings ▾) · GOOD
 *     (Giving) · ACCOUNT (Owner-only: Get started · Team · Billing & credits ·
 *     Settings).
 *   - Vendor identity card above the user chip ("Acme Robotics · Band 2 ·
 *     Renews 12 Mar 2027").
 *   - Topbar carries the page H1 + "ACME ROBOTICS · BAND N" mono eyebrow
 *     (vendor keeps the title in the topbar, unlike admin).
 *
 * The vendor_shell flag gates the surface and is OFF by default
 * (CHANGE_SAFETY.md): flag off renders the pre-port pages unchanged. The shell
 * also only wraps ACTIVE vendors — the locked pre-payment shell variant
 * (padlocked nav + lockout page, vendor-signup-and-prepayment lock) is a
 * separate port; until then non-active vendors keep the existing vetting flow.
 */

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getVendor();
  const vendor = one<{
    id: string;
    name: string;
    status: string;
    access_expires_at: string | null;
  }>(result?.vendorUser?.vendor);

  const enabled =
    !!result?.vendorUser && vendor?.status === "active" && (await getFlag("vendor_shell"));
  if (!enabled || !vendor || !result?.vendorUser) return <>{children}</>;

  const supabase = result.supabase;
  const head = { count: "exact" as const, head: true };
  const [submittedC, upcomingC, cycleRes] = await Promise.all([
    // Sidebar Requests badge: open requests waiting on the exec.
    supabase.from("request").select("id", head).eq("status", "submitted"),
    // Sidebar Meetings badge: proposed/confirmed with a future time locked in.
    supabase
      .from("meeting")
      .select("id", head)
      .in("status", ["proposed", "confirmed"])
      .gte("scheduled_at", new Date().toISOString()),
    supabase
      .from("cycle")
      .select("held_meetings_count")
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);
  const requestsBadge = submittedC.count ?? 0;
  const meetingsBadge = upcomingC.count ?? 0;

  // Band is recomputed on view from the pricing engine, never stored.
  const held = (cycleRes.data?.held_meetings_count as number) ?? 0;
  const band = bandForMeetingNumber(held + 1);
  const bandLabel = `Band ${band.band}`;

  const isOwner = (result.vendorUser.role as string) === "owner";

  const request: NavItem[] = [
    { label: "Dashboard", href: "/vendor", icon: "grid" },
    { label: "Executives", href: "/vendor/executives", icon: "user" },
    {
      label: "Requests",
      href: "/vendor/requests",
      icon: "inbox",
      badgeCount: requestsBadge,
      children: [
        // status params are real request_status enum values
        // (submitted/accepted/declined); labels stay the locked vendor copy.
        { label: "Pending", href: "/vendor/requests?status=submitted", icon: "inbox", badgeCount: requestsBadge },
        { label: "Accepted", href: "/vendor/requests?status=accepted", icon: "inbox" },
        { label: "Declined", href: "/vendor/requests?status=declined", icon: "inbox" },
      ],
    },
    {
      label: "Meetings",
      href: "/vendor/meetings",
      icon: "calendar",
      children: [
        { label: "Upcoming", href: "/vendor/meetings?when=upcoming", icon: "calendar", badgeCount: meetingsBadge },
        { label: "Past", href: "/vendor/meetings?when=past", icon: "calendar" },
      ],
    },
  ];

  const good: NavItem[] = [{ label: "Giving", href: "/vendor/giving", icon: "heart" }];

  // Get started carries no badge yet: the locked count source (open
  // checklist_item rows) has no schema behind it until checklists are built.
  const account: NavItem[] = [
    { label: "Get started", href: "/vendor/get-started", icon: "check" },
    { label: "Team", href: "/vendor/team", icon: "user" },
    { label: "Billing & credits", href: "/vendor/billing", icon: "tag" },
    { label: "Settings", href: "/vendor/settings", icon: "cog" },
  ];

  const groups = [
    { heading: "Request", items: request },
    { heading: "Good", items: good },
    ...(isOwner ? [{ heading: "Account", items: account }] : []),
  ];

  const brand = (
    <div className="flex items-center gap-3.5">
      <Image
        src="/brand-mark.png"
        alt=""
        width={40}
        height={40}
        className="rounded-md shrink-0 object-cover -m-2"
        style={{ width: 40, height: 40 }}
        priority
      />
      <Wordmark size={20} surface="dark" goodColor="var(--portal-emerald-sidebar-good)" />
    </div>
  );

  return (
    <PortalShell
      sidebar={
        <PortalSidebar
          portal="vendor"
          brand={brand}
          groups={groups}
          identity={{
            initials: initialsOf(vendor.name),
            title: vendor.name,
            subtitle: vendor.access_expires_at
              ? `${bandLabel} · Renews ${formatDate(vendor.access_expires_at)}`
              : bandLabel,
          }}
          account={{
            name: (result.vendorUser.name as string) ?? "You",
            role: isOwner ? "Owner" : "Member",
          }}
          signOutSlot={
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-[10px] uppercase tracking-[0.16em] opacity-70 hover:opacity-100 text-left"
                style={{ color: "var(--vendor-sidebar-ink)" }}
              >
                {vendor.name} · {isOwner ? "Owner" : "Member"} · sign out
              </button>
            </form>
          }
        />
      }
      topbar={
        <VendorTopbar
          eyebrow={`${vendor.name.toUpperCase()} · ${bandLabel.toUpperCase()}`}
          account={{ name: (result.vendorUser.name as string) ?? "You" }}
        />
      }
    >
      {children}
    </PortalShell>
  );
}
