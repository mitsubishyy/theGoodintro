"use client";

import { useActionState } from "react";
import { requestSignInLinkAction, type SignInLinkState } from "./actions";

/**
 * Passwordless sign-in-link path for executives and EAs (slice 2d), rendered
 * beneath the staff/vendor password form on the shared /login when the
 * exec_ea_login flag is on. Functional access surface; the locked two-column
 * /login redesign (design/locked/platform-sign-in) is a separate design port.
 *
 * Copy follows the lock: "sign-in link" (never "magic link"), and the link-sent
 * state ALWAYS renders after submit — it never confirms whether the address is a
 * member of the invite-only network.
 */
export function SignInLinkForm() {
  const [state, formAction, pending] = useActionState<SignInLinkState, FormData>(
    requestSignInLinkAction,
    {},
  );

  if (state.sent) {
    return (
      <div className="flex flex-col gap-2" aria-live="polite">
        <p className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
          Check your email
        </p>
        <p className="text-sm font-semibold">Your sign-in link is on its way.</p>
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          If that address is on file, we have sent it a sign-in link. It signs you
          straight in, works once, and a fresh one is a click away if it expires.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
        Executives and assistants: no password needed. Enter your email and we send
        you a one-tap sign-in link.
      </p>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
      >
        {pending ? "Sending…" : "Email me a sign-in link →"}
      </button>
    </form>
  );
}
