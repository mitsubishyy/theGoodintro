-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0018_exec_request_email_lock.sql.
--
-- Reverses ONLY what 0018 introduced for the locked exec-request email surface:
--   1. Drops the two follow-up RPCs it created (set_decline_reason_for_token,
--      set_ea_note_for_token).
--   2. Recreates get_request_for_token(text) with its prior 0008 return shape
--      (without requester_name / ea_name / meeting_minutes / has_consent),
--      since 0018 dropped + recreated it with a wider shape.
--   3. Drops the request.ea_forward_note column 0018 added.
--
-- Does NOT touch request.decline_reason (a pre-existing 0001/0008 column that
-- 0018 only writes to), nor any other prior object. Safe: ea_forward_note holds
-- only the optional post-forward EA note; dropping it loses that audit text but
-- nothing money/credit/cycle depends on it.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Drop the two follow-up RPCs 0018 created (reverse order of creation).
drop function if exists public.set_ea_note_for_token(text, text);
drop function if exists public.set_decline_reason_for_token(text, text);

-- 2. Restore get_request_for_token to its 0008 shape (drop the 0018 widened
--    version, recreate the original return shape and body).
drop function if exists public.get_request_for_token(text);
create function public.get_request_for_token(p_token text)
returns table (
  request_id uuid, request_status text, token_status text,
  vendor_name text, exec_name text, q1 text, q2 text,
  charity_name text, held_count int
) language sql stable security definer set search_path = '' as $$
  select r.id, r.status::text, t.status::text,
         v.name, e.name, r.q1_what, r.q2_why, c.name,
         coalesce((select cy.held_meetings_count from public.cycle cy
                   where cy.vendor_id = r.vendor_id order by cy.started_at desc limit 1), 0)
  from public.email_action_token t
  join public.request r on r.id = t.request_id
  join public.vendor v on v.id = r.vendor_id
  join public.executive e on e.id = r.executive_id
  left join public.charity c on c.id = e.default_charity_id
  where t.token = p_token;
$$;
revoke all on function public.get_request_for_token(text) from public;
grant execute on function public.get_request_for_token(text) to anon, authenticated;

-- 3. Drop the column 0018 added (last, after the function that referenced it).
alter table public.request drop column if exists ea_forward_note;
