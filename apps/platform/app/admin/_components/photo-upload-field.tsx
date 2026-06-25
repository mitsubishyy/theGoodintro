"use client";

import { useRef, useState } from "react";
import { Avatar } from "@thegoodintro/ui";
import { uploadPhotoFile } from "@/lib/upload/client";
import { usePhotoCrop, urlToFile } from "@/app/_components/photo-crop-provider";

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

const DEFAULT_HINT = "PNG, JPG or WebP. Max 1MB.";
const AVATAR_HINT = "PNG, JPG or WebP.";

export function PhotoUploadField({
  entity = "exec",
  fieldName = "photo_url",
  label = "Photo",
  initialUrl,
  ownerId,
  previewName,
  previewShape = "round",
  previewSize = 56,
  hint = DEFAULT_HINT,
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
  previewSize?: number;
  hint?: string;
  enabled: boolean;
  className?: string;
}) {
  const [url, setUrl] = useState(initialUrl);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { cropImage } = usePhotoCrop();
  const [original, setOriginal] = useState<File | null>(null);

  // Round avatars (executive + vendor-user) get the crop / framing step; charity
  // logo / hero are not 1:1 circular, so they keep the immediate upload for now.
  const avatar = entity === "exec" || entity === "vendor-user";
  // With the crop step the source-file size cap no longer bites (the crop is
  // resampled to a small 512 file), so the avatar control drops the "Max 1MB".
  const displayHint = avatar && hint === DEFAULT_HINT ? AVATAR_HINT : hint;

  // Frame an avatar, then upload the cropped file through the same route.
  const runCrop = (f: File) =>
    cropImage(f, {
      title: "Frame the photo",
      upload: async (cropped) => {
        const up = await uploadPhotoFile(cropped, entity, ownerId || crypto.randomUUID());
        if ("error" in up) throw new Error(up.error); // shown inline in the modal
        return up.url;
      },
    });

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr(null);

    if (avatar) {
      setOriginal(file);
      const newUrl = await runCrop(file);
      if (newUrl) setUrl(newUrl);
      return;
    }

    setBusy(true);
    const up = await uploadPhotoFile(file, entity, ownerId || crypto.randomUUID());
    setBusy(false);
    if ("error" in up) return setErr(up.error);
    setUrl(up.url);
  };

  // Re-frame the current photo without re-uploading: the in-session original if
  // we have it, otherwise the saved photo fetched back.
  const onReposition = async () => {
    const f = original ?? (url ? await urlToFile(url) : null);
    if (!f) return;
    const newUrl = await runCrop(f);
    if (newUrl) setUrl(newUrl);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div className="flex items-center gap-4">
        <Preview shape={previewShape} url={url} name={previewName} size={previewSize} />
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
              {avatar && url ? (
                <button type="button" onClick={onReposition} className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>
                  Reposition
                </button>
              ) : null}
              {url ? (
                <button type="button" onClick={() => setUrl("")} className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Remove
                </button>
              ) : null}
            </div>
            <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{displayHint}</span>
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

function Preview({ shape, url, name, size }: { shape: "round" | "wide"; url: string; name: string; size: number }) {
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
  return <Avatar name={name || "?"} src={url || undefined} size={size} />;
}
