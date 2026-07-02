import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { resolveExecPrincipalForUser } from "@/lib/auth";
import {
  loadExecHome,
  loadExecImpact,
  loadExecMeetings,
  loadExecRequests,
} from "@/app/exec/data";

/**
 * App-layer exec portal scoping. RLS is covered in rls-exec.test.ts; this suite
 * proves the page-facing resolver + loaders keep using the resolved principal
 * instead of a demo/default executive once an executive or EA is authenticated.
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ALPHA = "00000000-0000-0000-0000-00000000ad01";
const ALPHA_USER = "00000000-0000-0000-0000-00000000a5a1";
const PW = "Exec-Passw0rd!1";
const rand = () => Math.random().toString(36).slice(2);

describe("exec portal app-layer scoping (2d)", () => {
  let admin: SupabaseClient;
  let cExec1: SupabaseClient;
  let cExec2: SupabaseClient;
  let cEa: SupabaseClient;
  const ids = {
    e1: "",
    e2: "",
    e3: "",
    ea: "",
    uExec1: "",
    uExec2: "",
    uEa: "",
    r1: "",
    r2: "",
    m1: "",
    m2: "",
    charity: "",
  };

  async function mkUser(email: string): Promise<{ id: string; client: SupabaseClient }> {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: PW,
      email_confirm: true,
    });
    if (error) throw new Error(`createUser ${email}: ${error.message}`);
    const client = createClient(URL, KEY, { auth: { persistSession: false } });
    const { error: signInError } = await client.auth.signInWithPassword({ email, password: PW });
    if (signInError) throw new Error(`signIn ${email}: ${signInError.message}`);
    return { id: data.user!.id, client };
  }

  async function mkExec(label: string): Promise<string> {
    const { data, error } = await admin
      .from("executive")
      .insert({
        name: `Scoped ${label}`,
        title: "CFO",
        company: `${label} Co`,
        status: "active",
        primary_email: `${label.toLowerCase()}-${rand()}@exec.test`,
      })
      .select("id")
      .single();
    if (error) throw new Error(`mkExec: ${error.message}`);
    return data!.id as string;
  }

  async function mkRequest(execId: string, label: string): Promise<string> {
    const { data, error } = await admin
      .from("request")
      .insert({
        vendor_id: ALPHA,
        requested_by_user_id: ALPHA_USER,
        executive_id: execId,
        q1_what: `${label} request context`,
        q2_why: `${label} why this executive`,
        meeting_minutes: 45,
        status: "submitted",
      })
      .select("id")
      .single();
    if (error) throw new Error(`mkRequest: ${error.message}`);
    return data!.id as string;
  }

  async function mkMeeting(requestId: string, status: "confirmed" | "held"): Promise<string> {
    const { data, error } = await admin
      .from("meeting")
      .insert({
        request_id: requestId,
        charity_id: ids.charity,
        status,
        scheduled_at: "2026-07-10T01:00:00.000Z",
        join_url: "https://zoom.test/j/123",
      })
      .select("id")
      .single();
    if (error) throw new Error(`mkMeeting: ${error.message}`);
    return data!.id as string;
  }

  beforeAll(async () => {
    if (!URL || !KEY || !SERVICE_KEY) throw new Error("Supabase env vars are not set");
    admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: ch } = await admin.from("charity").select("id").limit(1);
    ids.charity = ch![0].id as string;

    ids.e1 = await mkExec("One");
    ids.e2 = await mkExec("Two");
    ids.e3 = await mkExec("Three");
    ids.r1 = await mkRequest(ids.e1, "E1-only");
    ids.r2 = await mkRequest(ids.e2, "E2-only");
    ids.m1 = await mkMeeting(ids.r1, "confirmed");
    ids.m2 = await mkMeeting(ids.r2, "held");
    await admin.from("gift_record").insert({
      meeting_id: ids.m2,
      charity_id: ids.charity,
      band_at_completion: "band_1",
      charity_amount_cents: 90000,
      admin_fee_cents: 60000,
      sat_date: "2026-07-10",
      status: "released",
    });

    const exec1 = await mkUser(`portal-e1-${rand()}@exec.test`);
    const exec2 = await mkUser(`portal-e2-${rand()}@exec.test`);
    ids.uExec1 = exec1.id;
    ids.uExec2 = exec2.id;
    cExec1 = exec1.client;
    cExec2 = exec2.client;
    await admin.from("executive").update({ auth_user_id: ids.uExec1 }).eq("id", ids.e1);
    await admin.from("executive").update({ auth_user_id: ids.uExec2 }).eq("id", ids.e2);

    const { data: ea } = await admin
      .from("ea")
      .insert({ name: "Portal EA", email: `portal-ea-${rand()}@ea.test` })
      .select("id, email")
      .single();
    ids.ea = ea!.id as string;
    await admin.from("ea_assignment").insert([
      { ea_id: ids.ea, executive_id: ids.e1 },
      { ea_id: ids.ea, executive_id: ids.e2 },
    ]);
    const eaUser = await mkUser(ea!.email as string);
    ids.uEa = eaUser.id;
    cEa = eaUser.client;
    await admin.from("ea").update({ auth_user_id: ids.uEa }).eq("id", ids.ea);
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.from("gift_record").delete().in("meeting_id", [ids.m1, ids.m2]);
    await admin.from("meeting").delete().in("id", [ids.m1, ids.m2]);
    await admin.from("request").delete().in("id", [ids.r1, ids.r2]);
    await admin.from("ea_assignment").delete().eq("ea_id", ids.ea);
    await admin.from("ea").delete().eq("id", ids.ea);
    await admin.from("executive").delete().in("id", [ids.e1, ids.e2, ids.e3]);
    for (const id of [ids.uExec1, ids.uExec2, ids.uEa]) {
      if (id) await admin.auth.admin.deleteUser(id);
    }
  });

  it("an executive principal lands on their own exec id, and OFF blocks app access", async () => {
    const user = (await cExec1.auth.getUser()).data.user!;
    const off = await resolveExecPrincipalForUser(cExec1, user, { execEaLoginEnabled: false });
    expect(off).toBeNull();

    const on = await resolveExecPrincipalForUser(cExec1, user, { execEaLoginEnabled: true });
    expect(on).toMatchObject({ kind: "executive", execId: ids.e1 });
  });

  it("the exec home/request/meeting loaders never show another executive's data", async () => {
    const home = await loadExecHome(cExec1, ids.e1, new Date("2026-07-15T00:00:00.000Z"));
    expect(home?.exec.id).toBe(ids.e1);
    expect(home?.incoming.map((r) => r.id)).toEqual([ids.r1]);
    expect(home?.impact.map((r) => r.id)).not.toContain(ids.m2);

    const requests = await loadExecRequests(cExec1, ids.e1);
    expect(requests?.cards.map((r) => r.id)).toEqual([ids.r1]);

    const meetings = await loadExecMeetings(cExec1, ids.e1, new Date("2026-07-01T00:00:00.000Z"));
    expect(meetings?.upcoming.map((r) => r.id)).toEqual([ids.m1]);
    expect(meetings?.past.map((r) => r.id)).not.toContain(ids.m2);

    const impact = await loadExecImpact(cExec1, ids.e1, new Date("2026-07-15T00:00:00.000Z"));
    expect(impact?.thisFy.map((r) => r.id)).not.toContain(ids.m2);
  });

  it("a different executive sees their own impact and never the first exec's meeting", async () => {
    const user = (await cExec2.auth.getUser()).data.user!;
    const p = await resolveExecPrincipalForUser(cExec2, user, { execEaLoginEnabled: true });
    expect(p).toMatchObject({ kind: "executive", execId: ids.e2 });

    const impact = await loadExecImpact(cExec2, ids.e2, new Date("2026-07-15T00:00:00.000Z"));
    expect(impact?.thisFy.map((r) => r.id)).toEqual([ids.m2]);
    expect(impact?.thisFy.map((r) => r.id)).not.toContain(ids.m1);
  });

  it("an EA can scope to assigned executives only, with forged selections ignored", async () => {
    const user = (await cEa.auth.getUser()).data.user!;
    const first = await resolveExecPrincipalForUser(cEa, user, { execEaLoginEnabled: true });
    expect(first).toMatchObject({ kind: "ea", execId: ids.e1 });

    const selected = await resolveExecPrincipalForUser(cEa, user, {
      execEaLoginEnabled: true,
      selectedExecutiveId: ids.e2,
    });
    expect(selected).toMatchObject({ kind: "ea", execId: ids.e2 });
    const impact = await loadExecImpact(cEa, selected!.execId!, new Date("2026-07-15T00:00:00.000Z"));
    expect(impact?.thisFy.map((r) => r.id)).toEqual([ids.m2]);

    const forged = await resolveExecPrincipalForUser(cEa, user, {
      execEaLoginEnabled: true,
      selectedExecutiveId: ids.e3,
    });
    expect(forged).toMatchObject({ kind: "ea", execId: ids.e1 });
  });
});
