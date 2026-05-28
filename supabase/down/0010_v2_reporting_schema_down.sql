-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0010_v2_reporting_schema.sql. Reverses every additive change.
-- (Dropping a column also drops its indexes; the explicit index drops below are
-- belt-and-suspenders and guarded with IF EXISTS.)
-- ─────────────────────────────────────────────────────────────────────────

drop index if exists public.expense_date_idx;
drop index if exists public.expense_financial_year_idx;
drop index if exists public.invoice_purchase_date_idx;
drop index if exists public.gift_record_cycle_idx;
drop index if exists public.gift_record_paid_date_idx;
drop index if exists public.gift_record_sat_date_idx;

-- expense table: CASCADE removes its policies, trigger, and indexes.
drop table if exists public.expense cascade;

alter table public.invoice
  drop constraint if exists invoice_quantity_chk,
  drop constraint if exists invoice_gst_chk,
  drop constraint if exists invoice_fee_ex_gst_chk,
  drop column if exists purchase_date,
  drop column if exists quantity,
  drop column if exists gst_cents,
  drop column if exists fee_ex_gst_cents;

alter table public.gift_record
  drop constraint if exists gift_record_position_n_chk,
  drop constraint if exists gift_record_cycle_number_chk,
  drop column if exists schedule_version,
  drop column if exists receipt_ref,
  drop column if exists position_n,
  drop column if exists cycle_number,
  drop column if exists paid_date,
  drop column if exists sat_date;

alter table public.charity
  drop column if exists payee_details,
  drop column if exists dgr_confirmed_date,
  drop column if exists legal_entity_name;
