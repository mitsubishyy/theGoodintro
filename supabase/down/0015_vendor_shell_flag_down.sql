-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0015_vendor_shell_flag.sql.
--
-- Removes the 'vendor_shell' feature flag seeded by the up migration. Targeted
-- delete by key only: the public.feature_flag table itself predates this
-- migration and stays. Safe: the flag ships OFF, so deleting the row changes
-- nothing for vendors (the pre-port surfaces were rendering regardless); the
-- up migration can be re-run to re-seed it.
-- ─────────────────────────────────────────────────────────────────────────

delete from public.feature_flag where key = 'vendor_shell';
