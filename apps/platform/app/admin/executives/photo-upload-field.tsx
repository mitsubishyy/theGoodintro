"use client";

import { useRef, useState } from "react";
import { Avatar } from "@thegoodintro/ui";
import { uploadPhotoFile } from "@/lib/upload/client";

/**
 * Admin photo control (file-upload only, per the locked New/Edit Executive spec).
 * Replaces the old free-text "Photo URL" input. On pick it POSTs the file to the
 * upload route (validate + sharp re-encode + storage write) and stashes the
 * returned stable public URL in a hidden `photo_url` field, so the executive form
 * persists it through its existing save action with no other change. On the New
 * form (no executive id yet) a fresh id is used for the object path; the path is
 * content-hashed and the column write resolves the real executive on save.
 */
export function PhotoUploadField({
  initialUrl,
  ownerId,
  previewName,
  enabled,
}: {
  initialUrl: string;
  ownerId?: string;
  previewName: string;
  enabled: boolean;
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
    const up = await uploadPhotoFile(file, "exec", ownerId || crypto.randomUUID());
    setBusy(false);
    if ("error" in up) return setErr(up.error);
    setUrl(up.url);
  };

  return (
    <div className="flex flex-col gap-1.5 sm:col-span-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        Photo
      </span>
      <div className="flex items-center gap-4">
        <Avatar name={previewName || "?"} src={url || undefined} size={56} />
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
                {busy ? "Uploading…" : url ? "Replace photo" : "Upload photo"}
              </button>
              {url ? (
                <button type="button" onClick={() => setUrl("")} className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Remove
                </button>
              ) : null}
            </div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>PNG, JPG or WebP. Max 1MB.</span>
            {err ? <span className="text-xs" style={{ color: "var(--portal-amber-ink)" }}>{err}</span> : null}
          </div>
        ) : (
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Photo upload is not enabled.
          </span>
        )}
      </div>
      <input type="hidden" name="photo_url" value={url} />
    </div>
  );
}
