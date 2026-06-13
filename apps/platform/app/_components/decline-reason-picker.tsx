"use client";

import { useState } from "react";

/**
 * The locked decline-reason flow (exec-request-email lock 2026-06-12, VP3/3b +
 * VP5): four chips, "Other" opens a warm-cream textarea with an emerald Send.
 * One component, two interaction modes, so the email page and the portal
 * modal never fork the copy:
 *
 *  - "immediate" (VP3, the email decline page): the decline ALREADY happened;
 *    tapping a chip submits the reason right away, Other opens the textarea +
 *    Send. Reasons are optional follow-ups, never gates.
 *  - "select" (VP5, the portal modal): the decline has NOT happened yet; the
 *    chip is a selection the modal's "Decline request" footer reads via
 *    onSelectionChange.
 *
 * Reason text is admin-side context only and is never sent to the vendor
 * verbatim (lock anti-list).
 */

export const DECLINE_REASON_CHIPS = ["Not relevant", "No capacity", "Bad timing"] as const;
export const OTHER_CHIP = "Other";

export interface DeclineReasonPickerProps {
  mode: "immediate" | "select";
  /** immediate mode: called with the chip label or the Other text. */
  onSubmit?: (reason: string) => Promise<void> | void;
  /** select mode: the modal footer reads the current selection from here. */
  onSelectionChange?: (reason: string | null) => void;
}

export function DeclineReasonPicker({ mode, onSubmit, onSelectionChange }: DeclineReasonPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [busy, setBusy] = useState(false);

  const isOther = selected === OTHER_CHIP;

  const submit = async (reason: string) => {
    if (!onSubmit) return;
    setBusy(true);
    try {
      await onSubmit(reason);
    } finally {
      setBusy(false);
    }
  };

  const pick = (chip: string) => {
    setSelected(chip);
    if (mode === "select") {
      onSelectionChange?.(chip === OTHER_CHIP ? otherText.trim() || OTHER_CHIP : chip);
      return;
    }
    if (chip !== OTHER_CHIP) void submit(chip);
  };

  const chip = (label: string) => {
    const active = selected === label;
    return (
      <button
        key={label}
        type="button"
        disabled={busy}
        onClick={() => pick(label)}
        className="min-h-12 px-5 rounded-full border text-[14px] font-medium transition-colors disabled:opacity-60"
        style={{
          background: active ? "var(--mint-tint, #e7f2ea)" : "transparent",
          borderColor: active ? "var(--primary)" : "var(--portal-line)",
          color: active ? "var(--primary)" : "var(--portal-ink)",
        }}
      >
        {label}
      </button>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 justify-center">
        {[...DECLINE_REASON_CHIPS, OTHER_CHIP].map(chip)}
      </div>
      {isOther && (
        <div className="mt-4">
          <textarea
            rows={3}
            value={otherText}
            onChange={(e) => {
              setOtherText(e.target.value);
              if (mode === "select") onSelectionChange?.(e.target.value.trim() || OTHER_CHIP);
            }}
            placeholder="Tell us in a line or two"
            maxLength={500}
            className="w-full rounded-xl border px-4 py-3 text-[14px]"
            style={{
              background: "var(--cream-1, #f6f2e8)",
              borderColor: "var(--portal-line)",
              color: "var(--portal-ink)",
            }}
          />
          {mode === "immediate" && (
            <button
              type="button"
              disabled={busy || otherText.trim().length === 0}
              onClick={() => void submit(otherText.trim())}
              className="mt-3 min-h-12 px-7 rounded-full text-[14px] font-semibold text-white disabled:opacity-60"
              style={{ background: "var(--primary)" }}
            >
              Send
            </button>
          )}
        </div>
      )}
    </div>
  );
}
