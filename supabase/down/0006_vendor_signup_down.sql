-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0006_vendor_signup.sql.
--
-- Reverses Pillar 3a vendor sign-up: drops the two functions this migration
-- introduced (public.signup_vendor first, since it calls
-- private.is_generic_email_domain) and deletes the two feature_flag rows it
-- seeded (vendor_signup, vendor_payments), matched by key.
--
-- Does NOT touch the vendor / vendor_user / feature_flag / audit_entry tables
-- (all created by earlier migrations). Grants/revokes are dropped implicitly
-- with their functions. Safe: removing the flags leaves them effectively
-- "off" (their seeded value), and the RPCs only create org rows on demand.
-- ─────────────────────────────────────────────────────────────────────────

drop function if exists public.signup_vendor(text, text);

drop function if exists private.is_generic_email_domain(text);

delete from public.feature_flag where key in ('vendor_signup', 'vendor_payments');
