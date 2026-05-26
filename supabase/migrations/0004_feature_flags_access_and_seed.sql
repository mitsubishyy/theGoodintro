-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — feature flags: read access + initial seed
--
-- Flags are operational config (CHANGE_SAFETY.md), not sensitive data: any
-- authenticated user may READ them so the app can gate UI; only staff may
-- change them (write policies from 0003 stay). Seeds the initial flags OFF.
-- ─────────────────────────────────────────────────────────────────────────

drop policy if exists p_select on public.feature_flag;
create policy p_select on public.feature_flag
  for select to authenticated using (true);

insert into public.feature_flag (key, enabled, description) values
  ('admin_shell', false,
   'Admin cockpit read-only shell: dashboard, vendors, executives, task inbox.'),
  ('admin_2fa_required', false,
   'Enforce TOTP 2FA (aal2) for staff sign-in. Turn ON at launch.')
on conflict (key) do nothing;
