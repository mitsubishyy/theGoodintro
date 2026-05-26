"use client";

import { useActionState } from "react";
import { signInAction, type AuthState } from "./actions";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    signInAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
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
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
        />
      </label>

      {state.error ? (
        <p className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
