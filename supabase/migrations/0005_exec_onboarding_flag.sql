-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — Pillar 2 feature flag (executive onboarding)
--
-- Gates the admin write surface for standing up executives (profiles, charity,
-- EA, pipeline status). Off by default (CHANGE_SAFETY.md).
-- ─────────────────────────────────────────────────────────────────────────

insert into public.feature_flag (key, enabled, description) values
  ('exec_onboarding', false,
   'Admin can create/edit executives, charities and EAs, and move execs through the onboarding pipeline.')
on conflict (key) do nothing;
