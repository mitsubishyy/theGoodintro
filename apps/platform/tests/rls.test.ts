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
    const { data: reqs } = await alex.from("request").select("id");
    expect(reqs?.length).toBe(1);
    const { data: alexGifts } = await alex.from("gift_record").select("id");
    expect(alexGifts?.length).toBe(1);
    const { data: blairGifts } = await blair.from("gift_record").select("id");
    expect(blairGifts?.length).toBe(0);
  });

  it("paid vendors can read the active executive list", async () => {
    const { data } = await alex.from("executive").select("id");
    expect(data?.length).toBe(2);
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
    expect(data?.length).toBe(2);
  });

  it("staff can read the staff table and all gifts", async () => {
    const { data: staff } = await admin.from("staff").select("id");
    expect((staff ?? []).length).toBeGreaterThanOrEqual(1);
    const { data: gifts } = await admin.from("gift_record").select("id");
    expect(gifts?.length).toBe(1);
  });
});
