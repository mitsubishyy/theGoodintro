"use client";

import { useActionState } from "react";
import { updateVendorAction, type FormState } from "../actions";

/**
 * Admin vendor profile edit (name, email_domain) — the vendor equivalent of
 * ExecutiveForm. Two fields, since the vendor org only carries name + email_domain
 * as profile data (status/credits/photo have their own flows). Mounted in the
 * vendor detail view when the admin_vendors_actions flag is on.
 *
 * email_domain carries an inline warning: it is unique and reserves the domain for
 * this org at signup. Existing users keep access across a change (they are bound by
 * auth_user_id, not the domain), so the copy says exactly that.
 */

const inputStyle = {
  background: "var(--portal-card)",
  borderColor: "var(--portal-line)",
} as const;

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
      {children}
    </span>
  );
}

export function VendorForm({ initial }: { initial: { id: string; name: string; emailDomain: string } }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateVendorAction, {});

  return (
    <form action={formAction} className="grid max-w-2xl gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={initial.id} />

      <label className="flex flex-col gap-1.5">
        <Label>Name *</Label>
        <input name="name" required defaultValue={initial.name} className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
      </label>

      <label className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Email domain *</Label>
        <input
          name="email_domain"
          required
          defaultValue={initial.emailDomain}
          placeholder="acme.com"
          className="rounded-lg border px-3 py-2.5 text-sm"
          style={inputStyle}
        />
        <span className="text-[12px]" style={{ color: "var(--portal-amber-ink)" }}>
          Existing users keep their access. This domain is what new signups are matched against, so changing it updates
          which work email domain is tied to this vendor.
        </span>
      </label>

      <div className="sm:col-span-2 flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        {state.error ? <span className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</span> : null}
        {state.ok ? <span className="text-sm" style={{ color: "var(--primary)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
