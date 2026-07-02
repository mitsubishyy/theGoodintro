-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0017_admin_vendors_actions_flag.sql.
--
-- Removes the 'admin_vendors_actions' feature flag seeded by the UP migration
-- (gates the Admin Vendors list mutating row/bulk archive actions). Targeted
-- delete by key only: it touches no other flag row and no table the flag
-- gates. Safe: the flag is a UI gate, not money/credit/cycle state; deleting
-- it just removes the toggle (the actions fall back to off/disabled).
-- ─────────────────────────────────────────────────────────────────────────

delete from public.feature_flag where key = 'admin_vendors_actions';
