-- Reverse of 0032_revoke_auth_on_soft_delete.sql.
-- Drop the soft-delete auth-revoke triggers, then the trigger function. After
-- this, soft-deleting an exec/EA no longer clears auth_user_id (the pre-0032
-- behaviour). Apply manually, never via `supabase db reset`.
drop trigger if exists t_ea_revoke_auth on public.ea;
drop trigger if exists t_executive_revoke_auth on public.executive;
drop function if exists private.revoke_auth_on_soft_delete();
