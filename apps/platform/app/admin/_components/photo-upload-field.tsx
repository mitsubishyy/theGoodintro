"use client";

import { useRef, useState } from "react";
import { Avatar } from "@thegoodintro/ui";
import { uploadPhotoFile } from "@/lib/upload/client";

/**
 * Shared admin photo control (file-upload only, per the locked specs). On pick it
 * POSTs the file to the upload route (validate + sharp re-encode + storage write)
 * and stashes the returned stable public URL in a hidden field the surrounding
 * form persists through its own save action. Reused for the executive avatar and
 * for charity logo / hero, parameterised by `entity` (which the route maps to a
 * variant + dimensions), the hidden `fieldName`, and the preview shape. With the
 * `enabled` flag off the control renders an honest inert state.
 */

type Entity = "exec" | "vendor-user" | "charity-logo" | "charity-hero";

export function PhotoUploadField({
  entity = "exec",
  fieldName = "photo_url",
  label = "Photo",
  initialUrl,
  ownerId,
  previewName,
  previewShape = "round",
  hint = "PNG, JPG or WebP. Max 1MB.",
  enabled,
  className = "sm:col-span-2",
}: {
  entity?: Entity;
  fieldName?: string;
  label?: string;
  initialUrl: string;
  ownerId?: string;
  previewName: string;
  previewShape?: "round" | "wide";
  hint?: string;
  enabled: boolean;
  className?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr(null);
    const up = await uploadPhotoFile(file, entity, ownerId || crypto.randomUUID());
    setBusy(false);
    if ("error" in up) return setErr(up.error);
    setUrl(up.url);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="flex items-center gap-4">
        <Preview shape={previewShape} url={url} name={previewName} />
        {enabled ? (
          <div className="flex flex-col gap-1.5">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPick} />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy}
                className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60"
                style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)" }}
              >
                {busy ? "Uploading…" : url ? "Replace" : "Upload"}
              </button>
              {url ? (
                <button type="button" onClick={() => setUrl("")} className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Remove
                </button>
              ) : null}
            </div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{hint}</span>
            {err ? <span className="text-xs" style={{ color: "var(--portal-amber-ink)" }}>{err}</span> : null}
          </div>
        ) : (
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Photo upload is not enabled.
          </span>
        )}
      </div>
      <input type="hidden" name={fieldName} value={url} />
    </div>
  );
}

function Preview({ shape, url, name }: { shape: "round" | "wide"; url: string; name: string }) {
  if (shape === "wide") {
    return (
      <div
        className="grid h-16 w-40 shrink-0 place-items-center overflow-hidden rounded-lg border"
        style={{ borderColor: "var(--portal-line)", background: "color-mix(in oklab, var(--portal-emerald) 10%, var(--portal-card))" }}
      >
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: "var(--muted-foreground)" }}>
            No image
          </span>
        )}
      </div>
    );
  }
  return <Avatar name={name || "?"} src={url || undefined} size={56} />;
}
