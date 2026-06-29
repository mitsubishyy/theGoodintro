import { describe, it, expect, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * DB-level lifecycle transition guards for Vendor and Executive (migration 0036,
 * the same defense-in-depth pattern as 0012's Meeting/Gift guards). Proves the
 * guards allow exactly the documented transitions (DATA_MODEL.md chains + what
 * the admin actions / apply_paid_invoice actually perform) and raise on anything
 * else, even by direct SQL.
 *
 * Runs against DEDICATED rows (off the seed). Each case re-INSERTs the row at its
 * `from` status (INSERT bypasses the UPDATE-only guard) so every assertion starts
 * from a known state. The executive is created WITHOUT default_charity_id (test
 * GOTCHA: keeps cleanup an unpinned delete). Uses the service role so RLS never
 * interferes — the trigger fires for every caller regardless.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VENDOR = "00000000-0000-0000-0000-0000000a7051"; // dedicated; off seed + other suites
const EXEC = "00000000-0000-0000-0000-00000000ec77";

// Allow-lists mirror migration 0036 exactly.
const VENDOR_LEGAL: [string, string][] = [
  ["signed_up", "call_booked"],
  ["signed_up", "approved"],
  ["call_booked", "approved"],
  ["approved", "paid"],
  ["approved", "active"],
  ["paid", "active"],
  ["active", "dormant"],
  ["dormant", "active"],
  ["dormant", "churned"],
];
const VENDOR_ILLEGAL: [string, string][] = [
  ["active", "signed_up"], // no going back to the start
  ["approved", "call_booked"], // no un-approve
  ["churned", "active"], // terminal cannot reactivate out of band
  ["signed_up", "active"], // cannot activate an unapproved vendor
  ["active", "churned"], // chain churns via dormant, not straight from active
  ["call_booked", "signed_up"],
];
const EXEC_LEGAL: [string, string][] = [
  ["invited", "set_up"],
  ["set_up", "active"],
  ["active", "paused"],
  ["active", "left"],
  ["paused", "active"],
  ["paused", "left"],
];
const EXEC_ILLEGAL: [string, string][] = [
  ["invited", "active"], // cannot skip set_up
  ["left", "active"], // terminal
  ["left", "paused"], // terminal
  ["set_up", "paused"], // must activate before pausing
  ["active", "invited"], // no going back to the start
  ["active", "set_up"],
];

function service(): SupabaseClient {
  return createClient(URL, SECRET, { auth: { persistSession: false } });
}

async function vendorAt(svc: SupabaseClient, status: string) {
  await svc.from("vendor").delete().eq("id", VENDOR);
  await svc.from("vendor").insert({ id: VENDOR, name: "GuardV", email_domain: "guardv.test", status });
}
async function execAt(svc: SupabaseClient, status: string) {
  await svc.from("executive").delete().eq("id", EXEC);
  // No default_charity_id (GOTCHA): keeps the row unpinned so cleanup is a plain delete.
  await svc.from("executive").insert({ id: EXEC, name: "GuardE", primary_email: "guarde@guard.test", status });
}
async function move(svc: SupabaseClient, table: "vendor" | "executive", id: string, status: string): Promise<string | null> {
  const { error } = await svc.from(table).update({ status }).eq("id", id);
  return error?.message ?? null;
}

afterAll(async () => {
  const svc = service();
  await svc.from("vendor").delete().eq("id", VENDOR);
  await svc.from("executive").delete().eq("id", EXEC);
});

describe("vendor lifecycle transition guard (0036)", () => {
  it("allows every documented transition", async () => {
    const svc = service();
    for (const [from, to] of VENDOR_LEGAL) {
      await vendorAt(svc, from);
      expect(await move(svc, "vendor", VENDOR, to), `${from} -> ${to} should be allowed`).toBeNull();
    }
  });

  it("allows an idempotent same-status write (e.g. apply_paid_invoice top-up)", async () => {
    const svc = service();
    await vendorAt(svc, "active");
    expect(await move(svc, "vendor", VENDOR, "active")).toBeNull();
  });

  it("rejects illegal transitions", async () => {
    const svc = service();
    for (const [from, to] of VENDOR_ILLEGAL) {
      await vendorAt(svc, from);
      expect(await move(svc, "vendor", VENDOR, to), `${from} -> ${to} should be blocked`).toMatch(
        /illegal vendor transition/,
      );
    }
  });
});

describe("executive lifecycle transition guard (0036)", () => {
  it("allows every documented transition", async () => {
    const svc = service();
    for (const [from, to] of EXEC_LEGAL) {
      await execAt(svc, from);
      expect(await move(svc, "executive", EXEC, to), `${from} -> ${to} should be allowed`).toBeNull();
    }
  });

  it("rejects illegal transitions", async () => {
    const svc = service();
    for (const [from, to] of EXEC_ILLEGAL) {
      await execAt(svc, from);
      expect(await move(svc, "executive", EXEC, to), `${from} -> ${to} should be blocked`).toMatch(
        /illegal executive transition/,
      );
    }
  });
});
