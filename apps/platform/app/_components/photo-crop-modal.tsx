"use client";

import { Button } from "@thegoodintro/ui";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

/**
 * Shared photo crop / framing step (locked 2026-06-25, matched to the QuotaClub
 * cover-letter cropper). A popup that sits BETWEEN "pick file" and "upload" for
 * the round 512px avatars (executive + vendor-user). Circle-only: the source
 * image renders behind a single circular viewport, the user drags to pan and
 * slides to zoom, and what shows in the circle is exactly what is saved — so the
 * circle doubles as the live preview (no separate preview, no rotate, no dimmed
 * surround). On Save it draws the visible region into a SQUARE `outputSize`
 * canvas and hands a WebP File to `onConfirm`; the caller uploads it through the
 * existing route (which re-encodes to a clean 512 WebP), so no backend change.
 * The stored asset is square, shown round by Avatar, exactly as today.
 *
 * Self-contained + role-agnostic. The crop is applied client-side; orientation
 * is honoured via createImageBitmap({ imageOrientation: "from-image" }) and EXIF
 * is dropped on output (fresh pixels), matching the server's privacy intent.
 */

const VIEW = 320; // circular viewport diameter in stage-space px (the crop area)
const MAX_ZOOM = 3;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

interface CropState {
  src: ImageBitmap | null; // orientation-corrected source
  nw: number;
  nh: number;
  scale: number;
  minScale: number; // cover-fit
  maxScale: number;
  tx: number; // source top-left x in stage space
  ty: number; // source top-left y in stage space
}

export interface PhotoCropModalProps {
  open: boolean;
  file: File | null;
  title?: string;
  /** Square output edge in px. Default 512 (the avatar variant). */
  outputSize?: number;
  /**
   * Caller uploads the cropped file; the modal shows "Saving…" until this
   * resolves, then the host closes it. Throw to show the message inline and keep
   * the modal open so the user can retry or cancel.
   */
  onConfirm: (cropped: File) => Promise<void> | void;
  onCancel: () => void;
}

