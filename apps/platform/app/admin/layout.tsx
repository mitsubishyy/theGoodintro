import Image from "next/image";
import { requireStaff } from "@/lib/auth";
import { getFlag } from "@/lib/flags";
import { signOutAction } from "@/app/login/actions";
import {
  PortalShell,
  PortalSidebar,
  PortalTopbar,
  StatusDot,
  Wordmark,
  type NavItem,
} from "@thegoodintro/ui";

/**
 * Admin portal shell — ported from the hand-rolled three-file shell to
 * @thegoodintro/ui per the Admin Dashboard re-lock 2026-06-09 + UI_KIT_BRIEF §0.
 *
 *   - PortalShell composes sidebar + topbar + the page slot the route fills.
 *   - PortalSidebar uses the re-locked admin emerald palette
 *     (--portal-emerald-sidebar oklch(0.45 0.10 158)) with the cream wordmark
 *     + sage-mint "Good" + 24px square logomark from /brand-mark.png.
 *   - PortalTopbar carries the command-K search and the locked
 *     "All systems operational" status block in its context slot. The page H1
 *     lives in <PortalPage>, not the topbar.
 *
 * The admin_shell feature flag gates the surface and stays OFF by default
 * (CHANGE_SAFETY.md).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { staff, supabase } = await requireStaff();
  const enabled = await getFlag("admin_shell");

  if (!enabled) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: "var(--portal-page)", color: "var(--foreground)" }}
      >
        <div className="max-w-md">
          <p
            className="font-mono text-xs uppercase tracking-[0.18em]"
            style={{ color: "var(--portal-amber-ink)" }}
          >
            Feature flag off
          </p>
          <h1 className="mt-2 text-xl font-semibold">Admin shell is not enabled</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Turn on the <code>admin_shell</code> flag in <code>feature_flag</code> to view the cockpit.
          </p>
        </div>
      </main>
    );
  }

  // Sidebar badge counts. Mirrors the data sources table in the Admin Dashboard
  // README: Meetings = confirmed + proposed; Vendors = in onboarding; Inbox =
  // unread; Pending requests sub-nav = submitted requests.
  const head = { count: "exact" as const, head: true };
  const [confirmedC, proposedC, vendorsOnboarding, submittedC] = await Promise.all([
    supabase.from("meeting").select("id", head).eq("status", "confirmed"),
    supabase.from("meeting").select("id", head).eq("status", "proposed"),
    supabase.from("vendor").select("id", head).in("status", ["signed_up", "call_booked", "approved", "paid"]),
    supabase.from("request").select("id", head).eq("status", "submitted"),
  ]);
  const meetingsBadge = (confirmedC.count ?? 0) + (proposedC.count ?? 0);
  const vendorsBadge = vendorsOnboarding.count ?? 0;
  const pendingRequestsBadge = submittedC.count ?? 0;
  // Inbox is wired through the Admin Inbox port (separate); placeholder until then.
  const inboxBadge = 0;

  const operations: NavItem[] = [
    { label: "Dashboard", href: "/admin", icon: "grid" },
    {
      label: "Meetings",
      href: "/admin/meetings",
      icon: "calendar",
      badgeCount: meetingsBadge,
      children: [
        // status params must be real meeting_status enum values
        // (proposed/confirmed/held/no_show/cancelled/reversed); the labels stay
        // operator-friendly.
        { label: "Scheduled", href: "/admin/meetings?status=confirmed", icon: "calendar" },
        { label: "Pending requests", href: "/admin/requests", icon: "inbox", badgeCount: pendingRequestsBadge },
        { label: "Completed", href: "/admin/meetings?status=held", icon: "calendar" },
        { label: "Cancellations", href: "/admin/meetings?status=cancelled", icon: "calendar" },
      ],
    },
    { label: "Vendors", href: "/admin/vendors", icon: "box", badgeCount: vendorsBadge },
    { label: "Executives", href: "/admin/executives", icon: "user" },
    { label: "Checklists", href: "/admin/checklists", icon: "grid" },
    { label: "Gifts & Charities", href: "/admin/giving", icon: "heart" },
  ];

  const communication: NavItem[] = [
    { label: "Inbox", href: "/admin/inbox", icon: "inbox", badgeCount: inboxBadge },
    { label: "Templates", href: "/admin/templates", icon: "chat" },
  ];

  const configure: NavItem[] = [
    { label: "Reports", href: "/admin/reports", icon: "grid" },
    { label: "Tags", href: "/admin/tags", icon: "gift" },
    { label: "Settings", href: "/admin/settings", icon: "cog" },
  ];

  const brand = (
    <div className="flex items-center gap-3.5">
      <Image
        src="/brand-mark.png"
        alt=""
        width={48}
        height={48}
        // The mark renders at 48px but -m-3 (12px negative margin all round)
        // pulls its layout box back to the original 24px footprint, so it
        // enlarges by overflowing its slot WITHOUT moving the wordmark (size
        // 20) or ADMIN subtitle (10px) — their size and position stay fixed.
        // rounded-full + the white border give the email-signature ringed-disc
        // look (the white ring separates the green disc from the green sidebar
        // so the mark pops). The mark is a sibling of the stacked
        // wordmark+subtitle so items-center centres it against the FULL two-line
        // block, not just the wordmark line. 48px is the ceiling: any larger and
        // it would collide with the wordmark.
        className="rounded-full shrink-0 object-cover -m-3 border-[3px] border-white"
        style={{ width: 48, height: 48 }}
        priority
      />
      <div className="flex flex-col gap-1">
        <Wordmark
          size={20}
          surface="dark"
          goodColor="var(--portal-emerald-sidebar-good)"
        />
        <span
          className="text-[10px] font-mono uppercase tracking-[0.18em]"
          style={{ color: "var(--portal-emerald-sidebar-muted)" }}
        >
          ADMIN · PRODUCTION
        </span>
      </div>
    </div>
  );

  const topbarContext = (
    <div className="hidden md:flex items-center gap-2 text-[12px]" style={{ color: "var(--muted-foreground)" }}>
      <StatusDot tone="green" size={8} />
      <span>All systems operational</span>
    </div>
  );

  return (
    <PortalShell
      sidebar={
        <PortalSidebar
          portal="admin"
          brand={brand}
          groups={[
            { heading: "Operations", items: operations },
            { heading: "Communication", items: communication },
            { heading: "Configure", items: configure },
          ]}
          account={{ name: staff.name as string, role: "Owner" }}
          signOutSlot={
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-[10px] uppercase tracking-[0.16em] opacity-70 hover:opacity-100"
                style={{ color: "var(--portal-emerald-sidebar-text)" }}
              >
                Sign out
              </button>
            </form>
          }
        />
      }
      topbar={
        <PortalTopbar
          searchPlaceholder="Search meetings, executives, vendors, charities"
          context={topbarContext}
          unreadCount={inboxBadge}
          account={{ name: staff.name as string }}
        />
      }
    >
      {children}
    </PortalShell>
  );
}
