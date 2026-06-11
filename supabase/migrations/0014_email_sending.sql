-- ─────────────────────────────────────────────────────────────────────────
-- 0014 — email sending (PRODUCTION_READINESS A1, provider per D-3: Resend).
--
-- What the queue drain in apps/platform/lib/email/ needs:
--   * two more notification states: `sending` (claimed by a drain run, so a
--     crashed run can be retried safely) and `bounced` (written by the A3
--     bounce webhook later; added now so the enum is settled).
--   * delivery bookkeeping columns: attempts / last_error / provider_message_id
--     / sent_at / sent_to. All nullable or defaulted; additive only.
--   * `payload` jsonb for notifications that are not request-scoped (the A4
--     receipt needs {credits, amount_cents}; the sign-up alert needs the
--     company/contact). Request-scoped emails keep using request_id (0013).
--   * the `email_sending` feature flag, OFF by default (CHANGE_SAFETY.md).
--   * the missing queue write at sign-up: signup_vendor wrote no notification
--     at all (MVP_GAP_AUDIT step 2 — "the new-signup alert never reaches
--     Issy"), so the RPC is re-created to queue the staff alert email.
--
-- Reversible: see ../down/0014_email_sending_down.sql (enum values cannot be
-- dropped in Postgres; the down recreates the type, which fails if rows use
-- the new values — the correct, safe behaviour).
-- ─────────────────────────────────────────────────────────────────────────

alter type notification_status add value if not exists 'sending';
alter type notification_status add value if not exists 'bounced';

alter table public.notification
  add column if not exists payload             jsonb,
  add column if not exists attempts            integer not null default 0 check (attempts >= 0),
  add column if not exists last_error          text,
  add column if not exists provider_message_id text,
  add column if not exists sent_at             timestamptz,
  add column if not exists sent_to             text;

insert into public.feature_flag (key, enabled, description) values
  ('email_sending', false,
   'Drain the notification queue through Resend (A1). Off until DNS + key are live.')
on conflict (key) do nothing;

-- Re-create signup_vendor (0006) with the staff alert queued. Template A1 in
-- NOTIFICATION_TEMPLATES.md: "New vendor sign-up: {company} ({name}, {email})."
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

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values ('vendor_user', v_user_id, 'vendor.signed_up', 'vendor', v_vendor_id,
            jsonb_build_object('domain', v_domain));

  return v_vendor_id;
end;
$$;

revoke all on function public.signup_vendor(text, text) from public;
grant execute on function public.signup_vendor(text, text) to authenticated;
