"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { PhotoCropModal } from "./photo-crop-modal";

/**
 * The reuse mechanism for the crop step. Mount <PhotoCropProvider> once inside a
 * portal layout, then any upload control calls `usePhotoCrop().cropImage(file,
 * { upload })` to insert "pick -> crop -> upload" with a tiny change at the call
 * site. The provider owns the single shared modal, the busy/"Saving…" state, the
 * inline error, and Escape/scrim dismissal; the call site only supplies the
 * `upload` closure (which already re-encodes server-side, no backend change) and
 * updates its own local URL on success.
 *
 *   const { cropImage } = usePhotoCrop();
 *   const url = await cropImage(file, {
 *     upload: async (cropped) => {
 *       const up = await uploadPhotoFile(cropped, entity, ownerId);
 *       if ("error" in up) throw new Error(up.error); // shown inline, modal stays open
 *       return up.url;
 *     },
 *   });
 *   if (url) setUrl(url); // null => the user cancelled
 */

/** Uploads the cropped file and resolves the final URL. Throw an Error to show
 *  its message inline and keep the modal open for retry. */
export type CropUploadFn = (cropped: File) => Promise<string>;

export interface CropImageOptions {
  upload: CropUploadFn;
  title?: string;
  outputSize?: number;
}

interface PhotoCropApi {
  /** Opens the crop modal for `file`. Resolves the final URL, or null if cancelled. */
  cropImage: (file: File, options: CropImageOptions) => Promise<string | null>;
}

/**
 * Fetch a saved photo URL back into a File so "Reposition" can re-open the
 * cropper on the current photo. Returns null if the fetch fails (e.g. CORS),
 * letting the caller fall back to the in-session original or quietly no-op.
 */
export async function urlToFile(url: string, fallbackType = "image/webp"): Promise<File | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new File([blob], "current", { type: blob.type || fallbackType });
  } catch {
    return null;
  }
}

const PhotoCropContext = createContext<PhotoCropApi | null>(null);

export function usePhotoCrop(): PhotoCropApi {
  const ctx = useContext(PhotoCropContext);
  if (!ctx) throw new Error("usePhotoCrop must be used within <PhotoCropProvider>.");
  return ctx;
}

export function PhotoCropProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<CropImageOptions | null>(null);
  // Bumped per open so the modal remounts with fresh state (no synchronous
  // setState resets inside its load effect).
  const [sessionKey, setSessionKey] = useState(0);
  const resolver = useRef<((url: string | null) => void) | null>(null);

  const cropImage = useCallback((nextFile: File, nextOptions: CropImageOptions) => {
    setFile(nextFile);
    setOptions(nextOptions);
    setSessionKey((k) => k + 1);
    setOpen(true);
    return new Promise<string | null>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const finish = useCallback((url: string | null) => {
    setOpen(false);
    setFile(null);
    setOptions(null);
    resolver.current?.(url);
    resolver.current = null;
  }, []);

  const api = useMemo<PhotoCropApi>(() => ({ cropImage }), [cropImage]);

  return (
    <PhotoCropContext.Provider value={api}>
      {children}
      <PhotoCropModal
        key={sessionKey}
        open={open}
        file={file}
        title={options?.title}
        outputSize={options?.outputSize}
        onCancel={() => finish(null)}
        onConfirm={async (cropped) => {
          if (!options) return;
          // May throw -> PhotoCropModal catches, shows the message inline, and
          // stays open. On success we resolve the caller's promise and close.
          const url = await options.upload(cropped);
          finish(url);
        }}
      />
    </PhotoCropContext.Provider>
  );
}
