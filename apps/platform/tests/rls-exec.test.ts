import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Exec / EA access model RLS (slice 2d). Proves the hard scoping property: a
 * signed-in executive sees ONLY their own data, an EA sees ONLY the executives
 * they are assigned to, neither sees another exec's or any vendor's rows, and
 * neither can write (read-only v1 scope). Auth method is irrelevant to RLS, so
 * the throwaway exec/EA users here use a password; production uses magic-link.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ALPHA = "00000000-0000-0000-0000-00000000ad01";
const ALPHA_USER = "00000000-0000-0000-0000-00000000a5a1";
const PW = "Exec-Passw0rd!1";
const rand = () => Math.random().toString(36).slice(2);

describe("exec/EA access model RLS (2d)", () => {
  let admin: SupabaseClient;
  let cExec1: SupabaseClient; // signed in AS executive E1
  let cEa: SupabaseClient; // signed in AS an EA assigned to E1
  let cExec2: SupabaseClient; // signed in AS executive E2 (isolation control)
  const ids = {
    e1: "", e2: "", ea: "", ea2: "",
    uExec1: "", uExec2: "", uEa: "",
    r1: "", r2: "", m1: "", charity: "", notif: "",
  };

  async function mkUser(email: string): Promise<{ id: string; client: SupabaseClient }> {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PW,
      email_confirm: true,
    });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    const client = createClient(URL, KEY, { auth: { persistSession: false } });
    const { error: se } = await client.auth.signInWithPassword({ email, password: PW });
    if (se) throw new Error(`signIn ${email}: ${se.message}`);
    return { id: data.user!.id, client };
  }

  async function mkExec(): Promise<string> {
    const { data, error } = await admin
      .from("executive")
      .insert({
        name: "Scoped Exec",
        title: "CFO",
        company: "Scope Co",
        status: "active",
        primary_email: `exec-${rand()}@exec.test`,
      })
      .select("id")
      .single();
    if (error) throw new Error(`mkExec: ${error.message}`);
    return data!.id as string;
  }

  async function mkRequest(execId: string): Promise<string> {
    const { data, error } = await admin
      .from("request")
      .insert({
        vendor_id: ALPHA,
        requested_by_user_id: ALPHA_USER,
        executive_id: execId,
        q1_what: "scope probe",
        q2_why: "scope probe",
        status: "submitted",
      })
      .select("id")
      .single();
    if (error) throw new Error(`mkRequest: ${error.message}`);
    return data!.id as string;
  }

  beforeAll(async () => {
    if (!URL || !KEY || !SERVICE_KEY) throw new Error("Supabase env vars are not set");
    admin = createClient(URL, SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: ch } = await admin.from("charity").select("id").limit(1);
    ids.charity = ch![0].id;

    ids.e1 = await mkExec();
    ids.e2 = await mkExec();

    // EA A1 assigned to E1 only; A2 is a different EA assigned to E2 (negatives).
    const { data: ea } = await admin
      .from("ea")
      .insert({ name: "Scoped EA", email: `ea-${rand()}@ea.test` })
      .select("id")
      .single();
    ids.ea = ea!.id;
    const { data: ea2 } = await admin
      .from("ea")
      .insert({ name: "Other EA", email: `ea2-${rand()}@ea.test` })
      .select("id")
      .single();
    ids.ea2 = ea2!.id;
    await admin.from("ea_assignment").insert({ ea_id: ids.ea, executive_id: ids.e1 });
    await admin.from("ea_assignment").insert({ ea_id: ids.ea2, executive_id: ids.e2 });
    // E1's linked assistant is A1 (so an exec can read their own EA's row).
    await admin.from("executive").update({ ea_id: ids.ea }).eq("id", ids.e1);

    // Requests + a meeting + gift + nomination + notification rows to scope.
    ids.r1 = await mkRequest(ids.e1);
    ids.r2 = await mkRequest(ids.e2);
    const { data: m } = await admin
      .from("meeting")
      .insert({ request_id: ids.r1, charity_id: ids.charity, status: "proposed" })
      .select("id")
      .single();
    ids.m1 = m!.id;
    await admin.from("gift_record").insert({
      meeting_id: ids.m1,
      charity_id: ids.charity,
      band_at_completion: "band_1",
      charity_amount_cents: 90000,
      admin_fee_cents: 60000,
    });
    await admin.from("nomination_history").insert([
      { executive_id: ids.e1, charity_id: ids.charity, started_at: new Date().toISOString() },
      { executive_id: ids.e2, charity_id: ids.charity, started_at: new Date().toISOString() },
    ]);
    // A notification addressed to E1 — to prove notification stays staff-only.
    const { data: n } = await admin
      .from("notification")
      .insert({
        recipient_type: "executive",
        recipient_id: ids.e1,
        channel: "email",
        event: "B1_request_submitted",
        status: "queued",
      })
      .select("id")
      .single();
    ids.notif = n!.id;

    // Auth users linked to the records.
    const exec1 = await mkUser(`u-exec1-${rand()}@exec.test`);
    const exec2 = await mkUser(`u-exec2-${rand()}@exec.test`);
    const ea1 = await mkUser(`u-ea-${rand()}@ea.test`);
    ids.uExec1 = exec1.id; cExec1 = exec1.client;
    ids.uExec2 = exec2.id; cExec2 = exec2.client;
    ids.uEa = ea1.id; cEa = ea1.client;
    await admin.from("executive").update({ auth_user_id: ids.uExec1 }).eq("id", ids.e1);
    await admin.from("executive").update({ auth_user_id: ids.uExec2 }).eq("id", ids.e2);
    await admin.from("ea").update({ auth_user_id: ids.uEa }).eq("id", ids.ea);
  });

  afterAll(async () => {
    if (!admin) return;
    if (ids.notif) await admin.from("notification").delete().eq("id", ids.notif);
    await admin.from("nomination_history").delete().in("executive_id", [ids.e1, ids.e2]);
    await admin.from("gift_record").delete().eq("meeting_id", ids.m1); // also cascades with the meeting
    await admin.from("meeting").delete().eq("id", ids.m1);
    await admin.from("request").delete().in("id", [ids.r1, ids.r2]);
    await admin.from("ea_assignment").delete().in("ea_id", [ids.ea, ids.ea2]);
    // Clear E1's ea link before deleting the ea rows (ea_id has no cascade).
    await admin.from("executive").update({ ea_id: null }).eq("id", ids.e1);
    await admin.from("ea").delete().in("id", [ids.ea, ids.ea2]);
    await admin.from("executive").delete().in("id", [ids.e1, ids.e2]);
    for (const u of [ids.uExec1, ids.uExec2, ids.uEa]) {
      if (u) await admin.auth.admin.deleteUser(u);
    }
  });

  it("an executive sees ONLY their own executive row", async () => {
    const { data } = await cExec1.from("executive").select("id");
    expect(data?.map((r) => r.id)).toEqual([ids.e1]);
  });

  it("an executive sees their own request/meeting/nomination, never another exec's", async () => {
    const { data: reqs } = await cExec1.from("request").select("id, executive_id");
    expect(reqs?.map((r) => r.id)).toContain(ids.r1);
    expect(reqs?.every((r) => r.executive_id === ids.e1)).toBe(true);

    const { data: meetings } = await cExec1.from("meeting").select("id");
    expect(meetings?.map((m) => m.id)).toEqual([ids.m1]);

    const { data: noms } = await cExec1.from("nomination_history").select("executive_id");
    expect(noms?.every((n) => n.executive_id === ids.e1)).toBe(true);
    expect(noms?.length).toBeGreaterThanOrEqual(1);
  });

  it("an EA sees the executive they are assigned to, and that exec's requests", async () => {
    const { data: execs } = await cEa.from("executive").select("id");
    expect(execs?.map((r) => r.id)).toEqual([ids.e1]);
    const { data: reqs } = await cEa.from("request").select("id, executive_id");
    expect(reqs?.map((r) => r.id)).toContain(ids.r1);
    expect(reqs?.every((r) => r.executive_id === ids.e1)).toBe(true);
  });

  it("isolation: exec E2 sees its own data and never E1's", async () => {
    const { data: execs } = await cExec2.from("executive").select("id");
    expect(execs?.map((r) => r.id)).toEqual([ids.e2]);
    const { data: reqs } = await cExec2.from("request").select("id");
    expect(reqs?.map((r) => r.id)).toContain(ids.r2);
    expect(reqs?.map((r) => r.id)).not.toContain(ids.r1);
  });

  it("gift_record is scoped: an exec sees their own meeting's gift, never another exec's", async () => {
    const { data: mine } = await cExec1.from("gift_record").select("meeting_id");
    expect(mine?.map((g) => g.meeting_id)).toEqual([ids.m1]);
    // E2 has no gift (its meeting was never created); it certainly never sees E1's.
    const { data: theirs } = await cExec2.from("gift_record").select("meeting_id");
    expect(theirs?.map((g) => g.meeting_id) ?? []).not.toContain(ids.m1);
  });

  it("ea is scoped: an EA reads its own row, an exec reads its linked EA, neither sees another EA", async () => {
    const { data: eaSelf } = await cEa.from("ea").select("id");
    expect(eaSelf?.map((r) => r.id)).toEqual([ids.ea]); // own row only, not A2

    const { data: eaLinked } = await cExec1.from("ea").select("id");
    expect(eaLinked?.map((r) => r.id)).toEqual([ids.ea]); // E1's assistant (A1), not A2

    // Negative: neither can see the unrelated EA (A2).
    expect((eaSelf ?? []).map((r) => r.id)).not.toContain(ids.ea2);
    expect((eaLinked ?? []).map((r) => r.id)).not.toContain(ids.ea2);
  });

  it("ea_assignment is scoped: EA and exec see the A1->E1 link, never the A2->E2 link", async () => {
    const eaRows = (await cEa.from("ea_assignment").select("ea_id, executive_id")).data ?? [];
    const execRows = (await cExec1.from("ea_assignment").select("ea_id, executive_id")).data ?? [];
    for (const rows of [eaRows, execRows]) {
      expect(rows.some((r) => r.ea_id === ids.ea && r.executive_id === ids.e1)).toBe(true);
      expect(rows.some((r) => r.ea_id === ids.ea2 || r.executive_id === ids.e2)).toBe(false);
    }
  });

  it("charity is readable by an exec and an EA (for the picker / impact)", async () => {
    const { data: execCh } = await cExec1.from("charity").select("id").limit(1);
    expect((execCh ?? []).length).toBeGreaterThanOrEqual(1);
    const { data: eaCh } = await cEa.from("charity").select("id").limit(1);
    expect((eaCh ?? []).length).toBeGreaterThanOrEqual(1);
  });

  it("notification stays staff-only: an exec sees no delivery metadata even for a row addressed to them", async () => {
    const { data: execNotifs } = await cExec1.from("notification").select("id");
    expect(execNotifs ?? []).toEqual([]); // including ids.notif, addressed to E1
    const { data: eaNotifs } = await cEa.from("notification").select("id");
    expect(eaNotifs ?? []).toEqual([]);
    // Control: it exists and staff can see it.
    const { data: staffSees } = await admin.from("notification").select("id").eq("id", ids.notif);
    expect(staffSees?.length).toBe(1);
  });

  it("an executive/EA cannot read vendor-only or staff data", async () => {
    for (const c of [cExec1, cEa]) {
      const { data: vendors } = await c.from("vendor").select("id");
      expect(vendors ?? []).toEqual([]);
      const { data: staff } = await c.from("staff").select("id");
      expect(staff ?? []).toEqual([]);
      const { data: invoices } = await c.from("invoice").select("id");
      expect(invoices ?? []).toEqual([]);
    }
  });

  it("an executive cannot write (read-only v1 scope): an update changes nothing", async () => {
    const { data: updated } = await cExec1
      .from("executive")
      .update({ title: "HACKED" })
      .eq("id", ids.e1)
      .select("id");
    expect(updated ?? []).toEqual([]); // RLS update is staff-only; no row returned
    const { data: row } = await admin.from("executive").select("title").eq("id", ids.e1).single();
    expect(row?.title).toBe("CFO");
  });
});
