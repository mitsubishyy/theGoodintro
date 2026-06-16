"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@thegoodintro/ui";
import { getCharityListAction, setStandingNominationAction } from "../actions";
import type { CharityListItem } from "../data";

/**
 * Charity PICKER modal — the locked standing-nomination change surface
 * (exec-dashboard VP2, re-rendered on My charity VP2). The single change
 * affordance; modal-only, no inline selection. Sets executive.default_charity_id
 * and appends a nomination_history row via setStandingNominationAction (the
 * staff-acting-for-exec demo pattern). Fetches the endorsed charity set on mount
 * (parent mounts it only when open, so each open is fresh). Backdrop reuses the
 * locked 20% ink + 2px blur.
 *
 * Per-meeting override is a separate flow (still the placeholder); this is
 * standing-nomination only. The "recently directed" pills are deferred (they
 * surface recent overrides, which the override flow owns).
 */

const SERIF = "var(--font-display), Georgia, serif";

export function CharityPickerModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [list, setList] = useState<CharityListItem[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCharityListAction().then(({ charities, currentId }) => {
      if (!active) return;
      setList(charities);
      setCurrentId(currentId);
      setSelected(currentId);
      setLoading(false);
    });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      active = false;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const confirm = async () => {
    if (!selected || selected === currentId) return;
    setBusy(true);
    setError(null);
    const res = await setStandingNominationAction(selected);
    if (res.error) {
      setBusy(false);
      setError(res.error);
      return;
    }
    router.refresh();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4 py-8"
      style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }}
      onPointerDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" className="flex max-h-[85vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
        {/* Header */}
        <div className="relative shrink-0 border-b px-7 pt-6 pb-5" style={{ borderColor: "var(--portal-line)" }}>
          <h2 className="text-[22px] font-semibold tracking-tight" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
            Change your charity
          </h2>
          <p className="mt-1.5 text-[13px]" style={{ color: "var(--muted-foreground)" }}>
            Every meeting you accept will direct your gift to your chosen DGR-endorsed charity.
          </p>
          <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-5 opacity-60 hover:opacity-100" style={{ color: "var(--muted-foreground)" }}>
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* List */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
          {loading ? (
            <p className="px-4 py-12 text-center text-[13px] italic" style={{ color: "var(--muted-foreground)" }}>
              Loading…
            </p>
          ) : (
            list.map((c) => {
              const isSelected = c.id === selected;
              const isCurrent = c.id === currentId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c.id)}
                  className="flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left"
                  style={{ background: isSelected ? "color-mix(in oklab, var(--portal-emerald) 7%, transparent)" : "transparent" }}
                >
                  <span
                    className="grid size-5 shrink-0 place-items-center rounded-full border"
                    style={{ borderColor: isSelected ? "var(--portal-emerald)" : "var(--portal-line)" }}
                  >
                    {isSelected && <span className="size-2.5 rounded-full" style={{ background: "var(--portal-emerald)" }} />}
                  </span>
                  <CharityMark name={c.name} src={c.logoUrl} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                      {c.name}
                    </span>
                    {c.cause && (
                      <span className="block text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                        {c.cause}
                      </span>
                    )}
                  </span>
                  {isCurrent && (
                    <span className="shrink-0 text-[12px] italic" style={{ color: "var(--portal-emerald)" }}>
                      Current
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t px-7 py-4" style={{ borderColor: "var(--portal-line)" }}>
          {error && (
            <p className="mb-2 text-[12px]" style={{ color: "var(--destructive, #b42318)" }}>
              {error}
            </p>
          )}
          <p className="mb-3 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            All charities are verified live against the ACNC DGR register.
          </p>
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} disabled={busy} className="h-11 rounded-full border px-6 text-[14px] font-semibold disabled:opacity-60" style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)", background: "transparent" }}>
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              disabled={busy || !selected || selected === currentId}
              className="h-11 rounded-full px-7 text-[14px] font-semibold text-white disabled:opacity-50"
              style={{ background: "var(--portal-emerald)" }}
            >
              {busy ? "Saving…" : "Set as my charity"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CharityMark({ name, src }: { name: string; src: string | null }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} width={36} height={36} className="size-9 shrink-0 rounded-full object-cover" style={{ border: "1px solid var(--portal-line)" }} />;
  }
  const mark = name
    .split(/\s+/)
    .map((w) => w[0])
    .filter((c) => /[A-Za-z]/.test(c ?? ""))
    .slice(0, 3)
    .join("")
    .toUpperCase();
  return (
    <span className="size-9 shrink-0 grid place-items-center rounded-full text-[12px] font-semibold" style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)" }}>
      {mark}
    </span>
  );
}
