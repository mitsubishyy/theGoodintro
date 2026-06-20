-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0005_exec_onboarding_flag.sql.
--
-- Removes the 'exec_onboarding' feature-flag seed row (Pillar 2 executive
-- onboarding gate). Targeted DELETE by key only: the feature_flag table itself
-- is owned by an earlier migration and is left intact, as are all other flag
-- rows. The flag is off by default, so removing the row reverts the admin
-- onboarding write surface to its unseeded (gated-off) state.
-- ─────────────────────────────────────────────────────────────────────────

delete from public.feature_flag where key = 'exec_onboarding';
