-- ─────────────────────────────────────────────────────────────────────────
-- 0010 — v2 reporting schema (the columns + table the reporting layer needs).
--
-- Source of truth: V2_BUILD_PLAN.md §3, COLD_START_GAPS DEC-1/2/3, and the row
-- contracts in packages/pricing/src/reporting.ts (GiftLedgerRow / PurchaseRow /
-- ExpenseRow). Additive only; no destructive change to live data.
--
-- DEC-1: admin_fee_cents stays the frozen keep; we do NOT add keep_amount_cents.
-- Reversible: see 0010_v2_reporting_schema_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- ── charity: payee fields for the charity-payout report + gift-ledger export (DEC-2)
alter table public.charity
  add column if not exists legal_entity_name  text,
  add column if not exists dgr_confirmed_date date,
  add column if not exists payee_details      jsonb;

-- ── gift_record: period-reporting + snapshot columns (DEC-3; GiftLedgerRow)
alter table public.gift_record
  add column if not exists sat_date         date,
  add column if not exists paid_date        date,
  add column if not exists cycle_number     integer,
  add column if not exists position_n       integer,
  add column if not exists receipt_ref      text,
  add column if not exists schedule_version text not null default 'v1';

alter table public.gift_record
  add constraint gift_record_cycle_number_chk check (cycle_number is null or cycle_number >= 1),
  add constraint gift_record_position_n_chk   check (position_n is null or position_n >= 1);

-- Backfill existing rows (DEC-3):
--   * sat_date  <- created_at::date (the held date for revenue / 2.4 / 2.5 / 2.6).
--   * paid_date <- confirmation->>'paid_at' for already-paid gifts (null if the
--     evidence blob has no timestamp; the seed sets it explicitly).
-- cycle_number / position_n are intentionally left NULL for historical rows:
-- reconstructing past cycle boundaries would be a guess. markHeld populates them
-- for every gift created from now on (DEC-4, Phase 2).
update public.gift_record set sat_date = created_at::date where sat_date is null;
update public.gift_record
   set paid_date = (confirmation->>'paid_at')::date
 where status = 'paid' and paid_date is null and (confirmation ->> 'paid_at') is not null;

-- ── invoice: purchase-ledger / GST-BAS columns (§3; PurchaseRow)
-- fee_ex_gst_cents = quantity x 150000; gst_cents = quantity x 15000;
-- purchase_date is the sale date (GST + cash filter). Left nullable + backfilled
-- by the billing layer (Phase 2); not derived here to avoid guessing past dates.
alter table public.invoice
  add column if not exists fee_ex_gst_cents integer,
  add column if not exists gst_cents        integer,
  add column if not exists quantity         integer,
  add column if not exists purchase_date    date;

alter table public.invoice
  add constraint invoice_fee_ex_gst_chk check (fee_ex_gst_cents is null or fee_ex_gst_cents >= 0),
  add constraint invoice_gst_chk        check (gst_cents is null or gst_cents >= 0),
  add constraint invoice_quantity_chk   check (quantity is null or quantity >= 0);

-- ── expense: the expense ledger (§3; ExpenseRow). Required for P&L + BAS (2.18).
create table if not exists public.expense (
  id                     uuid primary key default gen_random_uuid(),
  date                   date not null,
  category               text not null,
  payee                  text not null,
  amount_ex_gst_cents    integer not null check (amount_ex_gst_cents >= 0),
  gst_input_credit_cents integer not null default 0 check (gst_input_credit_cents >= 0),
  total_inc_gst_cents    integer not null check (total_inc_gst_cents >= 0),
  financial_year         text not null,   -- e.g. 'FY2026' (1 Jul..30 Jun)
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

create trigger t_expense_updated
  before update on public.expense
  for each row execute function public.set_updated_at();

-- expense is financial and staff-only (never vendor-visible).
alter table public.expense enable row level security;
alter table public.expense force row level security;
create policy p_select on public.expense for select to authenticated using (private.is_staff());
create policy p_insert on public.expense for insert to authenticated with check (private.is_staff());
create policy p_update on public.expense for update to authenticated using (private.is_staff()) with check (private.is_staff());
create policy p_delete on public.expense for delete to authenticated using (private.is_staff());

-- ── period-filter indexes for the new date columns
create index if not exists gift_record_sat_date_idx  on public.gift_record (sat_date);
create index if not exists gift_record_paid_date_idx  on public.gift_record (paid_date);
create index if not exists gift_record_cycle_idx       on public.gift_record (cycle_number);
create index if not exists invoice_purchase_date_idx   on public.invoice (purchase_date);
create index if not exists expense_financial_year_idx  on public.expense (financial_year);
create index if not exists expense_date_idx            on public.expense (date);
