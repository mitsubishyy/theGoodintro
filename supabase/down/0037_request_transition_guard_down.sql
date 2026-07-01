-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0037_request_transition_guard.sql. Removes the guard trigger +
-- function, reverting Request to app-only guarding. Apply manually, never via
-- `supabase db reset`.
-- ─────────────────────────────────────────────────────────────────────────

drop trigger if exists t_request_guard on public.request;
drop function if exists public.guard_request_transition();
