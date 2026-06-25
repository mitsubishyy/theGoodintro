import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark, Icon } from "@thegoodintro/ui";
import { LoginPanel } from "./login-panel";
import { safeNextPath } from "@/lib/safe-redirect";
import { getFlagAuthoritative } from "@/lib/flags";

export const metadata: Metadata = {
  title: "Sign in — TheGoodIntro",
  robots: { index: false, follow: false },
};

/**
 * Shared /login — the locked two-column auth-entry surface
 * (design/locked/platform-sign-in, LOCKED 2026-06-11). ONE door for vendors,
 * executives, and EAs: the email resolves the account server-side and the sign-in
 * link routes the person to their portal. No role picker, ever.
 *
 * Port decisions (with Issy 2026-06-25): the password path lives behind a quiet
 * "Sign in with a password instead" disclosure (LoginPanel), and the locked SSO
 * buttons are omitted until the OAuth provider is chosen. The link-sent state
 * always renders and never confirms membership (see SignInLinkForm).
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string; reset?: string }>;
}) {
  const { next, error, reset } = await searchParams;
  // Authoritative read: the visitor here is anonymous, and feature_flag is not
  // readable by anon under RLS, so a session-scoped read would always be OFF.
  const linkEnabled = await getFlagAuthoritative("exec_ea_login");

  const banner =
    error === "not_staff"
      ? "That account does not have admin access."
      : error === "not_authorized"
        ? "That account does not have access to this area."
        : error === "link_invalid"
          ? "That sign-in link did not work. Links work once and go stale quickly. Request a fresh one below."
          : reset === "done"
            ? "Your password has been updated. Sign in with your new password."
            : null;
  const bannerMuted = reset === "done";

  return (
    <main className="flex min-h-screen" style={{ background: "var(--portal-page)", color: "var(--foreground)" }}>
      {/* LEFT — form column (full width on mobile, 58% at lg). */}
      <div className="flex w-full flex-col px-6 py-10 sm:px-12 lg:w-[58%] lg:px-20 lg:py-16">
        <div className="flex justify-center lg:justify-start">
          <Wordmark size={28} />
        </div>

        <div className="flex flex-1 flex-col justify-center py-12">
          <div className="mx-auto w-full max-w-[400px]">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
              Welcome back
            </p>
            <h1 className="mt-2 text-[28px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
              Sign in to The<span style={{ color: "var(--primary)" }}>Good</span>Intro
            </h1>
            <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              {linkEnabled
                ? "Enter your email and we send you a one-tap sign-in link."
                : "Sign in with your work email and password."}
            </p>

            {/* SSO ("Continue with Google / Microsoft") goes here when the OAuth
                provider is chosen — omitted for now (parked MVP_SCOPE decision). */}

            {banner ? (
              <p className="mt-5 text-sm" style={{ color: bannerMuted ? "var(--muted-foreground)" : "var(--portal-amber-ink)" }}>
                {banner}
              </p>
            ) : null}

            <div className="mt-6">
              <LoginPanel next={safeNextPath(next)} linkEnabled={linkEnabled} />
            </div>

            <p className="mt-6 text-center text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              By signing in you accept our{" "}
              <a href="https://thegoodintro.com/terms" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Terms
              </a>{" "}
              and{" "}
              <a href="https://thegoodintro.com/privacy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[400px] text-center lg:text-left">
          <Link href="/signup" className="text-sm font-medium underline-offset-2 hover:underline" style={{ color: "var(--portal-amber-ink)" }}>
            New to TheGoodIntro? Request access →
          </Link>
        </div>
      </div>

      {/* RIGHT — brand panel (hidden on mobile). */}
      <aside
        className="hidden flex-col justify-center px-16 lg:flex lg:w-[42%]"
        style={{ background: "var(--primary)" }}
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "color-mix(in srgb, #fff 78%, var(--primary))" }}>
          Why this exists
        </p>
        <h2 className="mt-5 text-[42px] font-semibold leading-[1.1] tracking-tight" style={{ color: "#fff" }}>
          Real introductions.
          <br />
          Real giving.
        </h2>
        <p className="mt-5 max-w-[380px] text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.78)" }}>
          Senior leaders take the meetings worth taking, and every one funds a real gift to the charity they choose.
        </p>

        <BrandIllustration />

        <ul className="mt-10 flex flex-col gap-3">
          <TrustLine>Australian-first. Built for ASX and mid-market.</TrustLine>
          <TrustLine>Invite-led. Every vendor is vetted on a call.</TrustLine>
        </ul>
      </aside>
    </main>
  );
}

function TrustLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
      <Icon name="check" size={16} className="mt-0.5 shrink-0" style={{ color: "color-mix(in srgb, #fff 78%, var(--primary))" }} />
      <span>{children}</span>
    </li>
  );
}

/**
 * Abstract brand motif (no humans, 1.6px strokes): three stacked profile cards
 * with coins fanning toward a heart outline. A stand-in for the locked
 * illustration; refine alongside the /signup brand panel so the two auth pages
 * stay in step (verify-at-port item).
 */
function BrandIllustration() {
  return (
    <svg className="mt-12 h-auto w-[300px] max-w-full" viewBox="0 0 300 160" fill="none" aria-hidden="true">
      <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.6">
        <rect x="14" y="44" width="150" height="40" rx="10" fill="rgba(255,255,255,0.06)" />
        <rect x="26" y="28" width="150" height="40" rx="10" fill="rgba(255,255,255,0.10)" />
        <rect x="38" y="12" width="150" height="40" rx="10" fill="rgba(255,255,255,0.16)" />
        <circle cx="58" cy="32" r="9" />
        <path d="M78 28h74M78 38h50" />
      </g>
      <g stroke="color-mix(in srgb, #fff 80%, var(--primary))" strokeWidth="1.6" fill="none">
        <circle cx="120" cy="120" r="11" />
        <circle cx="150" cy="132" r="11" />
        <circle cx="182" cy="124" r="11" />
      </g>
      <path
        d="M236 120c0-9 7-15 14-15 5 0 9 3 11 7 2-4 6-7 11-7 7 0 14 6 14 15 0 14-25 28-25 28s-25-14-25-28z"
        stroke="#fff"
        strokeWidth="1.6"
        fill="rgba(255,255,255,0.08)"
      />
    </svg>
  );
}
