"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────────────────────────────────
   Infinite logo strip on a NATIVE horizontal scroller.
   - Scroll like any page: trackpad, mouse wheel, phone swipe.
   - Auto-drifts rightward when idle; pauses on hover and briefly after
     you interact so it never fights you.
   - Three copies + a wrap keep it seamless both directions.
   - macOS-dock magnification on mouse move; the band has vertical room
     so a magnified chip is never clipped.
   - Logos are resolved entirely on the client (no server-render race):
     each is preloaded through a chain of real-logo sources and the
     first that loads is shown. The chain ends in a favicon service, so
     a real mark resolves for essentially every charity. Drop an
     official file in /public/charities to override with the full logo.
   - Respects prefers-reduced-motion.
   ───────────────────────────────────────────────────────────────────── */

export type MarqueeItem = {
  name: string;
  href: string;
  domain?: string;
  /** Explicit logo URL or /public path; tried before the domain lookups. */
  logo?: string;
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
    out.push(`https://logo.clearbit.com/${it.domain}?size=200`);
    out.push(`https://icons.duckduckgo.com/ip3/${it.domain}.ico`);
    out.push(`https://www.google.com/s2/favicons?sz=128&domain=${it.domain}`);
  }
  return out;
}

function LogoChip({ item }: { item: MarqueeItem }) {
  const sources = useMemo(() => logoSources(item), [item]);
  const [resolved, setResolved] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    const attempt = () => {
      if (cancelled) return;
      if (i >= sources.length) {
        setDone(true);
        return;
      }
      const url = sources[i++];
      const probe = new window.Image();
      probe.referrerPolicy = "no-referrer";
      probe.onload = () => {
        if (cancelled) return;
        if (probe.naturalWidth >= 8 && probe.naturalHeight >= 8) {
          setResolved(url);
          setDone(true);
        } else {
          attempt();
        }
      };
      probe.onerror = () => {
        if (!cancelled) attempt();
      };
      probe.src = url;
    };
    attempt();
    return () => {
      cancelled = true;
    };
  }, [sources]);

  return (
    <span
      className="flex h-12 min-w-[8rem] items-center justify-center rounded-xl border px-6"
      style={{ background: "var(--card)", borderColor: "var(--border)" }}
    >
      {resolved ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolved}
          alt={item.name}
          draggable={false}
          className="max-h-9 w-auto object-contain pointer-events-none select-none"
        />
      ) : (
        <span
          className="whitespace-nowrap text-sm font-medium tracking-tight text-muted-foreground pointer-events-none select-none"
          aria-hidden={!done}
        >
          {item.name}
        </span>
      )}
    </span>
  );
}

const SPEED = 38; // px per second of idle drift
const MAGNIFY = 0.3; // peak extra scale
const RADIUS = 150; // px of cursor influence
const RESUME_MS = 1600; // pause auto-drift this long after interaction

export function LogoMarquee({
  items,
  ariaLabel = "Example charities",
}: {
  items: MarqueeItem[];
  ariaLabel?: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const setW = useRef(0);
  const hovering = useRef(false);
  const lastInteract = useRef(0);
  const reduced = useRef(false);

  const copies = [0, 1, 2];

  const magnify = useCallback((clientX: number | null) => {
    const el = scroller.current;
    if (!el) return;
    el.querySelectorAll<HTMLElement>(".marquee-item").forEach((node) => {
      if (clientX == null || reduced.current) {
        node.style.transform = "scale(1)";
        node.style.zIndex = "0";
        return;
      }
      const r = node.getBoundingClientRect();
      const c = r.left + r.width / 2;
      const t = Math.max(0, 1 - Math.abs(clientX - c) / RADIUS);
      node.style.transform = `scale(${1 + MAGNIFY * t * t})`;
      node.style.zIndex = t > 0 ? "1" : "0";
    });
  }, []);

  const normalize = useCallback(() => {
    const el = scroller.current;
    const s = setW.current;
    if (!el || s <= 0) return;
    if (el.scrollLeft < s * 0.5) el.scrollLeft += s;
    else if (el.scrollLeft > s * 1.5) el.scrollLeft -= s;
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const measure = () => {
      setW.current = el.scrollWidth / 3;
      if (el.scrollLeft === 0) el.scrollLeft = setW.current;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);

    const note = () => {
      lastInteract.current = performance.now();
    };
    el.addEventListener("scroll", normalize, { passive: true });
    el.addEventListener("wheel", note, { passive: true });
    el.addEventListener("touchstart", note, { passive: true });
    el.addEventListener("pointerdown", note, { passive: true });

    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const idle =
        !hovering.current &&
        !reduced.current &&
        now - lastInteract.current > RESUME_MS &&
        setW.current > 0;
      if (idle) {
        el.scrollLeft -= SPEED * dt; // drift content rightward
        normalize();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("scroll", normalize);
      el.removeEventListener("wheel", note);
      el.removeEventListener("touchstart", note);
      el.removeEventListener("pointerdown", note);
    };
  }, [normalize]);

  return (
    <div
      ref={scroller}
      className="marquee"
      role="region"
      aria-label={ariaLabel}
      onPointerEnter={() => {
        hovering.current = true;
      }}
      onPointerLeave={() => {
        hovering.current = false;
        magnify(null);
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") magnify(e.clientX);
      }}
    >
      <div className="marquee-track">
        {copies.map((cp) =>
          items.map((it) => (
            <a
              key={cp + "-" + it.name}
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-hidden={cp !== 0 || undefined}
              tabIndex={cp !== 0 ? -1 : undefined}
              className="marquee-item shrink-0"
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            >
              <LogoChip item={it} />
            </a>
          )),
        )}
      </div>
    </div>
  );
}
