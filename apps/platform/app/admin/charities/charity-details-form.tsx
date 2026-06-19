"use client";

import { useActionState } from "react";
import { updateCharityDetailsAction, type FormState } from "./actions";

/**
 * Charity core-identity editor (name / abn / dgr_status). Mirrors the create form's
 * fields and styling. dgr_status drives nomination eligibility (only `endorsed`
 * charities can be nominated), so changing it here is a real eligibility lever.
 */

const inputStyle = { background: "var(--portal-card)", borderColor: "var(--portal-line)" } as const;
const labelStyle = "font-mono text-[10px] uppercase tracking-[0.18em]";

export function CharityDetailsForm({
  id,
  name,
  abn,
  dgrStatus,
}: {
  id: string;
  name: string;
  abn: string;
  dgrStatus: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateCharityDetailsAction, {});

  return (
    <form action={formAction} className="grid max-w-xl gap-4">
      <input type="hidden" name="id" value={id} />

      <label className="flex flex-col gap-1.5">
        <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>Name *</span>
        <input name="name" required defaultValue={name} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>ABN</span>
        <input name="abn" defaultValue={abn} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelStyle} style={{ color: "var(--muted-foreground)" }}>DGR status</span>
        <select name="dgr_status" defaultValue={dgrStatus} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle}>
          <option value="endorsed">endorsed</option>
          <option value="unverified">unverified</option>
          <option value="revoked">revoked</option>
        </select>
        <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Only endorsed charities can be nominated by executives.
        </span>
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        >
          {pending ? "Saving…" : "Save details"}
        </button>
        {state.error ? <span className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</span> : null}
        {state.ok ? <span className="text-sm" style={{ color: "var(--primary)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
