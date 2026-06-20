-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0016_executive_directory_columns.sql.
--
-- Drops the three executive directory columns this migration added to
-- public.executive: industry, country, bio. The table itself predates this
-- migration and is left intact. Safe: these are plain nullable/defaulted text
-- columns for the Vendor Executives List (industry/country filters + the
-- vendor-facing bio); no money, credit, or cycle row depends on them, and
-- staff-only context_notes is untouched. Dropping them loses only the
-- directory profile fields, which the next run of 0016 re-adds.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.executive
  drop column if exists bio,
  drop column if exists country,
  drop column if exists industry;
