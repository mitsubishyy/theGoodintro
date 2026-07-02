// ─────────────────────────────────────────────────────────────────────────
// Per-charity DEMO config — the single knob that themes this whole mini-site.
//
// This is a standalone "demo website" we share in a slide deck: it copies the
// real TheGoodIntro home + charities pages, then blurs out every charity EXCEPT
// the highlighted one, so a single charity can see exactly where and how they
// would appear. To spin up the demo for a different charity, change the two
// values below to match that charity's entry in lib/charities.ts and the home
// marquee/gallery lists. Nothing else needs editing.
// ─────────────────────────────────────────────────────────────────────────

/** Slug of the highlighted charity (matches lib/charities.ts + gallery slug). */
export const HIGHLIGHT_SLUG = "rspca-australia";

/** Display name of the highlighted charity (matches the home marquee `name`). */
export const HIGHLIGHT_NAME = "RSPCA Australia";

/** Inline style applied to every non-highlighted charity (black & white, dimmed). */
export const DIM_STYLE: React.CSSProperties = {
  filter: "grayscale(1) blur(1px)",
  opacity: 0.5,
  pointerEvents: "none",
  userSelect: "none",
};
