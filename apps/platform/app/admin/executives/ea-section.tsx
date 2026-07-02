"use client";

import { useState } from "react";
import { clearEaAccessAction, linkEaAction, sendEaAccessLinkAction } from "./actions";
import { AccessActionForm } from "./access-actions";

type Ea = { id: string; name: string; email: string; auth_user_id?: string | null };

const inputStyle = {
  background: "var(--portal-card)",
  borderColor: "var(--portal-line)",
} as const;

export function EaSection({
  executiveId,
  currentEaId,
  eas,
}: {
  executiveId: string;
  currentEaId: string | null;
  eas: Ea[];
}) {
  const [choice, setChoice] = useState(currentEaId ?? "");
  const currentEa = currentEaId ? eas.find((ea) => ea.id === currentEaId) ?? null : null;

  return (
    <div className="flex flex-col gap-5">
      {currentEa ? (
        <div className="rounded-xl border p-4" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--portal-ink)" }}>
              {currentEa.name}
            </p>
            <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
              {currentEa.email} · {currentEa.auth_user_id ? "linked to an auth user" : "not linked yet"}
            </p>
          </div>
          <div className="mt-3 flex flex-col gap-2">
            <AccessActionForm action={sendEaAccessLinkAction} hidden={{ email: currentEa.email }}>
              Send EA access link
            </AccessActionForm>
            {currentEa.auth_user_id ? (
              <AccessActionForm
                action={clearEaAccessAction}
                hidden={{ ea_id: currentEa.id, executive_id: executiveId }}
              >
                Clear EA linked auth user
              </AccessActionForm>
            ) : null}
          </div>
        </div>
      ) : null}

      <form action={linkEaAction} className="flex flex-col gap-3">
        <input type="hidden" name="executive_id" value={executiveId} />
        <select
          name="ea_id"
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
          className="max-w-md rounded-lg border px-3 py-2.5 text-sm"
          style={inputStyle}
        >
          <option value="">— no EA —</option>
          {eas.map((ea) => (
            <option key={ea.id} value={ea.id}>
              {ea.name} ({ea.email})
            </option>
          ))}
          <option value="__new__">+ Add a new EA…</option>
        </select>

        {choice === "__new__" ? (
          <div className="flex max-w-md flex-col gap-2">
            <input name="ea_name" placeholder="EA name" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
            <input name="ea_email" type="email" placeholder="EA email" className="rounded-lg border px-3 py-2.5 text-sm" style={inputStyle} />
          </div>
        ) : null}

        <button type="submit" className="self-start rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
          Save EA
        </button>
      </form>
    </div>
  );
}
