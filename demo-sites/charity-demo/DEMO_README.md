# Charity demo mini-site — blueprint

A standalone Next.js app that copies the real TheGoodIntro home + charities
pages, then **blurs out every charity except one highlighted charity**, so a
single charity can see exactly where and how they would appear on the site.
It has **nothing to do** with the live thegoodintro.com site or the platform —
it is its own isolated Vercel project, shared only inside a slide deck.

## Live (RSPCA)

- Production: https://thegoodintro-rspca.vercel.app
- Vercel project: `thegoodintro-rspca` (scope: mitsubishyys-projects)

## What is different from the real site

- **Top nav** trimmed to just **Home** and **Charities**.
- **Footer** stripped to brand + copyright.
- **Home page** marquee band + "Inspiring giving in action" gallery: every
  charity is blurred/dimmed except the highlighted one (crisp, emerald ring).
- **/charities**: 9 cards (3x3), highlighted charity top-left and clickable
  ("Read the profile"); the other 8 are blurred and inactive.
- **/charities/[slug]**: only the highlighted charity's profile is generated.
  The "Sources / Registration / not affiliated" fine-print block is removed,
  and the donate button reads "Donate to <charity> now" with an arrow, linking
  to the charity's real donation page.
- The **coming-soon wall** (middleware) is intentionally not included.

## Re-theme for a DIFFERENT charity (the whole point of the blueprint)

1. Copy this folder: `cp -R demo-sites/charity-demo demo-sites/<charity>-demo`.
2. Edit **`lib/demo.ts`** — set `HIGHLIGHT_SLUG` and `HIGHLIGHT_NAME` to the
   new charity. The slug must match its entry in `lib/charities.ts`; the name
   must match its `name` in the home marquee list
   (`app/_components/home/charity-marquee-section.tsx`).
3. Make sure that charity exists in `lib/charities.ts` (profile content),
   `charity-marquee-section.tsx`, and `charity-gallery-section.tsx`. All 15 of
   the shortlist are already present.
4. Add real photos by adding entries to that charity's `images` array in
   `lib/charities.ts` (portrait + 2 landscapes). Empty frames render an
   on-brand "Photo" placeholder.
5. Deploy as its own project:
   ```
   cd demo-sites/<charity>-demo
   vercel link --yes --project thegoodintro-<charity>
   vercel deploy --prod --yes
   ```

## Build / run locally

```
cd demo-sites/charity-demo
npx next build      # verify
npx next dev        # local preview at :3000
```
(node_modules was copied from the theGoodintro-main worktree; deps match.)
