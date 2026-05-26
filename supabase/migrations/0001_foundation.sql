-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — foundation schema (v1)
--
-- Source of truth: DATA_MODEL.md. Money in whole AUD cents (integers), times
-- in UTC (timestamptz). Records snapshot their own truth; logs are append-only
-- (CHANGE_SAFETY.md). This migration is reversible (see 0001_foundation_down.sql
-- companion notes at the bottom).
--
-- Applied to STAGING first. No real data. Promote to a separate Sydney prod
-- project at go-live.
-- ─────────────────────────────────────────────────────────────────────────

-- gen_random_uuid() is available in Postgres 13+ core on Supabase.

-- ── Helper functions ──────────────────────────────────────────────────────

-- Keep updated_at honest on every mutation.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Append-only guard: block UPDATE/DELETE on history tables (logs/consent).
create or replace function public.prevent_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Table % is append-only; % is not permitted', tg_table_name, tg_op;
end;
$$;

-- ── Enum types (fixed value lists from DATA_MODEL.md) ──────────────────────

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
create type actor_type as enum ('staff','vendor_user','ea','system');
create type notification_recipient_type as enum ('vendor_user','executive','ea','staff');
create type notification_channel as enum ('email','in_app','slack');
create type notification_status as enum ('queued','sent','failed');
create type email_token_status as enum ('active','consumed','revoked');
create type consent_actor as enum ('executive','ea_acting_for_exec');

-- ── People & org ───────────────────────────────────────────────────────────

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
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  abn         text,
  dgr_status  charity_dgr_status not null default 'unverified',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
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

-- ── Vetting & access ───────────────────────────────────────────────────────

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

-- ── Money: invoices, cycles, credits ─────────────────────────────────────────

create table public.invoice (
  id              uuid primary key default gen_random_uuid(),
  vendor_id       uuid not null references public.vendor(id) on delete cascade,
  xero_invoice_id text unique,
  kind            invoice_kind not null default 'credit_purchase',
  line_items      jsonb not null default '[]'::jsonb,
  amount_cents    integer not null check (amount_cents >= 0),
  status          invoice_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
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

-- ── Booking loop ─────────────────────────────────────────────────────────────

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
  admin_fee_cents      integer not null check (admin_fee_cents >= 0),
  status               gift_status not null default 'released',
  confirmation         jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- ── Email action tokens & consent (EMAIL_ACTIONS.md) ─────────────────────────

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

-- ── System: audit, notifications, feature flags ──────────────────────────────

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

-- ── Indexes on hot foreign keys / lookups ────────────────────────────────────

create index on public.vendor_user (vendor_id);
create index on public.vendor_user (auth_user_id);
create index on public.invite (vendor_id);
create index on public.application (vendor_id);
create index on public.invoice (vendor_id);
create index on public.cycle (vendor_id);
create index on public.credit_lot (vendor_id);
create index on public.credit_lot (invoice_id);
create index on public.request (vendor_id);
create index on public.request (executive_id);
create index on public.request (status);
create index on public.meeting (request_id);
create index on public.meeting (status);
create index on public.gift_record (status);
create index on public.email_action_token (request_id);
create index on public.consent_event (request_id);
create index on public.audit_entry (target_type, target_id);
create index on public.notification (recipient_type, recipient_id);
create index on public.executive (status);

-- ── updated_at triggers ──────────────────────────────────────────────────────

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
create trigger t_email_token_updated   before update on public.email_action_token for each row execute function public.set_updated_at();
create trigger t_notification_updated  before update on public.notification for each row execute function public.set_updated_at();
create trigger t_feature_flag_updated  before update on public.feature_flag for each row execute function public.set_updated_at();

-- ── Append-only guards on history tables ─────────────────────────────────────

create trigger t_audit_entry_noupdate  before update on public.audit_entry  for each row execute function public.prevent_mutation();
create trigger t_audit_entry_nodelete  before delete on public.audit_entry  for each row execute function public.prevent_mutation();
create trigger t_consent_noupdate      before update on public.consent_event for each row execute function public.prevent_mutation();
create trigger t_consent_nodelete      before delete on public.consent_event for each row execute function public.prevent_mutation();
