-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0020_xero_oauth_connection.sql.
--
-- Drops the connection store and removes the feature flag. Safe and complete:
-- the table holds only integration tokens (no business records depend on it),
-- so dropping it cannot orphan money or state rows. Re-running the forward
-- migration re-creates an empty table; the operator re-connects Xero.
-- ─────────────────────────────────────────────────────────────────────────

drop trigger if exists t_xero_connection_updated on public.xero_connection;
drop table if exists public.xero_connection;
delete from public.feature_flag where key = 'integrations_xero';
