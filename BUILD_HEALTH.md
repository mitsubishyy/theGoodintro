# Build Health (current snapshot)

A living audit of where the v2 platform build stands right now. This is the
"what already works, what doesn't, and what matters most" view, independent of
the "what to build" docs. For the canonical to-build checklist see
[`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md); this file is a tiered VIEW
on it, not a replacement. For the build sequence see
[`V2_BUILD_PLAN.md`](V2_BUILD_PLAN.md). For still-open ART gaps see
[`COLD_START_GAPS.md`](COLD_START_GAPS.md).

**Last reviewed:** 2026-06-02 (codebase walkthrough against a production-SaaS
engineering rubric, independent of the build chat).

## 1. Verified strong (do not re-litigate)

These are proven and locked. A new session should consume them, not rebuild.

- **`packages/pricing`.** Pure-TS money engine: 5 test files, 59 passing tests,
  10 reconciliation invariants. The platform consumes
  `@thegoodintro/pricing` and `@thegoodintro/pricing/reporting`; it never
  recomputes money figures locally.
- **Tenant isolation via Postgres RLS.** Hard boundary, not app-layer. Enforced
  by `is_staff()` / `current_vendor_id()` in
  [`supabase/migrations/0002_rls.sql`](supabase/migrations/0002_rls.sql), proven
  end-to-end in
  [`apps/platform/tests/rls.test.ts`](apps/platform/tests/rls.test.ts).
- **State-machine guards at the DB layer.**
  [`supabase/migrations/0012_transition_guards.sql`](supabase/migrations/0012_transition_guards.sql)
  rejects illegal Meeting and Gift transitions via triggers. Even direct SQL
  cannot break them.
- **Append-only audit log.** `audit_entry` protected by `prevent_mutation()`
  trigger; [`apps/platform/lib/audit.ts`](apps/platform/lib/audit.ts) is the
  single write point.
- **MFA scaffolding in place.** `/login/mfa` route and
  `getAuthenticatorAssuranceLevel` check in
  [`apps/platform/lib/auth.ts`](apps/platform/lib/auth.ts). The
  `admin_2fa_required` feature flag exists in the schema; enable for launch
  (PRODUCTION_READINESS C4).
- **Xero webhook signature-verified and idempotent.**
  [`apps/platform/app/api/webhooks/xero/route.ts`](apps/platform/app/api/webhooks/xero/route.ts).
- **Schema discipline.** 12 reversible migrations with a `supabase/down/`
  directory, money stored in integer cents, UTC `timestamptz`, soft deletes
  via `deleted_at`, hard FK constraints with cascade where appropriate.
- **DB-backed integration tests, not mocked.** 9 test files in
  [`apps/platform/tests/`](apps/platform/tests/) run against staging Supabase
  covering reserve/consume, overcommit, cycle renewal, RLS isolation,
  reporting aggregation, CSV export, request loop, content guard.
- **Reporting library is wired.**
  [`apps/platform/lib/reporting.ts`](apps/platform/lib/reporting.ts) and
  [`apps/platform/lib/reports.ts`](apps/platform/lib/reports.ts) consume the
  pricing-package aggregators. The UI route is the gap (Tier 2 below).
- **`check:copy` brand and pricing guard.** Mechanical enforcement of
  TheGoodIntro spelling and pricing-page-only money figures.

## 2. Where we are weak (priority tiers over PRODUCTION_READINESS item codes)

Each item below exists as a tracked task in
[`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) under its item code (A1,
C4, D1, etc.). Read the description there; this file only ranks them. Where a
gap is NEW (not yet tracked in PRODUCTION_READINESS), it is marked NEW with
the proposed code.

### Tier 1: blocks paid launch
Any one open means we cannot charge a vendor.

- **A1 Email sender.** Notifications are queued but never sent. Exec request
  email IS the product. Single highest-priority item.
- **C11 Password reset flow** (NEW; added to PRODUCTION_READINESS in this
  pass). No flow exists in the codebase today; no production SaaS ships
  without it.
- **A4 Xero webhook hardened to spec.** Route exists; signature verification
  is in place; finish idempotency-on-replay and the manual-reconcile
  fallback (full contract per DEC-13 in XERO_INTEGRATION_CONTRACT.md).
- **C1 RLS tests run in CI.** Tests exist; nothing runs them automatically
  on PR.
- **C4 Admin 2FA enforced** (flag flip + staff requirement).
- **D1 and D2: CI + test DB.** Until these run, every other gate is
  advisory rather than enforced.
