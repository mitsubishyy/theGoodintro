import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin vendor edit form — the server action (updateVendorAction) and its guards.
 *
 * The action reads request-scoped context (requireStaff, getFlag), so those seams
 * are mocked; the validation, uniqueness pre-check, DB write, and audit insert all
 * run for real against the local stack. A separate RLS block proves the data-layer
 * backstop: a non-staff (vendor_user) session cannot mutate a vendor row, so even
 * bypassing the app-layer requireStaff gate changes nothing. This mirrors the
 * admin-vendors-list convention (test the contract under the untestable wrapper).
 */

const h = vi.hoisted(() => ({ supabase: null as unknown, staffId: "" }));

vi.mock("@/lib/flags", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/flags")>()),
  getFlag: vi.fn(async (k: string) => k === "admin_vendors_actions"),
}));

vi.mock("@/lib/auth", async (importActual) => ({
  ...(await importActual<typeof import("@/lib/auth")>()),
  requireStaff: vi.fn(async () => ({ staff: { id: h.staffId }, supabase: h.supabase, user: { id: "staff-user" } })),
  getStaff: vi.fn(async () => ({ user: { id: "staff-user" }, staff: { id: h.staffId } })),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));

import { updateVendorAction } from "@/app/admin/vendors/actions";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const PASSWORD = "Passw0rd!test";
const rand = () => Math.random().toString(36).slice(2);
const form = (o: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(o)) fd.set(k, v);
  return fd;
};

describe("admin vendor edit — updateVendorAction", () => {
  let admin: SupabaseClient;
  const ids = { staff: "", vendorA: "", vendorB: "", domainB: "" };

  beforeAll(async () => {
    if (!URL || !SERVICE_KEY) throw new Error("Supabase env vars are not set");
    admin = createClient(URL, SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

    const { data: st, error: stErr } = await admin
      .from("staff")
      .insert({ name: "Vendor Edit Staff", email: `vendor-edit-staff-${rand()}@staff.test`, role: "staff" })
      .select("id")
      .single();
    if (stErr) throw new Error(`mkStaff: ${stErr.message}`);
    ids.staff = st!.id as string;

    const { data: a, error: aErr } = await admin
      .from("vendor")
      .insert({ name: "Edit Target A Pty Ltd", email_domain: `edit-a-${rand()}.example` })
      .select("id")
      .single();
    if (aErr) throw new Error(`mkVendorA: ${aErr.message}`);
    ids.vendorA = a!.id as string;

    ids.domainB = `edit-b-${rand()}.example`;
    const { data: b, error: bErr } = await admin
      .from("vendor")
      .insert({ name: "Edit Target B Pty Ltd", email_domain: ids.domainB })
      .select("id")
      .single();
    if (bErr) throw new Error(`mkVendorB: ${bErr.message}`);
    ids.vendorB = b!.id as string;

    h.supabase = admin;
    h.staffId = ids.staff;
  });

  afterAll(async () => {
    if (!admin) return;
    await admin.from("audit_entry").delete().in("target_id", [ids.vendorA, ids.vendorB]);
    await admin.from("vendor").delete().in("id", [ids.vendorA, ids.vendorB]);
    await admin.from("staff").delete().eq("id", ids.staff);
  });

  it("staff can update name and email_domain; audit row records the changed fields", async () => {
    const newName = "Edit Target A Renamed Pty Ltd";
    const newDomain = `edit-a-new-${rand()}.example`;
    const res = await updateVendorAction({}, form({ id: ids.vendorA, name: newName, email_domain: newDomain }));
    expect(res).toEqual({ ok: true });

    const { data: v } = await admin.from("vendor").select("name, email_domain").eq("id", ids.vendorA).single();
    expect(v!.name).toBe(newName);
    expect(v!.email_domain).toBe(newDomain);

    const { data: audit } = await admin
      .from("audit_entry")
      .select("actor_type, actor_id, action, target_type, target_id, metadata")
      .eq("action", "vendor.profile_updated")
      .eq("target_id", ids.vendorA)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    expect(audit).toBeTruthy();
    expect(audit!.actor_type).toBe("staff");
    expect(audit!.actor_id).toBe(ids.staff);
    expect(audit!.target_type).toBe("vendor");
    const fields = (audit!.metadata as { fields: string[] }).fields;
    expect(fields).toEqual(expect.arrayContaining(["name", "email_domain"]));
  });

  it("rejects a duplicate email_domain and leaves the row unchanged", async () => {
    const { data: before } = await admin.from("vendor").select("email_domain").eq("id", ids.vendorA).single();
    const res = await updateVendorAction({}, form({ id: ids.vendorA, name: "Whatever Pty Ltd", email_domain: ids.domainB }));
    expect(res.error).toMatch(/already uses that email domain/i);
    expect(res.ok).toBeUndefined();

    const { data: after } = await admin.from("vendor").select("email_domain, name").eq("id", ids.vendorA).single();
    expect(after!.email_domain).toBe(before!.email_domain); // unchanged
    expect(after!.name).not.toBe("Whatever Pty Ltd"); // no partial write
  });

  it("rejects a generic (non-work) email_domain", async () => {
    const res = await updateVendorAction({}, form({ id: ids.vendorA, name: "Edit Target A Renamed Pty Ltd", email_domain: "gmail.com" }));
    expect(res.error).toMatch(/valid work email domain/i);
    const { data: after } = await admin.from("vendor").select("email_domain").eq("id", ids.vendorA).single();
    expect(after!.email_domain).not.toBe("gmail.com");
  });

  it("a non-staff (vendor user) session cannot update a vendor row (RLS backstop)", async () => {
    const alex = createClient(URL, ANON, { auth: { persistSession: false } });
    const { error: signInErr } = await alex.auth.signInWithPassword({ email: "alex@alpha.test", password: PASSWORD });
    if (signInErr) throw new Error(signInErr.message);

    const { data: mine } = await alex.from("vendor").select("id, name").limit(1).single();
    expect(mine?.id).toBeTruthy();

    const { data: touched } = await alex
      .from("vendor")
      .update({ name: "Hijacked Pty Ltd", email_domain: `hijack-${rand()}.example` })
      .eq("id", mine!.id)
      .select("id");
    expect(touched ?? []).toEqual([]); // RLS: no updatable rows for a vendor user

    const { data: still } = await admin.from("vendor").select("name").eq("id", mine!.id).single();
    expect(still!.name).not.toBe("Hijacked Pty Ltd");
  });
});
