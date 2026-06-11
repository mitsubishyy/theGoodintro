-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0014_email_sending.sql.
--
-- Postgres has no DROP VALUE, so removing `sending`/`bounced` means recreating
-- notification_status (same pattern as 0011's down). This FAILS if any row
-- already uses those values (resolve that data first) — the correct, safe
-- behaviour for a down migration. Also restores the 0006 signup_vendor body
-- (no notification insert), drops the delivery columns, and removes the flag.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Restore the 0006 signup_vendor (no queued alert).
create or replace function public.signup_vendor(p_company text, p_full_name text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_domain text;
  v_vendor_id uuid;
  v_user_id uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;
  if coalesce(btrim(p_company), '') = '' then raise exception 'company_required'; end if;

  select lower(email) into v_email from auth.users where id = v_uid;
  if v_email is null then raise exception 'no_email_on_account'; end if;
  v_domain := split_part(v_email, '@', 2);

  if private.is_generic_email_domain(v_domain) then
    raise exception 'work_email_required';
  end if;

  select vendor_id into v_vendor_id
  from public.vendor_user where auth_user_id = v_uid and deleted_at is null limit 1;
  if v_vendor_id is not null then return v_vendor_id; end if;

  if exists (select 1 from public.vendor where email_domain = v_domain and deleted_at is null) then
    raise exception 'org_exists_for_domain';
  end if;

  insert into public.vendor (name, email_domain, status)
    values (btrim(p_company), v_domain, 'signed_up')
    returning id into v_vendor_id;

  insert into public.vendor_user (vendor_id, auth_user_id, email, name, role, status)
    values (v_vendor_id, v_uid, v_email, coalesce(nullif(btrim(p_full_name), ''), v_email), 'owner', 'active')
    returning id into v_user_id;

  update public.vendor set owner_user_id = v_user_id where id = v_vendor_id;

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values ('vendor_user', v_user_id, 'vendor.signed_up', 'vendor', v_vendor_id,
            jsonb_build_object('domain', v_domain));

  return v_vendor_id;
end;
$$;
revoke all on function public.signup_vendor(text, text) from public;
grant execute on function public.signup_vendor(text, text) to authenticated;

-- 2. Drop the delivery bookkeeping columns.
alter table public.notification
  drop column if exists payload,
  drop column if exists attempts,
  drop column if exists last_error,
  drop column if exists provider_message_id,
  drop column if exists sent_at,
  drop column if exists sent_to;

-- 3. Remove the flag.
delete from public.feature_flag where key = 'email_sending';

-- 4. Recreate notification_status without sending/bounced (fails if in use).
alter table public.notification alter column status drop default;
alter table public.notification alter column status type text using status::text;
drop type public.notification_status;
create type public.notification_status as enum ('queued','sent','failed');
alter table public.notification
  alter column status type public.notification_status using status::public.notification_status,
  alter column status set default 'queued';
