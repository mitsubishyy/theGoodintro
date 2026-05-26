-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — Row-Level Security (v1)
--
-- RLS is the hard tenant boundary (SECURITY_AND_COMPLIANCE.md): a vendor user
-- can only ever READ their own org's rows; staff (admin) see everything.
-- All writes are mediated server-side (service_role bypasses RLS); vendors get
-- no direct write grant, so the app layer validates every mutation. These
-- policies are part of the test suite, not just assumed.
-- ─────────────────────────────────────────────────────────────────────────

-- ── Identity helpers (SECURITY DEFINER so they can read their own tables) ────

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

revoke all on function public.current_vendor_id() from public;
revoke all on function public.is_staff() from public;
grant execute on function public.current_vendor_id() to authenticated, anon;
grant execute on function public.is_staff() to authenticated, anon;

-- ── Enable + force RLS on every public table ─────────────────────────────────

do $$
declare t text;
begin
  foreach t in array array[
    'staff','charity','ea','executive','ea_assignment','vendor','vendor_user',
    'invite','application','invoice','cycle','credit_lot','request','meeting',
    'gift_record','email_action_token','consent_event','audit_entry',
    'notification','feature_flag'
  ] loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('alter table public.%I force row level security;', t);
    -- Admin cockpit: staff see and manage everything.
    execute format(
      'create policy staff_all on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff());',
      t
    );
  end loop;
end $$;

-- ── Vendor read scope (SELECT only; writes go through the server) ────────────

create policy vendor_read on public.vendor
  for select to authenticated using (id = public.current_vendor_id());

create policy vendor_read on public.vendor_user
  for select to authenticated using (vendor_id = public.current_vendor_id());

create policy vendor_read on public.invite
  for select to authenticated using (vendor_id = public.current_vendor_id());

create policy vendor_read on public.application
  for select to authenticated using (vendor_id = public.current_vendor_id());

create policy vendor_read on public.invoice
  for select to authenticated using (vendor_id = public.current_vendor_id());

create policy vendor_read on public.cycle
  for select to authenticated using (vendor_id = public.current_vendor_id());

create policy vendor_read on public.credit_lot
  for select to authenticated using (vendor_id = public.current_vendor_id());

create policy vendor_read on public.request
  for select to authenticated using (vendor_id = public.current_vendor_id());

create policy vendor_read on public.meeting
  for select to authenticated using (
    exists (
      select 1 from public.request r
      where r.id = meeting.request_id
        and r.vendor_id = public.current_vendor_id()
    )
  );

create policy vendor_read on public.gift_record
  for select to authenticated using (
    exists (
      select 1
      from public.meeting m
      join public.request r on r.id = m.request_id
      where m.id = gift_record.meeting_id
        and r.vendor_id = public.current_vendor_id()
    )
  );

create policy vendor_read on public.notification
  for select to authenticated using (
    recipient_type = 'vendor_user'
    and recipient_id in (
      select vu.id from public.vendor_user vu
      where vu.vendor_id = public.current_vendor_id()
    )
  );

-- Paid/active vendors see the executive list and the charities behind them.
create policy vendor_read on public.executive
  for select to authenticated using (
    public.current_vendor_id() is not null and status = 'active'
  );

create policy vendor_read on public.charity
  for select to authenticated using (public.current_vendor_id() is not null);

-- staff, ea, ea_assignment, email_action_token, consent_event, audit_entry,
-- feature_flag: no vendor policy => staff-only (plus server via service_role).
