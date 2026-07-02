-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0008_request_loop.sql.
--
-- Drops the three request-loop RPCs and removes the request_loop feature-flag
-- seed row. Safe: this migration only added functions + one flag row. The
-- tables those RPCs read/write (request, email_action_token, notification,
-- consent_event, meeting, audit_entry, executive, vendor, charity, cycle,
-- feature_flag) all pre-exist from earlier migrations and are left untouched,
-- as are any rows the RPCs may have created (requests, tokens, meetings) —
-- this rollback removes only the code paths, not the data they produced.
-- ─────────────────────────────────────────────────────────────────────────

drop function if exists public.act_on_request_token(text, text, text, text, text, text, text);
drop function if exists public.get_request_for_token(text);
drop function if exists public.submit_request(uuid, text, text, jsonb);

delete from public.feature_flag where key = 'request_loop';
