-- ═════════════════════════════════════════════════════════════════════════
-- theGoodintro platform — CONSOLIDATED TARGET SCHEMA (ART-1)
--
-- This is the single end-state DDL for the platform database, so no one has to
-- infer the schema from nine separate migrations. It is the source of truth for
-- structure. It folds together:
--   * the applied migrations 0001..0009 in their FINAL state (note: 0002's RLS
--     policies were entirely replaced by 0003, so only the 0003 consolidated
--     set appears here; 0004 made feature_flag world-readable to authenticated),
--   * the v2 schema additions required by COLD_START_GAPS.md (DEC-1..DEC-9) and
--     V2_BUILD_PLAN.md section 3. Every v2 delta is tagged `-- [v2 DEC-n]` or
--     `-- [v2 §3]` so it is obvious what is new versus what already shipped.
--
-- USAGE
--   * Reference / review document, and the one-shot way to stand up a fresh test
--     DB (ART-4, local Supabase CLI). It is NOT the apply path for staging/prod:
--     the existing DBs already have 0001..0009, so the v2 deltas ship to them as
--     numbered migrations 0010+ (each with a paired _down.sql, DEC-11), authored
--     AFTER Issy signs off on this file.
--   * Nothing in here is applied to any database until that sign-off.
--
-- CONVENTIONS (DATA_MODEL.md)
--   * Money is whole AUD cents (integers), never floats.
--   * Times are timestamptz (UTC); date-only money filters use `date`.
--   * Records snapshot their own truth; history tables (audit, consent) are
--     append-only (CHANGE_SAFETY.md).
--   * Enums are lower_snake_case fixed value lists.
--
-- EXTENSIONS
--   * gen_random_uuid() is in Postgres core (13+) on Supabase.
--   * pgcrypto lives in the `extensions` schema (used as extensions.gen_random_bytes
--     in the request-loop RPC, and extensions.crypt/gen_salt in the staging seed).
-- ═════════════════════════════════════════════════════════════════════════

-- ── Schemas ────────────────────────────────────────────────────────────────
-- `private` holds the RLS identity helpers so they are NOT exposed on the
-- PostgREST RPC surface (0003 hardening).
create schema if not exists private;
grant usage on schema private to authenticated;

-- ── Helper functions (search_path pinned, 0003 hardening) ───────────────────

-- Keep updated_at honest on every mutation.
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Append-only guard: block UPDATE/DELETE on history tables (logs/consent).
create or replace function public.prevent_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Table % is append-only; % is not permitted', tg_table_name, tg_op;
end;
$$;

-- ── Enum types (fixed value lists from DATA_MODEL.md) ───────────────────────

create type vendor_status as enum
  ('signed_up','call_booked','approved','paid','active','dormant','churned');
create type vendor_user_role as enum ('owner','member');
create type vendor_user_status as enum ('invited','active','removed');
create type invite_status as enum ('sent','accepted','expired');
create type executive_status as enum ('invited','set_up','active','paused','left');
create type charity_dgr_status as enum ('endorsed','unverified','revoked');
create type application_outcome as enum ('pending','approved','declined');
create type invoice_kind as enum ('credit_purchase','overcommit_topup');
create type invoice_status as enum ('draft','sent','paid','void');
create type request_status as enum ('submitted','accepted','declined','closed');
create type meeting_status as enum
  ('proposed','confirmed','held','no_show','cancelled','reversed');
create type meeting_outcome_source as enum ('zoom_teams_api','vendor_reported','admin');
create type gift_band as enum ('band_1','band_2','band_3','band_4');
create type gift_status as enum ('released','paid','voided');
create type staff_role as enum ('super_admin','staff');
-- [v2 DEC-9] `executive` added (last, to match ALTER TYPE ... ADD VALUE ordering
-- on already-migrated DBs). An exec's own signed-link action logs as `executive`,
-- not `system`; EA actions stay `ea`. The act_on_request_token RPC is updated to
-- use it in the Phase-2 state-machine work.
create type actor_type as enum ('staff','vendor_user','ea','system','executive');
create type notification_recipient_type as enum ('vendor_user','executive','ea','staff');
create type notification_channel as enum ('email','in_app','slack');
create type notification_status as enum ('queued','sent','failed');
create type email_token_status as enum ('active','consumed','revoked');
create type consent_actor as enum ('executive','ea_acting_for_exec');

-- ── People & org ────────────────────────────────────────────────────────────

