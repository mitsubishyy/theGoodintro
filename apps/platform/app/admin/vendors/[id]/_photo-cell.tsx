"use client";

import { useRef, useState } from "react";
import { Avatar } from "@thegoodintro/ui";
import { uploadPhotoFile } from "@/lib/upload/client";
import { saveVendorUserPhotoAction } from "../actions";

/**
 * Admin-override avatar with an inline photo-upload popover (Claude Design
 * "Vendor Photo Upload", Option A — avatar hover → popover). Rendered in the
 * Users & seats rows ONLY when `vendor_photo_upload` is on; otherwise the row
 * renders a plain read-only Avatar, so the table is byte-for-byte unchanged when
 * the flag is off. The bytes go through the shared upload route (validate +
 * re-encode + storage write under the staff session), then the returned public
 * URL is persisted via saveVendorUserPhotoAction.
 */
export function VendorUserPhotoCell({
  userId,
  name,
  initialUrl,
}: {
  userId: string;
  name: string;
  initialUrl?: string;
}) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true);
    setErr(null);
    const up = await uploadPhotoFile(file, "vendor-user", userId);
    if ("error" in up) {
      setBusy(false);
      setErr(up.error);
      return;
    }
    const saved = await saveVendorUserPhotoAction(userId, up.url);
    setBusy(false);
    if (saved.error) {
      setErr(saved.error);
      return;
    }
    setUrl(up.url);
  };

  const onRemove = async () => {
    setBusy(true);
    setErr(null);
    const saved = await saveVendorUserPhotoAction(userId, null);
    setBusy(false);
    if (saved.error) {
      setErr(saved.error);
      return;
    }
    setUrl("");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="group relative inline-flex rounded-full"
        style={{ lineHeight: 0 }}
        aria-label={`Edit photo for ${name}`}
      >
        <Avatar name={name} src={url || undefined} size={32} />
        <span
          className="absolute inset-0 grid place-items-center rounded-full opacity-0 transition-opacity duration-150 group-hover:opacity-100"
          style={{ background: "color-mix(in oklab, var(--portal-ink) 55%, transparent)" }}
        >
          <CameraIcon />
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} aria-hidden />
          <div
            className="absolute left-0 top-[calc(100%+6px)] z-30 flex w-[228px] flex-col gap-3 rounded-lg border p-3.5"
            style={{
              background: "var(--portal-card)",
              borderColor: "var(--portal-line)",
              boxShadow: "0 4px 16px color-mix(in oklab, var(--portal-ink) 12%, transparent)",
            }}
          >
            <div className="flex items-center gap-3">
              <Avatar name={name} src={url || undefined} size={52} />
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold" style={{ color: "var(--portal-ink)" }}>
                  {name}
                </div>
                <div className="font-mono text-[9.5px] leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                  PNG, JPG or WebP. Max 1MB.
                </div>
              </div>
            </div>

            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPick} />

            {busy ? (
              <div className="flex flex-col gap-1.5">
                <div className="h-[3px] overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--portal-ink) 8%, transparent)" }}>
                  <span className="block h-full w-1/3 animate-pulse rounded-full" style={{ background: "var(--portal-amber-ink)" }} />
                </div>
                <span className="text-[11px]" style={{ color: "var(--muted-foreground)" }}>Uploading…</span>
              </div>
            ) : url ? (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-md border px-2.5 py-1 text-[11.5px]"
                  style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)", color: "var(--portal-ink)" }}
                >
                  Replace
                </button>
                <button type="button" onClick={onRemove} className="text-[11.5px]" style={{ color: "oklch(0.58 0.18 25)" }}>
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="self-start rounded-md px-2.5 py-1 text-[11.5px] font-medium"
                style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
              >
                Upload
              </button>
            )}

            {err && (
              <div className="text-[11px]" style={{ color: "var(--portal-amber-ink)" }}>
                {err}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function CameraIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
