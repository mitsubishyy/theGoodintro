-- Down for 0027_atomic_money_transitions. Drops the atomic transition functions.
-- The app wrappers (lib/meetings.ts, lib/billing.ts) must be reverted in the same
-- change set, since after this they would call functions that no longer exist.
drop function if exists public.confirm_meeting(uuid, timestamptz, text, timestamptz, timestamptz, integer);
drop function if exists public.mark_held(uuid, text, timestamptz, timestamptz, timestamptz, jsonb, text);
drop function if exists public.reverse_held(uuid);
drop function if exists public.release_meeting(uuid, text);
drop function if exists public.cancel_proposed_meeting(uuid);
drop function if exists public.close_request(uuid);
drop function if exists public.apply_paid_invoice(text, integer, timestamptz, timestamptz);
