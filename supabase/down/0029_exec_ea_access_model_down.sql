-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0029_exec_ea_access_model.sql. Restores each p_select to its
-- pre-2d shape (0003 for most, 0019 for nomination_history), drops the
-- private exec/EA helpers, and drops the auth_user_id columns.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Restore the consolidated p_select policies (staff OR vendor-scope only).
drop policy p_select on public.executive;
create policy p_select on public.executive
  for select to authenticated
  using (private.is_staff() or (private.current_vendor_id() is not null and status = 'active'));

drop policy p_select on public.request;
create policy p_select on public.request
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

drop policy p_select on public.meeting;
create policy p_select on public.meeting
  for select to authenticated
  using (
    private.is_staff() or exists (
      select 1 from public.request r
      where r.id = meeting.request_id and r.vendor_id = private.current_vendor_id()
    )
  );

drop policy p_select on public.gift_record;
create policy p_select on public.gift_record
  for select to authenticated
  using (
    private.is_staff() or exists (
      select 1 from public.meeting m
      join public.request r on r.id = m.request_id
      where m.id = gift_record.meeting_id and r.vendor_id = private.current_vendor_id()
    )
  );

drop policy p_select on public.nomination_history;
create policy p_select on public.nomination_history
  for select to authenticated using (private.is_staff());

drop policy p_select on public.charity;
create policy p_select on public.charity
  for select to authenticated
  using (private.is_staff() or private.current_vendor_id() is not null);

drop policy p_select on public.notification;
create policy p_select on public.notification
  for select to authenticated
  using (
    private.is_staff() or (
      recipient_type = 'vendor_user'
      and recipient_id in (
        select vu.id from public.vendor_user vu
        where vu.vendor_id = private.current_vendor_id()
      )
    )
  );

drop policy p_select on public.ea;
create policy p_select on public.ea
  for select to authenticated using (private.is_staff());

drop policy p_select on public.ea_assignment;
create policy p_select on public.ea_assignment
  for select to authenticated using (private.is_staff());

-- 2. Drop the helpers and the identity columns.
drop function if exists private.can_access_executive(uuid);
drop function if exists private.current_ea_id();
drop function if exists private.current_executive_id();
alter table public.ea drop column if exists auth_user_id;
alter table public.executive drop column if exists auth_user_id;
