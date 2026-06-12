import { describe, it, expect } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const PASSWORD = "Passw0rd!test";

async function signIn(email: string): Promise<SupabaseClient> {
  const c = createClient(URL, KEY, { auth: { persistSession: false } });
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) throw new Error(error.message);
  return c;
}

/**
 * Admin Vendors list chunk B — DB behaviour the archive action relies on.
 * The server action itself (requireStaff + flag gate) follows the repo's
 * untestable-wrapper convention; what is tested here is the contract under
 * it: the flag ships OFF, staff can soft-delete, the list filter excludes
 * archived vendors, and a vendor user cannot archive anyone.
 */
describe("admin vendors list (T3 chunk B)", () => {
  it("admin_vendors_actions flag exists and ships OFF (CHANGE_SAFETY)", async () => {
    const admin = await signIn("admin@thegoodintro.test");
    const { data, error } = await admin
      .from("feature_flag")
      .select("enabled")
      .eq("key", "admin_vendors_actions")
      .single();
    expect(error).toBeNull();
    expect(data?.enabled).toBe(false);
  });

  it("staff archive is a soft delete the list query excludes; reversible", async () => {
    const admin = await signIn("admin@thegoodintro.test");

    const { data: created, error: insErr } = await admin
      .from("vendor")
      .insert({ name: "Archive Test Pty Ltd", email_domain: "archive-test.example" })
      .select("id")
      .single();
    expect(insErr).toBeNull();
    const id = created!.id as string;

    try {
      // The action's exact update: deleted_at = now() where still live.
      const { data: archived, error: updErr } = await admin
        .from("vendor")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", [id])
        .is("deleted_at", null)
        .select("id");
      expect(updErr).toBeNull();
      expect(archived).toHaveLength(1);

      // The list page filters .is("deleted_at", null) — the vendor is gone.
      const { data: listed } = await admin
        .from("vendor")
        .select("id")
        .is("deleted_at", null)
        .eq("id", id);
      expect(listed ?? []).toEqual([]);

      // Re-running the same update is a no-op (idempotent on already-archived).
      const { data: again } = await admin
        .from("vendor")
        .update({ deleted_at: new Date().toISOString() })
        .in("id", [id])
        .is("deleted_at", null)
        .select("id");
      expect(again ?? []).toEqual([]);

      // Reversible: clearing the column restores the vendor to the list.
      await admin.from("vendor").update({ deleted_at: null }).eq("id", id);
      const { data: restored } = await admin
        .from("vendor")
        .select("id")
        .is("deleted_at", null)
        .eq("id", id);
      expect(restored).toHaveLength(1);
    } finally {
      await admin.from("vendor").delete().eq("id", id);
    }
  });

  it("a vendor user cannot archive vendors (RLS)", async () => {
    const admin = await signIn("admin@thegoodintro.test");
    const alex = await signIn("alex@alpha.test");

    // Alex's own org id, read through his own RLS view.
    const { data: mine } = await alex.from("vendor").select("id").limit(1).single();
    expect(mine?.id).toBeTruthy();

    const { data: touched } = await alex
      .from("vendor")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", mine!.id)
      .select("id");
    // RLS: the update matches no updatable rows for a vendor user.
    expect(touched ?? []).toEqual([]);

    // Confirm nothing changed from the staff view.
    const { data: still } = await admin
      .from("vendor")
      .select("deleted_at")
      .eq("id", mine!.id)
      .single();
    expect(still?.deleted_at).toBeNull();
  });
});
