"use client";

import { useActionState } from "react";
import { verifyMfaAction, type AuthState } from "./actions";

export function MfaForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    verifyMfaAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-xs uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          6-digit code
        </span>
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          required
          className="rounded-lg border px-3 py-2.5 text-sm tracking-[0.3em] outline-none"
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
        className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
      >
        {pending ? "Verifying…" : "Verify"}
      </button>
    </form>
  );
}
