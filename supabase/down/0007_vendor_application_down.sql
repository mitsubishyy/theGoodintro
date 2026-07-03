-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0007_vendor_application.sql.
--
-- Drops the submit_application(jsonb) SECURITY DEFINER RPC this migration
-- created. The revoke/grant from the up only touched this function's ACL, so
-- they vanish with it; nothing else to undo. The application / vendor /
-- vendor_user / audit_entry tables the function reads and writes predate this
-- migration and are intentionally left untouched. No data is destroyed:
-- dropping the RPC only removes the self-serve write path, leaving rows intact.
-- ─────────────────────────────────────────────────────────────────────────

drop function if exists public.submit_application(jsonb);