export function PhotoCropModal({
  open,
  file,
  title = "Frame your photo",
  outputSize = 512,
  onConfirm,
  onCancel,
}: PhotoCropModalProps) {
  const stageRef = useRef<HTMLCanvasElement>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const st = useRef<CropState>({ src: null, nw: 0, nh: 0, scale: 1, minScale: 1, maxScale: 1, tx: 0, ty: 0 });
  const mounted = useRef(true);
  const busyRef = useRef(false);
  const dragging = useRef(false);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  const render = useCallback(() => {
    const s = st.current;
    const c = stageRef.current;
    if (!c || !s.src) return;
    const dpr = window.devicePixelRatio || 1;
    const px = Math.round(VIEW * dpr);
    if (c.width !== px) {
      c.width = px;
      c.height = px;
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, VIEW, VIEW);
    ctx.drawImage(s.src, s.tx, s.ty, s.nw * s.scale, s.nh * s.scale);
    if (sliderRef.current) {
      const span = s.maxScale - s.minScale || 1;
      sliderRef.current.value = String(((s.scale - s.minScale) / span) * 100);
    }
  }, []);

  const clampPan = useCallback(() => {
    const s = st.current;
    const dw = s.nw * s.scale;
    const dh = s.nh * s.scale;
    s.tx = clamp(s.tx, VIEW - dw, 0);
    s.ty = clamp(s.ty, VIEW - dh, 0);
  }, []);

  const recompute = useCallback(() => {
    const s = st.current;
    if (!s.src) return;
    s.nw = s.src.width;
    s.nh = s.src.height;
    s.minScale = Math.max(VIEW / s.nw, VIEW / s.nh); // cover-fit
    s.maxScale = s.minScale * MAX_ZOOM;
    s.scale = s.minScale;
    s.tx = (VIEW - s.nw * s.scale) / 2;
    s.ty = (VIEW - s.nh * s.scale) / 2;
  }, []);

  const zoomTo = useCallback(
    (next: number) => {
      const s = st.current;
      if (!s.src) return;
      const ns = clamp(next, s.minScale, s.maxScale);
      // keep the image point under the viewport centre fixed
      const ipx = (VIEW / 2 - s.tx) / s.scale;
      const ipy = (VIEW / 2 - s.ty) / s.scale;
      s.scale = ns;
      s.tx = VIEW / 2 - ipx * s.scale;
      s.ty = VIEW / 2 - ipy * s.scale;
      clampPan();
      render();
    },
    [clampPan, render],
  );

  // Load the picked file when the modal opens (orientation-corrected bitmap).
  useEffect(() => {
    if (!open || !file) return;
    let cancelled = false;
    (async () => {
      let bmp: ImageBitmap | null = null;
      try {
        bmp = await createImageBitmap(file, { imageOrientation: "from-image" } as ImageBitmapOptions);
      } catch {
        try {
          bmp = await createImageBitmap(file);
        } catch {
          if (!cancelled && mounted.current) setError("That image could not be read. Try a different file.");
          return;
        }
      }
      if (cancelled) {
        bmp.close?.();
        return;
      }
      const s = st.current;
      s.src?.close?.();
      s.src = bmp;
      recompute();
      if (mounted.current) {
        setReady(true);
        render();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, file, recompute, render]);

  // Native, non-passive wheel listener so preventDefault works.
  useEffect(() => {
    const c = stageRef.current;
    if (!open || !c) return;
    const onWheel = (e: WheelEvent) => {
      if (busyRef.current) return;
      e.preventDefault();
      zoomTo(st.current.scale * Math.exp(-e.deltaY * 0.0015));
    };
    c.addEventListener("wheel", onWheel, { passive: false });
    return () => c.removeEventListener("wheel", onWheel);
  }, [open, zoomTo]);

  useEffect(() => {
    if (!open) return;
    const onResize = () => render();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open, render]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busyRef.current) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (busy) return;
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!dragging.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const k = VIEW / rect.width; // CSS px -> stage space
    st.current.tx += e.movementX * k;
    st.current.ty += e.movementY * k;
    clampPan();
    render();
  };
  const endDrag = () => {
    dragging.current = false;
  };

  const save = async () => {
    const s = st.current;
    if (!s.src) return;
    const out = document.createElement("canvas");
    out.width = outputSize;
    out.height = outputSize;
    const ctx = out.getContext("2d");
    if (!ctx) {
      setError("Could not prepare the image. Try again.");
      return;
    }
    // The visible viewport [0..VIEW] maps back to source pixels by /scale.
    const ss = VIEW / s.scale;
    const sx = -s.tx / s.scale;
    const sy = -s.ty / s.scale;
    ctx.drawImage(s.src, sx, sy, ss, ss, 0, 0, outputSize, outputSize);
    let blob: Blob | null = await new Promise<Blob | null>((res) => out.toBlob((b) => res(b), "image/webp", 0.92));
    if (!blob || blob.type !== "image/webp") {
      blob = await new Promise<Blob | null>((res) => out.toBlob((b) => res(b), "image/png"));
    }
    if (!blob) {
      setError("Could not prepare the image. Try again.");
      return;
    }
    const ext = blob.type === "image/webp" ? "webp" : "png";
    const cropped = new File([blob], `avatar.${ext}`, { type: blob.type });
    setBusy(true);
    setError(null);
    try {
      await onConfirm(cropped);
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : "Upload failed. Try again.");
        setBusy(false);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center px-4"
      style={{ background: "color-mix(in oklch, var(--portal-ink) 20%, transparent)", backdropFilter: "blur(2px)" }}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-crop-title"
        className="w-full max-w-[400px] overflow-hidden rounded-2xl border"
        style={{ background: "var(--portal-card-reading)", borderColor: "var(--portal-line)" }}
      >
        {/* header */}
        <div className="px-6 pb-1 pt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
            Edit photo
          </p>
          <h2 id="photo-crop-title" className="mt-1.5 text-[17px] font-semibold" style={{ color: "var(--portal-ink)", letterSpacing: "-0.005em" }}>
            {title}
          </h2>
          <p className="mt-1 text-[12.5px]" style={{ color: "var(--muted-foreground)" }}>
            What you see in the circle is exactly what is saved. Drag to reposition, slide to zoom.
          </p>
        </div>

        {/* circular crop = the live preview */}
        <div className="px-6 pt-4">
          <div className="flex justify-center">
            <div
              className="relative shrink-0 overflow-hidden rounded-full"
              style={{
                width: "min(320px, 74vw)",
                height: "min(320px, 74vw)",
                background: "var(--portal-ink)",
                border: "3px solid var(--portal-card-reading)",
                boxShadow: "0 0 0 1px var(--portal-line)",
                touchAction: "none",
                cursor: busy ? "default" : "grab",
              }}
            >
              <canvas
                ref={stageRef}
                className="absolute inset-0 h-full w-full select-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
              />
              {!ready && (
                <div
                  className="absolute inset-0 grid place-items-center font-mono text-[10px] uppercase tracking-[0.18em]"
                  style={{ color: "color-mix(in oklch, white 80%, transparent)" }}
                >
                  {error ? "" : "Loading…"}
                </div>
              )}
            </div>
          </div>

          {/* zoom */}
          <div className="mt-5 flex items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
              Zoom
            </span>
            <input
              ref={sliderRef}
              type="range"
              min={0}
              max={100}
              defaultValue={0}
              disabled={busy}
              aria-label="Zoom"
              className="tgi-crop-slider h-[3px] flex-1"
              onChange={(e) =>
                zoomTo(st.current.minScale + (st.current.maxScale - st.current.minScale) * (Number(e.target.value) / 100))
              }
            />
          </div>
        </div>

        {/* footer */}
        <div
          className="mt-5 flex items-center justify-between gap-3 border-t px-6 py-4"
          style={{ borderColor: "var(--portal-line)", background: "color-mix(in oklch, var(--portal-page) 55%, var(--portal-card-reading))" }}
        >
          {error ? (
            <span className="flex-1 text-[12px]" style={{ color: "var(--portal-amber-ink)" }}>
              {error}
            </span>
          ) : (
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: "var(--muted-foreground)" }}>
              Output · {outputSize}px circle
            </span>
          )}
          <div className="flex gap-2.5">
            <Button variant="ghost" size="sm" onClick={() => !busy && onCancel()} disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" loading={busy} disabled={!ready} onClick={save}>
              {busy ? "Saving…" : "Save photo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
