-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — feature flag: Admin Vendors list actions (chunk B)
--
-- Gates the mutating row/bulk actions on the Admin Vendors list T3 port
-- (UI_KIT_DESIGN_LOG "Admin Vendors list (T3)" LOCKED 2026-06-02): archive
-- from the row overflow menu and the bulk-actions bar. OFF by default
-- (CHANGE_SAFETY.md): with the flag off the menus render but the mutating
-- items are disabled, staging first, Issy approves go-live.
-- Reversible: delete the flag row to remove.
-- ─────────────────────────────────────────────────────────────────────────

insert into public.feature_flag (key, enabled, description) values
  ('admin_vendors_actions', false,
   'Admin Vendors list mutating row/bulk actions (archive). Off = actions render disabled.')
on conflict (key) do nothing;
