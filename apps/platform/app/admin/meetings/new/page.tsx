import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFlag } from "@/lib/flags";
import { NewMeetingForm } from "./new-form";
import { createMeetingAction } from "../actions";

export const metadata: Metadata = {
  title: "New meeting · TheGoodIntro admin",
  robots: { index: false, follow: false },
};

/**
 * Admin manual "schedule a meeting" route (the dead 404 the meetings list and
 * dashboard both link to). The happy path auto-creates a meeting on exec accept;
 * this is the fallback for a meeting arranged off-platform. It creates an
 * accepted request + a proposed meeting via createMeetingAction (reusing
 * confirmMeeting for the reserve when a time is given). Flag-gated on
 * request_loop like the sibling meeting actions.
 */
export default async function NewMeetingPage() {
  if (!(await getFlag("request_loop"))) {
    return (
      <p className="px-8 py-6 text-sm" style={{ color: "var(--muted-foreground)" }}>
        Meeting scheduling is not enabled (turn on the <code>request_loop</code> flag).
      </p>
    );
  }

  const supabase = await createClient();
  const [{ data: vendors }, { data: executives }, { data: charities }] = await Promise.all([
    supabase.from("vendor").select("id, name").is("deleted_at", null).order("name"),
    supabase.from("executive").select("id, name, default_charity_id").is("deleted_at", null).order("name"),
    supabase.from("charity").select("id, name").is("deleted_at", null).order("name"),
  ]);

  return (
    <div className="max-w-2xl px-8 py-6">
      <Link href="/admin/meetings" className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        ← Meetings
      </Link>
      <h1 className="mt-2 mb-1 text-[20px] font-semibold tracking-tight">New meeting</h1>
      <p className="mb-6 max-w-prose text-sm" style={{ color: "var(--muted-foreground)" }}>
        Manually schedule a meeting for a vendor and executive, the fallback when it was not arranged by email. This
        creates an accepted request and a proposed meeting. Add a time to confirm it now (which reserves a credit), or
        leave it to confirm from the meetings list.
      </p>
      <NewMeetingForm
        action={createMeetingAction}
        vendors={vendors ?? []}
        executives={(executives ?? []) as { id: string; name: string; default_charity_id: string | null }[]}
        charities={charities ?? []}
      />
    </div>
  );
}
