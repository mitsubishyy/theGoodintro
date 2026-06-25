-- ─────────────────────────────────────────────────────────────────────────
-- 0033  Feature flag for the money-invariants reconciliation job (B4)
--
-- PRODUCTION_READINESS B4: a daily safety-net job runs the CALCULATIONS §4
-- reconciliation invariants over live data and records drift. The job route
-- (/api/jobs/reconcile) is CRON_SECRET-gated and read-only, but per CHANGE_SAFETY
-- every new behaviour ships behind a flag, off by default — staging first, Issy
-- enables. Read authoritatively (service role) by the route, since a cron POST
-- has no user session.
--
-- Reversible: see supabase/down/0033_reconcile_job_flag_down.sql.
-- ─────────────────────────────────────────────────────────────────────────
insert into public.feature_flag (key, enabled, description) values
  ('reconcile_job', false,
   'Daily money-invariants reconciliation safety net (PRODUCTION_READINESS B4): a CRON_SECRET-gated /api/jobs/reconcile run of the CALCULATIONS section 4 invariants (the three-way gift split and the fee master identity) over the live ledgers, recording any drift. Off by default; staging first, Issy enables.')
on conflict (key) do nothing;
