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
    e1: "", e2: "", ea: "",
    uExec1: "", uExec2: "", uEa: "",
    r1: "", r2: "", m1: "", charity: "",
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

    // EA assigned to E1 only.
    const { data: ea } = await admin
      .from("ea")
      .insert({ name: "Scoped EA", email: `ea-${rand()}@ea.test` })
      .select("id")
      .single();
    ids.ea = ea!.id;
    await admin.from("ea_assignment").insert({ ea_id: ids.ea, executive_id: ids.e1 });

    // Requests + a meeting + nomination rows to scope.
    ids.r1 = await mkRequest(ids.e1);
    ids.r2 = await mkRequest(ids.e2);
    const { data: m } = await admin
      .from("meeting")
      .insert({ request_id: ids.r1, charity_id: ids.charity, status: "proposed" })
      .select("id")
      .single();
    ids.m1 = m!.id;
    await admin.from("nomination_history").insert([
      { executive_id: ids.e1, charity_id: ids.charity, started_at: new Date().toISOString() },
      { executive_id: ids.e2, charity_id: ids.charity, started_at: new Date().toISOString() },
    ]);

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
    await admin.from("nomination_history").delete().in("executive_id", [ids.e1, ids.e2]);
    await admin.from("meeting").delete().eq("id", ids.m1);
    await admin.from("request").delete().in("id", [ids.r1, ids.r2]);
    await admin.from("ea_assignment").delete().eq("ea_id", ids.ea);
    await admin.from("ea").delete().eq("id", ids.ea);
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
