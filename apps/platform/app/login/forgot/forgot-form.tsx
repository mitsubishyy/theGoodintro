"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordResetAction, type ForgotState } from "./actions";

export function ForgotForm() {
  const [state, formAction, pending] = useActionState<ForgotState, FormData>(
    requestPasswordResetAction,
    {},
  );

  if (state.done) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
          If that account exists we have sent a reset link. Check your inbox and
          follow the link to set a new password.
        </p>
        <Link
          href="/login"
          className="text-sm underline-offset-2 hover:underline"
          style={{ color: "var(--foreground)" }}
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Work email
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
        {pending ? "Sending…" : "Send reset link"}
      </button>

      <Link
        href="/login"
        className="text-sm underline-offset-2 hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        Back to sign in
      </Link>
    </form>
  );
}
