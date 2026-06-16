import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";
const PRIYA = "00000000-0000-0000-0000-00000000ec03"; // locked exec-portal sample
const RFDS = "00000000-0000-0000-0000-00000000c1a3";
const BEYOND_BLUE = "00000000-0000-0000-0000-00000000c1a1";

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

/**
 * Exec portal schema foundation (migration 0019). Asserts the new fields
 * roundtrip, the nomination_history backfill + one-open-row invariant hold,
 * and the new table is staff-only under RLS. Money-path untouched here; this
 * is structure only (the floor under the locked exec screens).
 */
describe("exec portal schema (migration 0019)", () => {
  it("the new executive / charity / vendor_user / request columns roundtrip", async () => {
    const admin = await signIn("admin@thegoodintro.test");

    // Seeded onto the locked Priya sample.
    const { data: exec } = await admin
      .from("executive")
      .select(
        "linkedin_url, interested_in, current_projects, not_interested_in, timeline, seniority_signal, suggested_cadence, timezone, calendar_provider, calendar_connected_at, calendar_last_synced_at, preferred_window_days, preferred_window_start, preferred_window_end",
      )
      .eq("id", PRIYA)
      .single();
    expect(exec).toMatchObject({
      timezone: "Australia/Sydney",
      calendar_provider: "google",
      preferred_window_days: "weekdays",
    });
    expect(exec?.linkedin_url).toContain("linkedin.com");
    expect(exec?.interested_in).toBeTruthy();
    expect(exec?.seniority_signal).toBeTruthy();
    expect(exec?.preferred_window_start).toBe("09:00:00");

    // context_notes is RETAINED (deprecated, not dropped) — the column still
    // exists so the admin form + vendor read keep working.
    const { error: ctxErr } = await admin.from("executive").select("context_notes").eq("id", PRIYA).single();
    expect(ctxErr).toBeNull();

    const { data: charity } = await admin.from("charity").select("short_name").eq("id", RFDS).single();
    expect(charity?.short_name).toBe("Flying Doctor");

    const { data: vu } = await admin
      .from("vendor_user")
      .select("bio_one_liner, photo_url")
      .eq("id", "00000000-0000-0000-0000-00000000a5a1")
      .single();
    expect(vu?.bio_one_liner).toBeTruthy();
    expect(vu?.photo_url).toBeNull(); // initials-monogram fallback

    const { data: req } = await admin
      .from("request")
      .select("q1_head, q2_head")
      .eq("id", "00000000-0000-0000-0000-0000000004a1")
      .single();
    expect(req?.q1_head).toBeTruthy();
    expect(req?.q2_head).toBeTruthy();
  });

  it("q-head length is capped at 120 chars", async () => {
    const admin = await signIn("admin@thegoodintro.test");
    const { error } = await admin
      .from("request")
      .update({ q1_head: "x".repeat(121) })
      .eq("id", "00000000-0000-0000-0000-0000000004a1");
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toContain("request_q1_head_len");
  });

  it("nomination_history holds Priya's locked two-row sample + one open row per exec", async () => {
    const admin = await signIn("admin@thegoodintro.test");

    // Priya carries the locked two-row history seeded for the My charity port:
    // Beyond Blue (9 Feb 2024 to 12 May 2024), then RFDS (12 May 2024 to present).
    const { data: priyaRows } = await admin
      .from("nomination_history")
      .select("charity_id, started_at, ended_at")
      .eq("executive_id", PRIYA)
      .order("started_at", { ascending: true });
    expect(priyaRows).toHaveLength(2);
    expect(priyaRows![0]).toMatchObject({ charity_id: BEYOND_BLUE });
    expect(priyaRows![0].ended_at).not.toBeNull();
    expect(priyaRows![1]).toMatchObject({ charity_id: RFDS, ended_at: null });

    // No exec with a standing charity is missing its open row.
    const { data: execs } = await admin
      .from("executive")
      .select("id")
      .not("default_charity_id", "is", null);
    const { data: open } = await admin
      .from("nomination_history")
      .select("executive_id")
      .is("ended_at", null);
    const openSet = new Set((open ?? []).map((r) => r.executive_id));
    for (const e of execs ?? []) expect(openSet.has(e.id)).toBe(true);
  });

  it("at most one OPEN nomination per executive (partial unique index)", async () => {
    const admin = await signIn("admin@thegoodintro.test");
    // Priya already has an open RFDS row; a second open row must be rejected.
    const { error } = await admin
      .from("nomination_history")
      .insert({ executive_id: PRIYA, charity_id: BEYOND_BLUE });
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toMatch(/duplicate|unique|nomination_history_one_open/);

    // The correct change pattern still works: close the open row, then open a
    // new one. (Restored afterwards so the suite stays order-independent.)
    const { data: openRow } = await admin
      .from("nomination_history")
      .select("id, started_at")
      .eq("executive_id", PRIYA)
      .is("ended_at", null)
      .single();
    await admin.from("nomination_history").update({ ended_at: new Date().toISOString() }).eq("id", openRow!.id);
    const { error: reopen } = await admin
      .from("nomination_history")
      .insert({ executive_id: PRIYA, charity_id: BEYOND_BLUE });
    expect(reopen).toBeNull();

    // Restore the seed state: drop the Beyond Blue row, reopen RFDS.
    await admin.from("nomination_history").delete().eq("executive_id", PRIYA).eq("charity_id", BEYOND_BLUE);
    await admin.from("nomination_history").update({ ended_at: null }).eq("id", openRow!.id);
  });

  it("nomination_history is staff-only under RLS", async () => {
    const alex = await signIn("alex@alpha.test"); // vendor user
    const { data } = await alex.from("nomination_history").select("id");
    expect(data ?? []).toEqual([]);

    const { data: inserted } = await alex
      .from("nomination_history")
      .insert({ executive_id: PRIYA, charity_id: BEYOND_BLUE })
      .select("id");
    expect(inserted ?? []).toEqual([]); // RLS check blocks the write
  });
});
