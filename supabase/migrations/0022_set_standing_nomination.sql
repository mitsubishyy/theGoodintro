-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — atomic standing-nomination change (2026-06-16)
--
-- Replaces the exec action's three sequential supabase-js writes (flip
-- executive.default_charity_id, close the open nomination_history row, open a
-- new one) with one transactional plpgsql function, matching the
-- state-machine-in-DB pattern (0008 submit_request / act_on_request_token).
--
-- Why: supabase-js cannot wrap multiple statements in a transaction, so a
-- failure between the close and the open could leave an executive with a new
-- default_charity_id but ZERO open nomination rows (the partial unique index
-- nomination_history_one_open permits zero), which the loaders' "since"/history
-- reads do not tolerate and the action's no-op guard then prevents self-healing.
--
-- SECURITY DEFINER (it writes executive + nomination_history, both staff-only
-- under RLS) but hard-gated on private.is_staff() so it cannot be called by a
-- non-staff session. Validates the charity is DGR-endorsed. Idempotent: if the
-- charity is already the standing one it self-heals a missing open row and
-- returns. Order: close the open row, open the new one, flip the pointer LAST.
--
-- Reversible: see supabase/down/0022_set_standing_nomination_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

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
    -- Already the standing charity. Self-heal a missing open row, then return.
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
