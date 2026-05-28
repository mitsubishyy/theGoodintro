-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0001_foundation.sql (DEC-11 — fixes the previously dangling reference).
--
-- Reverses 0001's DDL: drops every table it created (CASCADE removes the
-- dependent triggers, indexes, FKs, and any policies later migrations added to
-- these tables), then the helper functions, then the enum types.
--
-- Assumes later migrations (0002+) have already been rolled back, per the
-- reverse-order convention. For a full local wipe prefer `supabase db reset`.
-- The `private` schema + its helpers are owned by 0003, not dropped here.
-- ─────────────────────────────────────────────────────────────────────────

drop table if exists public.feature_flag        cascade;
drop table if exists public.notification         cascade;
drop table if exists public.audit_entry          cascade;
drop table if exists public.consent_event        cascade;
drop table if exists public.email_action_token   cascade;
drop table if exists public.gift_record          cascade;
drop table if exists public.meeting              cascade;
drop table if exists public.request              cascade;
drop table if exists public.credit_lot           cascade;
drop table if exists public.cycle                cascade;
drop table if exists public.invoice              cascade;
drop table if exists public.application          cascade;
drop table if exists public.invite               cascade;
drop table if exists public.vendor_user          cascade;
drop table if exists public.vendor               cascade;
drop table if exists public.ea_assignment        cascade;
drop table if exists public.executive            cascade;
drop table if exists public.ea                   cascade;
drop table if exists public.charity              cascade;
drop table if exists public.staff                cascade;

drop function if exists public.prevent_mutation() cascade;
drop function if exists public.set_updated_at()   cascade;

drop type if exists consent_actor;
drop type if exists email_token_status;
drop type if exists notification_status;
drop type if exists notification_channel;
drop type if exists notification_recipient_type;
drop type if exists actor_type;
drop type if exists staff_role;
drop type if exists gift_status;
drop type if exists gift_band;
drop type if exists meeting_outcome_source;
drop type if exists meeting_status;
drop type if exists request_status;
drop type if exists invoice_status;
drop type if exists invoice_kind;
drop type if exists application_outcome;
drop type if exists charity_dgr_status;
drop type if exists executive_status;
drop type if exists invite_status;
drop type if exists vendor_user_status;
drop type if exists vendor_user_role;
drop type if exists vendor_status;
