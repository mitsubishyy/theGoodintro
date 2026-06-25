import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  RESET_PASSWORD_PATH,
  RECOVERY_INTENT_COOKIE,
  RECOVERY_INTENT_MAX_AGE,
  RECOVERY_INTENT_PATH,
} from "@/lib/password-reset";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Recovery email-link landing. The Supabase verify endpoint redirects here after
 * the user clicks the reset link; we establish the recovery session on THIS
 * request (so the cookie is set on the response) and ALWAYS forward to the
 * set-new-password page.
 *
 * Deliberately recovery-only and with a FIXED destination:
 *  - No caller-supplied `next`. Earlier this accepted a `next` path and redirected
 *    there, which let anyone craft a recovery email (the public key can request
 *    one) with `redirectTo=/auth/confirm?next=/admin` — turning a recovery email
 *    into a magic login to an arbitrary route. The destination is now hard-wired
 *    to RESET_PASSWORD_PATH; reintroduce a `next` only alongside a separate,
 *    non-recovery email-confirmation flow.
 *  - The OTP branch only accepts `type=recovery`; other email types are rejected
 *    until their own flows exist.
 *
 * Handles both Supabase SSR flows:
 *  - PKCE (the SSR default): `?code=…`            -> exchangeCodeForSession
 *  - OTP : `?token_hash=…&type=recovery`          -> verifyOtp
 *
 * On success it sets a short-lived, HttpOnly recovery-intent cookie that the
 * reset page and action require, so that page is reachable only via this route.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const success = NextResponse.redirect(new URL(RESET_PASSWORD_PATH, req.url));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(list: CookieToSet[]) {
          list.forEach(({ name, value, options }) =>
            success.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let ok = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type === "recovery") {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    ok = !error;
  }

  if (ok) {
    success.cookies.set(RECOVERY_INTENT_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: RECOVERY_INTENT_PATH,
      maxAge: RECOVERY_INTENT_MAX_AGE,
    });
    return success;
  }

  // Invalid, already-used, or expired link: send back to the request page with a
  // generic notice. Never echo a token-specific reason.
  return NextResponse.redirect(new URL("/login/forgot?error=link_invalid", req.url));
}
