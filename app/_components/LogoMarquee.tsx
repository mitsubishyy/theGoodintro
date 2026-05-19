"use client";

import { useEffect, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────
   Interactive infinite logo marquee.
   - Auto-scrolls rightward in a seamless loop (two identical copies, the
     offset is wrapped so there is no beginning or end).
   - Hovering pauses the auto-scroll; you can then grab and swipe it.
   - macOS-dock style: the logo nearest the cursor enlarges, with a
     gentle falloff to its neighbours.
   - Each logo loads from a chain of real-logo sources (an official file
     in /public/charities first, then logo-by-domain services), falling
     back to the charity name in its brand colour.
   - Respects prefers-reduced-motion (no auto-scroll, no magnify; drag
     still works since it is user-initiated).
   ───────────────────────────────────────────────────────────────────── */

export type MarqueeItem = {
  name: string;
  href: string;
  domain?: string;
  /** Explicit logo URL or /public path; tried before the domain lookups. */
  logo?: string;
  /** Brand colour, used only for the text fallback. */
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
    out.push(`https://www.google.com/s2/favicons?sz=128&domain=${it.domain}`);
  }
  return out;
}

function LogoChip({ item }: { item: MarqueeItem }) {
  const sources = logoSources(item);
  const [idx, setIdx] = useState(0);
  const exhausted = idx >= sources.length;

  return (
    <span
      className="flex h-12 items-center justify-center rounded-xl border px-6"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {exhausted ? (
        <span
          className="whitespace-nowrap text-base md:text-lg font-semibold tracking-tight"
          style={{ color: item.color ?? "var(--foreground)" }}
        >
          {item.name}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={sources[idx]}
          src={sources[idx]}
          alt={`${item.name} logo`}
          loading="lazy"
          referrerPolicy="no-referrer"
          draggable={false}
          onError={() => setIdx((i) => i + 1)}
          className="max-h-8 w-auto object-contain pointer-events-none"
        />
      )}
    </span>
  );
}

const SPEED = 42; // px per second
const MAGNIFY = 0.32; // peak extra scale
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

  function wrap() {
    const w = setWidth.current;
    if (w <= 0) return;
    if (offset.current > 0) offset.current -= w;
    else if (offset.current < -w) offset.current += w;
  }

  function magnify(clientX: number | null) {
    const track = trackRef.current;
    if (!track) return;
    const nodes = track.querySelectorAll<HTMLElement>(".marquee-item");
    nodes.forEach((el) => {
      if (clientX == null || reduced.current) {
        el.style.transform = "scale(1)";
        return;
      }
      const r = el.getBoundingClientRect();
      const center = r.left + r.width / 2;
      const t = Math.max(0, 1 - Math.abs(clientX - center) / RADIUS);
      const scale = 1 + MAGNIFY * t * t;
      el.style.transform = `scale(${scale})`;
      el.style.zIndex = t > 0 ? "1" : "0";
    });
  }

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
      const dt = (now - last) / 1000;
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
    };
  }, []);

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
        dragging.current = false;
        viewportRef.current?.classList.remove("is-dragging");
        magnify(null);
      }}
      onPointerDown={(e) => {
        dragging.current = true;
        moved.current = false;
        dragStartX.current = e.clientX;
        dragStartOffset.current = offset.current;
        viewportRef.current?.classList.add("is-dragging");
        viewportRef.current?.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (dragging.current) {
          const dx = e.clientX - dragStartX.current;
          if (Math.abs(dx) > 5) moved.current = true;
          offset.current = dragStartOffset.current + dx;
          wrap();
        }
        magnify(e.clientX);
      }}
      onPointerUp={(e) => {
        dragging.current = false;
        viewportRef.current?.classList.remove("is-dragging");
        viewportRef.current?.releasePointerCapture(e.pointerId);
      }}
      onPointerCancel={() => {
        dragging.current = false;
        viewportRef.current?.classList.remove("is-dragging");
      }}
      onClickCapture={(e) => {
        // A drag should not trigger the underlying link.
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
          >
            <LogoChip item={it} />
          </a>
        ))}
      </div>
    </div>
  );
}
