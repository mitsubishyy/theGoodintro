# Cold-Start Gaps and Decisions

A fresh Claude session, handed only this repo and told "build v2," was simulated
twice (build/logic and design). It found the places it would be forced to GUESS,
the same failure mode that produced the poor v1. This file closes every one of
them: each gap is resolved with either a **decision** (implement as written) or a
**required artifact** (must be built/written before the tagged work). Tick them off.

Read with [`V2_BUILD_PLAN.md`](V2_BUILD_PLAN.md) (features) and
[`PRODUCTION_READINESS.md`](PRODUCTION_READINESS.md) (run-in-prod). The money
engine, reports logic, and build sequence were judged genuinely build-ready; the
items below are what was not.

## 1. Contradictions (resolved)

- [x] **Cycle reset: rolling 12 months from first payment, NOT calendar year.** Was
      the dangerous one (FACTS.md, the declared canonical file, had it wrong, as did
      MVP_SCOPE.md). Fixed in `FACTS.md` and `MVP_SCOPE.md` to match CALCULATIONS.md
      0.4/2.7/2.11, DATA_MODEL.md, and the verified engine. The live pricing page
      still has the "calendar year" copy bug (website, Issy's call to fix).
- [ ] **Vendor receipt wording.** The vendor pays a fee and receives an ordinary
      **business-expense tax invoice**, NOT a DGR gift receipt (the gift receipt goes
      to TheGoodIntro as donor). Reconcile the wording in `SECURITY_AND_COMPLIANCE.md`
      so it does not read as "no receipt at all."
- [ ] **CALCULATIONS status table is incomplete.** Its 0.5 table omits `proposed`,
      `reversed`, `voided`. Treat `STATE_MACHINES.md` as authoritative for states; the
      terminology bridge in CALCULATIONS.md covers the Sat/held naming.

## 2. Engineering decisions (made; implement exactly as written)

- **DEC-1 Keep amount, no rename.** Keep the existing `gift_record.admin_fee_cents`
  as the frozen keep. The DB to `GiftLedgerRow` mapping sets `keepCents =
  admin_fee_cents`. Do NOT add a duplicate `keep_amount_cents` column.
- **DEC-2 Charity payee columns.** Add to `charity`: `legal_entity_name text`,
  `dgr_confirmed_date date`, `payee_details jsonb`. Required for the charity payout
  report and the gift-ledger export (they do not exist in 0001).
- **DEC-3 gift_record additions.** Add `sat_date date`, `paid_date date`,
  `cycle_number int`, `position_n int`, `receipt_ref text`, `schedule_version text
  not null default 'v1'`. `markHeld` populates `cycle_number` and `position_n` from
  the resolved current cycle (DEC-4); backfill `sat_date` from `created_at`.
- **DEC-4 Cycle renewal = lazy at `markHeld`.** Resolve the vendor's current cycle
  as the one whose half-open `[started_at, ends_at)` window contains `now`. If none
  (a renewal boundary was crossed), create the next cycle row with
  `held_meetings_count = 0` and `ends_at` from `cycleEndsAt` (same-day / last-day
  fallback), then `position_n = held_in_current_cycle + 1`. The band cycle is
  independent of the access window: `billing.ts` re-purchase only extends
  `access_expires_at` and never creates band cycles.
- **DEC-5 Concurrency: no double-reserve.** Wrap credit reservation in a transaction
  with `SELECT ... FOR UPDATE` on the vendor's `credit_lot` rows (or a unique partial
  index enforcing one reservation per meeting). Closes the read-then-write race in
  `confirmMeeting`.
- **DEC-6 DB-level transition guards.** Add a transition-validation trigger on
  `meeting` and `gift_record` that encodes the STATE_MACHINES.md tables and rejects
  any transition not listed. `paid` is terminal (no `paid -> voided`); terminal
  states have no outgoing transitions. App-code checks are not sufficient alone.
- **DEC-7 Scheduled jobs = Supabase `pg_cron`.** Use `pg_cron` (not Vercel cron) for
  the daily auto-cancel of unpaid overcommit meetings at `payment_due_at` and for the
  reconciliation job (PRODUCTION_READINESS B4). Idempotent; writes an audit entry.
- **DEC-8 Late-payment to credit matching.** When a late invoice is paid, attach the
  new CreditLot to the vendor's **oldest** waiting meeting (status `confirmed`,
  `credit_lot_id` null) first.
- **DEC-9 actor_type gets `executive`.** Add `executive` to the `actor_type` enum; an
  exec's own signed-link action logs as `executive` (today it wrongly logs as
  `system`). EA actions stay `ea`.
- **DEC-10 Exec consent binding (closes the open item).** The binding IS a
  `consent_event` row written on the exec's first signed-link action, recording
  `{ token, timestamp, actor, terms_version }`. That row is the recorded acceptance.
  **[LEGAL]** confirms this is sufficient.
- **DEC-11 Reversible migrations = paired down-files.** Every `NNNN_name.sql` ships a
  paired `NNNN_name_down.sql` with the reverse DDL. Fix the dangling
  `0001_foundation_down.sql` reference (create it or remove the claim).

## 3. Required artifacts (must be BUILT/written; gated)

- [ ] **ART-1 Consolidated target schema.** A single end-state DDL (e.g.
      `supabase/SCHEMA.sql` or a clean migration set) so no one infers the schema from
      9 migrations. **Gate: before any schema work.**
- [x] **ART-2 Complete `.env.example`.** Every required env var, created this pass at
      `apps/platform/.env.example`. (Was only 3 Supabase vars before.)
- [ ] **ART-3 Per-integration contracts.** For Xero, Zoom, Microsoft Graph (Teams +
      Outlook), Google Calendar, Resend, Calendly, Slack: the webhook payload shape,
      signature/verification, OAuth scopes + encrypted token storage, and env vars.
      Written against the real APIs in the connected window. **Until written, treat
      each integration as not-implementable** (no guessing payloads).
- [ ] **ART-4 Test DB + CI.** A migrate+seed script and a CI workflow so the
      DB-backed tests run (Supabase CLI local or an ephemeral project; the seed is
      currently applied by hand via MCP). **Gate: PRODUCTION_READINESS D1/D2, Phase 1.**
- [ ] **ART-5 Shared UI kit + reference screens (the design fix).** Build
      `packages/ui` (it does not exist) with the shell and templates as real,
      imported, stateful components, fix the undefined `--cream-*` tokens, and build
      one polished reference screen per template T1 to T6. **Gate: Phase 0 in
      PORTAL_LAYOUT_BLUEPRINT.md, before any module build.** This is the single
      biggest fix for the "looks thin / inconsistent" problem.

## 4. Order

Contradictions (section 1) and ART-2 are done. Then ART-5 (Phase 0 design kit) and
ART-1 + ART-4 (Phase 1 foundation) before feature modules. ART-3 contracts are
written as each integration is built. The section-2 decisions are implemented at the
point their code is written. Nothing in section 3 may be skipped with a guess.
