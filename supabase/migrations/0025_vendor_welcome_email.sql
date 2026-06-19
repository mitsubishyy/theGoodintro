-- ─────────────────────────────────────────────────────────────────────────
-- 0025 — queue the A1 vendor welcome at sign-up (PRODUCTION_READINESS A1).
--
-- signup_vendor (0014) queued only the staff alert. The vendor welcome email
-- (lib/email/templates.ts vendorWelcomeEmail, copy signed off 2026-06-13) had a
-- template but was never queued, so the drain never sent it. This re-creates the
-- RPC to ALSO queue an `A1_vendor_welcome` notification to the new owner user;
-- the drain composes it from that vendor_user (email + first name).
--
-- Additive + idempotent re-create; no data change. The welcome only SENDS when
-- email_sending is on + EMAIL_MODE=live (still gated). Reversible: see
-- ../down/0025_vendor_welcome_email_down.sql (restores the 0014 body).
-- ─────────────────────────────────────────────────────────────────────────

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

  -- The new-sign-up alert to Issy (queued; the A1 drain sends it).
  insert into public.notification (recipient_type, recipient_id, channel, event, status, payload)
    values ('staff', null, 'email', 'A1_vendor_signed_up', 'queued',
            jsonb_build_object('company', btrim(p_company), 'name',
                               coalesce(nullif(btrim(p_full_name), ''), v_email),
                               'email', v_email));

  -- The vendor welcome to the new owner user (queued; the A1 drain sends it,
  -- from Issy). Recipient_id lets the drain resolve their email + first name.
  insert into public.notification (recipient_type, recipient_id, channel, event, status)
    values ('vendor_user', v_user_id, 'email', 'A1_vendor_welcome', 'queued');

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values ('vendor_user', v_user_id, 'vendor.signed_up', 'vendor', v_vendor_id,
            jsonb_build_object('domain', v_domain));

  return v_vendor_id;
end;
$$;

revoke all on function public.signup_vendor(text, text) from public;
grant execute on function public.signup_vendor(text, text) to authenticated;
