"use client";

import { useEffect, useMemo, useState } from "react";

/* ─────────────────────────────────────────────────────────────────
   Logo resolver for the home charity marquee. Mirrors the probe
   chain used by LogoMarquee: an explicit /public asset first, then
   the charity's own domain via logo services, ending in a text chip
   so a chip never renders broken. Client-only because resolution
   probes real images in the browser.
   ───────────────────────────────────────────────────────────────── */

export type MarqueeCharity = {
  name: string;
  /** Explicit /public asset, tried first. */
  img?: string;
  /** The charity's own domain, used for live logo lookup. */
  domain?: string;
};

function sources(c: MarqueeCharity): string[] {
  const out: string[] = [];
  if (c.img) out.push(c.img);
  if (c.domain) {
    out.push(`https://logo.clearbit.com/${c.domain}?size=200`);
    out.push(`https://icons.duckduckgo.com/ip3/${c.domain}.ico`);
  }
  return out;
}

export function MarqueeLogo({
  charity,
  decorative = false,
}: {
  charity: MarqueeCharity;
  decorative?: boolean;
}) {
  const chain = useMemo(() => sources(charity), [charity]);
  const [resolved, setResolved] = useState<string | null>(null);
  const [failed, setFailed] = useState(chain.length === 0);

  useEffect(() => {
    let cancelled = false;
    let i = 0;
    const attempt = () => {
      if (cancelled) return;
      if (i >= chain.length) {
        setFailed(true);
        return;
      }
      const url = chain[i++];
      const probe = new window.Image();
      probe.referrerPolicy = "no-referrer";
      probe.onload = () => {
        if (cancelled) return;
        if (probe.naturalWidth >= 8 && probe.naturalHeight >= 8) {
          setResolved(url);
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
  }, [chain]);

  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={resolved}
        alt={decorative ? "" : charity.name}
        loading="lazy"
        draggable={false}
      />
    );
  }
  return (
    <span
      className="text-center text-sm font-semibold leading-snug select-none"
      style={{ color: "var(--cream-11)" }}
      aria-hidden={failed ? undefined : true}
    >
      {charity.name}
    </span>
  );
}
