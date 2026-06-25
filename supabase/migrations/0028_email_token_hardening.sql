-- ─────────────────────────────────────────────────────────────────────────────
-- 0028  Email-action token hardening + a per-token rate limiter (launch slice 2c)
--
-- Closes the replay / duplicate-side-effect gaps on the public signed-link RPC
-- and adds a 90-day safety-net expiry. Lifecycle invalidation stays PRIMARY
-- (a token dies when its request is accepted/declined/closed, per EMAIL_ACTIONS.md);
-- the 90-day cap is a defence-in-depth backstop so an action link cannot live in
-- an inbox forever if a request somehow stays open. No 14-day expiry — follow-up
-- emails still reuse the same link within the window (see ensure_request_action_token).
--
-- What changes, and why:
--   1. email_action_token.expires_at  — the 90-day backstop (existing rows: created_at + 90d).
--   2. request.forwarded_to_ea_at      — makes "Send to EA" forward EXACTLY once (idempotent).
--   3. rate_limit + consume_rate_limit — generic fixed-window limiter (DB-backed, serverless-safe).
--   4. ensure_request_action_token     — follow-up emails reuse a valid token or mint a fresh one.
--   5. get_request_for_token           — an expired token reads as is_expired WITHOUT exposing details.
--   6. act_on_request_token            — rate-limit, FOR UPDATE row lock (no double-accept / double-forward),
--                                        expiry check, and the idempotent + status-guarded send_to_ea.
--
-- Reversible: additive columns (nullable backfill then defaults), new tables/functions,
-- and create-or-replace on the two RPCs (re-applying the 0013/0018 bodies rolls back).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. ── 90-day backstop expiry on the action token ────────────────────────────
alter table public.email_action_token add column if not exists expires_at timestamptz;
-- Existing tokens: 90 days from their own creation, not from migration time.
update public.email_action_token set expires_at = created_at + interval '90 days'
  where expires_at is null;
alter table public.email_action_token alter column expires_at set default (now() + interval '90 days');
alter table public.email_action_token alter column expires_at set not null;

-- 2. ── Forward-to-EA idempotency marker on the request ───────────────────────
alter table public.request add column if not exists forwarded_to_ea_at timestamptz;

-- 3. ── Generic fixed-window rate limiter (DB-backed; only touched by SD fns) ──
create table if not exists public.rate_limit (
  bucket       text not null,
  window_start timestamptz not null,
  hits         integer not null default 0,
  primary key (bucket, window_start)
);
-- Deny-by-default: no policies, so anon/authenticated cannot read or write it
-- directly; consume_rate_limit (security definer) is the only writer.
alter table public.rate_limit enable row level security;

