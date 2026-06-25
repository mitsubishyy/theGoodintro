-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0028_email_token_hardening.sql. Restores the pre-0028 RPC bodies
-- (act_on_request_token at its 0013 shape, get_request_for_token at its 0018
-- shape), then drops the helpers, the rate_limit table, and the added columns.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. ── act_on_request_token back to the 0013 body (no rate limit, no row lock,
--        no expiry, send_to_ea unconditional + non-idempotent, actor 'system') ──
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

-- 2. ── get_request_for_token back to the 0018 body (no is_expired column) ────
drop function if exists public.get_request_for_token(text);
create function public.get_request_for_token(p_token text)
returns table (
  request_id uuid, request_status text, token_status text,
  vendor_name text, exec_name text, q1 text, q2 text,
  charity_name text, held_count int,
  requester_name text, ea_name text, meeting_minutes int, has_consent boolean
) language sql stable security definer set search_path = '' as $$
  select r.id, r.status::text, t.status::text,
         v.name, e.name, r.q1_what, r.q2_why, c.name,
         coalesce((select cy.held_meetings_count from public.cycle cy
                   where cy.vendor_id = r.vendor_id order by cy.started_at desc limit 1), 0),
         coalesce(nullif(trim(r.attendee->>'name'), ''), vu.name),
         a.name,
         r.meeting_minutes,
         exists (select 1 from public.consent_event ce
                 join public.request r2 on r2.id = ce.request_id
                 where r2.executive_id = e.id)
  from public.email_action_token t
  join public.request r on r.id = t.request_id
  join public.vendor v on v.id = r.vendor_id
  join public.executive e on e.id = r.executive_id
  left join public.charity c on c.id = e.default_charity_id
  left join public.vendor_user vu on vu.id = r.requested_by_user_id
  left join public.ea a on a.id = e.ea_id
  where t.token = p_token;
$$;
revoke all on function public.get_request_for_token(text) from public;
grant execute on function public.get_request_for_token(text) to anon, authenticated;

-- 3. ── Drop the helpers, the limiter table, and the added columns ────────────
drop function if exists public.ensure_request_action_token(uuid);
drop function if exists public.consume_rate_limit(text, integer, integer);
drop table if exists public.rate_limit;
alter table public.request drop column if exists forwarded_to_ea_at;
alter table public.email_action_token drop column if exists expires_at;
