"use client";

import { useEffect, useState } from "react";
import { DeclineReasonPicker } from "../../_components/decline-reason-picker";

/**
 * VP5 — the portal decline modal (exec-request-email lock 2026-06-12).
 * 560px modal over the locked 20% ink + 2px blur backdrop on /exec/requests.
 * Same four chips as the email decline page ("Other" expands the same
 * textarea), but the tense differs deliberately: this asks BEFORE the act
 * (portal context, Cancel exists); the email page reports AFTER it. This
 * resolves the decline-with-reason item parked on the Incoming Requests lock.
 *
 * Host wiring lands with the exec-incoming-requests port; until then the kit
 * component-states reference page demos it.
 */

export interface DeclineRequestModalProps {
  open: boolean;
  /** "Sam will be told politely." */
  requesterFirst: string;
  onCancel: () => void;
  /** Reason is the chip label, the Other text, or null when none picked. */
  onDecline: (reason: string | null) => Promise<void> | void;
}

export function DeclineRequestModal({ open, requesterFirst, onCancel, onDecline }: DeclineRequestModalProps) {
  const [reason, setReason] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
      style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="decline-request-title"
        className="w-full max-w-[560px] rounded-2xl border p-8"
        style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
      >
        <h2
          id="decline-request-title"
          className="text-[22px] font-semibold text-center"
          style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--portal-ink)", letterSpacing: "-0.01em" }}
        >
          Decline this request?
        </h2>
        <p
          className="mt-2.5 text-[14px] text-center leading-relaxed"
          style={{ fontFamily: "var(--font-display), Georgia, serif", fontStyle: "italic", color: "var(--muted-foreground)" }}
        >
          {requesterFirst} will be told politely. Your name is never attached to a reason.
        </p>
        <p className="mt-6 text-[14px] font-medium text-center" style={{ color: "var(--portal-ink)" }}>
          Want to tell us why? It shapes our reply and is never sent word-for-word.
        </p>
        <div className="mt-4">
          <DeclineReasonPicker mode="select" onSelectionChange={setReason} />
        </div>
        <div className="mt-8 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-12 px-6 rounded-full border text-[14px] font-semibold disabled:opacity-60"
            style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)", background: "transparent" }}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onDecline(reason);
              } finally {
                setBusy(false);
              }
            }}
            className="min-h-12 px-7 rounded-full text-[14px] font-semibold text-white disabled:opacity-60"
            style={{ background: "var(--primary)" }}
          >
            Decline request
          </button>
        </div>
      </div>
    </div>
  );
}
