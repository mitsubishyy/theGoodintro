"use client";

import { Avatar, Button } from "@thegoodintro/ui";
import { useRef, useState } from "react";
import { PhotoCropProvider, usePhotoCrop } from "../../_components/photo-crop-provider";

/**
 * Kit-reference demo of the shared photo crop step so it can be QA'd before its
 * hosts (the avatar upload controls) wire it in. Demo only: the `upload` closure
 * does NOT hit the network — it turns the cropped file into a local object URL
 * and simulates latency so the "Saving…" state is visible, then shows the result
 * in a real Avatar. The production wiring replaces this closure with
 * uploadPhotoFile(...) + the per-surface persist.
 */
function CropModalDemoInner() {
  const { cropImage } = usePhotoCrop();
  const fileRef = useRef<HTMLInputElement>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = await cropImage(file, {
      upload: async (cropped) => {
        const kind = cropped.type.split("/")[1]?.toUpperCase() ?? "IMG";
        setInfo(`${kind} · ${(cropped.size / 1024).toFixed(0)} KB · 512²`);
        await new Promise((r) => setTimeout(r, 900)); // simulate upload latency
        return URL.createObjectURL(cropped);
      },
    });
    if (url) setResultUrl(url);
  };

  return (
    <div className="flex items-center gap-5">
      <Avatar name="Demo Photo" src={resultUrl ?? undefined} size={64} />
      <div className="flex flex-col gap-1.5">
        <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onPick} />
        <div>
          <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
            Pick a photo to crop
          </Button>
        </div>
        <span className="text-[12px]" style={{ color: "var(--muted-foreground)" }}>
          {info ? `Cropped file: ${info}` : "Opens the crop step; Save shows the result here (demo does not upload)."}
        </span>
      </div>
    </div>
  );
}

export function CropModalDemo() {
  return (
    <PhotoCropProvider>
      <CropModalDemoInner />
    </PhotoCropProvider>
  );
}
