-- ─────────────────────────────────────────────────────────────────────────
-- 0038 — feature flag: Admin staff notifications feed.
--
-- Gates the first renderer for the queued channel='in_app' notification rows
-- (CHANGE_SAFETY.md / apps/platform/CLAUDE.md §4: new behaviour ships behind a
-- flag, OFF by default). The feed at /admin/notifications is READ-ONLY: it lists
-- the staff-directed in_app rows (recipient_type='staff') that have accumulated
-- since the loop went live and were never surfaced anywhere. Off = the route
-- returns 404 and the sidebar item is hidden; staging first, Issy approves
-- go-live. Reversible: delete the flag row (see the _down file).
-- ─────────────────────────────────────────────────────────────────────────

insert into public.feature_flag (key, enabled, description) values
  ('admin_notifications', false,
   'Admin staff notifications feed at /admin/notifications (read-only render of queued in_app staff rows). Off = route 404s, nav item hidden.')
on conflict (key) do nothing;
