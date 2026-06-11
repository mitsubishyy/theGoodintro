-- ─────────────────────────────────────────────────────────────────────────
-- 0013 — link notification queue rows to their request (A1 prerequisite).
--
-- MVP_GAP_AUDIT step 4: the notification table carries only
-- recipient/channel/event/status, so a queued row cannot identify the request
-- it is about and the email sender (PRODUCTION_READINESS A1) cannot compose
-- the exec request email from the queue. Adds `request_id` (nullable — not
-- every notification is request-scoped), backfills only the rows whose request
-- is provable (never guessed), and re-creates the two RPCs that queue
-- request-scoped notifications so every new row carries it. App-side inserts
-- (lib/meetings.ts) gain the column in the same change set.
-- Reversible: see ../down/0013_notification_request_id_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.notification
  add column if not exists request_id uuid references public.request(id) on delete set null;

create index if not exists notification_request_id_idx on public.notification (request_id);

-- ── Backfill (conservative: exact same-transaction created_at match, and only
--    when that timestamp identifies a single candidate; ambiguous rows stay null).

-- submit_request inserts the request and its three notifications in one
-- transaction, so their created_at values are identical.
update public.notification n
   set request_id = r.id
  from public.request r
 where n.request_id is null
   and n.event in ('B1_request_submitted','B1_request_sent','B1_request_live')
   and r.created_at = n.created_at
   and (select count(*) from public.request r2 where r2.created_at = n.created_at) = 1;

-- act_on_request_token (accept/decline) writes the consent_event in the same
-- transaction as its notifications.
update public.notification n
   set request_id = c.request_id
  from public.consent_event c
 where n.request_id is null
   and n.event in ('C1_exec_accepted','C1_confirm_time','B5_decline_to_send')
   and c.created_at = n.created_at
   and (select count(*) from public.consent_event c2 where c2.created_at = n.created_at) = 1;

-- send_to_ea writes no consent_event; its audit entry shares the transaction.
update public.notification n
   set request_id = a.target_id
  from public.audit_entry a
 where n.request_id is null
   and n.event = 'B_forward_to_ea'
   and a.action = 'request.forwarded_to_ea'
   and a.created_at = n.created_at
   and (select count(*) from public.audit_entry a2
         where a2.action = 'request.forwarded_to_ea' and a2.created_at = n.created_at) = 1;

-- ── Writers: re-create the 0008 RPCs so queued rows always carry request_id.

create or replace function public.submit_request(
  p_executive_id uuid, p_q1 text, p_q2 text, p_attendee jsonb
) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_vendor uuid; v_user uuid; v_req uuid; v_token text;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select vendor_id, id into v_vendor, v_user from public.vendor_user
  where auth_user_id = v_uid and status = 'active' and deleted_at is null limit 1;
  if v_vendor is null then raise exception 'no_vendor'; end if;

  if not exists (select 1 from public.vendor where id = v_vendor and status = 'active') then
    raise exception 'vendor_not_active';
  end if;
  if not exists (select 1 from public.executive where id = p_executive_id and status = 'active' and deleted_at is null) then
    raise exception 'exec_not_available';
  end if;

  insert into public.request
    (vendor_id, requested_by_user_id, executive_id, q1_what, q2_why, attendee, meeting_minutes, status)
    values (v_vendor, v_user, p_executive_id, left(coalesce(p_q1,''),300), left(coalesce(p_q2,''),300),
            p_attendee, 45, 'submitted')
    returning id into v_req;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.email_action_token (request_id, token, status) values (v_req, v_token, 'active');

  insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id) values
    ('executive', p_executive_id, 'email', 'B1_request_submitted', 'queued', v_req),
    ('vendor_user', v_user, 'in_app', 'B1_request_sent', 'queued', v_req),
    ('staff', null, 'in_app', 'B1_request_live', 'queued', v_req);

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id)
    values ('vendor_user', v_user, 'request.submitted', 'request', v_req);

  return v_req;
end;
$$;
revoke all on function public.submit_request(uuid, text, text, jsonb) from public;
grant execute on function public.submit_request(uuid, text, text, jsonb) to authenticated;

create or replace function public.act_on_request_token(
  p_token text, p_actor text, p_action text, p_decline_reason text,
  p_ip text, p_user_agent text, p_terms_version text
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_req uuid; v_token_status text; v_req_status text; v_exec uuid; v_charity uuid;
  v_req_user uuid; v_ea uuid; v_actor_type public.actor_type;
begin
  select t.request_id, t.status::text, r.status::text, r.executive_id, r.requested_by_user_id
  into v_req, v_token_status, v_req_status, v_exec, v_req_user
  from public.email_action_token t join public.request r on r.id = t.request_id
  where t.token = p_token;

  if v_req is null then raise exception 'invalid_token'; end if;
  if v_token_status <> 'active' then raise exception 'token_not_active'; end if;
  if p_actor not in ('executive','ea_acting_for_exec') then raise exception 'bad_actor'; end if;
  v_actor_type := case when p_actor = 'ea_acting_for_exec' then 'ea' else 'system' end;

  if p_action = 'send_to_ea' then
    select ea_id into v_ea from public.executive where id = v_exec;
    if v_ea is not null then
      insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id)
        values ('ea', v_ea, 'email', 'B_forward_to_ea', 'queued', v_req);
    end if;
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.forwarded_to_ea', 'request', v_req);
    return 'forwarded';
  end if;

  if v_req_status <> 'submitted' then raise exception 'request_not_open'; end if;
  if p_action not in ('accept','decline') then raise exception 'bad_action'; end if;

  insert into public.consent_event (request_id, token, actor, action, terms_version, ip, user_agent)
    values (v_req, p_token, p_actor::public.consent_actor, p_action,
            coalesce(nullif(p_terms_version,''),'v1'), p_ip, p_user_agent);

  if p_action = 'accept' then
    update public.request set status = 'accepted' where id = v_req;
    select default_charity_id into v_charity from public.executive where id = v_exec;
    insert into public.meeting (request_id, charity_id, status) values (v_req, v_charity, 'proposed');
    update public.email_action_token set status = 'consumed' where token = p_token;
    insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id) values
      ('vendor_user', v_req_user, 'email', 'C1_exec_accepted', 'queued', v_req),
      ('staff', null, 'in_app', 'C1_confirm_time', 'queued', v_req);
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.accepted', 'request', v_req);
    return 'accepted';
  else
    update public.request set status = 'declined', decline_reason = p_decline_reason where id = v_req;
    update public.email_action_token set status = 'consumed' where token = p_token;
    insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id)
      values ('staff', null, 'in_app', 'B5_decline_to_send', 'queued', v_req);
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.declined', 'request', v_req);
    return 'declined';
  end if;
end;
$$;
revoke all on function public.act_on_request_token(text, text, text, text, text, text, text) from public;
grant execute on function public.act_on_request_token(text, text, text, text, text, text, text) to anon, authenticated;