create table public.staff (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique references auth.users(id) on delete set null,
  name          text not null,
  email         text not null unique,
  role          staff_role not null default 'staff',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

create table public.charity (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  abn                text,
  dgr_status         charity_dgr_status not null default 'unverified',
  -- [v2 DEC-2] payee fields needed by the charity-payout report and the
  -- gift-ledger export (absent in 0001).
  legal_entity_name  text,
  dgr_confirmed_date date,
  payee_details      jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  deleted_at         timestamptz
);

create table public.ea (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);

create table public.executive (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  title               text,
  company             text,
  photo_url           text,
  context_notes       text,
  default_charity_id  uuid references public.charity(id),
  ea_id               uuid references public.ea(id),
  status              executive_status not null default 'invited',
  suggested_cadence   text,
  primary_email       text not null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  deleted_at          timestamptz
);

create table public.ea_assignment (
  id            uuid primary key default gen_random_uuid(),
  ea_id         uuid not null references public.ea(id) on delete cascade,
  executive_id  uuid not null references public.executive(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (ea_id, executive_id)
);

create table public.vendor (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email_domain      text not null unique,
  status            vendor_status not null default 'signed_up',
  owner_user_id     uuid,  -- FK added after vendor_user exists (circular)
  access_expires_at timestamptz,
  cycle_started_at  timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz
);

create table public.vendor_user (
  id            uuid primary key default gen_random_uuid(),
  vendor_id     uuid not null references public.vendor(id) on delete cascade,
  auth_user_id  uuid unique references auth.users(id) on delete set null,
  email         text not null unique,
  name          text not null,
  role          vendor_user_role not null default 'member',
  status        vendor_user_status not null default 'invited',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);

alter table public.vendor
  add constraint vendor_owner_user_fk
  foreign key (owner_user_id) references public.vendor_user(id);

create table public.invite (
  id                  uuid primary key default gen_random_uuid(),
  vendor_id           uuid not null references public.vendor(id) on delete cascade,
  invited_email       text not null,
  invited_by_user_id  uuid not null references public.vendor_user(id),
  token               text not null unique,
  status              invite_status not null default 'sent',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── Vetting & access ──────────────────────────────────────────────────────

create table public.application (
  id                uuid primary key default gen_random_uuid(),
  vendor_id         uuid not null references public.vendor(id) on delete cascade,
  answers           jsonb not null default '{}'::jsonb,
  calendly_event_id text,
  outcome           application_outcome not null default 'pending',
  decided_by        uuid references public.staff(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Money: invoices, cycles, credits ────────────────────────────────────────

create table public.invoice (
  id                uuid primary key default gen_random_uuid(),
  vendor_id         uuid not null references public.vendor(id) on delete cascade,
  xero_invoice_id   text unique,
  kind              invoice_kind not null default 'credit_purchase',
  line_items        jsonb not null default '[]'::jsonb,
  amount_cents      integer not null check (amount_cents >= 0),
  status            invoice_status not null default 'draft',
  -- [v2 §3] Purchase-ledger / GST-BAS columns (PurchaseRow contract in
  -- packages/pricing/reporting.ts). fee_ex_gst = quantity x 150000,
  -- gst = quantity x 15000; purchase_date is the sale date (GST + cash filter).
  fee_ex_gst_cents  integer check (fee_ex_gst_cents is null or fee_ex_gst_cents >= 0),
  gst_cents         integer check (gst_cents is null or gst_cents >= 0),
  quantity          integer check (quantity is null or quantity >= 0),
  purchase_date     date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.cycle (
  id                   uuid primary key default gen_random_uuid(),
  vendor_id            uuid not null references public.vendor(id) on delete cascade,
  started_at           timestamptz not null,
  ends_at              timestamptz not null,
  held_meetings_count  integer not null default 0 check (held_meetings_count >= 0),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table public.credit_lot (
  id                  uuid primary key default gen_random_uuid(),
  vendor_id           uuid not null references public.vendor(id) on delete cascade,
  quantity            integer not null check (quantity > 0),
  quantity_remaining  integer not null check (quantity_remaining >= 0),
  invoice_id          uuid references public.invoice(id),
  purchased_at        timestamptz not null default now(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (quantity_remaining <= quantity)
);

-- ── Booking loop ──────────────────────────────────────────────────────────

create table public.request (
  id                   uuid primary key default gen_random_uuid(),
  vendor_id            uuid not null references public.vendor(id) on delete cascade,
  requested_by_user_id uuid not null references public.vendor_user(id),
  executive_id         uuid not null references public.executive(id),
  q1_what              text not null check (char_length(q1_what) <= 300),
  q2_why               text not null check (char_length(q2_why) <= 300),
  attendee             jsonb,
  meeting_minutes      integer not null default 45 check (meeting_minutes > 0),
  status               request_status not null default 'submitted',
  decline_reason       text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

create table public.meeting (
  id              uuid primary key default gen_random_uuid(),
  request_id      uuid not null references public.request(id) on delete cascade,
  charity_id      uuid references public.charity(id),
  scheduled_at    timestamptz,
  credit_lot_id   uuid references public.credit_lot(id),
  payment_due_at  timestamptz,
  join_url        text,
  status          meeting_status not null default 'proposed',
  outcome_source  meeting_outcome_source,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- One canonical gift record per held meeting. Amount locks at completion.
create table public.gift_record (
  id                   uuid primary key default gen_random_uuid(),
  meeting_id           uuid not null unique references public.meeting(id) on delete cascade,
  charity_id           uuid references public.charity(id),
  band_at_completion   gift_band not null,
  charity_amount_cents integer not null check (charity_amount_cents >= 0),
  -- [v2 DEC-1] admin_fee_cents IS the frozen keep (= 150000 - charity_amount_cents).
  -- The DB->GiftLedgerRow mapping sets keepCents = admin_fee_cents. Do NOT add a
  -- duplicate keep_amount_cents column (overrides V2_BUILD_PLAN §3's tentative wording).
  admin_fee_cents      integer not null check (admin_fee_cents >= 0),
  status               gift_status not null default 'released',
  confirmation         jsonb,
  -- [v2 DEC-3] period-reporting + snapshot columns (GiftLedgerRow contract).
  -- sat_date: held date (revenue / 2.4 / 2.5 / 2.6 filter), backfilled from
  --   created_at::date for existing rows.
  -- paid_date: payment date (2.2 / 2.13 filter), set when status -> paid.
  -- cycle_number / position_n: the vendor cycle + n-within-cycle, set by markHeld
  --   from the cycle resolved per DEC-4.
  -- schedule_version: the band-schedule version frozen at "held" (snapshot rule).
  sat_date             date,
  paid_date            date,
  cycle_number         integer check (cycle_number is null or cycle_number >= 1),
  position_n           integer check (position_n is null or position_n >= 1),
  receipt_ref          text,
  schedule_version     text not null default 'v1',
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- [v2 §3] Expense ledger (new). Required for the P&L / operating-profit report
-- and BAS (CALCULATIONS 2.18; ExpenseRow contract in reporting.ts). Staff-only.
create table public.expense (
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

-- ── Email action tokens & consent (EMAIL_ACTIONS.md) ────────────────────────

create table public.email_action_token (
  id          uuid primary key default gen_random_uuid(),
  request_id  uuid not null references public.request(id) on delete cascade,
  token       text not null unique,
  status      email_token_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.consent_event (
  id            uuid primary key default gen_random_uuid(),
  request_id    uuid not null references public.request(id) on delete cascade,
  token         text not null,
  actor         consent_actor not null,
  action        text not null,
  terms_version text not null,
  consented_at  timestamptz not null default now(),
  ip            text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

-- ── System: audit, notifications, feature flags ─────────────────────────────

create table public.audit_entry (
  id                       uuid primary key default gen_random_uuid(),
  actor_type               actor_type not null,
  actor_id                 uuid,
  acting_for_executive_id  uuid references public.executive(id),
  action                   text not null,
  target_type              text,
  target_id                uuid,
  metadata                 jsonb not null default '{}'::jsonb,
  created_at               timestamptz not null default now()
);

create table public.notification (
  id              uuid primary key default gen_random_uuid(),
  recipient_type  notification_recipient_type not null,
  recipient_id    uuid,
  channel         notification_channel not null,
  event           text not null,
  status          notification_status not null default 'queued',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- CHANGE_SAFETY.md: every new behaviour ships behind a flag, off by default.
create table public.feature_flag (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  enabled     boolean not null default false,
  description text,
  updated_by  uuid references public.staff(id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Indexes on hot foreign keys / lookups (0001 + 0003 + v2) ────────────────

create index vendor_user_vendor_id_idx       on public.vendor_user (vendor_id);
create index vendor_user_auth_user_id_idx     on public.vendor_user (auth_user_id);
create index invite_vendor_id_idx             on public.invite (vendor_id);
create index application_vendor_id_idx        on public.application (vendor_id);
create index invoice_vendor_id_idx            on public.invoice (vendor_id);
create index cycle_vendor_id_idx              on public.cycle (vendor_id);
create index credit_lot_vendor_id_idx         on public.credit_lot (vendor_id);
create index credit_lot_invoice_id_idx        on public.credit_lot (invoice_id);
create index request_vendor_id_idx            on public.request (vendor_id);
create index request_executive_id_idx         on public.request (executive_id);
create index request_status_idx               on public.request (status);
create index meeting_request_id_idx           on public.meeting (request_id);
create index meeting_status_idx               on public.meeting (status);
create index gift_record_status_idx           on public.gift_record (status);
create index email_action_token_request_id_idx on public.email_action_token (request_id);
create index consent_event_request_id_idx     on public.consent_event (request_id);
create index audit_entry_target_idx           on public.audit_entry (target_type, target_id);
create index notification_recipient_idx       on public.notification (recipient_type, recipient_id);
create index executive_status_idx             on public.executive (status);

-- Covering indexes for the remaining FKs (0003 advisor 0001).
create index application_decided_by_idx       on public.application (decided_by);
create index audit_entry_acting_for_exec_idx   on public.audit_entry (acting_for_executive_id);
create index ea_assignment_executive_id_idx    on public.ea_assignment (executive_id);
create index executive_default_charity_id_idx  on public.executive (default_charity_id);
create index executive_ea_id_idx               on public.executive (ea_id);
create index feature_flag_updated_by_idx       on public.feature_flag (updated_by);
create index gift_record_charity_id_idx        on public.gift_record (charity_id);
create index invite_invited_by_user_id_idx     on public.invite (invited_by_user_id);
create index meeting_charity_id_idx            on public.meeting (charity_id);
create index meeting_credit_lot_id_idx         on public.meeting (credit_lot_id);
create index request_requested_by_user_id_idx  on public.request (requested_by_user_id);
create index vendor_owner_user_id_idx          on public.vendor (owner_user_id);

-- [v2 §3] Period-report filter indexes for the new date columns.
create index gift_record_sat_date_idx          on public.gift_record (sat_date);
create index gift_record_paid_date_idx          on public.gift_record (paid_date);
create index gift_record_cycle_idx              on public.gift_record (cycle_number);
create index invoice_purchase_date_idx          on public.invoice (purchase_date);
create index expense_financial_year_idx         on public.expense (financial_year);
create index expense_date_idx                   on public.expense (date);

-- ── updated_at triggers ─────────────────────────────────────────────────────

create trigger t_staff_updated        before update on public.staff        for each row execute function public.set_updated_at();
create trigger t_charity_updated       before update on public.charity      for each row execute function public.set_updated_at();
create trigger t_ea_updated            before update on public.ea           for each row execute function public.set_updated_at();
create trigger t_executive_updated     before update on public.executive    for each row execute function public.set_updated_at();
create trigger t_vendor_updated        before update on public.vendor       for each row execute function public.set_updated_at();
create trigger t_vendor_user_updated   before update on public.vendor_user  for each row execute function public.set_updated_at();
create trigger t_invite_updated        before update on public.invite       for each row execute function public.set_updated_at();
create trigger t_application_updated   before update on public.application  for each row execute function public.set_updated_at();
create trigger t_invoice_updated       before update on public.invoice      for each row execute function public.set_updated_at();
create trigger t_cycle_updated         before update on public.cycle        for each row execute function public.set_updated_at();
create trigger t_credit_lot_updated    before update on public.credit_lot   for each row execute function public.set_updated_at();
create trigger t_request_updated       before update on public.request      for each row execute function public.set_updated_at();
create trigger t_meeting_updated       before update on public.meeting      for each row execute function public.set_updated_at();
create trigger t_gift_record_updated   before update on public.gift_record  for each row execute function public.set_updated_at();
create trigger t_expense_updated       before update on public.expense      for each row execute function public.set_updated_at();  -- [v2 §3]
create trigger t_email_token_updated   before update on public.email_action_token for each row execute function public.set_updated_at();
create trigger t_notification_updated  before update on public.notification for each row execute function public.set_updated_at();
create trigger t_feature_flag_updated  before update on public.feature_flag for each row execute function public.set_updated_at();

-- ── Append-only guards on history tables ────────────────────────────────────

create trigger t_audit_entry_noupdate  before update on public.audit_entry  for each row execute function public.prevent_mutation();
create trigger t_audit_entry_nodelete  before delete on public.audit_entry  for each row execute function public.prevent_mutation();
create trigger t_consent_noupdate      before update on public.consent_event for each row execute function public.prevent_mutation();
create trigger t_consent_nodelete      before delete on public.consent_event for each row execute function public.prevent_mutation();

-- ── [v2 DEC-6] State-machine transition guards (defense in depth) ───────────
-- App-code checks alone are not enough; encode STATE_MACHINES.md at the DB level
-- so an illegal status move is impossible even by direct SQL. Guards fire only on
-- UPDATE of the status column (INSERT sets the initial state; a status that does
-- not change is always allowed, so non-status updates pass freely). Terminal
-- states have NO outgoing transition.
--
-- `proposed -> cancelled` IS allowed: a request that was accepted (meeting =
-- proposed) can be withdrawn before a time is confirmed. No credit is reserved at
-- proposed, so it is money-safe (nothing to release). Issy approved 2026-05-28;
-- STATE_MACHINES.md updated to match.

create or replace function public.guard_meeting_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;  -- no status change (e.g. join_url / scheduled_at edit)
  end if;
  if (old.status::text, new.status::text) in (
    ('proposed','confirmed'),
    ('confirmed','held'),
    ('confirmed','no_show'),
    ('confirmed','cancelled'),
    ('held','reversed'),
    ('proposed','cancelled')   -- request withdrawn before a time is confirmed (Issy approved 2026-05-28)
  ) then
    return new;
  end if;
  raise exception 'illegal meeting transition: % -> %', old.status, new.status;
end;
$$;

create trigger t_meeting_guard
  before update on public.meeting
  for each row execute function public.guard_meeting_transition();

create or replace function public.guard_gift_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;
  end if;
  -- `paid` is terminal: no paid -> voided (DEC-6). `voided` is terminal.
  if (old.status::text, new.status::text) in (
    ('released','paid'),
    ('released','voided')
  ) then
    return new;
  end if;
  raise exception 'illegal gift_record transition: % -> %', old.status, new.status;
end;
$$;

create trigger t_gift_record_guard
  before update on public.gift_record
  for each row execute function public.guard_gift_transition();

-- NOTE [v2 DEC-5]: the no-double-reserve concurrency fix is NOT a column. It is a
-- transactional reserve path (SELECT ... FOR UPDATE on the vendor's credit_lot
-- rows inside a SECURITY DEFINER reserve RPC, replacing the read-then-write in
-- confirmMeeting). It is authored with the state-machine work in Phase 2 and is
-- intentionally absent here so this file stays a faithful data schema.

-- ════════════════════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (final consolidated state from 0003 + 0004; 0002 superseded)
-- ════════════════════════════════════════════════════════════════════════════
-- RLS is the hard tenant boundary: a vendor user can only READ their own org's
-- rows; staff (admin) see everything; all writes are mediated server-side
-- (service_role bypasses RLS). These policies are part of the test suite (C1).

-- Identity helpers in the unexposed `private` schema (SECURITY DEFINER).
create or replace function private.current_vendor_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select vu.vendor_id
  from public.vendor_user vu
  where vu.auth_user_id = (select auth.uid())
    and vu.status = 'active'
    and vu.deleted_at is null
  limit 1;
$$;

create or replace function private.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff s
    where s.auth_user_id = (select auth.uid())
      and s.deleted_at is null
  );
$$;

revoke all on function private.current_vendor_id() from public;
revoke all on function private.is_staff() from public;
grant execute on function private.current_vendor_id() to authenticated;
grant execute on function private.is_staff() to authenticated;

-- Enable + force RLS on every public table (including the v2 `expense` table).
do $$
declare t text;
begin
  foreach t in array array[
    'staff','charity','ea','executive','ea_assignment','vendor','vendor_user',
    'invite','application','invoice','cycle','credit_lot','request','meeting',
    'gift_record','expense','email_action_token','consent_event','audit_entry',
    'notification','feature_flag'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
  end loop;
end $$;

-- Staff-only tables: staff do everything, vendors see nothing.
-- [v2 §3] `expense` joins this group (financial, never vendor-visible).
do $$
declare t text;
begin
  foreach t in array array[
    'staff','ea','ea_assignment','expense','email_action_token','consent_event',
    'audit_entry','feature_flag'
  ] loop
    execute format('create policy p_select on public.%I for select to authenticated using (private.is_staff());', t);
    execute format('create policy p_insert on public.%I for insert to authenticated with check (private.is_staff());', t);
    execute format('create policy p_update on public.%I for update to authenticated using (private.is_staff()) with check (private.is_staff());', t);
    execute format('create policy p_delete on public.%I for delete to authenticated using (private.is_staff());', t);
  end loop;
end $$;

-- Vendor-readable tables: staff write everything; vendors read their scope.
-- (Vendor self-serve writes go through the server with service_role + validation.)
do $$
declare t text;
begin
  foreach t in array array[
    'vendor','vendor_user','invite','application','invoice','cycle',
    'credit_lot','request','meeting','gift_record','notification',
    'executive','charity'
  ] loop
    execute format('create policy p_insert on public.%I for insert to authenticated with check (private.is_staff());', t);
    execute format('create policy p_update on public.%I for update to authenticated using (private.is_staff()) with check (private.is_staff());', t);
    execute format('create policy p_delete on public.%I for delete to authenticated using (private.is_staff());', t);
  end loop;
end $$;

-- Per-table SELECT scope: staff OR the vendor's own rows.
create policy p_select on public.vendor
  for select to authenticated
  using (private.is_staff() or id = private.current_vendor_id());

create policy p_select on public.vendor_user
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.invite
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.application
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.invoice
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.cycle
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.credit_lot
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.request
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.meeting
  for select to authenticated
  using (
    private.is_staff() or exists (
      select 1 from public.request r
      where r.id = meeting.request_id and r.vendor_id = private.current_vendor_id()
    )
  );

create policy p_select on public.gift_record
  for select to authenticated
  using (
    private.is_staff() or exists (
      select 1 from public.meeting m
      join public.request r on r.id = m.request_id
      where m.id = gift_record.meeting_id and r.vendor_id = private.current_vendor_id()
    )
  );

create policy p_select on public.notification
  for select to authenticated
  using (
    private.is_staff() or (
      recipient_type = 'vendor_user'
      and recipient_id in (
        select vu.id from public.vendor_user vu
        where vu.vendor_id = private.current_vendor_id()
      )
    )
  );

-- Paid/active vendors see the active executive list and the charities behind them.
create policy p_select on public.executive
  for select to authenticated
  using (
    private.is_staff()
    or (private.current_vendor_id() is not null and status = 'active')
  );

create policy p_select on public.charity
  for select to authenticated
  using (private.is_staff() or private.current_vendor_id() is not null);

-- feature_flag: flags are operational config; any authenticated user may READ so
-- the app can gate UI (0004). Writes stay staff-only (the p_insert/update/delete
-- above). This SELECT policy replaces the staff-only one for feature_flag.
drop policy if exists p_select on public.feature_flag;
create policy p_select on public.feature_flag
  for select to authenticated using (true);

-- ════════════════════════════════════════════════════════════════════════════
-- RPCs (SECURITY DEFINER) — self-serve writes that RLS would otherwise block
-- (0006 sign-up, 0007 application, 0008 request loop). The token is the secret
-- for the unauthenticated exec path.
-- ════════════════════════════════════════════════════════════════════════════

-- Generic / free email domains that may not own a vendor org (0006).
create or replace function private.is_generic_email_domain(p_domain text)
returns boolean language sql immutable set search_path = '' as $$
  select lower(p_domain) = any (array[
    'gmail.com','googlemail.com','outlook.com','hotmail.com','live.com',
    'yahoo.com','yahoo.com.au','icloud.com','me.com','mac.com','aol.com',
    'proton.me','protonmail.com','gmx.com','mail.com','yandex.com','msn.com',
    'ymail.com','pm.me','zoho.com','fastmail.com'
  ]);
$$;
grant execute on function private.is_generic_email_domain(text) to authenticated;

-- Create the caller's vendor org (idempotent). Owner seat is created active (0006).
create or replace function public.signup_vendor(p_company text, p_full_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_domain text;
  v_vendor_id uuid;
  v_user_id uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if coalesce(btrim(p_company), '') = '' then raise exception 'company_required'; end if;

  select lower(email) into v_email from auth.users where id = v_uid;
  if v_email is null then raise exception 'no_email_on_account'; end if;
  v_domain := split_part(v_email, '@', 2);

  if private.is_generic_email_domain(v_domain) then
    raise exception 'work_email_required';
  end if;

  select vendor_id into v_vendor_id
  from public.vendor_user where auth_user_id = v_uid and deleted_at is null limit 1;
  if v_vendor_id is not null then return v_vendor_id; end if;

  if exists (select 1 from public.vendor where email_domain = v_domain and deleted_at is null) then
    raise exception 'org_exists_for_domain';
  end if;

  insert into public.vendor (name, email_domain, status)
    values (btrim(p_company), v_domain, 'signed_up')
    returning id into v_vendor_id;

  insert into public.vendor_user (vendor_id, auth_user_id, email, name, role, status)
    values (v_vendor_id, v_uid, v_email, coalesce(nullif(btrim(p_full_name), ''), v_email), 'owner', 'active')
    returning id into v_user_id;

  update public.vendor set owner_user_id = v_user_id where id = v_vendor_id;

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values ('vendor_user', v_user_id, 'vendor.signed_up', 'vendor', v_vendor_id,
            jsonb_build_object('domain', v_domain));

  return v_vendor_id;
end;
$$;
revoke all on function public.signup_vendor(text, text) from public;
grant execute on function public.signup_vendor(text, text) to authenticated;

-- Vendor submits the vetting application; moves signed_up -> call_booked (0007).
create or replace function public.submit_application(p_answers jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_vendor uuid;
  v_user uuid;
  v_app uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select vendor_id, id into v_vendor, v_user
  from public.vendor_user
  where auth_user_id = v_uid and status = 'active' and deleted_at is null
  limit 1;
  if v_vendor is null then raise exception 'no_vendor'; end if;

  insert into public.application (vendor_id, answers, outcome)
    values (v_vendor, coalesce(p_answers, '{}'::jsonb), 'pending')
    returning id into v_app;

  update public.vendor set status = 'call_booked'
    where id = v_vendor and status = 'signed_up';

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id)
    values ('vendor_user', v_user, 'application.submitted', 'application', v_app);

  return v_app;
end;
$$;
revoke all on function public.submit_application(jsonb) from public;
grant execute on function public.submit_application(jsonb) to authenticated;

-- Vendor submits a request; creates the request + its single email-action token (0008).
create or replace function public.submit_request(
  p_executive_id uuid, p_q1 text, p_q2 text, p_attendee jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_vendor uuid; v_user uuid; v_req uuid; v_token text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select vendor_id, id into v_vendor, v_user from public.vendor_user
  where auth_user_id = v_uid and status = 'active' and deleted_at is null limit 1;
  if v_vendor is null then raise exception 'no_vendor'; end if;

  if not exists (select 1 from public.vendor where id = v_vendor and status = 'active') then
    raise exception 'vendor_not_active';
  end if;
  if not exists (select 1 from public.executive where id = p_executive_id and status = 'active' and deleted_at is null) then
    raise exception 'exec_not_available';
  end if;

  insert into public.request
    (vendor_id, requested_by_user_id, executive_id, q1_what, q2_why, attendee, meeting_minutes, status)
    values (v_vendor, v_user, p_executive_id, left(coalesce(p_q1,''),300), left(coalesce(p_q2,''),300),
            p_attendee, 45, 'submitted')
    returning id into v_req;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.email_action_token (request_id, token, status) values (v_req, v_token, 'active');

  insert into public.notification (recipient_type, recipient_id, channel, event, status) values
    ('executive', p_executive_id, 'email', 'B1_request_submitted', 'queued'),
    ('vendor_user', v_user, 'in_app', 'B1_request_sent', 'queued'),
    ('staff', null, 'in_app', 'B1_request_live', 'queued');

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id)
    values ('vendor_user', v_user, 'request.submitted', 'request', v_req);

  return v_req;
end;
$$;
revoke all on function public.submit_request(uuid, text, text, jsonb) from public;
grant execute on function public.submit_request(uuid, text, text, jsonb) to authenticated;

-- Inert read for the confirm page (GET) keyed off the token (0008).
create or replace function public.get_request_for_token(p_token text)
returns table (
  request_id uuid, request_status text, token_status text,
  vendor_name text, exec_name text, q1 text, q2 text,
  charity_name text, held_count int
) language sql stable security definer set search_path = '' as $$
  select r.id, r.status::text, t.status::text,
         v.name, e.name, r.q1_what, r.q2_why, c.name,
         coalesce((select cy.held_meetings_count from public.cycle cy
                   where cy.vendor_id = r.vendor_id order by cy.started_at desc limit 1), 0)
  from public.email_action_token t
  join public.request r on r.id = t.request_id
  join public.vendor v on v.id = r.vendor_id
  join public.executive e on e.id = r.executive_id
  left join public.charity c on c.id = e.default_charity_id
  where t.token = p_token;
$$;
revoke all on function public.get_request_for_token(text) from public;
grant execute on function public.get_request_for_token(text) to anon, authenticated;

-- Commit (POST): accept / decline / send_to_ea (0008).
-- NOTE [v2 DEC-9]: the exec's own action should log actor_type `executive` (not
-- `system`). The line marked below is corrected in the Phase-2 state-machine work
-- once the `executive` enum value (added above) is live. It is reproduced here AS
-- CURRENTLY DEPLOYED so SCHEMA.sql matches reality; the v2 fix is a migration.
create or replace function public.act_on_request_token(
  p_token text, p_actor text, p_action text, p_decline_reason text,
  p_ip text, p_user_agent text, p_terms_version text
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_req uuid; v_token_status text; v_req_status text; v_exec uuid; v_charity uuid;
  v_req_user uuid; v_ea uuid; v_actor_type public.actor_type;
begin
  select t.request_id, t.status::text, r.status::text, r.executive_id, r.requested_by_user_id
  into v_req, v_token_status, v_req_status, v_exec, v_req_user
  from public.email_action_token t join public.request r on r.id = t.request_id
  where t.token = p_token;

  if v_req is null then raise exception 'invalid_token'; end if;
  if v_token_status <> 'active' then raise exception 'token_not_active'; end if;
  if p_actor not in ('executive','ea_acting_for_exec') then raise exception 'bad_actor'; end if;
  -- [v2 DEC-9] target state: `executive` for the exec's own action (Phase 2).
  v_actor_type := case when p_actor = 'ea_acting_for_exec' then 'ea' else 'system' end;

  if p_action = 'send_to_ea' then
    select ea_id into v_ea from public.executive where id = v_exec;
    if v_ea is not null then
      insert into public.notification (recipient_type, recipient_id, channel, event, status)
        values ('ea', v_ea, 'email', 'B_forward_to_ea', 'queued');
    end if;
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.forwarded_to_ea', 'request', v_req);
    return 'forwarded';
  end if;

  if v_req_status <> 'submitted' then raise exception 'request_not_open'; end if;
  if p_action not in ('accept','decline') then raise exception 'bad_action'; end if;

  insert into public.consent_event (request_id, token, actor, action, terms_version, ip, user_agent)
    values (v_req, p_token, p_actor::public.consent_actor, p_action,
            coalesce(nullif(p_terms_version,''),'v1'), p_ip, p_user_agent);

  if p_action = 'accept' then
    update public.request set status = 'accepted' where id = v_req;
    select default_charity_id into v_charity from public.executive where id = v_exec;
    insert into public.meeting (request_id, charity_id, status) values (v_req, v_charity, 'proposed');
    update public.email_action_token set status = 'consumed' where token = p_token;
    insert into public.notification (recipient_type, recipient_id, channel, event, status) values
      ('vendor_user', v_req_user, 'email', 'C1_exec_accepted', 'queued'),
      ('staff', null, 'in_app', 'C1_confirm_time', 'queued');
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.accepted', 'request', v_req);
    return 'accepted';
  else
    update public.request set status = 'declined', decline_reason = p_decline_reason where id = v_req;
    update public.email_action_token set status = 'consumed' where token = p_token;
    insert into public.notification (recipient_type, recipient_id, channel, event, status)
      values ('staff', null, 'in_app', 'B5_decline_to_send', 'queued');
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.declined', 'request', v_req);
    return 'declined';
  end if;
end;
$$;
revoke all on function public.act_on_request_token(text, text, text, text, text, text, text) from public;
grant execute on function public.act_on_request_token(text, text, text, text, text, text, text) to anon, authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- BASELINE FEATURE-FLAG CONFIG (0004/0005/0006/0008/0009) — all OFF by default
-- (CHANGE_SAFETY.md). Reference config, not structure; included so a fresh DB
-- boots to the same baseline. Turn ON per go-live, staging first, Issy approves.
-- ════════════════════════════════════════════════════════════════════════════
insert into public.feature_flag (key, enabled, description) values
  ('admin_shell',         false, 'Admin cockpit read-only shell: dashboard, vendors, executives, task inbox.'),
  ('admin_2fa_required',  false, 'Enforce TOTP 2FA (aal2) for staff sign-in. Turn ON at launch.'),
  ('exec_onboarding',     false, 'Admin can create/edit executives, charities and EAs, and move execs through the onboarding pipeline.'),
  ('vendor_signup',       false, 'Self-serve vendor sign-up (work email only, first user is owner).'),
  ('vendor_payments',     false, 'Vendor vetting -> Xero invoice -> paid webhook -> unlock + credits.'),
  ('request_loop',        false, 'Vendors request meetings; execs accept/decline/forward via signed email links.'),
  ('exec_dashboard',      false, 'Executive web dashboard: standing nomination, incoming requests, recent impact, charity picker. Email remains the primary surface.')
on conflict (key) do nothing;
