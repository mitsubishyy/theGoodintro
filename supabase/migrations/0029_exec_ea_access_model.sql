-- ─────────────────────────────────────────────────────────────────────────────
-- 0029  Exec / EA access model — identity linkage + scoped read RLS (slice 2d)
--
-- Until now the exec portal was staff-operated (the interim /exec gate resolves a
-- demo exec under a staff session). This adds the real access model: an executive
-- or EA who signs in (passwordless magic-link, built in the 2d app layer) is
-- mapped to their record by auth_user_id, and RLS scopes them to ONLY their own
-- data — an exec to their own request/meeting/gift/nomination rows, an EA to the
-- executives they are assigned to (ea_assignment, many-to-many).
--
-- Read-only (the locked v1 scope): exec/EA get SELECT scope only. Writes stay
-- staff-only at the RLS layer; the one exec/EA write (standing-charity change) is
-- a controlled, scope-checked server function added in a later 2d step. Mirrors
-- the existing vendor model (0002/0003): one consolidated p_select per table,
-- private-schema identity helpers, writes via service_role.
--
-- Reversible: see supabase/down/0029_exec_ea_access_model_down.sql.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. ── Identity linkage (mirrors vendor_user.auth_user_id) ───────────────────
-- Nullable + unique: most executives never log in (email-first); a non-null link
-- is one-to-one. on delete set null so deleting an auth user just unlinks.
alter table public.executive
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;
alter table public.ea
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

-- 2. ── Identity helpers in the unexposed `private` schema ─────────────────────
-- (mirrors private.is_staff / private.current_vendor_id: SECURITY DEFINER so they
-- read their own tables under RLS, granted to authenticated only, never exposed
-- on the PostgREST RPC surface).
create or replace function private.current_executive_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select e.id from public.executive e
  where e.auth_user_id = (select auth.uid()) and e.deleted_at is null
  limit 1;
$$;

create or replace function private.current_ea_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select a.id from public.ea a
  where a.auth_user_id = (select auth.uid()) and a.deleted_at is null
  limit 1;
$$;

-- Whether the current auth user may access executive p_exec: as that executive,
-- or as an EA assigned to them. The single scoping primitive for the policies.
create or replace function private.can_access_executive(p_exec uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select p_exec is not null and (
    p_exec = private.current_executive_id()
    or exists (
      select 1 from public.ea_assignment asg
      where asg.executive_id = p_exec and asg.ea_id = private.current_ea_id()
    )
  );
$$;

revoke all on function private.current_executive_id() from public;
revoke all on function private.current_ea_id() from public;
revoke all on function private.can_access_executive(uuid) from public;
grant execute on function private.current_executive_id() to authenticated;
grant execute on function private.current_ea_id() to authenticated;
grant execute on function private.can_access_executive(uuid) to authenticated;

-- 3. ── Extend SELECT scope: replace each consolidated p_select to add the
--        exec/EA branch (keeps exactly one permissive SELECT policy per table).
--        Writes (p_insert/p_update/p_delete) stay staff-only, unchanged.

drop policy p_select on public.executive;
create policy p_select on public.executive
  for select to authenticated
  using (
    private.is_staff()
    or (private.current_vendor_id() is not null and status = 'active')
    or private.can_access_executive(id)
  );

drop policy p_select on public.request;
create policy p_select on public.request
  for select to authenticated
  using (
    private.is_staff()
    or vendor_id = private.current_vendor_id()
    or private.can_access_executive(executive_id)
  );

drop policy p_select on public.meeting;
create policy p_select on public.meeting
  for select to authenticated
  using (
    private.is_staff()
    or exists (
      select 1 from public.request r
      where r.id = meeting.request_id
        and (r.vendor_id = private.current_vendor_id()
             or private.can_access_executive(r.executive_id))
    )
  );

drop policy p_select on public.gift_record;
create policy p_select on public.gift_record
  for select to authenticated
  using (
    private.is_staff()
    or exists (
      select 1 from public.meeting m join public.request r on r.id = m.request_id
      where m.id = gift_record.meeting_id
        and (r.vendor_id = private.current_vendor_id()
             or private.can_access_executive(r.executive_id))
    )
  );

drop policy p_select on public.nomination_history;
create policy p_select on public.nomination_history
  for select to authenticated
  using (private.is_staff() or private.can_access_executive(executive_id));

drop policy p_select on public.charity;
create policy p_select on public.charity
  for select to authenticated
  using (
    private.is_staff()
    or private.current_vendor_id() is not null
    or private.current_executive_id() is not null
    or private.current_ea_id() is not null
  );

drop policy p_select on public.notification;
create policy p_select on public.notification
  for select to authenticated
  using (
    private.is_staff()
    or (recipient_type = 'vendor_user' and recipient_id in (
        select vu.id from public.vendor_user vu where vu.vendor_id = private.current_vendor_id()))
    or (recipient_type = 'executive' and private.can_access_executive(recipient_id))
    or (recipient_type = 'ea' and recipient_id = private.current_ea_id())
  );

-- ea + ea_assignment were staff-only (0003). Let an EA read their own identity and
-- the executives they cover, and an executive read the EA linked to them.
drop policy p_select on public.ea;
create policy p_select on public.ea
  for select to authenticated
  using (
    private.is_staff()
    or auth_user_id = (select auth.uid())
    or exists (
      select 1 from public.executive e
      where e.ea_id = ea.id and private.can_access_executive(e.id)
    )
  );

drop policy p_select on public.ea_assignment;
create policy p_select on public.ea_assignment
  for select to authenticated
  using (
    private.is_staff()
    or ea_id = private.current_ea_id()
    or private.can_access_executive(executive_id)
  );
