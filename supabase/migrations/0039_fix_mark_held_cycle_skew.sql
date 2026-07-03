-- ─────────────────────────────────────────────────────────────────────────
-- 0039 — Fix a real duplicate-cycle race in mark_held (money correctness).
--
-- SYMPTOM: the atomic-transitions test "concurrent helds get distinct band
-- positions" intermittently saw gift positions [1,1] instead of [1,2] (and two
-- cycle rows for one vendor). Band position selects the charity band, so a
-- duplicate position is a WRONG DONATION AMOUNT — this had to be proven, not
-- papered over.
--
-- ROOT CAUSE (not the advisory lock — that works). mark_held (0027) finds-or-
-- creates the vendor's band cycle with:
--     where started_at <= p_now and ends_at > p_now
-- Each caller samples its OWN p_now, and for the very first cycle the wrapper
-- passes started_at = its own now. Under the per-vendor advisory lock the two
-- helds are serialized correctly, but the FOLLOWER's lookup is keyed off the
-- follower's p_now: when the caller that WON the lock had the LATER timestamp,
-- it inserts a cycle whose started_at is a hair AFTER the follower's p_now, so
-- the follower's `started_at <= p_now` misses it and inserts a SECOND cycle.
-- Two cycles => two independent position counters => both helds get position 1.
-- Reproduced at ~3% over 250 iterations locally; the two cycle rows' started_at
-- differed by exactly 1 ms. It is a timing window, hence "intermittent on CI,
-- passes on rerun". apply_paid_invoice is NOT affected: it anchors off the
-- persisted vendor.cycle_started_at flag, not a per-call timestamp.
--
-- FIX (function layer only; the lock and the atomic counter increment are
-- unchanged): under the lock, take the vendor's MOST RECENT cycle (locked) and
-- REUSE it while now is still inside it (ends_at > p_now); open the next window
-- only when a 12-month boundary has genuinely been crossed (ends_at <= p_now).
-- Reuse is no longer gated on `started_at <= p_now`, so a sub-millisecond skew
-- between two callers' p_now can never spawn a duplicate cycle. This preserves
-- the boundary-roll behaviour (the rolled-forward window is deterministic from
-- the anchor, so both boundary-crossers compute the same started_at and the
-- follower reuses the leader's row) and changes NO business policy, NO money
-- math, and NO locking behaviour — it only stops the duplicate insert.
--
-- Considered but deliberately NOT bundled: a gist exclusion constraint making
-- overlapping cycles structurally impossible. It needs the btree_gist extension
-- and would FAIL to install if any pre-existing overlapping cycle rows (from
-- this very bug) already exist in a downstream environment, and it would turn a
-- would-be dup into a raised RPC error rather than a clean reuse. The function
-- fix removes the cause; the constraint is a possible future backstop, Issy's
-- call. Reversible: see ../down/0039_fix_mark_held_cycle_skew_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.mark_held(
  p_meeting_id uuid,
  p_source text,
  p_now timestamptz,
  p_cycle_window_start timestamptz,
  p_cycle_window_end timestamptz,
  p_bands jsonb,
  p_schedule_version text
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_vendor uuid; v_request uuid; v_charity uuid; v_lot uuid;
  v_cycle uuid; v_cycle_ends timestamptz;
  v_held_before integer; v_position integer; v_cycle_number integer;
  v_band_key text; v_charity_cents integer; v_admin_cents integer;
begin
  if v_uid is not null and not exists (select 1 from public.staff where auth_user_id = v_uid)
    then raise exception 'not_staff'; end if;
  if p_source not in ('zoom_teams_api', 'vendor_reported', 'admin') then raise exception 'bad_source'; end if;

  select r.vendor_id, m.request_id, m.charity_id, m.credit_lot_id
    into v_vendor, v_request, v_charity, v_lot
  from public.meeting m join public.request r on r.id = m.request_id
  where m.id = p_meeting_id;
  if v_vendor is null then raise exception 'not_found'; end if;

  -- Serialize all helds for this vendor so the band-cycle find-or-create and the
  -- position increment cannot race (a concurrent held must not create a 2nd cycle
  -- or reuse the same band position). FOR UPDATE alone can't lock a not-yet-
  -- existing cycle row, so the advisory lock is what closes the insert race.
  perform pg_advisory_xact_lock(hashtextextended(v_vendor::text, 0));

  -- Idempotency: only one caller flips confirmed -> held.
  update public.meeting set status = 'held', outcome_source = p_source::public.meeting_outcome_source
    where id = p_meeting_id and status = 'confirmed';
  if not found then raise exception 'bad_state'; end if;

  -- The vendor's most-recent band cycle, locked. Reuse it while `now` is still
  -- inside it; open the next window only when a 12-month boundary has genuinely
  -- been crossed (now >= its end). Reuse is deliberately NOT gated on
  -- `started_at <= p_now`: each caller samples its own p_now (and the first
  -- cycle's started_at is that caller's own now), so under the per-vendor lock a
  -- follower whose p_now is a hair BEFORE the leader's just-created started_at
  -- would otherwise miss it and insert a DUPLICATE cycle (0027 bug: duplicate
  -- band position, wrong charity band). Keying reuse off `ends_at > p_now`
  -- against the latest cycle is skew-proof (ends_at is ~a year out) and keeps the
  -- deterministic boundary-roll behaviour intact.
  select id, ends_at into v_cycle, v_cycle_ends from public.cycle
    where vendor_id = v_vendor
    order by started_at desc limit 1
    for update;
  if v_cycle is null or v_cycle_ends <= p_now then
    insert into public.cycle (vendor_id, started_at, ends_at, held_meetings_count)
      values (v_vendor, p_cycle_window_start, p_cycle_window_end, 0)
      returning id into v_cycle;
  end if;

  -- Atomic read+increment of the locked counter -> this meeting's position.
  update public.cycle set held_meetings_count = held_meetings_count + 1
    where id = v_cycle
    returning held_meetings_count - 1 into v_held_before;
  v_position := v_held_before + 1;

  select count(*) into v_cycle_number from public.cycle c2
    where c2.vendor_id = v_vendor
      and c2.started_at <= (select started_at from public.cycle where id = v_cycle);

  -- Band split for the position, from the pricing-supplied schedule (single source).
  select b.band_key, b.charity_cents, b.admin_cents
    into v_band_key, v_charity_cents, v_admin_cents
  from jsonb_to_recordset(p_bands)
    as b(band_key text, lo integer, hi integer, charity_cents integer, admin_cents integer)
  where v_position >= b.lo and (b.hi is null or v_position <= b.hi)
  order by b.lo desc limit 1;
  if v_band_key is null then raise exception 'no_band_for_position'; end if;

  -- Consume the reserved credit atomically (never below zero).
  if v_lot is not null then
    update public.credit_lot set quantity_remaining = quantity_remaining - 1
      where id = v_lot and quantity_remaining > 0;
  end if;

  insert into public.gift_record
    (meeting_id, charity_id, band_at_completion, charity_amount_cents, admin_fee_cents,
     status, sat_date, cycle_number, position_n, schedule_version)
    values (p_meeting_id, v_charity, v_band_key::public.gift_band, v_charity_cents, v_admin_cents,
            'released', (p_now at time zone 'UTC')::date, v_cycle_number, v_position, p_schedule_version);

  insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id) values
    ('executive', null, 'email', 'C6_meeting_completed', 'queued', v_request),
    ('staff', null, 'in_app', 'C5_release_gift', 'queued', v_request);
  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
            (select id from public.staff where auth_user_id = v_uid),
            'meeting.held', 'meeting', p_meeting_id,
            jsonb_build_object('band', v_band_key, 'position', v_position));
  return v_band_key;
end; $$;
