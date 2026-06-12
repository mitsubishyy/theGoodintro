-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — feature flag: locked vendor portal shell
--
-- Gates the ported vendor portal (deep teal-pine sidebar, locked IA, identity
-- card, metrics ribbon dashboard — UI_KIT_DESIGN_LOG "Vendor Dashboard"
-- LOCKED 2026-06-05). OFF by default (CHANGE_SAFETY.md): the pre-port vendor
-- surfaces keep rendering until Issy flips this on, staging first.
-- Reversible: delete the flag row to remove.
-- ─────────────────────────────────────────────────────────────────────────

insert into public.feature_flag (key, enabled, description) values
  ('vendor_shell', false,
   'Locked vendor portal shell + dashboard/executives/request ports. Off = the pre-port vendor pages render unchanged.')
on conflict (key) do nothing;
