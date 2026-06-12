-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — executive directory columns for the vendor list
--
-- The locked Vendor Executives List (UI_KIT_DESIGN_LOG 2026-06-06) and
-- VENDOR_PORTAL_BRIEF ("Leader directory: title, company, region, industry")
-- render Industry and Country as columns + filters, and the Executive Detail
-- Drawer renders a vendor-facing bio. None had schema. Plain nullable text
-- (not enums): the canonical industry list / seniority mechanism is still an
-- open product decision; a check constraint can tighten these later.
--
-- Vendors can already read active executives under RLS, so all three columns
-- are vendor-visible by design — bio is the vendor-facing profile paragraph,
-- NOT the staff-only context_notes, which stays admin-side.
--
-- Reversible:
--   alter table public.executive drop column industry, drop column country,
--     drop column bio;
-- ─────────────────────────────────────────────────────────────────────────

alter table public.executive
  add column if not exists industry text,
  -- ISO 3166-1 alpha-2; AU-only today, baked in for going global (brief).
  add column if not exists country  text not null default 'AU',
  add column if not exists bio      text;
