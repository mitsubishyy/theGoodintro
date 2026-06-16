-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — charity content (2026-06-16)
--
-- The charity-content increment parked at the exec-portal schema review
-- (exec-portal-schema-state #2). Backs the locked charity DETAIL modal
-- (exec-dashboard VP4, re-rendered on exec-my-charity VP3 and opened from the
-- exec Impact "Learn about" footer) and the cause/credentials lines on the
-- Direction Card, the picker rows, and the My charity hero.
--
-- v1 sourcing (ratified by Issy 2026-06-16): the 8 locked charities are
-- CURATED BY HAND (seed_staging.sql), no scraper. The columns are identical to
-- what a future weekly website-scrape job would populate; content_updated_at is
-- the freshness stamp either way. NOT credentials (abn/dgr_* already exist):
-- the content modal is purpose/programmes/where-the-gift-goes/stories only.
--
-- All additive and nullable/defaulted; the two list fields are jsonb arrays:
--   programmes : [{ "label": text, "body": text }]            (top 3, curated order)
--   stories    : [{ "published_at": date, "headline": text,
--                   "body": text, "url": text }]               (newest 2 rendered)
--
-- Reversible: see supabase/down/0021_charity_content_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

alter table public.charity
  add column if not exists cause                      text,
  add column if not exists dgr_item                   text,
  add column if not exists logo_url                   text,
  add column if not exists hero_image_url             text,
  add column if not exists purpose                    text,
  add column if not exists programmes                 jsonb not null default '[]'::jsonb,
  add column if not exists featured_quote             text,
  add column if not exists featured_quote_attribution text,
  add column if not exists stories                    jsonb not null default '[]'::jsonb,
  add column if not exists content_updated_at         timestamptz;
