"use client";

import { useActionState } from "react";
import { signUpAction, type SignUpState } from "./actions";

const inputStyle = {
  background: "var(--portal-card)",
  borderColor: "var(--portal-line)",
} as const;

function Field({ label, name, type = "text", autoComplete }: { label: string; name: string; type?: string; autoComplete?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <input name={name} type={type} required autoComplete={autoComplete} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
    </label>
  );
}

export function SignUpForm() {
  const [state, formAction, pending] = useActionState<SignUpState, FormData>(
    signUpAction,
    {},
  );

  if (state.checkEmail) {
    return (
      <p className="text-sm" style={{ color: "var(--foreground)" }}>
        Almost there. Check your inbox to confirm your email, then sign in and we
        will finish setting up your account.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Field label="Company" name="company" autoComplete="organization" />
      <Field label="Your name" name="full_name" autoComplete="name" />
      <Field label="Work email" name="email" type="email" autoComplete="email" />
      <Field label="Password" name="password" type="password" autoComplete="new-password" />

      {state.error ? (
        <p className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="mt-1 rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
        {pending ? "Creating your account…" : "Create account"}
      </button>
    </form>
  );
}
