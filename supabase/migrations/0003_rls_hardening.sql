-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — RLS hardening (v1)
--
-- Addresses the Supabase advisor findings on the foundation:
--  * sets search_path on the trigger functions,
--  * moves the RLS helper functions into a non-exposed `private` schema so
--    they are not callable via the PostgREST RPC surface, granted to
--    authenticated only (vendors/staff use the session role; anon never needs
--    them),
--  * consolidates policies to one SELECT policy (staff OR vendor-scope) plus
--    explicit INSERT/UPDATE/DELETE policies (staff only), removing the
--    overlapping multiple-permissive-SELECT policies,
--  * adds covering indexes for the remaining foreign keys.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Pin search_path on the trigger functions (SECURITY note 0011).
create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.prevent_mutation()
returns trigger language plpgsql set search_path = '' as $$
begin
  raise exception 'Table % is append-only; % is not permitted', tg_table_name, tg_op;
end;
$$;

-- 2. Drop every existing policy (clean slate for the consolidated set).
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I;', r.policyname, r.tablename);
  end loop;
end $$;

-- 3. Move the identity helpers into a private (unexposed) schema.
create schema if not exists private;
grant usage on schema private to authenticated;

create or replace function private.current_vendor_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select vu.vendor_id
  from public.vendor_user vu
  where vu.auth_user_id = (select auth.uid())
    and vu.status = 'active'
    and vu.deleted_at is null
  limit 1;
$$;

create or replace function private.is_staff()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff s
    where s.auth_user_id = (select auth.uid())
      and s.deleted_at is null
  );
$$;

revoke all on function private.current_vendor_id() from public;
revoke all on function private.is_staff() from public;
grant execute on function private.current_vendor_id() to authenticated;
grant execute on function private.is_staff() to authenticated;

drop function if exists public.current_vendor_id();
drop function if exists public.is_staff();

-- 4. Staff-only tables: staff do everything, vendors see nothing.
do $$
declare t text;
begin
  foreach t in array array[
    'staff','ea','ea_assignment','email_action_token','consent_event',
    'audit_entry','feature_flag'
  ] loop
    execute format('create policy p_select on public.%I for select to authenticated using (private.is_staff());', t);
    execute format('create policy p_insert on public.%I for insert to authenticated with check (private.is_staff());', t);
    execute format('create policy p_update on public.%I for update to authenticated using (private.is_staff()) with check (private.is_staff());', t);
    execute format('create policy p_delete on public.%I for delete to authenticated using (private.is_staff());', t);
  end loop;
end $$;

-- 5. Vendor-readable tables: staff write everything; vendors read their scope.
--    Writes are staff-only here (vendor self-serve writes go through the server
--    with service_role and explicit validation).
do $$
declare t text;
begin
  foreach t in array array[
    'vendor','vendor_user','invite','application','invoice','cycle',
    'credit_lot','request','meeting','gift_record','notification',
    'executive','charity'
  ] loop
    execute format('create policy p_insert on public.%I for insert to authenticated with check (private.is_staff());', t);
    execute format('create policy p_update on public.%I for update to authenticated using (private.is_staff()) with check (private.is_staff());', t);
    execute format('create policy p_delete on public.%I for delete to authenticated using (private.is_staff());', t);
  end loop;
end $$;

-- Per-table SELECT scope: staff OR the vendor's own rows.
create policy p_select on public.vendor
  for select to authenticated
  using (private.is_staff() or id = private.current_vendor_id());

create policy p_select on public.vendor_user
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.invite
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.application
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.invoice
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.cycle
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.credit_lot
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.request
  for select to authenticated
  using (private.is_staff() or vendor_id = private.current_vendor_id());

create policy p_select on public.meeting
  for select to authenticated
  using (
    private.is_staff() or exists (
      select 1 from public.request r
      where r.id = meeting.request_id and r.vendor_id = private.current_vendor_id()
    )
  );

create policy p_select on public.gift_record
  for select to authenticated
  using (
    private.is_staff() or exists (
      select 1 from public.meeting m
      join public.request r on r.id = m.request_id
      where m.id = gift_record.meeting_id and r.vendor_id = private.current_vendor_id()
    )
  );

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

create policy p_select on public.executive
  for select to authenticated
  using (
    private.is_staff()
    or (private.current_vendor_id() is not null and status = 'active')
  );

create policy p_select on public.charity
  for select to authenticated
  using (private.is_staff() or private.current_vendor_id() is not null);

-- 6. Covering indexes for the remaining foreign keys (advisor 0001).
create index if not exists application_decided_by_idx       on public.application (decided_by);
create index if not exists audit_entry_acting_for_exec_idx   on public.audit_entry (acting_for_executive_id);
create index if not exists ea_assignment_executive_id_idx    on public.ea_assignment (executive_id);
create index if not exists executive_default_charity_id_idx  on public.executive (default_charity_id);
create index if not exists executive_ea_id_idx               on public.executive (ea_id);
create index if not exists feature_flag_updated_by_idx       on public.feature_flag (updated_by);
create index if not exists gift_record_charity_id_idx        on public.gift_record (charity_id);
create index if not exists invite_invited_by_user_id_idx     on public.invite (invited_by_user_id);
create index if not exists meeting_charity_id_idx            on public.meeting (charity_id);
create index if not exists meeting_credit_lot_id_idx         on public.meeting (credit_lot_id);
create index if not exists request_requested_by_user_id_idx  on public.request (requested_by_user_id);
create index if not exists vendor_owner_user_id_idx          on public.vendor (owner_user_id);