- **B1 Sentry.** Money-path errors must not fail silently.

### Tier 2: blocks the first real meeting flow end-to-end
- **A5 Zoom/Teams attendance.** Otherwise Issy sets `held` manually; works
  but does not scale.
- **A6 Calendar bidirectional sync** (Google + Microsoft Graph).
- **A8 Three-step follow-up sequence.**
- **Reports UI** (the `/admin/reports` route to expose the existing
  reporting lib). Covered by V2_BUILD_PLAN section 6; not yet a
  PRODUCTION_READINESS code.
- **`held → reversed` and `released → voided` admin controls** in
  `lib/meetings.ts`. DB guards exist (migration 0012); the app surface to
  trigger them does not.
- **Auto-cancel job for unpaid overcommit meetings** (scheduled job; depends
  on Tier 1 / A8 cron infrastructure).

### Tier 3: operational quality and scaling
- **B3 Backups + PITR runbook in repo.**
- **B4 Reconciliation job** running the 10 invariants on schedule with
  alerts on drift.
- **B5 Uptime / health-check alerting.**
- **C7 Soft-delete + retain + purge** for Privacy Act erasure with audit
  retained.
- **C2 Webhook signature verification** on Zoom/Teams once A5 lands.
- **C5 Secret scan in CI.**
- **D3 Playwright E2E** of the full request → held → paid loop.
- **Vendor and Executive status transitions DB-guarded** (NEW gap, not in
  PRODUCTION_READINESS). Meeting and Gift transitions are guarded; Vendor
  and Executive are not, so an admin can force illegal status moves at the
  DB layer.
- **RBAC granularity** (NEW gap). The `vendor_user_role` enum is `owner` /
  `member` but is not enforced at action granularity; for example,
  "only owner can invite" is not coded.
- **Server-side input validation** at every server-action boundary (NEW
  gap). Hand-rolled string checks today; Zod or similar would tighten the
  boundary cheaply.

### Tier 4: defer beyond v1
- Realtime collaboration / live presence (deliberate; async-first).
- File uploads / attachments (no document workflow in DATA_MODEL).
- Public REST API surface (server actions suffice until external automation
  is requested).

## 3. Explicitly NOT building (the "missing on purpose" register)

When a future audit or stakeholder asks "why doesn't the platform have X?",
this is the answer. Do not propose adding these without re-opening scope
with Issy.

- **Kanban, task modal, project-as-task-collection.** TGI's unit is the
  Request → Meeting → GiftRecord lifecycle, not a Task. The lifecycle is
  fully modelled; a kanban surface would mis-shape the product.
- **Realtime collaboration, typing indicators, live presence.** Executives
  do not log in; vendors interact infrequently. Async-first by design.
- **Subtasks, labels, watchers.** Belong to a tracker, not a concierge
  platform.
- **Multi-project per organisation.** Vendor with up-to-6 seats is the org
  model; no project layer is needed.
- **Custom file storage / attachments.** No attachment workflow exists in
  DATA_MODEL.
- **Public REST API** (see Tier 4).

## 4. What an audit cannot tell you (limits of this snapshot)

A snapshot like this is intent-vs-code calibrated, not battle-tested. A
future session should not treat it as a guarantee.

- The test suite is not yet running in CI (D1 / D2), so "59 tests pass" is
  true *as of the last manual run*, not as of every commit.
- Server actions call the Supabase admin client, which **bypasses RLS**.
  Authz relies on every action checking `requireStaff()` or vendor scope
  before that call. A single forgotten gate would be a hole. A focused
  review pass over `apps/platform/app/**/actions.ts` is warranted before
  launch.
- Production load patterns (Xero webhook replay storms, Resend rate limits,
  concurrent vendor writes) are not exercised; the first month of real
  traffic will surface things this snapshot cannot.
- There is no money-path incident runbook. PRODUCTION_READINESS section 1
  flags this as a founder gate (ownership / on-call).

## 5. Update protocol

Update this file when:
- A Tier 1 item ships (move it down or remove it).
- A new structural gap is found (add it with a tier and, if it should be
  tracked, propose an item code into PRODUCTION_READINESS rather than
  re-listing it here).
- The "Not building" register changes (always with Issy's sign-off).

Do NOT update this file for every PR. The docs that move with code are the
spec files; this is the snapshot view. Re-audit on a real cadence
(quarterly, or before any pre-launch sign-off), not continuously.
