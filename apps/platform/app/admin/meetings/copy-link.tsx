"use client";

import { useState } from "react";

/**
 * Pre-email stopgap (MVP_GAP_AUDIT step 4 / PRODUCTION_READINESS A1): nothing
 * sends the exec request email yet, so the admin copies the signed accept link
 * and hand-delivers it from her own inbox. Keep even after the sender ships, as
 * the deliverability fallback; its proper home is the /admin/requests port (S8).
 */
export function CopyAcceptLink({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-2">
      <code
        className="min-w-0 flex-1 truncate rounded-lg border px-2 py-1.5 font-mono text-xs"
        style={{ borderColor: "var(--portal-line)", color: "var(--muted-foreground)" }}
        title={path}
      >
        {path}
      </code>
      <button
        type="button"
        className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold"
        style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        onClick={async () => {
          await navigator.clipboard.writeText(window.location.origin + path);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
      >
        {copied ? "Copied" : "Copy accept link"}
      </button>
    </div>
  );
}
