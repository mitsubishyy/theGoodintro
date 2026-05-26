"use client";

import { useActionState } from "react";
import { submitRequestAction, type RequestState } from "../actions";

const inputStyle = {
  background: "var(--portal-card)",
  borderColor: "var(--portal-line)",
} as const;

export function RequestForm({ executiveId }: { executiveId: string }) {
  const [state, formAction, pending] = useActionState<RequestState, FormData>(
    submitRequestAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="executive_id" value={executiveId} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">What would you like to talk about?</span>
        <textarea name="q1" rows={3} maxLength={300} required className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Why is it relevant to this leader?</span>
        <textarea name="q2" rows={3} maxLength={300} required className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <fieldset className="rounded-lg border p-4" style={{ borderColor: "var(--portal-line)" }}>
        <legend className="px-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
          If someone other than you will attend (optional)
        </legend>
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="att_name" placeholder="Name" className="rounded-lg border px-3 py-2 text-sm" style={inputStyle} />
          <input name="att_title" placeholder="Title" className="rounded-lg border px-3 py-2 text-sm" style={inputStyle} />
          <input name="att_email" type="email" placeholder="Email" className="rounded-lg border px-3 py-2 text-sm" style={inputStyle} />
        </div>
      </fieldset>

      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        Emails, phone numbers and links are removed automatically — the first
        introduction happens through us.
      </p>

      {state.error ? (
        <p className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="self-start rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
        {pending ? "Sending…" : "Send request"}
      </button>
    </form>
  );
}
