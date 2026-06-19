-- Down for 0025: restore the 0014 signup_vendor (staff alert only, no vendor
-- welcome). Already-queued A1_vendor_welcome rows are harmless (the drain skips
-- any event not in SUPPORTED_EMAIL_EVENTS once the app code is also reverted).

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

  insert into public.notification (recipient_type, recipient_id, channel, event, status, payload)
    values ('staff', null, 'email', 'A1_vendor_signed_up', 'queued',
            jsonb_build_object('company', btrim(p_company), 'name',
                               coalesce(nullif(btrim(p_full_name), ''), v_email),
                               'email', v_email));

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values ('vendor_user', v_user_id, 'vendor.signed_up', 'vendor', v_vendor_id,
            jsonb_build_object('domain', v_domain));

  return v_vendor_id;
end;
$$;

revoke all on function public.signup_vendor(text, text) from public;
grant execute on function public.signup_vendor(text, text) to authenticated;
