"use client";

import { useState } from "react";
import { linkEaAction } from "./actions";

type Ea = { id: string; name: string; email: string };

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

  return (
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
  );
}
