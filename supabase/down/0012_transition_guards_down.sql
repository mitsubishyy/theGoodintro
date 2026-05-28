-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0012_transition_guards.sql. Removes the guard triggers + functions.
-- ─────────────────────────────────────────────────────────────────────────

drop trigger if exists t_gift_record_guard on public.gift_record;
drop trigger if exists t_meeting_guard     on public.meeting;
drop function if exists public.guard_gift_transition();
drop function if exists public.guard_meeting_transition();
