-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0003_rls_hardening.sql.
--
-- PARTIALLY IRREVERSIBLE. 0003 step 2 ran a blanket sweep that dropped EVERY
-- policy in the public schema (including policies created by prior migrations)
-- before installing its own consolidated set. The original definitions of those
-- pre-existing policies are not captured anywhere, so a faithful rollback to the
-- exact pre-0003 state is impossible: this script removes only what 0003 itself
-- added and leaves the affected tables with RLS enabled but NO policies (deny-all
-- to authenticated, service_role still bypasses). Re-run the relevant prior
-- migration(s) to repopulate the original policies if a true restore is needed.
--
-- 0003 did NOT run ENABLE ROW LEVEL SECURITY, so this script does NOT disable
-- RLS on any table (that was a prior migration's doing).
--
-- Reversed here, in dependency order:
--  * the consolidated policies 0003 created (p_select / p_insert / p_update /
--    p_delete on the staff-only and vendor-readable tables),
--  * the covering FK indexes 0003 added,
--  * the private-schema move: drop the private helper functions, restore the
--    public helper functions 0003 dropped (current_vendor_id / is_staff),
--    WITH the same grants 0002 originally gave them, drop the private schema,
--  * the search_path pin on the trigger functions (re-created without it).
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Drop the consolidated policies 0003 created (mirror of its step 4/5/6).
--    Idempotent: drop p_select/p_insert/p_update/p_delete on every table 0003
--    touched. Children before parents is moot for policies (no cross-policy
--    deps), but we keep the same table groupings for clarity. Dropping these
--    first is required so the later drop of private.is_staff() /
--    private.current_vendor_id() is not blocked by a dependent policy.
do $$
declare t text;
begin
  foreach t in array array[
    -- staff-only tables
    'staff','ea','ea_assignment','email_action_token','consent_event',
    'audit_entry','feature_flag',
    -- vendor-readable tables
    'vendor','vendor_user','invite','application','invoice','cycle',
    'credit_lot','request','meeting','gift_record','notification',
    'executive','charity'
  ] loop
    execute format('drop policy if exists p_select on public.%I;', t);
    execute format('drop policy if exists p_insert on public.%I;', t);
    execute format('drop policy if exists p_update on public.%I;', t);
    execute format('drop policy if exists p_delete on public.%I;', t);
  end loop;
end $$;

-- 2. Drop the covering FK indexes 0003 added (advisor 0001).
--    Verified unique to 0003 (no prior migration creates these names), so this
--    does not remove a prior migration's index.
drop index if exists public.application_decided_by_idx;
drop index if exists public.audit_entry_acting_for_exec_idx;
drop index if exists public.ea_assignment_executive_id_idx;
drop index if exists public.executive_default_charity_id_idx;
drop index if exists public.executive_ea_id_idx;
drop index if exists public.feature_flag_updated_by_idx;
drop index if exists public.gift_record_charity_id_idx;
drop index if exists public.invite_invited_by_user_id_idx;
drop index if exists public.meeting_charity_id_idx;
drop index if exists public.meeting_credit_lot_id_idx;
drop index if exists public.request_requested_by_user_id_idx;
drop index if exists public.vendor_owner_user_id_idx;

-- 3. Undo the private-schema move.
--    First restore the public helper functions 0003 dropped (these were
--    originally created in 0002 with the body below). The private copies
--    referenced public.* with an empty search_path, so the restored public
--    copies are functionally identical in body. CRITICAL: because 0003 DROPPED
--    these functions, the create below is a fresh CREATE and would otherwise
--    default to EXECUTE granted to PUBLIC. We must re-apply 0002's exact grant
--    pattern (revoke from public; grant to authenticated, anon) or the rollback
--    would leave the helpers MORE permissive than the original. Then drop the
--    private functions and the private schema.
create or replace function public.current_vendor_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select vu.vendor_id
  from public.vendor_user vu
  where vu.auth_user_id = (select auth.uid())
    and vu.status = 'active'
    and vu.deleted_at is null
  limit 1;
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff s
    where s.auth_user_id = (select auth.uid())
      and s.deleted_at is null
  );
$$;

-- Restore 0002's grants exactly (the pre-0003 state).
revoke all on function public.current_vendor_id() from public;
revoke all on function public.is_staff() from public;
grant execute on function public.current_vendor_id() to authenticated, anon;
grant execute on function public.is_staff() to authenticated, anon;

drop function if exists private.current_vendor_id();
drop function if exists private.is_staff();
-- RESTRICT (not CASCADE) on purpose: if a later migration's object still lives
-- in the private schema (e.g. 0006's private.is_generic_email_domain), this
-- errors loudly instead of silently destroying it. Later migrations must be
-- rolled back before this one.
drop schema if exists private restrict;

-- 4. Unpin search_path on the trigger functions (re-create without the pin).
--    NOTE: the original pre-0003 bodies are not recoverable; these reproduce the
--    bodies as written in 0003 minus the `set search_path = ''` clause, which is
--    the only change 0003 made to them.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_mutation()
returns trigger language plpgsql as $$
begin
  raise exception 'Table % is append-only; % is not permitted', tg_table_name, tg_op;
end;
$$;
