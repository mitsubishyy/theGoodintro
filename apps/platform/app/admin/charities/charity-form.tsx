"use client";

import { useActionState } from "react";
import { createCharityAction, type FormState } from "./actions";

const inputStyle = {
  background: "var(--portal-card)",
  borderColor: "var(--portal-line)",
} as const;

export function CharityForm() {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    createCharityAction,
    {},
  );

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>Name *</span>
        <input name="name" required className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>ABN</span>
        <input name="abn" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>DGR status</span>
        <select name="dgr_status" defaultValue="unverified" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle}>
          <option value="endorsed">endorsed</option>
          <option value="unverified">unverified</option>
          <option value="revoked">revoked</option>
        </select>
      </label>
      <button type="submit" disabled={pending} className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
        {pending ? "Adding…" : "Add charity"}
      </button>
      {state.error ? <span className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</span> : null}
      {state.ok ? <span className="text-sm" style={{ color: "var(--primary)" }}>Added.</span> : null}
    </form>
  );
}
