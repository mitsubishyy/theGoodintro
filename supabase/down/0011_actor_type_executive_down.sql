-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0011_actor_type_executive.sql.
--
-- Postgres has no DROP VALUE, so removing `executive` means recreating the type.
-- `audit_entry.actor_type` is the only column of this type; the
-- act_on_request_token function declares a variable of the type but resolves it
-- at runtime, so recreating it under the same name is safe.
--
-- This FAILS if any row already uses `executive` (resolve that data first) — which
-- is the correct, safe behaviour for a down migration.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.audit_entry
  alter column actor_type type text using actor_type::text;

drop type public.actor_type;

create type public.actor_type as enum ('staff','vendor_user','ea','system');

alter table public.audit_entry
  alter column actor_type type public.actor_type using actor_type::public.actor_type;
