import { createServerClient, type CookieOptions } from "@supabase/ssr";
import {
  NextResponse,
  type NextRequest,
} from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNextPath } from "@/lib/safe-redirect";
import { RESET_PASSWORD_PATH } from "@/lib/password-reset";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

/**
 * Auth email-link landing (recovery + any future email confirmation). The
 * Supabase verify endpoint redirects here after the user clicks the emailed
 * link; we establish the session on THIS request (so the cookie is set on the
 * response) and forward to the in-app page named by `next`.
 *
 * Handles both Supabase SSR flows:
 *  - PKCE: `?code=…`        -> exchangeCodeForSession
 *  - OTP : `?token_hash=…&type=recovery` -> verifyOtp
 *
 * `next` comes off an attacker-influenceable URL, so it is run through
 * safeNextPath before any redirect — same open-redirect guard as login.
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  // Validate the forward target; default to the set-new-password page when the
  // link did not carry one (safeNextPath returns "/" for missing/unsafe values).
  const safeNext = safeNextPath(url.searchParams.get("next"));
  const next = safeNext === "/" ? RESET_PASSWORD_PATH : safeNext;

  const success = NextResponse.redirect(new URL(next, req.url));

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
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    ok = !error;
  }

  if (ok) return success;

  // Invalid, already-used, or expired link: send back to the request page with a
  // generic notice. Never echo a token-specific reason.
  return NextResponse.redirect(new URL("/login/forgot?error=link_invalid", req.url));
}
