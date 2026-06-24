"use client";

import { useActionState } from "react";
import { updatePasswordAction, type ResetState } from "./actions";
import { MIN_PASSWORD_LENGTH } from "@/lib/password-reset";

export function ResetForm() {
  const [state, formAction, pending] = useActionState<ResetState, FormData>(
    updatePasswordAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          New password
        </span>
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
          className="rounded-lg border px-3 py-2.5 text-sm outline-none"
          style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span
          className="font-mono text-xs uppercase tracking-[0.18em]"
          style={{ color: "var(--muted-foreground)" }}
        >
          Confirm new password
        </span>
        <input
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD_LENGTH}
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
        {pending ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}
