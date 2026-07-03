# Platform load-performance notes

Scope: perceived + real page-load smoothness for `apps/platform` only. No business
logic, portal layout, money logic, or feature-flag behaviour changed. Local-only work
(no cloud Supabase migrate/reseed). Locked portal layouts are preserved
component-for-component; skeletons reuse the existing `@thegoodintro/ui` density.

## Baseline (before this work)

Captured on the `platform/photo-crop-step` branch, local `npm run build`.

- **Verification:** `npm run build` exit 0 (clean); platform `npm run lint` 0 errors
  (2 pre-existing warnings); platform `npm run test` 163 passed / 1 skipped
  (`email-smoke`, needs a live Resend key).
- **First-load JS (uncompressed), from `.next/diagnostics/route-bundle-stats.json`:**
  42 routes, min 502 KB, avg 572 KB, max 736 KB.
- **Heaviest routes:** `/account/security` 736 KB, `/exec/profile` 638 KB,
  `/exec/impact` 625 KB, `/exec/meetings` 625 KB, `/exec/my-charity` 621 KB,
  `/exec/requests` 615 KB, `/admin/meetings` 607 KB, `/admin/vendors/[id]` 592 KB,
  `/exec` 589 KB, `/admin/vendors` 583 KB.

### Where the time actually goes (server render, not bundle)

Bundle size is broadly uniform across routes (shared chunk dominates), so the felt
slowness is **server round-trips before first paint**, not JS download:

- **Admin shell** (`app/admin/layout.tsx`) blocked on `requireStaff()` +
  `getFlag("admin_shell")` **then 4 sidebar badge-count queries** before any chrome.
- **Vendor shell** (`app/vendor/layout.tsx`) blocked on `getVendor()` +
  `getFlag("vendor_shell")` then 2 sidebar badge counts + a cycle lookup.
- **Admin dashboard** (`app/admin/page.tsx`) ran a single `Promise.all` of ~21 queries
  before rendering anything.
- Most admin/vendor routes had **no `loading.tsx`**, so intra-section navigation showed
  a blank content area until the server page resolved.
- `getFlag` / `getVendor` / the staff lookup were re-run several times per request
  (layout + page + guards), each doing its own `getUser` round-trip.

Routes that could not be measured for missing local env: none. The full build
succeeds locally with `.env.local` present.

## Changes in this pass (see git diff for detail)

1. **Per-request memoization** — `React.cache()` on `getFlag`, `getVendor`, and the
   underlying staff-session lookup so a value repeated within one request costs one
   round-trip. RLS/session boundaries unchanged (each is still the signed-in user's
   client; cache is per-request only).
2. **Route loading states** — added `loading.tsx` skeletons for the high-traffic
   admin/vendor/exec routes that lacked them, reusing `Skeleton` / `PortalPage` /
   `ExecChromeSkeleton` at the locked density.
3. **Shells render sooner** — auth + flag gates stay server-side; the non-critical
   sidebar badge counts now hydrate client-side from a staff/vendor-gated route
   handler, so stable nav paints immediately and the small amber numbers appear a
   moment later.
4. **Streamed admin dashboard** — the dashboard chrome + ribbon paint first; each
   heavy widget is an async server component behind `Suspense` with a locked skeleton,
   so a slow widget no longer blocks the whole page. Data sources and calculations are
   unchanged.
5. **Narrower reads** — the vendor dashboard fetches only the executive cards it shows
   (locked shell renders 4) instead of every executive. Remaining broad reads that are
   required for exact filter/aggregate counts are kept for correctness and documented
   as TODOs below.
6. **Transition feel** — client filter/search/pagination controls wrap `router.push`
   in `useTransition` and surface a subtle pending state without layout shift.

## Verification (after this pass)

- `npm run build` (both apps) exit 0; platform `npm run lint` 0 errors (1
  pre-existing warning in the legacy `vendor/_components/dashboard.tsx`; the old
  `admin/page.tsx` unused-expression warning is gone); root `npm test`
  2/2 workspaces green (platform 163 passed / 1 skipped, same as baseline).
- First-load JS is essentially flat: 41 of 42 routes within ±1 KB. `/exec` alone
  rose 589 → 631 KB because adding its `loading.tsx` pulls the shared
  `ExecChromeSkeleton` into its first-load bundle — the exact cost its five
  sibling exec routes already carry. The wins here are server round-trips +
  streaming + perceived-load feedback, which bundle size does not capture.
- Not run: a live visual pass of the flag-gated shells. Admin/vendor shells only
  render with `admin_shell` / `vendor_shell` ON, and the exec dashboard needs
  `exec_dashboard` ON + a seeded exec, so a dev-server walkthrough needs the local
  Supabase stack booted + flags flipped + seed. Left to a follow-up with the DB up.

## Demo-readiness review (local runtime pass)

Booted the local Supabase stack (`scripts/test-db.sh`, synthetic seed), turned
`admin_shell` / `vendor_shell` / `exec_dashboard` / `request_loop` ON in the local
DB, and drove the dev server (demo auto-sign-in) with `curl`:

- `/admin` (staff) renders 200 with the full ribbon + **all seven** dashboard
  widgets streamed in (Booked meetings, Pending requests, Needs action,
  Distributions, Unresponded comms, Recent onboards, Gifts sent) — no widget
  dropped. `/vendor` (active vendor) renders the locked shell; `/exec` renders the
  exec dashboard.
