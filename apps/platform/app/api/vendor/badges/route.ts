import { NextResponse } from "next/server";
import { getVendor } from "@/lib/auth";

export const dynamic = "force-dynamic";

function one<T>(v: unknown): T | undefined {
  return (Array.isArray(v) ? v[0] : v) as T | undefined;
}

/**
 * Deferred sidebar badge counts for the vendor shell (active vendors only). The
 * shell paints immediately and hydrates these after mount (PortalSidebar
 * `badgeSource`). Mirrors the counts the vendor layout used to run inline:
 * Requests = submitted (waiting on the exec); Upcoming = confirmed with a future
 * time; Pending = proposed (a time is still being arranged). The Upcoming/Pending
 * split matches the /vendor/meetings buckets exactly, so each nav badge always
 * agrees with its filtered list. Vendor-scoped by RLS; the active-status gate
 * mirrors the shell.
 *
 * Gated on vendor membership + active status only (not the `vendor_shell` flag):
 * the sidebar only calls this endpoint when the flag-gated active-vendor shell is
 * mounted, so flag parity is already enforced client-side, and `getFlag` is not
 * reliable inside a route handler (Supabase-SSR cookie context differs).
 */
export async function GET() {
  const result = await getVendor();
  const vendor = one<{ status: string }>(result?.vendorUser?.vendor);
  if (!result?.vendorUser || vendor?.status !== "active") {
    return NextResponse.json({}, { status: 401 });
  }

  const supabase = result.supabase;
  const head = { count: "exact" as const, head: true };
  const nowIso = new Date().toISOString();
  const [submittedC, upcomingC, pendingC] = await Promise.all([
    supabase.from("request").select("id", head).eq("status", "submitted"),
    // Upcoming = confirmed with a future time (matches the "upcoming" bucket).
    supabase.from("meeting").select("id", head).eq("status", "confirmed").gte("scheduled_at", nowIso),
    // Pending = proposed (a time is still being arranged; no scheduled_at yet).
    supabase.from("meeting").select("id", head).eq("status", "proposed"),
  ]);

  return NextResponse.json({
    requests: submittedC.count ?? 0,
    upcoming: upcomingC.count ?? 0,
    pending: pendingC.count ?? 0,
  });
}
