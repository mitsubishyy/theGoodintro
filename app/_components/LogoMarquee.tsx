/* ─────────────────────────────────────────────────────────────────────
   Auto-scrolling row of charity wordmarks. CSS-only animation (see
   .marquee in globals.css): scrolls rightward, pauses on hover, and
   falls back to a static wrapped row under prefers-reduced-motion.
   Each item links out to the charity's public register entry.
   ───────────────────────────────────────────────────────────────────── */

export type MarqueeItem = {
  name: string;
  href: string;
  serif?: boolean;
};

export function LogoMarquee({
  items,
  ariaLabel = "Example charities",
}: {
  items: MarqueeItem[];
  ariaLabel?: string;
}) {
  const all = [
    ...items.map((it) => ({ ...it, clone: false })),
    ...items.map((it) => ({ ...it, clone: true })),
  ];

  return (
    <div className="marquee" role="region" aria-label={ariaLabel}>
      <div className="marquee-track">
        {all.map((it, i) => (
          <a
            key={(it.clone ? "c-" : "") + it.name + i}
            href={it.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-hidden={it.clone || undefined}
            tabIndex={it.clone ? -1 : undefined}
            className={
              "shrink-0 whitespace-nowrap text-base md:text-lg font-semibold tracking-tight text-foreground/55 hover:text-primary transition-colors " +
              (it.clone ? "marquee-clone " : "") +
              (it.serif ? "font-serif italic" : "")
            }
          >
            {it.name}
          </a>
        ))}
      </div>
    </div>
  );
}
