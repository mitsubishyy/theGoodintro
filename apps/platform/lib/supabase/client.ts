import { createBrowserClient } from "@supabase/ssr";

/** Browser Supabase client (publishable key; all access is RLS-enforced). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
