-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — feature flag: executive dashboard (secondary surface)
--
-- The executive portal is email-first (EMAIL_ACTIONS.md); this web dashboard is
-- an optional, secondary surface for the exec and their EA (EXECUTIVE_PORTAL_
-- BRIEF.md). Ships OFF by default (CHANGE_SAFETY.md): turned on for staging /
-- the demo first, then approved per go-live by Issy.
-- Reversible: delete the flag row to remove.
-- ─────────────────────────────────────────────────────────────────────────

insert into public.feature_flag (key, enabled, description) values
  ('exec_dashboard', false,
   'Executive web dashboard: standing nomination, incoming requests, recent impact, charity picker. Email remains the primary surface.')
on conflict (key) do nothing;
