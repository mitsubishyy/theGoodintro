-- Reverse of 0034_auto_cancel_overdue_overcommit.sql. Drop the auto-cancel
-- function and remove its flag. The cron route reads the flag authoritatively
-- and defaults to OFF when the row is absent, so removing it simply disables the
-- job. Apply manually, never via `supabase db reset`.
drop function if exists public.cancel_overdue_overcommit_meetings(timestamptz);
delete from public.feature_flag where key = 'auto_cancel_overcommit';
