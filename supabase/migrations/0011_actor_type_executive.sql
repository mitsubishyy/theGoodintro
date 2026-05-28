-- ─────────────────────────────────────────────────────────────────────────
-- 0011 — add `executive` to the actor_type enum (DEC-9).
--
-- An executive's own signed-link action should log as `executive`, not `system`
-- (it currently logs as `system` in act_on_request_token). This migration only
-- ADDS the enum value; the RPC change that uses it ships in the Phase-2
-- state-machine work, deliberately in a later migration.
--
-- Kept as its own migration on purpose: a newly added enum value cannot be used
-- in the same transaction that adds it. Nothing here uses it, so this is safe.
-- Reversible: see 0011_actor_type_executive_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

alter type public.actor_type add value if not exists 'executive';
