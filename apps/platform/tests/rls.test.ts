import { describe, it, expect, beforeAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * End-to-end RLS tenant-boundary tests against the STAGING project, using the
 * public publishable key and the synthetic login users from seed_staging.sql.
 * Proves a vendor can read only its own org's rows and never staff/other orgs.
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in
 * the environment (loaded from apps/platform/.env.local when run via npm test).
 */
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";

const ALPHA = "00000000-0000-0000-0000-00000000ad01";
const BETA = "00000000-0000-0000-0000-00000000bd01";
const ALPHA_USER = "00000000-0000-0000-0000-00000000a5a1";

async function signIn(email: string): Promise<SupabaseClient> {
  const client = createClient(URL, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(`sign-in failed for ${email}: ${error.message}`);
  return client;
}

describe("RLS tenant boundary", () => {
  let alex: SupabaseClient;
  let blair: SupabaseClient;
  let anon: SupabaseClient;

  beforeAll(async () => {
    if (!URL || !KEY) throw new Error("Supabase env vars are not set");
    alex = await signIn("alex@alpha.test");
    blair = await signIn("blair@beta.test");
    anon = createClient(URL, KEY, { auth: { persistSession: false } });
  });

  it("a vendor sees only their own org", async () => {
    const { data } = await alex.from("vendor").select("id");
    expect(data?.map((v) => v.id)).toEqual([ALPHA]);
  });

  it("a vendor cannot read another org by id", async () => {
    const { data } = await alex.from("vendor").select("id").eq("id", BETA);
    expect(data).toEqual([]);
  });

  it("a vendor sees only their own users", async () => {
    const { data } = await alex.from("vendor_user").select("id");
    expect(data?.map((u) => u.id)).toEqual([ALPHA_USER]);
  });

  it("a vendor sees only their own requests and gifts", async () => {
    // >= 1: the seed has one Alpha request; the request-loop test may add more.
    const { data: reqs } = await alex.from("request").select("id");
    expect((reqs ?? []).length).toBeGreaterThanOrEqual(1);
    // Isolation: Beta has no requests of its own.
    const { data: blairReqs } = await blair.from("request").select("id");
    expect(blairReqs ?? []).toEqual([]);
    // Seed has three Alpha gifts after the exec-dashboard demo enrichment (0009).
    const { data: alexGifts } = await alex.from("gift_record").select("id");
    expect(alexGifts?.length).toBe(3);
    const { data: blairGifts } = await blair.from("gift_record").select("id");
    expect(blairGifts?.length).toBe(0);
  });

  it("a vendor cannot read another org's money rows (meeting, credit_lot, cycle, invoice)", async () => {
    // Alpha's seeded money rows (seed_staging.sql). For each, Alpha's own user
    // can read it (positive control) and Beta's user reads zero (isolation).
    const ALPHA_MONEY: Record<string, string> = {
      invoice: "00000000-0000-0000-0000-0000000019a1",
      cycle: "00000000-0000-0000-0000-00000000c9a1",
      credit_lot: "00000000-0000-0000-0000-0000000010a1",
      meeting: "00000000-0000-0000-0000-0000000013a1",
    };
    for (const [table, id] of Object.entries(ALPHA_MONEY)) {
      const { data: mine } = await alex.from(table).select("id").eq("id", id);
      expect(mine?.map((r) => r.id)).toEqual([id]);
      const { data: theirs } = await blair.from(table).select("id").eq("id", id);
      expect(theirs ?? []).toEqual([]);
    }
  });

  it("paid vendors can read the active executive list (only active, all of them)", async () => {
    const { data } = await alex.from("executive").select("id, status");
    const rows = data ?? [];
    // The RLS property (0003): a paid vendor sees execs only where status = 'active'.
    expect(rows.every((e) => e.status === "active")).toBe(true);
    // Seed has 10 active execs (2 original + 8 directory demo rows). Sibling tests
    // share the DB and may add more active execs, so assert the floor, not an exact
    // count (the old exact count made this flaky across reruns on a non-reset DB).
    expect(rows.length).toBeGreaterThanOrEqual(10);
  });

  it("a vendor cannot read the staff table", async () => {
    const { data } = await alex.from("staff").select("id");
    expect(data ?? []).toEqual([]);
  });

  it("beta sees only beta, not alpha", async () => {
    const { data } = await blair.from("vendor").select("id");
    expect(data).toEqual([{ id: BETA }]);
  });

  it("an anonymous client sees nothing", async () => {
    const { data: vendors } = await anon.from("vendor").select("id");
    expect(vendors ?? []).toEqual([]);
    const { data: execs } = await anon.from("executive").select("id");
    expect(execs ?? []).toEqual([]);
  });
});

describe("staff (admin) full access — the admin shell data path", () => {
  let admin: SupabaseClient;

  beforeAll(async () => {
    admin = await signIn("admin@thegoodintro.test");
  });

  it("staff see every vendor", async () => {
    const { data } = await admin.from("vendor").select("id");
    // >= 2: the seed has Alpha + Beta; the sign-up test may add Gamma.
    expect((data ?? []).length).toBeGreaterThanOrEqual(2);
  });

  it("staff can read the staff table and all gifts", async () => {
    const { data: staff } = await admin.from("staff").select("id");
    expect((staff ?? []).length).toBeGreaterThanOrEqual(1);
    // Three Alpha gifts in the seed after the exec-dashboard demo enrichment (0009).
    const { data: gifts } = await admin.from("gift_record").select("id");
    expect(gifts?.length).toBe(3);
  });

  it("staff can insert and delete (write path), then cleans up", async () => {
    const name = `RLS test charity ${Date.now()}`;
    const { data, error } = await admin
      .from("charity")
      .insert({ name })
      .select("id")
      .single();
    expect(error).toBeNull();
    expect(data?.id).toBeTruthy();
    await admin.from("charity").delete().eq("id", data!.id);
    const { data: gone } = await admin.from("charity").select("id").eq("id", data!.id);
    expect(gone).toEqual([]);
  });
});

describe("vendors cannot write (RLS denies)", () => {
  it("a vendor insert into charity is rejected", async () => {
    const alex = await signIn("alex@alpha.test");
    const { error } = await alex
      .from("charity")
      .insert({ name: "Should not exist" })
      .select("id")
      .single();
    expect(error).not.toBeNull();
  });
});

describe("vendor sign-up RPC (signup_vendor)", () => {
  it("a work-email user creates their org (idempotent)", async () => {
    const gina = await signIn("gina@gamma.test");
    const { data, error } = await gina.rpc("signup_vendor", {
      p_company: "Gamma Co",
      p_full_name: "Gina Gamma",
    });
    expect(error).toBeNull();
    expect(typeof data).toBe("string");
    const { data: vendors } = await gina.from("vendor").select("email_domain");
    expect(vendors).toEqual([{ email_domain: "gamma.test" }]);
  });

  it("a generic-domain user is rejected", async () => {
    const freebie = await signIn("freebie@gmail.com");
    const { error } = await freebie.rpc("signup_vendor", {
      p_company: "Freebie",
      p_full_name: "Free Bee",
    });
    expect(error).not.toBeNull();
  });
});
