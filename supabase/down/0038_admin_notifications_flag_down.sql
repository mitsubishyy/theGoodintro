-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0038_admin_notifications_flag.sql. Removes the feature flag row,
-- which hides the nav item and 404s the route (getFlag defaults to OFF for a
-- missing key). Apply manually, never via `supabase db reset`.
-- ─────────────────────────────────────────────────────────────────────────

delete from public.feature_flag where key = 'admin_notifications';
