import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkAuthUserToExecOrEa } from "@/lib/exec-access";
import { safeNextPath } from "@/lib/safe-redirect";
import { logSecurityEvent } from "@/lib/security-log";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Sign-in-link landing for executives and EAs (slice 2d). Supabase's verify
 * endpoint redirects here after the link is clicked; we establish the session on
 * THIS request, bind the auth user to its executive / EA record (so the 0029 RLS
 * starts scoping them), and route into the exec portal.
 *
 * This is the "separate, non-recovery email-confirmation flow" the recovery route
 * (/auth/confirm) deliberately deferred a `next` to. The destination here is
 * locked to the exec portal: a caller-supplied `next` is both safeNextPath-ed AND
 * required to be within /exec, so this link can never be turned into an open login
 * to /admin or off-origin (the open-redirect class is closed by construction; an
 * exec/EA session has no admin access regardless).
 *
 * Membership is never revealed: an authenticated session that matches no exec/EA
 * is signed out and bounced with the same generic notice as an invalid link.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  // Honor an in-portal `next` only if it is same-origin (safeNextPath) AND inside
  // /exec; anything else (a different portal, off-origin) falls back to /exec.
  const requested = safeNextPath(url.searchParams.get("next"));
  const dest = requested === "/exec" || requested.startsWith("/exec/") ? requested : "/exec";

  // Collect cookie writes so the final destination is chosen AFTER linking.
  const jar: CookieToSet[] = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(list: CookieToSet[]) {
          jar.push(...list);
        },
      },
    },
  );

  // Failure NEVER carries the session jar onto the response, so a verified-but-
  // unusable session (invalid link, or an authenticated non-member) is never
  // written to the browser — the person stays signed out and is bounced with the
  // same generic notice. Membership is never confirmed or denied.
  const fail = () => NextResponse.redirect(new URL("/login?error=link_invalid", req.url));

  // Establish the session (PKCE `code`, or OTP `token_hash` for magic-link / email).
  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && (type === "magiclink" || type === "email")) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }
  if (!ok) return fail();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return fail();

  // Bind the auth user to its exec/EA record under the service role (an exec/EA
  // session cannot write executive/ea under RLS).
  const admin = createAdminClient();
  const principal = admin ? await linkAuthUserToExecOrEa(admin, user.id, user.email) : null;

  if (!principal) {
    // Authenticated, but not an exec/EA. Revoke the just-issued session server-side
    // and bounce WITHOUT writing its cookies (fail() drops the jar).
    await supabase.auth.signOut();
    return fail();
  }

  // Only a real principal gets the session written to the browser.
  logSecurityEvent("exec_signin_linked", { kind: principal.kind });
  const res = NextResponse.redirect(new URL(dest, req.url));
  for (const { name, value, options } of jar) res.cookies.set(name, value, options);
  return res;
}
