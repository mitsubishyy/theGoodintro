-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0013_notification_request_id.sql. Restores the 0008 RPC bodies
-- (notification inserts without request_id), then drops the index + column.
-- ─────────────────────────────────────────────────────────────────────────

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

  insert into public.notification (recipient_type, recipient_id, channel, event, status) values
    ('executive', p_executive_id, 'email', 'B1_request_submitted', 'queued'),
    ('vendor_user', v_user, 'in_app', 'B1_request_sent', 'queued'),
    ('staff', null, 'in_app', 'B1_request_live', 'queued');

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
      insert into public.notification (recipient_type, recipient_id, channel, event, status)
        values ('ea', v_ea, 'email', 'B_forward_to_ea', 'queued');
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
    insert into public.notification (recipient_type, recipient_id, channel, event, status) values
      ('vendor_user', v_req_user, 'email', 'C1_exec_accepted', 'queued'),
      ('staff', null, 'in_app', 'C1_confirm_time', 'queued');
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.accepted', 'request', v_req);
    return 'accepted';
  else
    update public.request set status = 'declined', decline_reason = p_decline_reason where id = v_req;
    update public.email_action_token set status = 'consumed' where token = p_token;
    insert into public.notification (recipient_type, recipient_id, channel, event, status)
      values ('staff', null, 'in_app', 'B5_decline_to_send', 'queued');
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.declined', 'request', v_req);
    return 'declined';
  end if;
end;
$$;
revoke all on function public.act_on_request_token(text, text, text, text, text, text, text) from public;
grant execute on function public.act_on_request_token(text, text, text, text, text, text, text) to anon, authenticated;

drop index if exists public.notification_request_id_idx;
alter table public.notification drop column if exists request_id;
