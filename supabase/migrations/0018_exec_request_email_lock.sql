-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — exec request email + action pages lock (2026-06-12)
--
-- Backs the locked email surface (design/locked/exec-request-email/):
--
--  1. request.ea_forward_note — the lock's one named schema candidate: the
--     optional note an exec leaves for their EA AFTER the send-to-EA action
--     (act-instantly pattern: the forward already happened; the note is a
--     follow-up). Stored for audit per the lock's recommendation.
--  2. get_request_for_token gains the fields the locked action pages render:
--     requester_name ("Sam will be told politely"), ea_name ("Sent to Lena
--     Park."), meeting_minutes, and has_consent — the consent footnote
--     renders ONLY when the executive has no consent record yet (the inert
--     read happens before the action writes the first record, so the page
--     knows whether THIS was the first-ever action). Return-shape change, so
--     drop + recreate.
--  3. Two follow-up RPCs for the confirmation pages (reasons and notes are
--     optional follow-ups, never gates, so they run AFTER the token was
--     consumed by the act itself):
--       set_decline_reason_for_token — stores a reason chip label or the
--         "Other" free text onto an already-declined request.
--       set_ea_note_for_token — stores the EA note onto an already-forwarded
--         request.
--     Both are keyed on the (possibly consumed) action token, capped at 500
--     chars, and append an audit entry. Reasons are admin-side context and
--     are never sent to the vendor verbatim (lock anti-list).
--
-- Reversible: drop the two new functions, drop the column, and recreate
-- get_request_for_token with its 0008 return shape (see SCHEMA.sql).
-- ─────────────────────────────────────────────────────────────────────────

alter table public.request add column if not exists ea_forward_note text;

-- 2. The inert token read, with the locked action pages' fields.
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

-- 3a. Optional decline-reason follow-up (chips or "Other" text).
create function public.set_decline_reason_for_token(p_token text, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_req uuid; v_status text; v_exec uuid;
begin
  select t.request_id, r.status::text, r.executive_id
  into v_req, v_status, v_exec
  from public.email_action_token t join public.request r on r.id = t.request_id
  where t.token = p_token;

  if v_req is null then raise exception 'invalid_token'; end if;
  if v_status <> 'declined' then raise exception 'request_not_declined'; end if;

  update public.request
  set decline_reason = left(nullif(trim(p_reason), ''), 500)
  where id = v_req;

  insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
    values ('system', v_exec, 'request.decline_reason_added', 'request', v_req);
end;
$$;
revoke all on function public.set_decline_reason_for_token(text, text) from public;
grant execute on function public.set_decline_reason_for_token(text, text) to anon, authenticated;

-- 3b. Optional EA-note follow-up after a send-to-EA forward.
create function public.set_ea_note_for_token(p_token text, p_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare
  v_req uuid; v_exec uuid;
begin
  select t.request_id, r.executive_id into v_req, v_exec
  from public.email_action_token t join public.request r on r.id = t.request_id
  where t.token = p_token;

  if v_req is null then raise exception 'invalid_token'; end if;
  if not exists (select 1 from public.audit_entry a
                 where a.action = 'request.forwarded_to_ea'
                   and a.target_type = 'request' and a.target_id = v_req) then
    raise exception 'not_forwarded';
  end if;

  update public.request
  set ea_forward_note = left(nullif(trim(p_note), ''), 500)
  where id = v_req;

  insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
    values ('system', v_exec, 'request.ea_note_added', 'request', v_req);
end;
$$;
revoke all on function public.set_ea_note_for_token(text, text) from public;
grant execute on function public.set_ea_note_for_token(text, text) to anon, authenticated;
