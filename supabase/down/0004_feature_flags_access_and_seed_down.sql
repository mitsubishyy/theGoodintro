-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0004_feature_flags_access_and_seed.sql.
--
-- Reverses the feature-flag read access + initial seed only. Deletes exactly
-- the two flag rows this migration seeded (admin_shell, admin_2fa_required) and
-- drops the authenticated-read SELECT policy (p_select) it added. Leaves the
-- feature_flag table and the staff write policies (from 0003) untouched.
-- ─────────────────────────────────────────────────────────────────────────

delete from public.feature_flag
  where key in ('admin_shell', 'admin_2fa_required');

drop policy if exists p_select on public.feature_flag;
