"use client";

import { useActionState } from "react";
import { submitApplicationAction, type AppState } from "./actions";

const inputStyle = {
  background: "var(--portal-card)",
  borderColor: "var(--portal-line)",
} as const;

function Q({ label, name }: { label: string; name: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <textarea name={name} rows={3} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
    </label>
  );
}

export function ApplicationForm() {
  const [state, formAction, pending] = useActionState<AppState, FormData>(
    submitApplicationAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Q label="Who are you, and what do you do?" name="who_we_are" />
      <Q label="Why are you relevant to the leaders on theGoodintro?" name="why_relevant" />
      <Q label="What are you hoping to achieve?" name="goals" />

      {state.error ? (
        <p className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="self-start rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
