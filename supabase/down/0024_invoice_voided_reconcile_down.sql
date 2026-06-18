-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0024_invoice_voided_reconcile.sql.
--
-- Drops the reconcile detection column. Safe: it only annotates invoices the
-- reconcile job flagged for a manual reverse-unlock; no money, credit, or cycle
-- row depends on it (the unlock itself lives in credit_lot / vendor / cycle).
-- Dropping it loses only the "needs reverse-unlock" marker, which the next
-- reconcile run re-derives from Xero.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.invoice drop column if exists voided_in_xero_at;
