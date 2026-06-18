-- ─────────────────────────────────────────────────────────────────────────
-- 0024 — invoice.voided_in_xero_at (Xero reconcile safety net; B4, DEC-13).
--
-- The daily reconcile job (the paid-webhook's backstop, PRODUCTION_READINESS
-- B4, DEC-7 pg_cron) sweeps our open invoices against Xero. When Xero reports
-- an invoice VOIDED, this column records when we first detected it:
--
--   * on a PAID invoice (credits already unlocked) it marks a MANUAL
--     reverse-unlock — surfaced in the admin "Needs action" queue, derived from
--     `status='paid' AND voided_in_xero_at IS NOT NULL`. v1 NEVER auto-reverses
--     (reversal binding is Issy's policy call, V2_BUILD_PLAN §7); the operator
--     handles it and the item clears when the invoice is reversed.
--   * on a never-paid invoice the reconcile instead sets status='void' (no money
--     moved); the stamp is kept for the audit trail.
--
-- Stamped once (the job only writes it when null), so daily runs never duplicate
-- the task or its alert. Nullable, no default — null = not voided in Xero.
-- Reversible: see ../down/0024_invoice_voided_reconcile_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.invoice
  add column voided_in_xero_at timestamptz;

comment on column public.invoice.voided_in_xero_at is
  'Set by the daily Xero reconcile job when Xero reports this invoice VOIDED. On a PAID invoice it flags a manual reverse-unlock (admin Needs action; never auto-reversed, V2_BUILD_PLAN §7). Null = not voided in Xero.';
