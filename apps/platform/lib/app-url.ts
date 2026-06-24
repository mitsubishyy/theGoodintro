/**
 * The platform's external base URL with no trailing slash. Used to build
 * absolute links handed to outside systems (e.g. the Supabase Auth recovery
 * `redirectTo`). Mirrors the convention already used to build absolute email
 * links in `lib/email/sender.ts`; keep the two in step.
 */
export function appBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(
    /\/+$/,
    "",
  );
}
