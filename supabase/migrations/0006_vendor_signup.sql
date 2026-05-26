-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — Pillar 3a: vendor sign-up
--
-- Self-serve sign-up can't insert vendor rows directly (RLS writes are
-- staff-only and there is no service-role key in this build). So a just-signed-
-- in user creates their org via a SECURITY DEFINER RPC that enforces the rules:
-- work-email-only (generic domains blocked) and one org per domain. First user
-- becomes the owner. Flags off by default.
-- ─────────────────────────────────────────────────────────────────────────

insert into public.feature_flag (key, enabled, description) values
  ('vendor_signup', false, 'Self-serve vendor sign-up (work email only, first user is owner).'),
  ('vendor_payments', false, 'Vendor vetting -> Xero invoice -> paid webhook -> unlock + credits.')
on conflict (key) do nothing;

-- Generic / free email domains that may not own a vendor org.
create or replace function private.is_generic_email_domain(p_domain text)
returns boolean language sql immutable set search_path = '' as $$
  select lower(p_domain) = any (array[
    'gmail.com','googlemail.com','outlook.com','hotmail.com','live.com',
    'yahoo.com','yahoo.com.au','icloud.com','me.com','mac.com','aol.com',
    'proton.me','protonmail.com','gmx.com','mail.com','yandex.com','msn.com',
    'ymail.com','pm.me','zoho.com','fastmail.com'
  ]);
$$;
grant execute on function private.is_generic_email_domain(text) to authenticated;

-- Create the caller's vendor org (idempotent: returns the existing org if the
-- caller is already a member). Owner seat is created active.
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

  -- Already a member? Return their org (idempotent).
  select vendor_id into v_vendor_id
  from public.vendor_user where auth_user_id = v_uid and deleted_at is null limit 1;
  if v_vendor_id is not null then return v_vendor_id; end if;

  -- One org per domain.
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
