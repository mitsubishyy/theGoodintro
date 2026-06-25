-- ─────────────────────────────────────────────────────────────────────────
-- 0030  Controlled exec/EA standing-charity change (slice 2d, 4/n)
--
-- The one write the v1 exec portal grants an executive/EA: changing their own
-- standing-nomination charity. Everything else stays read-only (0029) / staff-
-- only. This adds a SCOPE-CHECKED entry point so an exec or their assigned EA can
-- make exactly this change for themselves and nobody else.
--
-- To avoid duplicating the nomination logic, the core of the existing staff
-- function set_standing_nomination (0022) is extracted into a private mechanism
-- (private.apply_standing_nomination) that does NO authorization. Two thin public
-- wrappers gate it:
--   • public.set_standing_nomination  — staff-only (unchanged contract; the
--     existing 'not_staff' guard + action-layer audit stay exactly as they were).
--   • public.request_standing_nomination — staff OR private.can_access_executive
--     (the 0029 exec/EA scoping primitive). It self-audits as the acting principal
--     (executive / ea / staff) because an exec/EA session cannot insert audit_entry
--     under RLS; writing the audit inside this SECURITY DEFINER function keeps it
--     atomic with the change and correctly attributed.
--
-- Reversible: see supabase/down/0030_request_standing_nomination_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. ── Shared mechanism (no authorization; never call directly) ──────────────
-- This is the verbatim core of 0022's set_standing_nomination with the is_staff
-- gate removed. SECURITY DEFINER so it writes executive + nomination_history
-- (staff-only under RLS); kept in the unexposed `private` schema and execute is
-- revoked from every API role so it is reachable ONLY through the gated wrappers
-- below (which run as the same definer and so retain execute on it).
create or replace function private.apply_standing_nomination(p_executive_id uuid, p_charity_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_current uuid;
  v_exists boolean;
begin
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
revoke all on function private.apply_standing_nomination(uuid, uuid) from public, anon, authenticated;

-- 2. ── Staff wrapper (unchanged contract) ────────────────────────────────────
-- Keeps the exact 'not_staff' guard the exec-portal-schema test asserts; now
-- delegates the mechanism to the shared private function.
create or replace function public.set_standing_nomination(p_executive_id uuid, p_charity_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_staff() then raise exception 'not_staff'; end if;
  perform private.apply_standing_nomination(p_executive_id, p_charity_id);
end;
$$;
revoke all on function public.set_standing_nomination(uuid, uuid) from public;
grant execute on function public.set_standing_nomination(uuid, uuid) to authenticated;

-- 3. ── Scope-checked exec/EA wrapper ─────────────────────────────────────────
-- Authorize staff OR the owning executive / an assigned EA (the 0029 primitive),
-- apply the change, then write the audit row as the acting principal. Raises
-- 'not_authorized' for anyone else (a non-owning exec/EA, a vendor, anon).
create or replace function public.request_standing_nomination(p_executive_id uuid, p_charity_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_ea  uuid := private.current_ea_id();
  v_exec uuid := private.current_executive_id();
  v_actor_type public.actor_type;
  v_actor_id uuid;
begin
  -- Fail closed with `is not true`, NOT `not (...)`: can_access_executive can
  -- evaluate to NULL (an EA session has a null current_executive_id, so the
  -- `p_exec = current_executive_id()` disjunct is NULL, and NULL OR false = NULL).
  -- RLS treats that NULL as deny, but a bare `not (NULL)` is NULL — which would
  -- skip the raise and let an unassigned EA through. `is not true` denies on both
  -- NULL and false.
  if (private.is_staff() or private.can_access_executive(p_executive_id)) is not true then
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

-- 4. ── Feature flag for the exec/EA passwordless login behaviour ──────────────
-- The structural access model (0029 RLS) needs no flag, but exec/EA actually
-- being able to sign in and reach their portal is a behaviour change, so it ships
-- OFF by default (CHANGE_SAFETY.md): staging/demo first, Issy approves go-live.
insert into public.feature_flag (key, enabled, description) values
  ('exec_ea_login', false,
   'Passwordless sign-in link for executives and their EAs at the shared /login, plus the staff "send access link" provisioning. The exec portal gate widens to the owning exec/EA only when this is on; staff operate it either way.')
on conflict (key) do nothing;