-- Returns TRUE if the call is within the limit for the current window, FALSE if
-- it has tripped. Atomic upsert: the increment and the read are one statement, so
-- concurrent calls cannot both slip under the cap.
create or replace function public.consume_rate_limit(
  p_bucket text, p_limit integer, p_window_seconds integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  v_window timestamptz;
  v_hits   integer;
begin
  v_window := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  insert into public.rate_limit (bucket, window_start, hits)
    values (p_bucket, v_window, 1)
    on conflict (bucket, window_start)
      do update set hits = public.rate_limit.hits + 1
    returning hits into v_hits;
  return v_hits <= p_limit;
end;
$$;
-- Supabase's default privileges auto-grant EXECUTE to anon/authenticated as
-- NAMED roles, so revoking from `public` alone is not enough — revoke the named
-- roles too. Only the security-definer functions that wrap it (running as owner)
-- call this; no role needs a direct grant.
revoke all on function public.consume_rate_limit(text, integer, integer) from public, anon, authenticated;

-- 4. ── ensure_request_action_token: reuse-or-refresh for follow-up emails ─────
-- Follow-up emails should reuse the still-valid link within the 90-day window, or
-- mint a fresh token if the prior one has hit the backstop. Maintains the
-- single-active-token-per-request invariant: retires expired actives and revokes
-- any extra actives, so a request never carries two live links.
create or replace function public.ensure_request_action_token(p_request_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_token text;
begin
  -- Serialize issuance for this request so concurrent callers cannot race the
  -- single-active invariant into two live tokens.
  perform 1 from public.request where id = p_request_id for update;

  update public.email_action_token
    set status = 'revoked'
    where request_id = p_request_id and status = 'active' and expires_at <= now();

  select token into v_token
    from public.email_action_token
    where request_id = p_request_id and status = 'active' and expires_at > now()
    order by created_at desc
    limit 1;

  if v_token is not null then
    -- Single-active invariant: revoke any other live tokens for this request.
    update public.email_action_token
      set status = 'revoked'
      where request_id = p_request_id and status = 'active' and token <> v_token;
    return v_token;
  end if;

  v_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.email_action_token (request_id, token, status)
    values (p_request_id, v_token, 'active');
  return v_token;
end;
$$;
-- Minting/retrieving an exec action token is a privileged operation: ONLY the
-- email sender (service_role) may call it. Supabase's default privileges grant
-- EXECUTE to anon/authenticated as NAMED roles, so they must be revoked
-- explicitly (revoking `public` alone leaves those grants in place) — a vendor
-- must never be able to obtain or mint the token that authorises actions on an
-- executive's request.
revoke all on function public.ensure_request_action_token(uuid) from public, anon, authenticated;
grant execute on function public.ensure_request_action_token(uuid) to service_role;

-- 5. ── The inert token read: expired tokens reveal NOTHING but "expired" ──────
-- An expired link must show a polite "expired" page that routes to follow-up,
-- WITHOUT exposing any request details. So when expired we return a single row
-- with is_expired = true and every detail column NULL; a missing token returns
-- no row (the page's "not valid" state).
drop function if exists public.get_request_for_token(text);
create function public.get_request_for_token(p_token text)
returns table (
  request_id uuid, request_status text, token_status text,
  vendor_name text, exec_name text, q1 text, q2 text,
  charity_name text, held_count int,
  requester_name text, ea_name text, meeting_minutes int, has_consent boolean,
  is_expired boolean
) language sql stable security definer set search_path = '' as $$
  with base as (
    select
      r.id as request_id, r.status::text as request_status, t.status::text as token_status,
      v.name as vendor_name, e.name as exec_name, r.q1_what as q1, r.q2_why as q2,
      c.name as charity_name,
      coalesce((select cy.held_meetings_count from public.cycle cy
                where cy.vendor_id = r.vendor_id order by cy.started_at desc limit 1), 0) as held_count,
      coalesce(nullif(trim(r.attendee->>'name'), ''), vu.name) as requester_name,
      a.name as ea_name,
      r.meeting_minutes as meeting_minutes,
      exists (select 1 from public.consent_event ce
              join public.request r2 on r2.id = ce.request_id
              where r2.executive_id = e.id) as has_consent,
      (t.expires_at <= now()) as is_expired
    from public.email_action_token t
    join public.request r on r.id = t.request_id
    join public.vendor v on v.id = r.vendor_id
    join public.executive e on e.id = r.executive_id
    left join public.charity c on c.id = e.default_charity_id
    left join public.vendor_user vu on vu.id = r.requested_by_user_id
    left join public.ea a on a.id = e.ea_id
    where t.token = p_token
  )
  select
    case when is_expired then null else request_id end,
    case when is_expired then null else request_status end,
    case when is_expired then null else token_status end,
    case when is_expired then null else vendor_name end,
    case when is_expired then null else exec_name end,
    case when is_expired then null else q1 end,
    case when is_expired then null else q2 end,
    case when is_expired then null else charity_name end,
    case when is_expired then null else held_count end,
    case when is_expired then null else requester_name end,
    case when is_expired then null else ea_name end,
    case when is_expired then null else meeting_minutes end,
    case when is_expired then null else has_consent end,
    is_expired
  from base;
$$;
revoke all on function public.get_request_for_token(text) from public;
grant execute on function public.get_request_for_token(text) to anon, authenticated;

-- 6. ── The committing RPC, hardened ──────────────────────────────────────────
create or replace function public.act_on_request_token(
  p_token text, p_actor text, p_action text, p_decline_reason text,
  p_ip text, p_user_agent text, p_terms_version text
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_req uuid; v_token_status text; v_req_status text; v_exec uuid; v_charity uuid;
  v_req_user uuid; v_ea uuid; v_actor_type public.actor_type; v_expires_at timestamptz;
begin
  -- Per-token rate limit: caps hammering / replay of any single link. Checked
  -- first so a flood does no work. Generous vs the act-instantly double-fire.
  if not public.consume_rate_limit('act_token:' || p_token, 20, 60) then
    raise exception 'rate_limited';
  end if;

  -- Find which request this token authorises (read-only; request_id is immutable).
  select request_id into v_req from public.email_action_token where token = p_token;
  if v_req is null then raise exception 'invalid_token'; end if;

  -- Lock the REQUEST row, not the token: replay safety is request-scoped, so two
  -- concurrent actions on the same request via DIFFERENT active tokens still
  -- serialize here and cannot both create a meeting (double booking). Locking the
  -- request FIRST (before touching any token row) matches the lock order in
  -- ensure_request_action_token, so the two paths can never deadlock.
  select r.status::text, r.executive_id, r.requested_by_user_id
  into v_req_status, v_exec, v_req_user
  from public.request r where r.id = v_req for update;

  -- The token's state is now stable under the request lock (every token mutator
  -- for a request takes this same lock), so a plain read is race-free.
  select t.status::text, t.expires_at into v_token_status, v_expires_at
  from public.email_action_token t where t.token = p_token;

  if v_token_status <> 'active' then raise exception 'token_not_active'; end if;
  if now() >= v_expires_at then raise exception 'token_expired'; end if;
  if p_actor not in ('executive','ea_acting_for_exec') then raise exception 'bad_actor'; end if;
  -- Attribute the action to who acted: the executive, or their EA acting for them.
  v_actor_type := case when p_actor = 'ea_acting_for_exec' then 'ea' else 'executive' end;

  if p_action = 'send_to_ea' then
    -- Forward only while the request is still open (tightened: was unconditional).
    if v_req_status <> 'submitted' then raise exception 'request_not_open'; end if;
    -- Claim the forward atomically; the side effects fire only on the first claim,
    -- so replays (double-click, mail-scanner POST, retry) never re-email the EA.
    -- The token stays ACTIVE (forward is not terminal — the EA still acts).
    update public.request set forwarded_to_ea_at = now()
      where id = v_req and forwarded_to_ea_at is null;
    if found then
      select ea_id into v_ea from public.executive where id = v_exec;
      if v_ea is not null then
        insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id)
          values ('ea', v_ea, 'email', 'B_forward_to_ea', 'queued', v_req);
      end if;
      insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
        values (v_actor_type, v_exec, 'request.forwarded_to_ea', 'request', v_req);
    end if;
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
    -- Terminal: consume EVERY active token for this request, not just the one
    -- used, so no sibling link can be replayed after the decision.
    update public.email_action_token set status = 'consumed'
      where request_id = v_req and status = 'active';
    insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id) values
      ('vendor_user', v_req_user, 'email', 'C1_exec_accepted', 'queued', v_req),
      ('staff', null, 'in_app', 'C1_confirm_time', 'queued', v_req);
    insert into public.audit_entry (actor_type, acting_for_executive_id, action, target_type, target_id)
      values (v_actor_type, v_exec, 'request.accepted', 'request', v_req);
    return 'accepted';
  else
    update public.request set status = 'declined', decline_reason = p_decline_reason where id = v_req;
    -- Terminal: consume every active token for this request (see accept).
    update public.email_action_token set status = 'consumed'
      where request_id = v_req and status = 'active';
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
