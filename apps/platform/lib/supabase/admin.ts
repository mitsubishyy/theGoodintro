import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — BYPASSES RLS. Server-only, never import into client
 * code. Used by trusted system paths (e.g. the signature-verified Xero
 * webhook). Returns null when the key is not configured (stubbed), so callers
 * can degrade gracefully until the secret is provided.
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
