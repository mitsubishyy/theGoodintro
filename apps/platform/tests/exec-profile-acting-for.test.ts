import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Regression guard for the acting-for profile-save bug (fixed alongside this test):
 * when a STAFF member operates a specific executive's portal (staff_acting_exec_id),
 * the profile-save actions must write to THAT executive — not the seeded demo exec —
 * while still attributing the actor as staff. The bug shipped precisely because the
 * suite had no test here: the DB write silently targeted the demo exec.
 *
 * These actions read request-scoped context (feature flags, the resolved principal,
 * cache revalidation), so we mock ONLY those seams. Everything that matters to the
 * regression — the `principal.execId ?? demo` resolution, the executive UPDATE, and
 * the audit insert — runs for real against the local Supabase stack. The injected
 * principal carries a service-role client as `supabase`, exactly as getExecPrincipal
 * would hand the action its session client.
 */

const h = vi.hoisted(() => ({
  principal: null as
    | { supabase: unknown; user: { id: string }; kind: "staff"; execId: string | null; staffId: string }
    | null,
  flags: { exec_dashboard: true, photo_upload: true } as Record<string, boolean>,
}));

vi.mock("@/lib/flags", () => ({
  getFlag: vi.fn(async (k: string) => h.flags[k] === true),
  getFlagAuthoritative: vi.fn(async (k: string) => h.flags[k] === true),
  assertFlag: vi.fn(async () => {}),
}));

vi.mock("@/lib/auth", () => ({
  EA_PRINCIPAL_COOKIE: "tgi_ea_principal",
  STAFF_ACTING_EXEC_COOKIE: "staff_acting_exec_id",
  getExecPrincipal: vi.fn(async () => h.principal),
  getStaff: vi.fn(async () => (h.principal ? { user: h.principal.user, staff: { id: h.principal.staffId } } : null)),
  requireExecOrEa: vi.fn(async () => h.principal),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

import { saveProfileYouAction, setRequestPauseAction } from "@/app/exec/actions";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const DEMO = "00000000-0000-0000-0000-00000000ec03"; // seeded demo exec (Priya), the row the bug wrote to
const rand = () => Math.random().toString(36).slice(2);

describe("acting-for profile saves target the acting exec, not the demo exec", () => {
  let admin: SupabaseClient;
  const ids = { staff: "", execA: "" };
  let demoBefore: Record<string, unknown> | null = null;

  beforeAll(async () => {
    if (!URL || !SERVICE_KEY) throw new Error("Supabase env vars are not set");
    admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

    const staffEmail = `acting-staff-${rand()}@staff.test`;
    const { data: st, error: stErr } = await admin
      .from("staff")
      .insert({ name: "Acting Staff", email: staffEmail, role: "staff" })
      .select("id")
      .single();
    if (stErr) throw new Error(`mkStaff: ${stErr.message}`);
    ids.staff = st!.id as string;

    const { data: a, error: aErr } = await admin
      .from("executive")
      .insert({ name: "Acting Target A", title: "COO", company: "A Co", status: "active", primary_email: `acta-${rand()}@exec.test` })
      .select("id")
      .single();
    if (aErr) throw new Error(`mkExec: ${aErr.message}`);
    ids.execA = a!.id as string;

    // Snapshot the demo exec so we can prove it stays untouched (and restore it).
    const { data: d } = await admin
      .from("executive")
      .select("name, title, company, primary_email, linkedin_url, photo_url, status")
      .eq("id", DEMO)
      .single();
    demoBefore = d ?? null;

    // Staff acting FOR exec A, operating under the service-role client.
    h.principal = { supabase: admin, user: { id: `u-${rand()}` }, kind: "staff", execId: ids.execA, staffId: ids.staff };
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.from("audit_entry").delete().eq("acting_for_executive_id", ids.execA);
    await admin.from("executive").delete().eq("id", ids.execA);
    await admin.from("staff").delete().eq("id", ids.staff);
    // Defensive: the fix must not touch the demo exec, but restore its snapshot
    // regardless so a regression here cannot corrupt the shared seed row.
    if (demoBefore) await admin.from("executive").update(demoBefore).eq("id", DEMO);
  });

  it("saveProfileYouAction (actions.ts:72 resolution) writes exec A, leaves demo untouched, audits acting_for = A", async () => {
    const linkedin = `linkedin.com/in/acting-${rand()}`;
    const email = `acta-updated-${rand()}@exec.test`;
    const res = await saveProfileYouAction({ name: "Acting Target A", title: "COO", company: "A Co", email, linkedinUrl: linkedin });
    expect(res).toEqual({ ok: true });

    // (a) exec A received the write
    const { data: a } = await admin.from("executive").select("linkedin_url, primary_email").eq("id", ids.execA).single();
    expect(a!.linkedin_url).toBe(linkedin);
    expect(a!.primary_email).toBe(email);

    // (b) the demo exec is untouched
    const { data: d } = await admin.from("executive").select("name, linkedin_url, primary_email").eq("id", DEMO).single();
    expect(d!.name).toBe(demoBefore!.name);
    expect(d!.linkedin_url).toBe(demoBefore!.linkedin_url);
    expect(d!.primary_email).toBe(demoBefore!.primary_email);

    // (c) audit: actor stays staff, acting_for = exec A
    const { data: audit } = await admin
      .from("audit_entry")
      .select("actor_type, actor_id, acting_for_executive_id, action")
      .eq("action", "executive.profile_you_updated")
      .eq("acting_for_executive_id", ids.execA)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(audit).toBeTruthy();
    expect(audit!.actor_type).toBe("staff");
    expect(audit!.actor_id).toBe(ids.staff);
    expect(audit!.acting_for_executive_id).toBe(ids.execA);
  });

  it("setRequestPauseAction (actions.ts:155 resolution) pauses exec A, leaves demo untouched, audits acting_for = A", async () => {
    const res = await setRequestPauseAction(true);
    expect(res).toEqual({ ok: true });

    // (a) exec A was paused
    const { data: a } = await admin.from("executive").select("status").eq("id", ids.execA).single();
    expect(a!.status).toBe("paused");

    // (b) demo exec's status is untouched
    const { data: d } = await admin.from("executive").select("status").eq("id", DEMO).single();
    expect(d!.status).toBe(demoBefore!.status);

    // (c) audit: actor stays staff, acting_for = exec A
    const { data: audit } = await admin
      .from("audit_entry")
      .select("actor_type, actor_id, acting_for_executive_id")
      .eq("action", "executive.requests_paused")
      .eq("acting_for_executive_id", ids.execA)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(audit).toBeTruthy();
    expect(audit!.actor_type).toBe("staff");
    expect(audit!.actor_id).toBe(ids.staff);
    expect(audit!.acting_for_executive_id).toBe(ids.execA);
  });
});
