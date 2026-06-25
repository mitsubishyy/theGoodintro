"use client";

import { useActionState, useState } from "react";
import { Icon } from "@thegoodintro/ui";
import { requestSignInLinkAction, type SignInLinkState } from "./actions";

/**
 * Passwordless sign-in-link path for executives, EAs (and any account on file),
 * the PRIMARY path on the locked two-column /login when exec_ea_login is on.
 * Restyled to the lock (design/locked/platform-sign-in VP1 + VP2).
 *
 * Locked rules preserved: copy says "sign-in link", never "magic link"; the
 * link-sent state ALWAYS renders after submit and never confirms whether the
 * address is a member of the invite-only network. The entered address is held in
 * client state only to echo it back on the sent screen ("We've sent it to …") —
 * the server response is a constant `{ sent: true }` and reveals nothing.
 */
export function SignInLinkForm() {
  const [state, formAction, pending] = useActionState<SignInLinkState, FormData>(
    requestSignInLinkAction,
    {},
  );
  const [email, setEmail] = useState("");
  // "Use a different address" returns to the form even though the action still
  // reports sent; a fresh submit clears it (onSubmit below).
  const [reentry, setReentry] = useState(false);
  const sent = Boolean(state.sent) && !reentry;

  if (sent) {
    return (
      <div className="flex flex-col gap-4" aria-live="polite">
        <span className="grid size-16 place-items-center rounded-full" style={{ background: "var(--portal-amber-soft)" }}>
          <Icon name="inbox" size={28} style={{ color: "var(--portal-amber-ink)" }} />
        </span>
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--portal-amber-ink)" }}>
            Check your email
          </p>
          <h2 className="text-[22px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
            Your sign-in link is on its way.
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            {email ? (
              <>
                We&apos;ve sent it to <strong style={{ color: "var(--portal-ink)" }}>{email}</strong>.{" "}
              </>
            ) : (
              <>If that address is on file, we&apos;ve sent it a sign-in link.{" "}</>
            )}
            It signs you straight in, works once, and a fresh one is a click away if it expires.
          </p>
        </div>

        <form action={formAction}>
          <input type="hidden" name="email" value={email} />
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-lg border text-sm font-semibold disabled:opacity-60"
            style={{ background: "#fff", borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
          >
            {pending ? "Sending…" : "Send it again"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => { setReentry(true); setEmail(""); }}
          className="self-start text-sm underline-offset-2 hover:underline"
          style={{ color: "var(--portal-amber-ink)" }}
        >
          ← Use a different address
        </button>

        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
          Nothing arriving? Check spam, or write to hello@thegoodintro.com.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} onSubmit={() => setReentry(false)} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
          Email
        </span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="h-12 rounded-lg border px-3.5 text-sm outline-none"
          style={{ background: "#fff", borderColor: "var(--portal-line)" }}
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="h-12 rounded-lg text-sm font-semibold disabled:opacity-60"
        style={{ background: "var(--portal-ink)", color: "#fff" }}
      >
        {pending ? "Sending…" : "Email me a sign-in link →"}
      </button>
    </form>
  );
}
