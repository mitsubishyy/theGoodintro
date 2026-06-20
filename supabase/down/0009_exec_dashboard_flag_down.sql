-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0009_exec_dashboard_flag.sql.
--
-- Removes the seeded 'exec_dashboard' feature-flag row (the optional, secondary
-- executive web dashboard surface; email remains primary). Safe: deletes only
-- the one flag this migration seeded, matched by key. Does NOT touch the
-- feature_flag table itself, which a prior migration created and other flags
-- depend on. The flag shipped OFF by default, so no behaviour change beyond
-- removing the toggle row.
-- ─────────────────────────────────────────────────────────────────────────

delete from public.feature_flag where key = 'exec_dashboard';
