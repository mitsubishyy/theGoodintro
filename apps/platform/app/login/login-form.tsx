"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signInAction, type AuthState } from "./actions";

/**
 * Staff / vendor password sign-in. On the locked two-column /login redesign this
 * is the SECONDARY path: the email sign-in-link leads when exec_ea_login is on,
 * and this opens from a quiet "Sign in with a password instead" disclosure. When
 * the link flow is off it is the only path. Restyled to the locked field look
 * (48px white fields, hairline, mono labels, ink CTA).
 */
export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Work email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-12 rounded-lg border px-3.5 text-sm outline-none"
          style={{ background: "#fff", borderColor: "var(--portal-line)" }}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-lg border px-3.5 text-sm outline-none"
          style={{ background: "#fff", borderColor: "var(--portal-line)" }}
        />
      </label>

      <Link
        href="/login/forgot"
        className="-mt-1 self-end text-xs underline-offset-2 hover:underline"
        style={{ color: "var(--muted-foreground)" }}
      >
        Forgot password?
      </Link>

      {state.error ? (
        <p className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--portal-ink)", color: "#fff" }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
