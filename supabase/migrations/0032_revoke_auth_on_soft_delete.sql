-- ─────────────────────────────────────────────────────────────────────────
-- 0032  Total emergency revoke — drop auth linkage on exec/EA soft-delete
--
-- 0029 scopes a signed-in exec/EA by auth_user_id, and the identity helpers
-- (private.current_executive_id / current_ea_id) filter `deleted_at is null`. So
-- soft-deleting a row already removes it from those helpers' results — BUT the
-- auth_user_id stays pinned to the dead row, which has two bad consequences:
--   1. the kill switch is incomplete: flipping exec_ea_login off blocks new
--      sign-ins, page access and the charity write, yet an already-bound exec/EA
--      whose record is then revoked should lose access the instant it is revoked,
--      not merely on a flag flip. Clearing the link is the per-record revoke.
--   2. re-onboarding is blocked: linkAuthUserToExecOrEa refuses a UID that is
--      still pinned to a soft-deleted record (it must, or it would jump to a
--      different row sharing the email and mis-scope / collide on the unique
--      auth_user_id). A reused email can therefore never re-bind until the stale
--      link is gone.
--
-- This makes the revoke automatic and path-independent: a BEFORE UPDATE trigger
-- nulls auth_user_id the moment a row crosses into soft-deleted, no matter who
-- writes deleted_at (an admin action, the service role, a future bulk revoke).
-- Doing it in the database — atomic with the deleted_at write — means no caller
-- can forget it and there is no window where the row is deleted but still linked.
--
-- Reversible: see supabase/down/0032_revoke_auth_on_soft_delete_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- Fires only on the null -> non-null deleted_at edge (a fresh soft-delete) and
-- only when a link is actually present, so it is a no-op on ordinary updates,
-- on an already-deleted row, and on un-delete (the link stays cleared — a
-- restored exec/EA re-binds through the normal sign-in path). Kept in the
-- unexposed `private` schema with a pinned search_path, like the other identity
-- machinery; trigger functions are never on the PostgREST RPC surface.
create or replace function private.revoke_auth_on_soft_delete()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.deleted_at is not null
     and old.deleted_at is null
     and new.auth_user_id is not null then
    new.auth_user_id := null;
  end if;
  return new;
end;
$$;
revoke all on function private.revoke_auth_on_soft_delete() from public, anon, authenticated;

create trigger t_executive_revoke_auth
  before update on public.executive
  for each row execute function private.revoke_auth_on_soft_delete();

create trigger t_ea_revoke_auth
  before update on public.ea
  for each row execute function private.revoke_auth_on_soft_delete();
