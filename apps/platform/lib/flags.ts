import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Load ALL feature flags in a single query, memoized per request with React
 * `cache()`. `feature_flag` is a tiny operational-config table (CHANGE_SAFETY.md),
 * so reading every row once per request and serving `getFlag()` from the map
 * turns N separate per-request flag round-trips (layout gate + page guards +
 * nested checks) into one. Per-request only; still runs as the signed-in user's
 * client, so RLS is unchanged (an unauthenticated caller reads no rows → every
 * flag defaults OFF, exactly as before).
 */
const loadFlags = cache(async (): Promise<Record<string, boolean>> => {
  const supabase = await createClient();
  const { data } = await supabase.from("feature_flag").select("key, enabled");
  const map: Record<string, boolean> = {};
  for (const row of data ?? []) {
    map[row.key as string] = row.enabled === true;
  }
  return map;
});

/**
 * Read a feature flag. Defaults to OFF for anything missing or unreadable
 * (CHANGE_SAFETY.md: every new behaviour is off by default). Flags are toggled
 * in the admin portal; the value lives in the `feature_flag` table. Served from
 * the per-request batched `loadFlags()` map (one query for all flags).
 *
 * Reads under the CALLER's session: feature_flag's RLS is `select to authenticated
 * using (true)`, so an authenticated user gets the real value, but an ANONYMOUS
 * caller reads zero rows and always sees OFF. That is fine for flags only ever
 * gated behind a signed-in surface; for a flag that must gate a PUBLIC surface
 * (or act as a reliable kill switch independent of who is asking), use
 * getFlagAuthoritative instead.
 */
export async function getFlag(key: string): Promise<boolean> {
  const flags = await loadFlags();
  return flags[key] === true;
}

/**
 * Read a feature flag AUTHORITATIVELY via the service role, bypassing RLS, so the
 * value does not depend on whether the caller is authenticated. Use this for any
 * flag that gates a public/unauthenticated surface (e.g. the shared /login
 * sign-in-link path) or that must be a reliable on/off kill switch read
 * identically across every surface (CHANGE_SAFETY.md §3). Fails CLOSED: if the
 * service-role client is not configured the flag reads OFF, never on.
 */
export async function getFlagAuthoritative(key: string): Promise<boolean> {
  const admin = createAdminClient();
  if (!admin) return false; // fail closed — no service role means no feature
  const { data } = await admin
    .from("feature_flag")
    .select("enabled")
    .eq("key", key)
    .maybeSingle();
  return data?.enabled === true;
}

/** Throw if a flag is off — server-side guard for flag-gated write actions. */
export async function assertFlag(key: string): Promise<void> {
  if (!(await getFlag(key))) {
    throw new Error(`This feature (${key}) is not enabled.`);
  }
}
