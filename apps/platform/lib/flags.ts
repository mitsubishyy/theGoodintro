import { createClient } from "@/lib/supabase/server";

/**
 * Read a feature flag. Defaults to OFF for anything missing or unreadable
 * (CHANGE_SAFETY.md: every new behaviour is off by default). Flags are toggled
 * in the admin portal; the value lives in the `feature_flag` table.
 */
export async function getFlag(key: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feature_flag")
    .select("enabled")
    .eq("key", key)
    .maybeSingle();
  return data?.enabled === true;
}
