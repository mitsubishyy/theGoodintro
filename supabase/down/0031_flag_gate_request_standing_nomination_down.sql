-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0031. Restores request_standing_nomination to its 0030 body (staff OR
-- can_access_executive, with NO feature-flag check on the non-staff path).
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.request_standing_nomination(p_executive_id uuid, p_charity_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_ea  uuid := private.current_ea_id();
  v_exec uuid := private.current_executive_id();
  v_actor_type public.actor_type;
  v_actor_id uuid;
begin
  if (private.is_staff() or private.can_access_executive(p_executive_id)) is not true then
    raise exception 'not_authorized';
  end if;

  perform private.apply_standing_nomination(p_executive_id, p_charity_id);

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
