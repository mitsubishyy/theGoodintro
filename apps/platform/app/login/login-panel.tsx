"use client";

import { useState } from "react";
import { LoginForm } from "./login-form";
import { SignInLinkForm } from "./sign-in-link-form";

/**
 * The left-column form area of the locked /login (design/locked/platform-sign-in).
 *
 * Reconciles the locked passwordless-first design with the live auth reality
 * (decided with Issy 2026-06-25, "secondary disclosure"):
 *  - When the sign-in-link flow is on (exec_ea_login), the email sign-in-link is
 *    the PRIMARY path, and staff/vendor password sign-in opens from a quiet
 *    "Sign in with a password instead" disclosure.
 *  - When it is off, password sign-in is the only path and renders directly (no
 *    disclosure), matching today's behaviour.
 *
 * SSO ("Continue with Google / Microsoft") from the lock is intentionally OMITTED
 * for now (decided with Issy): the OAuth provider is a parked MVP_SCOPE decision,
 * so dead buttons are worse than their absence. They return as a Pass B when the
 * provider is chosen — keep their slot in mind (above the "OR WITH EMAIL"
 * divider) when wiring them.
 */
export function LoginPanel({ next, linkEnabled }: { next: string; linkEnabled: boolean }) {
  const [showPassword, setShowPassword] = useState(false);

  if (!linkEnabled) {
    // Password is the only path; render it directly.
    return <LoginForm next={next} />;
  }

  return (
    <div className="flex flex-col gap-5">
      <SignInLinkForm />

      <div className="flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: "var(--portal-line)" }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Or with a password
        </span>
        <span className="h-px flex-1" style={{ background: "var(--portal-line)" }} />
      </div>

      {showPassword ? (
        <div className="flex flex-col gap-3">
          <LoginForm next={next} />
          <button
            type="button"
            onClick={() => setShowPassword(false)}
            className="self-start text-sm underline-offset-2 hover:underline"
            style={{ color: "var(--portal-amber-ink)" }}
          >
            ← Back to the sign-in link
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowPassword(true)}
          className="h-11 rounded-lg border text-sm font-semibold"
          style={{ background: "#fff", borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
        >
          Sign in with a password instead
        </button>
      )}
    </div>
  );
}
