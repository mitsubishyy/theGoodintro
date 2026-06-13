-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — exec portal schema foundation (2026-06-13)
--
-- The schema floor under the locked exec portal screens (design/locked/
-- exec-*). One reversible migration, local stack first (CHANGE_SAFETY.md),
-- additive only: no column is dropped, no existing data is rewritten, so the
-- admin/vendor surfaces already in production keep working unchanged. Scope is
-- exactly the approved list from the build brief; charity-detail content
-- fields the dashboard/my-charity modals will additionally need are called
-- out in the build-chat review note, NOT added here (their jsonb shapes +
-- scrape job are unsettled).
--
-- Enums avoided for the select-backed fields (timeline / seniority_signal),
-- matching the 0016 precedent: the canonical option lists are still an open
-- product decision; plain nullable text now, a check constraint can tighten
-- later without an enum migration.
--
-- REVERSIBILITY (no paired _down.sql: supabase `db reset` applies every file
-- in migrations/ in order, so a down-file would self-revert. The repo's actual
-- practice since 0010 is comment-documented down steps. To roll back 0019:
--   drop table public.nomination_history;
--   alter table public.executive
--     drop column linkedin_url, drop column interested_in,
--     drop column current_projects, drop column not_interested_in,
--     drop column timeline, drop column seniority_signal,
--     drop column timezone, drop column calendar_provider,
--     drop column calendar_connected_at, drop column calendar_last_synced_at,
--     drop column preferred_window_days, drop column preferred_window_start,
--     drop column preferred_window_end;
--   alter table public.charity drop column short_name;
--   alter table public.vendor_user drop column photo_url, drop column bio_one_liner;
--   alter table public.request drop column q1_head, drop column q2_head;
-- (suggested_cadence and context_notes are left untouched by a rollback; they
-- pre-date this migration.)
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. Executive: LinkedIn + structured business context ───────────────────
-- The six business-context fields the locked exec Profile + Admin New
-- Executive form mirror. The sixth, suggested_cadence, ALREADY EXISTS (0001)
-- as text and is reused as-is. context_notes is RETAINED (still wired into the
-- admin exec form + the vendor exec-detail read) and DEPRECATED: the new exec
-- surfaces read the structured fields; context_notes' removal + the admin-form
-- rework to structured fields is a flagged follow-up, not silently done here.
alter table public.executive
  add column if not exists linkedin_url      text,
  add column if not exists interested_in     text,
  add column if not exists current_projects  text,
  add column if not exists not_interested_in text,
  add column if not exists timeline          text,
  add column if not exists seniority_signal  text;

-- ── 2. Executive: calendar / timezone / preferred window ───────────────────
-- Backs the locked "Calendar & access" Profile section + the Admin Calendar &
-- EA module. Free/busy connection only (never event details); the sync
-- timestamps drive the "Last synced N minutes ago" line. Window stored
-- structured so it stays queryable for the slot-proposal step.
alter table public.executive
  add column if not exists timezone               text,
  add column if not exists calendar_provider      text,  -- 'google' | 'outlook' | null
  add column if not exists calendar_connected_at  timestamptz,
  add column if not exists calendar_last_synced_at timestamptz,
  add column if not exists preferred_window_days   text default 'weekdays',
  add column if not exists preferred_window_start  time,
  add column if not exists preferred_window_end    time;

-- ── 3. Charity: short name ─────────────────────────────────────────────────
-- The short reference used by the nomination short-mark + "sent to the Flying
-- Doctor" style lines. The richer charity-detail content fields (cause,
-- logo_url, hero_image_url, dgr_item, purpose, programmes[], featured_quote,
-- stories[]) are NOT added here; see the review note.
alter table public.charity
  add column if not exists short_name text;

-- ── 4. Vendor user: photo + one-line bio ───────────────────────────────────
-- The exec request email's vendor card reads these: photo_url for the avatar,
-- bio_one_liner for the italic credibility line (the email already renders the
-- credibility line only when this value is present).
alter table public.vendor_user
  add column if not exists photo_url      text,
  add column if not exists bio_one_liner  text;

-- ── 5. Request: Q1 / Q2 heads ──────────────────────────────────────────────
-- The locked /exec/requests Card 1 + the request email render a short Fraunces
-- HEAD above each answer body. q1_what / q2_why hold the bodies (existing);
-- these hold the heads. Same content, one source, two renders.
alter table public.request
  add column if not exists q1_head text,
  add column if not exists q2_head text;

do $$
begin
  if not exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'request' and constraint_name = 'request_q1_head_len'
  ) then
    alter table public.request
      add constraint request_q1_head_len check (char_length(q1_head) <= 120),
      add constraint request_q2_head_len check (char_length(q2_head) <= 120);
  end if;
end $$;

-- ── 6. Nomination history ──────────────────────────────────────────────────
-- The standing-charity history behind the My charity page's "since [date]"
-- line + history feed, and a future admin Executive-detail mirror. Append a
-- row on every standing-charity change and close the previous row (ended_at);
-- the current nomination is the single open row (ended_at IS NULL). NOT
-- append-only: closing a row is a legitimate ended_at update, so no
-- prevent_mutation trigger.
create table if not exists public.nomination_history (
  id            uuid primary key default gen_random_uuid(),
  executive_id  uuid not null references public.executive(id) on delete cascade,
  charity_id    uuid not null references public.charity(id),
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  created_at    timestamptz not null default now()
);

create index if not exists nomination_history_exec_started_idx
  on public.nomination_history (executive_id, started_at desc);

-- At most one OPEN nomination per executive (the current standing charity).
create unique index if not exists nomination_history_one_open_per_exec
  on public.nomination_history (executive_id) where ended_at is null;

-- RLS: staff-only, matching the expense table (0010). Execs are email-first
-- with no login/session in v1, so exec-portal reads go through service-role /
-- security-definer paths when those screens are built; no exec-self policy yet.
alter table public.nomination_history enable row level security;
alter table public.nomination_history force row level security;
create policy p_select on public.nomination_history for select to authenticated using (private.is_staff());
create policy p_insert on public.nomination_history for insert to authenticated with check (private.is_staff());
create policy p_update on public.nomination_history for update to authenticated using (private.is_staff()) with check (private.is_staff());
create policy p_delete on public.nomination_history for delete to authenticated using (private.is_staff());

-- Backfill: every executive who already has a standing charity gets an open
-- history row anchored at their join date, so the My charity "since [date]"
-- line resolves for existing records. Idempotent (skips execs that already
-- have any history row).
insert into public.nomination_history (executive_id, charity_id, started_at)
select e.id, e.default_charity_id, e.created_at
from public.executive e
where e.default_charity_id is not null
  and not exists (
    select 1 from public.nomination_history nh where nh.executive_id = e.id
  );
