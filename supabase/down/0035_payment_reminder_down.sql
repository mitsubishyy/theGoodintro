-- Reverse of 0035_payment_reminder.sql. Drop the D2 reminder function, remove its
-- flag, and drop the once-only stamp column. The cron route reads the flag
-- authoritatively and defaults to OFF when the row is absent, so removing it
-- simply disables the job. Apply manually, never via `supabase db reset`.
drop function if exists public.queue_overdue_payment_reminders(timestamptz, timestamptz);
delete from public.feature_flag where key = 'payment_reminder';
alter table public.meeting drop column if exists payment_reminder_sent_at;
