"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Exec portal route-segment error boundary (BLUEPRINT §0 — "never a whole-page
 * crash; the current server pages throw on a DB error"). Catches anything a
 * page or loader under /exec throws and renders a calm, on-brand retry surface
 * instead of the framework's white error screen. Self-contained: no shell, no
 * DB read (a DB read is what may have failed), so it can always render.
 */
export default function ExecError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface for observability without leaking details to the page.
    console.error("[exec] route error", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6" style={{ background: "var(--portal-page)", color: "var(--portal-ink)" }}>
      <div className="max-w-md text-center">
        <h1 className="text-[26px] font-semibold tracking-[-0.01em]" style={{ fontFamily: "var(--font-display), Georgia, serif" }}>
          We could not load this page.
        </h1>
        <p className="mt-3 text-[14px] italic" style={{ color: "var(--muted-foreground)" }}>
          Something interrupted the request. Your data is safe. Try again, and if it keeps happening we will already be looking into it.
        </p>
        <div className="mt-7 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="h-11 px-5 rounded-[10px] text-[13.5px] font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--portal-emerald)]"
            style={{ background: "var(--portal-emerald)" }}
          >
            Try again
          </button>
          <Link
            href="/exec"
            className="h-11 px-5 inline-flex items-center rounded-[10px] text-[13.5px] font-semibold border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--portal-emerald)]"
            style={{ borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
