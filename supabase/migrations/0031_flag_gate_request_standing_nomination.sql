-- ─────────────────────────────────────────────────────────────────────────
-- 0031  Flag-gate the exec/EA standing-charity change (slice 2d review fix)
--
-- request_standing_nomination (0030) authorized staff OR private.can_access_-
-- executive, with no feature-flag check. But exec/EA portal access is supposed to
-- be a reliable kill switch (exec_ea_login, CHANGE_SAFETY.md §3): an executive
-- bound to an auth user can call this RPC DIRECTLY over PostgREST, bypassing the
-- app layer, so gating only at the page/action layer leaves the switch leaky.
--
-- This re-defines the function so the NON-STAFF path additionally requires
-- exec_ea_login to be enabled. Staff are unaffected (they operate the surface
-- regardless of the flag). The flag is read inside the SECURITY DEFINER function,
-- which can see public.feature_flag irrespective of RLS. Everything else
-- (private.apply_standing_nomination core, the self-audit, set_standing_-
-- nomination) is unchanged from 0030.
--
-- Reversible: see supabase/down/0031_flag_gate_request_standing_nomination_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.request_standing_nomination(p_executive_id uuid, p_charity_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_ea  uuid := private.current_ea_id();
  v_exec uuid := private.current_executive_id();
  v_actor_type public.actor_type;
  v_actor_id uuid;
  v_flag boolean;
begin
  select enabled into v_flag from public.feature_flag where key = 'exec_ea_login';

  -- Staff may always operate. An exec/EA may use this ONLY while exec_ea_login is
  -- enabled, so flipping the flag off revokes the one write a bound exec/EA had
  -- even against a direct RPC call. Fail closed with `is not true` (can_access can
  -- be NULL for an EA whose current_executive_id is null; NULL must deny).
  if (private.is_staff()
      or (coalesce(v_flag, false) and private.can_access_executive(p_executive_id))) is not true then
    raise exception 'not_authorized';
  end if;

  perform private.apply_standing_nomination(p_executive_id, p_charity_id);

  -- Attribute the audit to the acting principal. An EA acting for the exec wins
  -- over the exec branch (an EA session has no current_executive_id anyway).
  if v_ea is not null then
    v_actor_type := 'ea'; v_actor_id := v_ea;
  elsif v_exec = p_executive_id then
    v_actor_type := 'executive'; v_actor_id := v_exec;
  else
    v_actor_type := 'staff'; v_actor_id := null;
  end if;

  insert into public.audit_entry
    (actor_type, actor_id, acting_for_executive_id, action, target_type, target_id, metadata)
  values
    (v_actor_type, v_actor_id, p_executive_id, 'executive.standing_nomination_changed',
     'executive', p_executive_id, jsonb_build_object('charity_id', p_charity_id));
end;
$$;
revoke all on function public.request_standing_nomination(uuid, uuid) from public, anon;
grant execute on function public.request_standing_nomination(uuid, uuid) to authenticated;
