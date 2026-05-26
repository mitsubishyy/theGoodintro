"use client";

import { useActionState, useState } from "react";
import { actOnTokenAction, type TokenActionState } from "./actions";

const DONE: Record<string, string> = {
  accepted: "Thank you. We are securing a time and will send the invite shortly.",
  declined: "Thank you for letting us know. No problem at all.",
  forwarded: "Forwarded to your EA. They can confirm from the same link.",
};

export function ConfirmForm({
  token,
  intent,
}: {
  token: string;
  intent: "accept" | "decline" | "send_to_ea";
}) {
  const [state, formAction, pending] = useActionState<TokenActionState, FormData>(
    actOnTokenAction,
    {},
  );
  const [action, setAction] = useState(intent);

  if (state.result && DONE[state.result]) {
    return <p className="text-sm" style={{ color: "var(--primary)" }}>{DONE[state.result]}</p>;
  }

  const radio = "flex items-center gap-2 text-sm";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="token" value={token} />

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Who is confirming?
        </legend>
        <label className={radio}><input type="radio" name="actor" value="executive" defaultChecked /> The executive</label>
        <label className={radio}><input type="radio" name="actor" value="ea_acting_for_exec" /> Their EA, acting for them</label>
      </fieldset>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Your decision
        </legend>
        {(["accept", "decline", "send_to_ea"] as const).map((a) => (
          <label key={a} className={radio}>
            <input type="radio" name="action" value={a} checked={action === a} onChange={() => setAction(a)} />
            {a === "accept" ? "Accept" : a === "decline" ? "Decline" : "Send to my EA"}
          </label>
        ))}
      </fieldset>

      {action === "decline" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">A short reason (optional)</span>
          <textarea name="decline_reason" rows={2} className="rounded-lg border px-3 py-2.5 text-sm" style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }} />
        </label>
      ) : null}

      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
        By confirming, you accept the{" "}
        <a href="https://thegoodintro.com/terms" className="underline-offset-2 hover:underline">Terms</a>.
      </p>

      {state.error ? (
        <p className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</p>
      ) : null}

      <button type="submit" disabled={pending} className="self-start rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60" style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}>
        {pending ? "Confirming…" : "Confirm"}
      </button>
    </form>
  );
}
