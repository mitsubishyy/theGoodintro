-- Reverse of 0033_reconcile_job_flag.sql. Remove the reconcile_job flag. The job
-- route reads it authoritatively and defaults to OFF when the row is absent, so
-- removing it simply disables the job. Apply manually, never via `supabase db reset`.
delete from public.feature_flag where key = 'reconcile_job';
