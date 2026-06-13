"use client";

import { useEffect } from "react";
import { Icon } from "@thegoodintro/ui";

/**
 * Deferred charity-change / charity-detail modal (exec-dashboard lock VP2-VP4,
 * marked "Pass B" throughout the lock). The full picker (8-charity list,
 * recently-directed pills, search) and the read-only detail modal need the
 * charity-content schema increment (charity.cause / blurb / logo_url / purpose
 * / programmes[] / hero_image_url / stories[]), which is parked for the
 * planning chat. Until that lands, the locked trigger buttons render and open
 * this placeholder on the real locked backdrop (20% ink + 2px blur) so the
 * chrome and interaction model are in place; it never silently resolves a
 * charity change.
 */
export function CharityChangeModal({
  open,
  variant,
  charityName,
  onClose,
}: {
  open: boolean;
  variant: "standing" | "override" | "learn";
  charityName: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const title =
    variant === "learn"
      ? `About ${charityName}`
      : variant === "override"
        ? "Direct this meeting to a different charity"
        : "Change your charity";
  const body =
    variant === "learn"
      ? `A fuller picture of ${charityName} — its purpose, the programmes your gift supports, and recent stories — arrives with the next exec-portal pass.`
      : "The charity picker (search, recently directed, the full DGR-endorsed list) arrives with the next exec-portal pass. Your standing nomination is unchanged.";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
      style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-[560px] rounded-2xl border p-8"
        style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)", boxShadow: "0 8px 32px rgba(20,20,30,0.08)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              {variant === "override" ? "Per-meeting charity" : "Standing nomination"}
            </p>
            <h2
              className="mt-1 text-[22px] font-semibold"
              style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--portal-ink)", letterSpacing: "-0.01em" }}
            >
              {title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="size-8 grid place-items-center rounded-full shrink-0"
            style={{ color: "var(--muted-foreground)" }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <p className="mt-4 text-[14px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
          {body}
        </p>
        <div className="mt-7 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 px-6 rounded-full text-[13px] font-semibold text-white"
            style={{ background: "var(--portal-emerald)" }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
