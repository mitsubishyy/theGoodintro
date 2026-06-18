"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";
import { PhotoUploadField } from "./photo-upload-field";

type Charity = { id: string; name: string };
type Initial = {
  id?: string;
  name?: string;
  primary_email?: string;
  title?: string | null;
  company?: string | null;
  default_charity_id?: string | null;
  suggested_cadence?: string | null;
  photo_url?: string | null;
  context_notes?: string | null;
};

const inputStyle = {
  background: "var(--portal-card)",
  borderColor: "var(--portal-line)",
} as const;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.18em]"
      style={{ color: "var(--muted-foreground)" }}
    >
      {children}
    </span>
  );
}

export function ExecutiveForm({
  action,
  charities,
  initial = {},
  submitLabel,
  photoUploadEnabled = false,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  charities: Charity[];
  initial?: Initial;
  submitLabel: string;
  photoUploadEnabled?: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    action,
    {},
  );

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <label className="flex flex-col gap-1.5">
        <Label>Name *</Label>
        <input name="name" required defaultValue={initial.name ?? ""} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Primary email *</Label>
        <input name="primary_email" type="email" required defaultValue={initial.primary_email ?? ""} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Title</Label>
        <input name="title" defaultValue={initial.title ?? ""} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Company</Label>
        <input name="company" defaultValue={initial.company ?? ""} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Default charity</Label>
        <select name="default_charity_id" defaultValue={initial.default_charity_id ?? ""} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle}>
          <option value="">— none —</option>
          {charities.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1.5">
        <Label>Suggested cadence</Label>
        <input name="suggested_cadence" placeholder="e.g. up to 2 / month" defaultValue={initial.suggested_cadence ?? ""} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>
      <PhotoUploadField
        initialUrl={initial.photo_url ?? ""}
        ownerId={initial.id}
        previewName={initial.name ?? ""}
        enabled={photoUploadEnabled}
      />
      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Business-context notes</Label>
        <textarea name="context_notes" rows={4} defaultValue={initial.context_notes ?? ""} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <div className="sm:col-span-2 flex items-center gap-4">
        <button type="submit" disabled={pending} className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {state.error ? (
          <span className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</span>
        ) : null}
        {state.ok ? (
          <span className="text-sm" style={{ color: "var(--primary)" }}>Saved.</span>
        ) : null}
      </div>
    </form>
  );
}
