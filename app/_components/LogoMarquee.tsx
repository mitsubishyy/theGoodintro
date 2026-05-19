"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────
   Interactive infinite logo marquee.
   - Auto-scrolls rightward in a seamless loop (two identical copies, the
     offset is wrapped so there is no beginning or end).
   - Hovering pauses the scroll; grab and drag to swipe either way.
   - macOS-dock magnification: the logo nearest the cursor enlarges with
     a gentle falloff. The band has vertical room so nothing is clipped.
   - Each logo is preloaded in JS through a chain of real-logo sources
     (an official file in /public/charities first, then logo-by-domain
     services). A broken image is never rendered: until/unless a real
     logo loads, the charity name shows in its brand colour.
   - Respects prefers-reduced-motion (no auto-scroll, no magnify; manual
     drag still works).
   ───────────────────────────────────────────────────────────────────── */

export type MarqueeItem = {
  name: string;
  href: string;
  domain?: string;
  /** Explicit logo URL or /public path; tried before the domain lookups. */
  logo?: string;
  /** Brand colour, used for the text fallback. */
  color?: string;
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function logoSources(it: MarqueeItem): string[] {
  const out: string[] = [];
  if (it.logo) out.push(it.logo);
  out.push(`/charities/${slugify(it.name)}.svg`);
  out.push(`/charities/${slugify(it.name)}.png`);
  if (it.domain) {
    out.push(`https://logo.clearbit.com/${it.domain}?size=160`);
    out.push(`https://icons.duckduckgo.com/ip3/${it.domain}.ico`);
  }
  return out;
}

function LogoChip({ item }: { item: MarqueeItem }) {
  const sources = useMemo(() => logoSources(item), [item]);
  const [src, setSrc] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    const tryNext = () => {
      if (cancelled) return;
      if (i >= sources.length) {
        setFailed(true);
        return;
      }
      const url = sources[i++];
      const img = new window.Image();
      img.referrerPolicy = "no-referrer";
      img.onload = () => {
        if (cancelled) return;
        // skip 1x1 trackers / empty placeholders
        if (img.naturalWidth > 2 && img.naturalHeight > 2) setSrc(url);
        else tryNext();
      };
      img.onerror = () => tryNext();
      img.src = url;
    };
    tryNext();
    return () => {
      cancelled = true;
    };
  }, [sources]);

  return (
    <span
      className="flex h-12 items-center justify-center rounded-xl border px-6"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={item.name}
          draggable={false}
          className="max-h-8 w-auto object-contain pointer-events-none select-none"
        />
      ) : (
        <span
          className="whitespace-nowrap text-base md:text-lg font-semibold tracking-tight pointer-events-none select-none"
          style={{
            color: failed
              ? item.color ?? "var(--foreground)"
              : "var(--muted-foreground)",
          }}
        >
          {item.name}
        </span>
      )}
    </span>
  );
}

const SPEED = 42; // px per second
const MAGNIFY = 0.3; // peak extra scale
const RADIUS = 150; // px of cursor influence

export function LogoMarquee({
  items,
  ariaLabel = "Example charities",
}: {
  items: MarqueeItem[];
  ariaLabel?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const offset = useRef(0);
  const setWidth = useRef(0);
  const hovering = useRef(false);
  const dragging = useRef(false);
  const moved = useRef(false);
  const dragStartX = useRef(0);
  const dragStartOffset = useRef(0);
  const reduced = useRef(false);

  const all = [
    ...items.map((it) => ({ it, clone: false })),
    ...items.map((it) => ({ it, clone: true })),
  ];

  const wrap = useCallback(() => {
    const w = setWidth.current;
    if (w <= 0) return;
    if (offset.current > 0) offset.current -= w;
    else if (offset.current < -w) offset.current += w;
  }, []);

  const magnify = useCallback((clientX: number | null) => {
    const track = trackRef.current;
    if (!track) return;
    const nodes = track.querySelectorAll<HTMLElement>(".marquee-item");
    nodes.forEach((el) => {
      if (clientX == null || reduced.current) {
        el.style.transform = "scale(1)";
        el.style.zIndex = "0";
        return;
      }
      const r = el.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const t = Math.max(0, 1 - Math.abs(clientX - center) / RADIUS);
      el.style.transform = `scale(${1 + MAGNIFY * t * t})`;
      el.style.zIndex = t > 0 ? "1" : "0";
    });
  }, []);

  const onWinMove = useCallback(
    (e: PointerEvent) => {
      if (dragging.current) {
        const dx = e.clientX - dragStartX.current;
        if (Math.abs(dx) > 4) moved.current = true;
        offset.current = dragStartOffset.current + dx;
        wrap();
      }
      magnify(e.clientX);
    },
    [wrap, magnify],
  );

  const onWinUp = useCallback(() => {
    dragging.current = false;
    viewportRef.current?.classList.remove("is-dragging");
    window.removeEventListener("pointermove", onWinMove);
    window.removeEventListener("pointerup", onWinUp);
    window.removeEventListener("pointercancel", onWinUp);
  }, [onWinMove]);

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const measure = () => {
      const track = trackRef.current;
      if (track) setWidth.current = track.scrollWidth / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (
        !hovering.current &&
        !dragging.current &&
        !reduced.current &&
        setWidth.current > 0
      ) {
        offset.current += SPEED * dt;
        wrap();
      }
      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${offset.current}px,0,0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
    };
  }, [wrap, onWinMove, onWinUp]);

  return (
    <div
      ref={viewportRef}
      className="marquee"
      role="region"
      aria-label={ariaLabel}
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
        if (!dragging.current) magnify(null);
      }}
      onPointerMove={(e) => {
        if (!dragging.current) magnify(e.clientX);
      }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        dragging.current = true;
        moved.current = false;
        dragStartX.current = e.clientX;
        dragStartOffset.current = offset.current;
        viewportRef.current?.classList.add("is-dragging");
        window.addEventListener("pointermove", onWinMove);
        window.addEventListener("pointerup", onWinUp);
        window.addEventListener("pointercancel", onWinUp);
      }}
      onClickCapture={(e) => {
        if (moved.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div ref={trackRef} className="marquee-track">
        {all.map(({ it, clone }, i) => (
          <a
            key={(clone ? "c-" : "") + it.name + i}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden={clone || undefined}
            tabIndex={clone ? -1 : undefined}
            className="marquee-item shrink-0"
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
          >
            <LogoChip item={it} />
          </a>
        ))}
      </div>
    </div>
  );
}
