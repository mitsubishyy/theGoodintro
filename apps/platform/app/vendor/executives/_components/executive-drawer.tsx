"use client";

import { useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Avatar, Icon, WhatHappensNext } from "@thegoodintro/ui";
import type { ExecListRow } from "./executives-list";

/**
 * Vendor Executive Detail Drawer — ported component-for-component from the
 * locked design (UI_KIT_DESIGN_LOG "Vendor Executive Detail Drawer" LOCKED
 * 2026-06-06 + design/locked/vendor-executive-detail-drawer/README.md).
 *
 *   - 600px right slide-over, white reading surface, --portal-line left
 *     border + subtle edge shadow, backdrop dim rgba(20,40,30,0.32) (mood,
 *     not blackout). ESC / X / backdrop click dismiss.
 *   - Sticky header: ghost X-close. The mockup's mono "EXC-1042" tag has no
 *     schema behind it (executive has no public_id column) — omitted rather
 *     than faked, same treatment the admin ports gave sample-data-only chips.
 *   - Body: identity → ABOUT → Supports / Member since stat cards → WHAT
 *     HAPPENS NEXT (kit pattern, the locked 3 request-flow steps with the
 *     mockup's she/her sample pronouns generalised).
 *   - Sticky footer: full-width primary ink "Request a meeting →".
 *
 * Opens via the ?exec= search param (linkable, server-hydrated); closing
 * drops the param so list state (filters, page, sort) is preserved.
 */
export function ExecutiveDrawer({ exec }: { exec: ExecListRow }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    params.delete("exec");
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [router, pathname, searchParams]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  const firstName = exec.name.split(" ")[0] || exec.name;

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={exec.name}>
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 w-full h-full cursor-default"
        style={{ background: "rgba(20,40,30,0.32)" }}
      />
      <aside
        className="absolute right-0 top-0 h-full w-[600px] max-w-full flex flex-col border-l"
        style={{
          background: "var(--portal-card-reading)",
          borderColor: "var(--portal-line)",
          boxShadow: "-8px 0 24px rgba(20,40,30,0.08)",
        }}
      >
        {/* Sticky header */}
        <header
          className="h-16 shrink-0 px-6 flex items-center border-b"
          style={{ borderColor: "var(--portal-line)" }}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="size-8 grid place-items-center rounded-md hover:bg-[var(--portal-card-hover)]"
            style={{ color: "var(--portal-ink)" }}
          >
            <Icon name="x" size={18} />
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="flex items-center gap-5">
            <Avatar name={exec.name} src={exec.photoUrl} size={80} />
            <div className="min-w-0 leading-tight">
              <h2 className="text-[22px] font-semibold truncate" style={{ color: "var(--portal-ink)" }}>
                {exec.name}
              </h2>
              <p className="mt-0.5 text-[14px] truncate" style={{ color: "var(--portal-ink)" }}>
                {exec.title}
              </p>
              <p className="text-[13.5px] truncate" style={{ color: "var(--muted-foreground)" }}>
                {exec.company}
              </p>
            </div>
          </div>

          <Hairline />

          <div>
            <p
              className="text-[11px] font-mono uppercase tracking-[0.18em]"
              style={{ color: "var(--muted-foreground)" }}
            >
              About
            </p>
            {exec.bio ? (
              <p className="mt-2 text-[13.5px] leading-[1.6]" style={{ color: "var(--portal-ink)" }}>
                {exec.bio}
              </p>
            ) : (
              /* bio empty-state copy is a parked open decision (drawer lock);
                 provisional line, swap when Issy settles the copy */
              <p className="mt-2 text-[13.5px] italic" style={{ color: "var(--muted-foreground)" }}>
                Profile coming soon.
              </p>
            )}
          </div>

          <Hairline />

          <div className="space-y-4">
            <div className="rounded-xl p-5" style={{ background: "var(--portal-amber-soft)" }}>
              <p
                className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em]"
                style={{ color: "var(--portal-amber-ink)" }}
              >
                <Icon name="heart" size={14} />
                Supports
              </p>
              <p className="mt-2 text-[16px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                {exec.charityName ?? "Their chosen charity"}
              </p>
              <p className="mt-1 text-[12.5px]" style={{ color: "var(--portal-amber-ink)" }}>
                Every meeting {firstName} accepts sends a real gift here.
              </p>
            </div>
            <div
              className="rounded-xl p-5 border"
              style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
            >
              <p
                className="text-[11px] font-mono uppercase tracking-[0.18em]"
                style={{ color: "var(--muted-foreground)" }}
              >
                Member since
              </p>
              <p
                className="mt-2 text-[28px] font-semibold leading-none"
                style={{ fontFamily: "var(--font-display), serif", color: "var(--portal-ink)" }}
              >
                {exec.memberSinceYear}
              </p>
              <p className="mt-1.5 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
                Taking qualified meetings on TheGoodIntro.
              </p>
            </div>
          </div>

          <Hairline />

          <WhatHappensNext
            steps={[
              `You write a short pitch for ${firstName}.`,
              `We send your message to ${firstName}. They accept or decline.`,
              "If they accept, we secure a time. A credit is only spent after the meeting is held.",
            ]}
          />
        </div>

        {/* Sticky footer */}
        <footer
          className="h-[88px] shrink-0 px-6 flex items-center border-t"
          style={{ borderColor: "var(--portal-line)" }}
        >
          <a
            href={`/vendor/executives/${exec.id}/request`}
            className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-lg text-[13.5px] font-semibold"
            style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
          >
            Request a meeting
            <Icon name="arrow-right" size={16} />
          </a>
        </footer>
      </aside>
    </div>
  );
}

function Hairline() {
  return <div className="border-t" style={{ borderColor: "var(--portal-line)" }} />;
}
