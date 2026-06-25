"use client";

import { useRef, useState } from "react";
import { Avatar } from "@thegoodintro/ui";
import { uploadPhotoFile } from "@/lib/upload/client";
import { usePhotoCrop, urlToFile } from "@/app/_components/photo-crop-provider";
import { saveVendorPhotoAction, saveVendorProfileAction } from "./actions";

/**
 * Vendor "Your profile" card (Claude Design "Vendor Settings"). The photo block
 * is the anchor: vendor self-serve upload with states no-photo / uploading /
 * photo-set, and an inert "coming soon" state when `photoEnabled` is false.
 * Name is editable (Save persists it); email + role are read-only.
 */
export function VendorProfileCard({
  vendorUserId,
  name: initialName,
  email,
  role,
  initialPhotoUrl,
  photoEnabled,
}: {
  vendorUserId: string;
  name: string;
  email: string;
  role: string;
  initialPhotoUrl?: string;
  photoEnabled: boolean;
}) {
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [photoErr, setPhotoErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { cropImage } = usePhotoCrop();
  const [original, setOriginal] = useState<File | null>(null);

  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [profileErr, setProfileErr] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const dirty = name.trim() !== initialName.trim();

  // Frame the avatar, then upload the cropped file through the same route +
  // persist. Errors surface inside the modal (it stays open).
  const runCrop = (f: File) =>
    cropImage(f, {
      title: "Frame your photo",
      upload: async (cropped) => {
        setBusy(true);
        try {
          const up = await uploadPhotoFile(cropped, "vendor-user", vendorUserId);
          if ("error" in up) throw new Error(up.error);
          const result = await saveVendorPhotoAction(up.url);
          if (result.error) throw new Error(result.error);
          return up.url;
        } finally {
          setBusy(false);
        }
      },
    });

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setPhotoErr(null);
    setOriginal(file);
    const newUrl = await runCrop(file);
    if (newUrl) setPhotoUrl(newUrl);
  };

  // Re-frame the current photo without re-uploading.
  const onReposition = async () => {
    const f = original ?? (photoUrl ? await urlToFile(photoUrl) : null);
    if (!f) return;
    const newUrl = await runCrop(f);
    if (newUrl) setPhotoUrl(newUrl);
  };

  const onRemovePhoto = async () => {
    setBusy(true);
    setPhotoErr(null);
    const result = await saveVendorPhotoAction(null);
    setBusy(false);
    if (result.error) {
      setPhotoErr(result.error);
      return;
    }
    setPhotoUrl("");
  };

  const onSaveProfile = async () => {
    setSaving(true);
    setProfileErr(null);
    setSaved(false);
    const result = await saveVendorProfileAction({ name: name.trim() });
    setSaving(false);
    if (result.error) {
      setProfileErr(result.error);
      return;
    }
    setSaved(true);
  };

  const labelCls = "font-mono text-[10.5px] uppercase tracking-[0.16em]";
  const mutedLabel = { color: "var(--muted-foreground)" } as const;

  return (
    <section
      className="overflow-hidden rounded-2xl border"
      style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)" }}
    >
      <div className="px-6 pt-5">
        <h2 className="text-[15px] font-semibold tracking-tight" style={{ color: "var(--portal-ink)" }}>
          Your profile
        </h2>
      </div>

      <div className="px-6 pb-6 pt-4">
        {/* ── Photo block (anchor) ── */}
        <div
          className="mb-6 flex flex-col gap-5 rounded-xl border p-5 sm:flex-row sm:items-center sm:gap-6"
          style={{ background: "var(--portal-amber-soft)", borderColor: "color-mix(in oklab, var(--portal-amber-ink) 18%, transparent)" }}
        >
          <Avatar name={name} src={photoUrl || undefined} size={96} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className={labelCls} style={mutedLabel}>Your photo</span>

            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPick} />

            {!photoEnabled ? (
              <>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled
                    className="inline-flex h-[34px] cursor-not-allowed items-center gap-2 rounded-lg px-3.5 text-[13px] font-medium"
                    style={{ background: "color-mix(in oklab, var(--portal-ink) 6%, transparent)", color: "var(--muted-foreground)" }}
                  >
                    <CameraIcon /> Upload
                  </button>
                  <span
                    className="inline-flex h-[22px] items-center rounded-full px-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ background: "color-mix(in oklab, var(--portal-ink) 6%, transparent)", color: "var(--muted-foreground)" }}
                  >
                    Coming soon
                  </span>
                </div>
                <span className="mt-1 font-mono text-[11px]" style={mutedLabel}>
                  Photo uploads are coming soon to the vendor portal.
                </span>
              </>
            ) : busy ? (
              <div className="mt-1.5 flex max-w-[280px] flex-col gap-1.5">
                <div className="h-1 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--portal-ink) 8%, transparent)" }}>
                  <span className="block h-full w-1/3 animate-pulse rounded-full" style={{ background: "var(--portal-amber-ink)" }} />
                </div>
                <span className="font-mono text-[11px]" style={{ color: "var(--portal-amber-ink)" }}>Uploading…</span>
              </div>
            ) : (
              <>
                <div className="mt-1.5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="inline-flex h-[34px] items-center gap-2 rounded-lg border px-3.5 text-[13px] font-medium"
                    style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)", color: "var(--portal-ink)" }}
                  >
                    <CameraIcon /> {photoUrl ? "Replace" : "Upload"}
                  </button>
                  {photoUrl && (
                    <button type="button" onClick={onReposition} className="text-[13px] font-medium" style={{ color: "var(--portal-amber-ink)" }}>
                      Reposition
                    </button>
                  )}
                  {photoUrl && (
                    <button type="button" onClick={onRemovePhoto} className="text-[13px] font-medium" style={{ color: "oklch(0.58 0.18 25)" }}>
                      Remove
                    </button>
                  )}
                </div>
                <span className="mt-1 font-mono text-[11px]" style={mutedLabel}>PNG, JPG or WebP.</span>
              </>
            )}

            {photoErr && <span className="mt-1 text-[12px]" style={{ color: "oklch(0.58 0.18 25)" }}>{photoErr}</span>}
          </div>
        </div>

        {/* ── Fields ── */}
        <div className="flex flex-col gap-[18px]">
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="vs-name" className={labelCls} style={mutedLabel}>Full name</label>
            <input
              id="vs-name"
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setSaved(false); }}
              className="h-10 w-full rounded-lg border px-3 text-[13.5px]"
              style={{ background: "var(--portal-card)", borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
            />
          </div>

          <div className="flex flex-col gap-[7px]">
            <span className={labelCls} style={mutedLabel}>Work email</span>
            <div
              className="flex h-10 w-full items-center rounded-lg border px-3 text-[13.5px]"
              style={{ background: "color-mix(in oklab, var(--portal-ink) 3%, transparent)", borderColor: "var(--portal-line)", color: "var(--portal-ink)" }}
            >
              {email}
            </div>
            <span className="text-[12px]" style={mutedLabel}>Used for meeting confirmations and sign-in. Contact TheGoodIntro to change it.</span>
          </div>

          <div className="flex flex-col gap-[7px]">
            <span className={labelCls} style={mutedLabel}>Role on this vendor</span>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-[12px] font-medium capitalize"
                style={{ background: "var(--portal-amber-soft)", color: "var(--portal-amber-ink)", border: "1px solid color-mix(in oklab, var(--portal-amber-ink) 25%, transparent)" }}
              >
                {role}
              </span>
              <span className="text-[12px]" style={mutedLabel}>Set by TheGoodIntro.</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer (name save) ── */}
      <div
        className="flex items-center gap-3 border-t px-6 py-4"
        style={{ borderColor: "var(--portal-line)", background: "color-mix(in oklab, var(--portal-ink) 2%, transparent)" }}
      >
        <span className="text-[12px]" style={mutedLabel}>
          {profileErr ? profileErr : saved ? "Saved." : "Changes apply to your vendor profile across the network."}
        </span>
        <span className="flex-1" />
        <button
          type="button"
          onClick={() => { setName(initialName); setProfileErr(null); setSaved(false); }}
          disabled={!dirty || saving}
          className="inline-flex h-[34px] items-center rounded-lg border px-3.5 text-[13px] font-medium disabled:opacity-50"
          style={{ borderColor: "var(--portal-line)", background: "var(--portal-card)", color: "var(--portal-ink)" }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSaveProfile}
          disabled={!dirty || saving}
          className="inline-flex h-[34px] items-center rounded-lg px-3.5 text-[13px] font-medium disabled:opacity-50"
          style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </section>
  );
}

function CameraIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M12 16V4M6 10l6-6 6 6" />
      <path d="M4 20h16" />
    </svg>
  );
}
