"use client";

import { useActionState, type ReactNode } from "react";
import type { FormState } from "../actions";

type Option = { id: string; name: string };
type ExecOption = { id: string; name: string; default_charity_id: string | null };

const inputStyle = { background: "var(--portal-card)", borderColor: "var(--portal-line)" } as const;

function Label({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
      {children}
    </span>
  );
}

export function NewMeetingForm({
  action,
  vendors,
  executives,
  charities,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  vendors: Option[];
  executives: ExecOption[];
  charities: Option[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-1.5">
        <Label>Vendor *</Label>
        <select name="vendor_id" required defaultValue="" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle}>
          <option value="" disabled>Select a vendor…</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <Label>Executive *</Label>
        <select name="executive_id" required defaultValue="" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle}>
          <option value="" disabled>Select an executive…</option>
          {executives.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <Label>Charity</Label>
        <select name="charity_id" defaultValue="" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle}>
          <option value="">Use executive default</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <Label>Proposed time</Label>
        <input name="scheduled_at" type="datetime-local" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Join URL</Label>
        <input name="join_url" type="url" placeholder="https://…" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>What to discuss</Label>
        <input name="q1_what" maxLength={300} placeholder="Defaults to an introductory note if left blank" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Why</Label>
        <input name="q2_why" maxLength={300} placeholder="Optional context" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <div className="sm:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        >
          {pending ? "Creating…" : "Create meeting"}
        </button>
        {state.error ? (
          <span className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</span>
        ) : null}
      </div>
    </form>
  );
}
