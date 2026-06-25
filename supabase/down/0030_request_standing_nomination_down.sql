-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0030_request_standing_nomination.sql. Restores set_standing_nomination
-- to its self-contained 0022 body, drops the scope-checked exec/EA wrapper and
-- the shared private mechanism, and removes the exec_ea_login flag row.
-- ─────────────────────────────────────────────────────────────────────────

drop function if exists public.request_standing_nomination(uuid, uuid);

-- Restore the exact 0022 definition (inline logic, staff-only).
create or replace function public.set_standing_nomination(p_executive_id uuid, p_charity_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_current uuid;
  v_exists boolean;
begin
  if not private.is_staff() then raise exception 'not_staff'; end if;

  select true, default_charity_id into v_exists, v_current
  from public.executive where id = p_executive_id and deleted_at is null;
  if v_exists is not true then raise exception 'executive_not_found'; end if;

  if not exists (
    select 1 from public.charity
    where id = p_charity_id and dgr_status = 'endorsed' and deleted_at is null
  ) then
    raise exception 'charity_not_available';
  end if;

  if v_current is not distinct from p_charity_id then
    if not exists (
      select 1 from public.nomination_history
      where executive_id = p_executive_id and ended_at is null
    ) then
      insert into public.nomination_history (executive_id, charity_id)
        values (p_executive_id, p_charity_id);
    end if;
    return;
  end if;

  update public.nomination_history
    set ended_at = now()
    where executive_id = p_executive_id and ended_at is null;
  insert into public.nomination_history (executive_id, charity_id)
    values (p_executive_id, p_charity_id);
  update public.executive
    set default_charity_id = p_charity_id
    where id = p_executive_id;
end;
$$;
revoke all on function public.set_standing_nomination(uuid, uuid) from public;
grant execute on function public.set_standing_nomination(uuid, uuid) to authenticated;

drop function if exists private.apply_standing_nomination(uuid, uuid);

delete from public.feature_flag where key = 'exec_ea_login';
