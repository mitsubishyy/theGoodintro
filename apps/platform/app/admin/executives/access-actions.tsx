"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";

type AccessAction = (prev: FormState, fd: FormData) => Promise<FormState>;

const buttonStyle = {
  borderColor: "var(--portal-line)",
  background: "var(--portal-card)",
  color: "var(--portal-ink)",
} as const;

export function AccessActionForm({
  action,
  children,
  hidden,
}: {
  action: AccessAction;
  children: React.ReactNode;
  hidden: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {Object.entries(hidden).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60"
        style={buttonStyle}
      >
        {pending ? "Working..." : children}
      </button>
      {state.error ? (
        <span className="text-xs" style={{ color: "var(--portal-amber-ink)" }}>
          {state.error}
        </span>
      ) : null}
      {state.ok ? (
        <span className="text-xs" style={{ color: "var(--primary)" }}>
          Done.
        </span>
      ) : null}
    </form>
  );
}
