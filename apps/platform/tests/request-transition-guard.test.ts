import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * DB-level state-machine transition guard for Request (migration 0037, the same
 * defense-in-depth pattern as 0012's Meeting/Gift and 0036's Vendor/Executive
 * guards). Proves the guard allows exactly the three documented transitions
 * (STATE_MACHINES.md: submitted -> accepted | declined | closed, performed by
 * act_on_request_token accept/decline and close_request) and raises on anything
 * else, even by direct SQL.
 *
 * Runs against a DEDICATED request row (off the seed) hung on a dedicated
 * vendor + vendor_user + executive created once in beforeAll. Each case re-INSERTs
 * the request at its `from` status (INSERT bypasses the UPDATE-only guard) so every
 * assertion starts from a known state. Uses the service role so RLS never
 * interferes — the trigger fires for every caller regardless.
 */

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const VENDOR = "00000000-0000-0000-0000-0000000a7052"; // dedicated; off seed + other suites
const VUSER = "00000000-0000-0000-0000-0000000a7053";
const EXEC = "00000000-0000-0000-0000-00000000ec78";
const REQUEST = "00000000-0000-0000-0000-000000005e91";

// Allow-list mirrors migration 0037 exactly (STATE_MACHINES.md Request table).
const REQUEST_LEGAL: [string, string][] = [
  ["submitted", "accepted"],
  ["submitted", "declined"],
  ["submitted", "closed"],
];
const REQUEST_ILLEGAL: [string, string][] = [
  ["accepted", "declined"], // terminal; the Meeting takes over from accepted
  ["accepted", "closed"], // terminal
  ["accepted", "submitted"], // no going back to the start
  ["declined", "accepted"], // terminal; no un-decline
  ["declined", "closed"], // terminal
  ["closed", "submitted"], // terminal; no reopen
  ["closed", "accepted"], // terminal
];

function service(): SupabaseClient {
  return createClient(URL, SECRET, { auth: { persistSession: false } });
}

async function requestAt(svc: SupabaseClient, status: string) {
  await svc.from("request").delete().eq("id", REQUEST);
  await svc.from("request").insert({
    id: REQUEST,
    vendor_id: VENDOR,
    requested_by_user_id: VUSER,
    executive_id: EXEC,
    q1_what: "guard test",
    q2_why: "guard test",
    status,
  });
}
async function move(svc: SupabaseClient, status: string): Promise<string | null> {
  const { error } = await svc.from("request").update({ status }).eq("id", REQUEST);
  return error?.message ?? null;
}

beforeAll(async () => {
  const svc = service();
  // Clean any leftovers, then build the dedicated parent chain the request hangs on.
  await svc.from("request").delete().eq("id", REQUEST);
  await svc.from("vendor").delete().eq("id", VENDOR); // cascades vendor_user
  await svc.from("executive").delete().eq("id", EXEC);
  await svc.from("vendor").insert({ id: VENDOR, name: "GuardR", email_domain: "guardr.test", status: "active" });
  await svc.from("vendor_user").insert({ id: VUSER, vendor_id: VENDOR, email: "guardr@guardr.test", name: "GuardR User" });
  // No default_charity_id (GOTCHA, per the 0036 test): keeps the exec row unpinned.
  await svc.from("executive").insert({ id: EXEC, name: "GuardR Exec", primary_email: "guardr-exec@guard.test", status: "active" });
});

afterAll(async () => {
  const svc = service();
  await svc.from("request").delete().eq("id", REQUEST);
  await svc.from("vendor").delete().eq("id", VENDOR); // cascades vendor_user
  await svc.from("executive").delete().eq("id", EXEC);
});

describe("request transition guard (0037)", () => {
  it("allows every documented transition", async () => {
    const svc = service();
    for (const [from, to] of REQUEST_LEGAL) {
      await requestAt(svc, from);
      expect(await move(svc, to), `${from} -> ${to} should be allowed`).toBeNull();
    }
  });

  it("allows an idempotent same-status write (e.g. forwarded_to_ea_at / decline_reason)", async () => {
    const svc = service();
    // A send-to-EA forward touches forwarded_to_ea_at while status stays 'submitted';
    // set_decline_reason_for_token touches decline_reason while status stays 'declined'.
    await requestAt(svc, "submitted");
    expect(await move(svc, "submitted")).toBeNull();
    await requestAt(svc, "declined");
    expect(await move(svc, "declined")).toBeNull();
  });

  it("rejects illegal transitions", async () => {
    const svc = service();
    for (const [from, to] of REQUEST_ILLEGAL) {
      await requestAt(svc, from);
      expect(await move(svc, to), `${from} -> ${to} should be blocked`).toMatch(
        /illegal request transition/,
      );
    }
  });
});
