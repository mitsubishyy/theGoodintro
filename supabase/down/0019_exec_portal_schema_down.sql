-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0019_exec_portal_schema.sql.
--
-- Reverses the exec portal schema floor. Fully reversible: 0019 was additive
-- only (new columns + one new table + its backfill), so this drops exactly what
-- 0019 introduced and nothing it inherited.
--   - nomination_history is 0019's own table: dropping it (cascade) removes its
--     indexes, RLS policies, and the backfilled history rows in one step.
--   - The added columns on executive / charity / vendor_user / request are
--     dropped individually; their parent tables pre-date 0019 and are LEFT.
--   - suggested_cadence and context_notes pre-date 0019 and are NOT touched.
--   - request_q1_head_len / request_q2_head_len are dropped before their
--     columns (constraints depend on the columns).
-- ─────────────────────────────────────────────────────────────────────────

-- ── 6. Nomination history (table + its indexes, policies, backfill) ─────────
-- Dropping the table cascades away its indexes, RLS policies, and backfilled
-- rows; RLS was enabled by THIS migration, so it goes with the table.
drop table if exists public.nomination_history cascade;

-- ── 5. Request: Q1 / Q2 head constraints, then columns ──────────────────────
alter table public.request drop constraint if exists request_q1_head_len;
alter table public.request drop constraint if exists request_q2_head_len;

alter table public.request
  drop column if exists q1_head,
  drop column if exists q2_head;

-- ── 4. Vendor user: photo + one-line bio ────────────────────────────────────
alter table public.vendor_user
  drop column if exists photo_url,
  drop column if exists bio_one_liner;

-- ── 3. Charity: short name ──────────────────────────────────────────────────
alter table public.charity
  drop column if exists short_name;

-- ── 2. Executive: calendar / timezone / preferred window ────────────────────
alter table public.executive
  drop column if exists timezone,
  drop column if exists calendar_provider,
  drop column if exists calendar_connected_at,
  drop column if exists calendar_last_synced_at,
  drop column if exists preferred_window_days,
  drop column if exists preferred_window_start,
  drop column if exists preferred_window_end;

-- ── 1. Executive: LinkedIn + structured business context ────────────────────
-- suggested_cadence (0001) and context_notes pre-date this migration and are
-- deliberately left untouched.
alter table public.executive
  drop column if exists linkedin_url,
  drop column if exists interested_in,
  drop column if exists current_projects,
  drop column if exists not_interested_in,
  drop column if exists timeline,
  drop column if exists seniority_signal;
