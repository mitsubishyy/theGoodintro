import { NextResponse } from "next/server";
import { getStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Deferred sidebar badge counts for the admin shell. The shell paints its stable
 * nav immediately and hydrates these amber numbers after mount (PortalSidebar
 * `badgeSource`), so the layout no longer blocks first render on four count
 * queries. Mirrors the count sources the admin layout used to run inline:
 * Meetings = confirmed + proposed; Vendors = in onboarding; Pending requests =
 * submitted. Staff-gated, and every count also runs under the caller's RLS.
 *
 * Gated on staff role only (not the `admin_shell` flag): the sidebar only calls
 * this endpoint when the flag-gated shell is mounted, so flag parity is already
 * enforced client-side, and `getFlag` is not reliable inside a route handler
 * (Supabase-SSR cookie context differs from a server component).
 */
export async function GET() {
  const session = await getStaff();
  if (!session?.staff) {
    return NextResponse.json({}, { status: 401 });
  }

  const supabase = await createClient();
  const head = { count: "exact" as const, head: true };
  const [confirmedC, proposedC, vendorsOnboarding, submittedC] = await Promise.all([
    supabase.from("meeting").select("id", head).eq("status", "confirmed"),
    supabase.from("meeting").select("id", head).eq("status", "proposed"),
    supabase
      .from("vendor")
      .select("id", head)
      .in("status", ["signed_up", "call_booked", "approved", "paid"]),
    supabase.from("request").select("id", head).eq("status", "submitted"),
  ]);

  return NextResponse.json({
    meetings: (confirmedC.count ?? 0) + (proposedC.count ?? 0),
    vendors: vendorsOnboarding.count ?? 0,
    pendingRequests: submittedC.count ?? 0,
  });
}