- Auth gate intact: `/admin` and `/vendor` 307 → `/login` when unauthenticated.
- Badge endpoints: **401 unauthenticated**, and real counts when authenticated
  (`/api/admin/badges` → `{meetings, vendors, pendingRequests}`, `/api/vendor/badges`
  → `{requests, meetings}`), matching the seed.

**One regression found and fixed during this review.** A flag-parity guard added
during the review (`getFlag("admin_shell")` / `getFlag("vendor_shell")` inside the
badge route handlers) fail-closed the badges: `getFlag` reads false inside a route
handler even when the session is authenticated (Supabase-SSR cookie context differs
from a server component; the auth reads via `getStaff`/`getVendor` work fine). The
guard was reverted. The endpoints stay gated by role + RLS, and flag parity is
already enforced client-side because the sidebar only calls `badgeSource` when the
flag-gated shell is mounted.

Could **not** be verified without a real browser (no screenshot/pixel access here):
skeleton visual density vs. the locked screens, badge hydration having zero layout
shift, and the streamed-widget settle animation. These are low-risk (skeletons reuse
the existing `Skeleton`/`PortalPage` primitives at `--portal-*` tokens; the sidebar
renders no badge on the server and adds a small trailing pill on the client).

## Latency profiling + speed pass (server round-trips, not skeletons)

Profiled with temporary `[PERF]` timers (env-gated, since removed) around auth,
flags, and each route's query group, plus Next's per-request `application-code`
breakdown. Warm dev-mode, local Supabase, medians of 3.

**Where the real time went (before):**
- **`supabase.auth.getUser()` is the dominant fixed cost** — ~20-30ms app-side +
  ~20ms in the middleware (`proxy.ts`) on *every* request. Standard Supabase-SSR
  session validation; left as-is (auth boundary).
- **Feature flags did N separate round-trips per request** — admin routes read 2-3
  flags, each its own query (~5ms, spiking to ~28ms).
- **`/exec` was a sequential query waterfall** — `loadExecHome` fired ~11 queries
  mostly one-after-another (`exec.loadHome` ~40ms, and it had a redundant `allMtg`
  query duplicating the meetings read).
- **`/vendor`** ran the FY charity total sequentially *after* its main group.
- `/admin` streams 7 widget sections in parallel (~22 concurrent queries) — fast
  first paint, but heavy local-pool contention makes the settle ~130ms locally.

**Fixes (all preserve business/money/RLS/flag/layout logic):**
1. **Batched flag reads** (`lib/flags.ts`): one `loadFlags()` query per request
   (React `cache()`), `getFlag()` serves from the map. N flag round-trips → 1.
2. **Parallelised the exec waterfall** (`app/exec/data.ts`): ~11 sequential queries
   → 3 dependency-ordered `Promise.all` waves (execId-only reads · charity/cycles/
   meetings · gift reads), and dropped the redundant `allMtg` query (the meetings
   read already had that id set). Output verified byte-identical (only React Flight
   stream ids differ).
3. **Parallelised `vendorCharityForPeriod`** into the vendor dashboard's main
   `Promise.all` (it only needs `vendor.id` + the FY window).

**Before → after (warm, dev-mode local, `application-code` ms):**

| route | before | after | notes |
|---|---|---|---|
| `/admin` | ~137 | ~130 | 7 parallel sections + auth dominate; only 2 flags to batch |
| `/admin/vendors` | ~87 | ~74 | flag reads 3 → 1 |
| `/admin/meetings` | ~75 | ~65 | flag reads 3 → 1 (the trailing sequential `getFlag` is now a cache hit) |
| `/exec` | ~70 | ~51 | waterfall 11 → 3 waves + flags |
| `/vendor` | ~87 | ~84 | flags + charity parallelised (local pool contention hides most of it) |
| `/vendor/executives` | ~78 | ~77 | only 2 flags |
| `/api/admin/badges` | ~27 | ~26 | staff auth + 4 counts (already lean) |
| `/api/vendor/badges` | ~25 | ~26 | vendor auth + 2 counts (already lean) |

Query-group level (the DB round-trip cost, which scales ~10× on cloud RTT):
`exec.loadHome` **~40ms → 22.8ms (-43%)**; flags N×~5ms → one ~5ms `loadAll`.

**Local numbers understate the cloud win.** Each localhost round-trip is ~2-6ms, so
cutting round-trips saves only a few ms here. On cloud Supabase (Sydney, ~15-60ms
per round-trip) the same cuts are far larger: the exec waterfall alone drops ~8
sequential round-trips (~300ms saved at 40ms RTT), and flag-batching saves ~2
round-trips per admin route.

**Biggest remaining bottleneck: the double `getUser()`** (middleware + app-side,
~40-50ms combined). Not touched — it is the auth boundary. A future pass could
verify the JWT locally (`getClaims()` / asymmetric signing keys) to drop the
app-side network round-trip *without* weakening RLS; that needs an explicit
security review before changing the auth mechanism.

## Remaining performance TODOs (correctness kept over premature optimisation)

- `app/admin/vendors/page.tsx` and `app/vendor/executives/page.tsx` load the full
  collection to compute exact filter counts + distinct filter options. Correct at
  current scale; move to DB-level pagination + count/`distinct` queries once either
  collection grows past a few hundred rows. Admin-vendors count behaviour is asserted
  by `tests/admin-vendors-list.test.ts` — preserve it.
- `app/admin/page.tsx` still reads all meetings (status distribution) and all gift
  records (per-charity totals) to aggregate in JS, because the Supabase JS client
  cannot `GROUP BY` cleanly without an RPC. These now stream in their own widgets;
  replace with `count`/sum RPCs if the tables grow large.
