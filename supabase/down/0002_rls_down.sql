-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0002_rls.sql.
--
-- Reverses the v1 Row-Level Security layer ONLY: drops the staff_all and
-- vendor_read policies this migration created, disables + un-forces RLS on the
-- tables this migration turned it on for, and drops the two identity helpers
-- (current_vendor_id, is_staff). It does NOT drop any table or column — every
-- table here predates this migration; this migration only added policies/RLS
-- and the helper functions. Policies are dropped before the functions they
-- reference; RLS is disabled before the helpers go.
-- ─────────────────────────────────────────────────────────────────────────

-- ── Drop vendor read policies (SELECT scope) ─────────────────────────────────
drop policy if exists vendor_read on public.vendor;
drop policy if exists vendor_read on public.vendor_user;
drop policy if exists vendor_read on public.invite;
drop policy if exists vendor_read on public.application;
drop policy if exists vendor_read on public.invoice;
drop policy if exists vendor_read on public.cycle;
drop policy if exists vendor_read on public.credit_lot;
drop policy if exists vendor_read on public.request;
drop policy if exists vendor_read on public.meeting;
drop policy if exists vendor_read on public.gift_record;
drop policy if exists vendor_read on public.notification;
drop policy if exists vendor_read on public.executive;
drop policy if exists vendor_read on public.charity;

-- ── Drop staff_all policies + disable/un-force RLS on every table this
--    migration enabled it for (same array as the up migration) ───────────────
do $$
declare t text;
begin
  foreach t in array array[
    'staff','charity','ea','executive','ea_assignment','vendor','vendor_user',
    'invite','application','invoice','cycle','credit_lot','request','meeting',
    'gift_record','email_action_token','consent_event','audit_entry',
    'notification','feature_flag'
  ] loop
    execute format('drop policy if exists staff_all on public.%I;', t);
    execute format('alter table public.%I no force row level security;', t);
    execute format('alter table public.%I disable row level security;', t);
  end loop;
end $$;

-- ── Drop identity helpers (now that no policy references them) ────────────────
drop function if exists public.current_vendor_id();
drop function if exists public.is_staff();
