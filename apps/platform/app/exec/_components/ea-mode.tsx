"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { EaModeData, EaModePrincipal } from "../data";
import { switchEaPrincipalAction } from "../actions";

/**
 * EA Mode (design/locked/exec-ea-mode-banner, LOCKED 2026-06-11). Cross-cutting
 * chrome, not a route: when an EA signs in, every exec page carries a persistent
 * charcoal "Acting for" banner across the very top of the viewport (over the
 * sidebar — same tone, one continuous chrome). The principal's identity sits in
 * the banner; the signed-in EA stays in the sidebar chip (ExecShell reads the
 * context below to swap it — never the other way round).
 *
 * Resolved once in the exec layout (resolveEaMode) and provided here so the
 * banner and the chip share one payload. Non-EA sessions get a null context and
 * no banner.
 *
 * Charity-change permission RESOLVED 2026-06-25 (ratified 2d scope): an assigned
 * EA MAY change their principal's standing charity (audited as the EA acting for
 * that exec — built and tested in slice 2d). So the EA Mode banner's "remove the
 * change-charity affordance" hide does NOT apply and is intentionally not
 * implemented; the standing-charity path stays available to an assigned EA, with
 * the server enforcing assigned-EA-only access and the audit attribution. (The
 * banner README's "EA cannot change charity" line predates this ratification and
 * is superseded unless Issy reverses the product call.)
 *
 * Still TODO for EA-mode completeness (tracked, not silently dropped): greeting
 * personalisation (page content reads the signed-in human) and the remaining
 * hides that ARE genuine EA restrictions — forward-to-self on the incoming queue,
 * and editing the principal's business context (the read-only-plus-charity scope).
 */

const EaModeContext = createContext<EaModeData | null>(null);
export function useEaMode(): EaModeData | null {
  return useContext(EaModeContext);
}

export function EaModeProvider({ eaMode, children }: { eaMode: EaModeData | null; children: React.ReactNode }) {
  return (
    <EaModeContext.Provider value={eaMode}>
      {eaMode && <EaBanner eaMode={eaMode} />}
      {children}
    </EaModeContext.Provider>
  );
}

function subtitle(p: { title: string | null; company: string | null }): string {
  return [p.title, p.company].filter(Boolean).join(" · ");
}

function EaBanner({ eaMode }: { eaMode: EaModeData }) {
  const { principal, assignments, activePrincipalId, switchable } = eaMode;
  const principalFirst = principal.name.split(/\s+/)[0];
  const sub = subtitle(principal);

  // Sticky and above everything (including drawer backdrops) so the acting-for
  // context never disappears. Charcoal `--exec-sidebar`, continuous with the
  // sidebar. Not dismissible — no X, no collapse (anti-list).
  return (
    <div
      className="sticky top-0 z-[60] flex h-11 w-full items-center justify-between"
      style={{ background: "var(--exec-sidebar)" }}
    >
      <div className="flex min-w-0 items-center gap-2.5 pl-6">
        <Avatar name={principal.name} src={principal.photoUrl ?? undefined} size={24} />
        <span className="shrink-0 text-[13px] italic" style={{ color: "var(--exec-sidebar-muted)" }}>
          Acting for
        </span>
        <span className="truncate text-[13px] font-semibold" style={{ color: "var(--exec-sidebar-text)" }}>
          {principal.name}
        </span>
        {sub && (
          <span className="hidden truncate text-[12px] sm:inline" style={{ color: "var(--exec-sidebar-muted)" }}>
            · {sub}
          </span>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-4 pr-6">
        <span className="hidden text-[12px] italic md:inline" style={{ color: "var(--exec-sidebar-muted)" }}>
          Every action is recorded in {principalFirst}&apos;s account history.
        </span>
        {/* Trigger + hairline render ONLY when the EA assists more than one
            executive (conditional-render rule). */}
        {switchable && (
          <>
            <span className="hidden h-4 w-px md:inline-block" style={{ background: "rgba(255,255,255,0.15)" }} />
            <SwitchExecutive assignments={assignments} activeId={activePrincipalId} />
          </>
        )}
      </div>
    </div>
  );
}

function SwitchExecutive({ assignments, activeId }: { assignments: EaModePrincipal[]; activeId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = async (id: string) => {
    if (busy) return;
    if (id === activeId) {
      setOpen(false);
      return;
    }
    setBusy(true);
    const res = await switchEaPrincipalAction(id);
    setBusy(false);
    setOpen(false);
    if (!res.error) router.refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-[12.5px] font-semibold"
        style={{ color: "var(--exec-sidebar-text)" }}
      >
        Switch executive
        <Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-[300px] overflow-hidden rounded-[10px] border py-2"
          style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)", boxShadow: "0 8px 32px rgba(20,20,30,0.08)" }}
        >
          <p className="px-4 pb-1 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Your executives
          </p>
          {assignments.map((a, i) => (
            <button
              key={a.executiveId}
              type="button"
              role="menuitem"
              disabled={busy}
              onClick={() => pick(a.executiveId)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-[var(--portal-card-hover)] disabled:opacity-60"
              style={i === 0 ? undefined : { borderTop: "1px solid var(--portal-line)" }}
            >
              <Avatar name={a.name} src={a.photoUrl ?? undefined} size={32} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                  {a.name}
                </span>
                <span className="block truncate text-[12px]" style={{ color: "var(--muted-foreground)" }}>
                  {subtitle(a)}
                </span>
              </span>
              {a.executiveId === activeId && (
                <span className="shrink-0 text-[12px] italic" style={{ color: "var(--portal-emerald)" }}>
                  Current
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
