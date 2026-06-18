"use client";

import { useActionState } from "react";
import { updateCharityImagesAction, type FormState } from "./actions";
import { PhotoUploadField } from "../_components/photo-upload-field";

/**
 * Charity images editor (logo + hero). File-upload only, reusing the shared
 * pipeline. The uploads stash their public URLs in hidden fields; saving persists
 * them via updateCharityImagesAction. logo renders as the round charity mark
 * across the exec portal; hero is the banner on the "Learn about" detail modal.
 */
export function CharityEditForm({
  id,
  name,
  logoUrl,
  heroUrl,
  photoUploadEnabled,
}: {
  id: string;
  name: string;
  logoUrl: string;
  heroUrl: string;
  photoUploadEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateCharityImagesAction, {});

  return (
    <form action={formAction} className="grid max-w-xl gap-6">
      <input type="hidden" name="id" value={id} />

      <PhotoUploadField
        entity="charity-logo"
        fieldName="logo_url"
        label="Logo"
        initialUrl={logoUrl}
        ownerId={id}
        previewName={name}
        previewShape="round"
        hint="Square image works best. PNG, JPG or WebP. Max 1MB."
        enabled={photoUploadEnabled}
        className=""
      />

      <PhotoUploadField
        entity="charity-hero"
        fieldName="hero_image_url"
        label="Hero image"
        initialUrl={heroUrl}
        ownerId={id}
        previewName={name}
        previewShape="wide"
        hint="Wide banner, about 1200 by 480. PNG, JPG or WebP. Max 1MB."
        enabled={photoUploadEnabled}
        className=""
      />

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--portal-ink)", color: "var(--portal-card)" }}
        >
          {pending ? "Saving…" : "Save images"}
        </button>
        {state.error ? <span className="text-sm" style={{ color: "var(--portal-amber-ink)" }}>{state.error}</span> : null}
        {state.ok ? <span className="text-sm" style={{ color: "var(--primary)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
