"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, Icon } from "@thegoodintro/ui";
import type { ExecProfileData } from "../../data";
import { saveExecutiveAssistantAction } from "../../actions";

/**
 * Profile EA drawer (exec-profile VP3 + exec-small-states-batch VP3). 540px right
 * slide-over, 3px emerald top accent bar (edit/action variant), equal-priority
 * footer pair. Add variant (no EA on file) omits the currently-on-file block +
 * remove link. The numbered "what your assistant can do" circles are hairline +
 * ink (never amber on exec).
 *
 * The save ("Send access link" / "Save changes") creates/updates the single EA
 * record + ea_assignment and sends the one-click access link
 * (saveExecutiveAssistantAction). It is LIVE when `enabled` (the exec_ea_login
 * flag); while the flag is off the button stays DISABLED with an honest note (the
 * lock's degrade rule: disable rather than silently no-op). The "Remove access"
 * link stays inert here — revoke is out of this add/link scope.
 */

const SERIF = "var(--font-display), Georgia, serif";

export function ProfileEaDrawer({ ea, enabled, onClose }: { ea: ExecProfileData["ea"]; enabled: boolean; onClose: () => void }) {
  const router = useRouter();
  const isEdit = Boolean(ea);
  const [name, setName] = useState(ea?.name ?? "");
  const [email, setEmail] = useState(ea?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = enabled && !busy && name.trim().length > 0 && email.trim().includes("@");

  const save = async () => {
    if (!canSubmit) return;
    setBusy(true);
    setErr(null);
    const res = await saveExecutiveAssistantAction({ name, email });
    setBusy(false);
    if (res.error) return setErr(res.error);
    onClose();
    router.refresh();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" aria-modal="true" role="dialog">
      <div className="absolute inset-0" style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }} onPointerDown={(e) => e.target === e.currentTarget && onClose()} />
      <div className="relative h-full w-full max-w-[540px] overflow-y-auto border-l" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
        <div className="h-[3px] w-full" style={{ background: "var(--portal-emerald)" }} />
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-6 top-6 opacity-60 hover:opacity-100" style={{ color: "var(--muted-foreground)" }}>
          <Icon name="x" size={20} />
        </button>

        <div className="px-7 pt-8 pb-28">
          <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
            Calendar & access
          </p>
          <h2 className="mt-1 text-[22px] font-semibold" style={{ fontFamily: SERIF, color: "var(--portal-ink)" }}>
            {isEdit ? "Edit executive assistant" : "Add executive assistant"}
          </h2>
          <p className="mt-2 text-[13px] italic leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
            Your assistant can see your incoming requests and act on meetings on your behalf. They cannot change your business context.
          </p>

          {isEdit && ea && (
            <div className="mt-6">
              <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
                Currently on file
              </p>
              <div className="mt-2 flex items-center gap-3 rounded-xl border p-4" style={{ borderColor: "var(--portal-line)" }}>
                <Avatar name={ea.name} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                    {ea.name}
                  </div>
                  {ea.sinceLabel && (
                    <div className="text-[12.5px] italic" style={{ color: "var(--muted-foreground)" }}>
                      Acting access since {ea.sinceLabel}
                    </div>
                  )}
                </div>
                <button type="button" disabled className="inline-flex items-center gap-1.5 text-[12.5px] italic opacity-50" style={{ color: "var(--portal-ink)" }} title="Coming with the access-link email">
                  <Icon name="trash" size={14} /> Remove {ea.name}&apos;s access
                </button>
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              {isEdit ? "Update details" : "Their details"}
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name" className="w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none" style={{ background: "var(--portal-page)", border: "1px solid var(--portal-line)", color: "var(--portal-ink)" }} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" className="w-full rounded-lg px-3.5 py-2.5 text-[14px] outline-none" style={{ background: "var(--portal-page)", border: "1px solid var(--portal-line)", color: "var(--portal-ink)" }} />
            </div>
            <p className="mt-2 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              {isEdit && ea
                ? `Saving sends ${ea.name} a confirmation email with a one-click access link. If you change the email to a new person, the previous address loses access immediately.`
                : "Saving sends them a confirmation email with a one-click access link."}
            </p>
          </div>

          <div className="mt-6">
            <p className="text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              What your assistant can do
            </p>
            <div className="mt-3 flex flex-col gap-3">
              <EaStep n={1}>See your requests and calendar</EaStep>
              <EaStep n={2}>Accept, decline, or forward on your behalf</EaStep>
              <EaStep n={3}>Request reschedules</EaStep>
            </div>
          </div>

          {!enabled && (
            <p className="mt-6 text-[12px] italic" style={{ color: "var(--muted-foreground)" }}>
              Assistant access goes live with the one-click access-link email, which is coming soon.
            </p>
          )}
          {err && (
            <p className="mt-6 text-[12.5px]" style={{ color: "#b42318" }}>
              {err}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex gap-3 border-t px-6 py-5" style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}>
          <button type="button" onClick={onClose} disabled={busy} className="flex-1 h-12 rounded-[10px] text-[13.5px] font-semibold disabled:opacity-60" style={{ background: "transparent", color: "var(--portal-ink)", border: "1px solid var(--portal-line)" }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!canSubmit}
            className="flex-1 h-12 rounded-[10px] text-[13.5px] font-semibold text-white disabled:opacity-50"
            style={{ background: "var(--portal-emerald)" }}
            title={enabled ? undefined : "Coming with the access-link email"}
          >
            {busy ? "Sending…" : isEdit ? "Save changes" : "Send access link"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EaStep({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-[18px] shrink-0 place-items-center rounded-full border text-[11px] font-semibold" style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}>
        {n}
      </span>
      <span className="text-[14px]" style={{ color: "var(--portal-ink)" }}>
        {children}
      </span>
    </div>
  );
}
