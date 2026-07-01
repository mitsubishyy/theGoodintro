import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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
 */
export async function getFlag(key: string): Promise<boolean> {
  const flags = await loadFlags();
  return flags[key] === true;
}

/** Throw if a flag is off — server-side guard for flag-gated write actions. */
export async function assertFlag(key: string): Promise<void> {
  if (!(await getFlag(key))) {
    throw new Error(`This feature (${key}) is not enabled.`);
  }
}
