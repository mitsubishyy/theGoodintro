-- ─────────────────────────────────────────────────────────────────────────
-- 0027 — Atomic money + meeting-lifecycle transitions (PRODUCTION_READINESS
-- "atomic transaction layer"). Before this, lib/meetings.ts and lib/billing.ts
-- ran each transition as a SEQUENCE of separate PostgREST calls (one HTTP round
-- trip = one transaction each), so a failure partway left half-applied state
-- (a held meeting with no gift, a paid invoice with no credits), and the
-- credit/cycle counters were read-modify-written in app code, which loses
-- updates under concurrent calls (two helds of one vendor racing the same band
-- position, two confirms racing the same free credit).
--
-- This migration moves every money/state transition into ONE plpgsql function
-- so all of its writes commit or roll back together, with:
--   • row locks / atomic UPDATEs (no read-modify-write on counters),
--   • a per-vendor advisory lock so concurrent confirms can't over-reserve,
--   • replay idempotency (the state flip is the guard; a second call is a no-op),
--   • an append-only audit_entry per transition.
--
-- Money + date math is NOT duplicated here: the band schedule, cycle-window
-- dates, and the overcommit cap are computed in @thegoodintro/pricing and passed
-- in as parameters (p_bands, p_*_at, p_overcommit_max). The SQL only locks,
-- counts, compares, and writes. The thin wrappers live in lib/meetings.ts and
-- lib/billing.ts. The 0012 transition guards stay as defense-in-depth.
--
-- Authz: these are staff/system operations. A light guard rejects a non-staff
-- AUTHENTICATED caller (auth.uid() set but not staff); service-role / cron
-- callers have a null auth.uid() and pass (the full server-action authz audit is
-- a separate task). Reversible: see ../down/0027_atomic_money_transitions_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- ── helper: actor columns for the audit row (staff id when a staff user calls;
--    null / 'system' for a service-role or cron call). Kept inline per function
--    via a small expression rather than a shared function to keep search_path=''.

-- ════════════════════════════════════════════════════════════════════════════
-- confirm_meeting — reserve a credit if available (under a per-vendor lock so two
-- confirms can't both claim the last credit), else schedule as an overcommit
-- (capped). Atomic: the availability read and the reservation commit together.
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.confirm_meeting(
  p_meeting_id uuid,
  p_scheduled_at timestamptz,
  p_join_url text,
  p_overcommit_scheduled_at timestamptz,
  p_overcommit_payment_due_at timestamptz,
  p_overcommit_max integer
) returns text language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_vendor uuid; v_request uuid;
  v_remaining integer; v_reserved integer; v_available integer;
  v_lot uuid; v_unpaid integer; v_detail text; v_event text;
  v_status text; v_existing_lot uuid;
begin
  if v_uid is not null and not exists (select 1 from public.staff where auth_user_id = v_uid)
    then raise exception 'not_staff'; end if;

  select r.id, r.vendor_id into v_request, v_vendor
  from public.meeting m join public.request r on r.id = m.request_id
  where m.id = p_meeting_id;
  if v_vendor is null then raise exception 'not_found'; end if;

  -- Serialize concurrent confirms for this vendor: availability is a sum across
  -- lots/meetings, so the check-then-reserve must not interleave.
  perform pg_advisory_xact_lock(hashtextextended(v_vendor::text, 0));

  -- Idempotent retry: re-confirming an already-confirmed meeting is a no-op that
  -- preserves its reservation. A double-click / form replay must never turn a
  -- reserved meeting into an uncredited one (use reschedule to change the time).
  -- Only proposed -> confirmed runs the reserve-or-overcommit logic.
  select status::text, credit_lot_id into v_status, v_existing_lot
  from public.meeting where id = p_meeting_id;
  if v_status = 'confirmed' then
    return case when v_existing_lot is not null then 'reserved' else 'overcommit' end;
  elsif v_status <> 'proposed' then
    raise exception 'bad_state';
  end if;

  select coalesce(sum(quantity_remaining), 0) into v_remaining
  from public.credit_lot where vendor_id = v_vendor;
  select count(*) into v_reserved
  from public.meeting m2 join public.request r2 on r2.id = m2.request_id
  where r2.vendor_id = v_vendor and m2.status = 'confirmed' and m2.credit_lot_id is not null;
  v_available := v_remaining - v_reserved;

  if v_available > 0 then
    -- oldest lot whose remaining exceeds its own current reservations
    select cl.id into v_lot from public.credit_lot cl
    where cl.vendor_id = v_vendor
      and cl.quantity_remaining > (
        select count(*) from public.meeting m3 join public.request r3 on r3.id = m3.request_id
        where r3.vendor_id = v_vendor and m3.status = 'confirmed' and m3.credit_lot_id = cl.id)
    order by cl.purchased_at asc limit 1;

    update public.meeting
      set status = 'confirmed', scheduled_at = p_scheduled_at, join_url = p_join_url,
          credit_lot_id = v_lot, payment_due_at = null
      where id = p_meeting_id and status = 'proposed';
    if not found then raise exception 'bad_state'; end if;
    v_detail := 'reserved'; v_event := 'C2_time_confirmed';
  else
    select count(*) into v_unpaid
    from public.meeting m4 join public.request r4 on r4.id = m4.request_id
    where r4.vendor_id = v_vendor and m4.status = 'confirmed' and m4.credit_lot_id is null;
    if v_unpaid >= p_overcommit_max then raise exception 'overcommit_cap_reached'; end if;

    update public.meeting
      set status = 'confirmed', scheduled_at = p_overcommit_scheduled_at, join_url = p_join_url,
          credit_lot_id = null, payment_due_at = p_overcommit_payment_due_at
      where id = p_meeting_id and status = 'proposed';
    if not found then raise exception 'bad_state'; end if;
    v_detail := 'overcommit'; v_event := 'D1_uncredited_booked';
  end if;

  insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id)
    values ('vendor_user', null, 'email', v_event, 'queued', v_request);
  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
            (select id from public.staff where auth_user_id = v_uid),
            'meeting.confirmed', 'meeting', p_meeting_id, jsonb_build_object('detail', v_detail));
  return v_detail;
end; $$;

-- ════════════════════════════════════════════════════════════════════════════
-- mark_held — consume the reserved credit, advance the band cycle, and lock the
-- gift split, all in one transaction. The cycle's held_meetings_count is read
-- and incremented atomically (UPDATE ... RETURNING under the row lock), so two
-- helds of one vendor get distinct band positions. The band split for the
-- position comes from p_bands (pricing), never hardcoded here.
-- ════════════════════════════════════════════════════════════════════════════
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
  v_cycle uuid; v_held_before integer; v_position integer; v_cycle_number integer;
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

  -- The band cycle containing `now`, locked; create it if a 12-month boundary
  -- was crossed (window dates computed by pricing and passed in).
  select id into v_cycle from public.cycle
    where vendor_id = v_vendor and started_at <= p_now and ends_at > p_now
    order by started_at desc limit 1
    for update;
  if v_cycle is null then
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

-- ════════════════════════════════════════════════════════════════════════════
-- reverse_held — return the consumed credit, void the gift only while released
-- (a paid gift stands as goodwill), free the band position, and spawn a rebook.
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.reverse_held(p_meeting_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_vendor uuid; v_request uuid; v_charity uuid; v_lot uuid;
  v_gift uuid; v_sat date; v_cycle uuid;
begin
  if v_uid is not null and not exists (select 1 from public.staff where auth_user_id = v_uid)
    then raise exception 'not_staff'; end if;

  select r.vendor_id, m.request_id, m.charity_id, m.credit_lot_id
    into v_vendor, v_request, v_charity, v_lot
  from public.meeting m join public.request r on r.id = m.request_id
  where m.id = p_meeting_id;
  if v_vendor is null then raise exception 'not_found'; end if;

  perform pg_advisory_xact_lock(hashtextextended(v_vendor::text, 0));

  update public.meeting set status = 'reversed' where id = p_meeting_id and status = 'held';
  if not found then raise exception 'bad_state'; end if;

  update public.gift_record set status = 'voided'
    where meeting_id = p_meeting_id and status = 'released'
    returning id, sat_date into v_gift, v_sat;

  if v_lot is not null then
    update public.credit_lot set quantity_remaining = least(quantity, quantity_remaining + 1)
      where id = v_lot;
  end if;

  -- Give the band position back only when the gift was actually voided.
  if v_gift is not null and v_sat is not null then
    select id into v_cycle from public.cycle
      where vendor_id = v_vendor
        and started_at < ((v_sat + 1)::timestamptz)
        and ends_at > (v_sat::timestamptz)
      order by started_at desc limit 1
      for update;
    if v_cycle is not null then
      update public.cycle set held_meetings_count = held_meetings_count - 1
        where id = v_cycle and held_meetings_count > 0;
    end if;
  end if;

  insert into public.meeting (request_id, charity_id, status)
    values (v_request, v_charity, 'proposed');

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
            (select id from public.staff where auth_user_id = v_uid),
            'meeting.reversed', 'meeting', p_meeting_id,
            jsonb_build_object('gift_voided', v_gift is not null));
  return case when v_gift is not null then 'gift_voided' else 'gift_paid_kept' end;
end; $$;

-- ════════════════════════════════════════════════════════════════════════════
-- release_meeting — no-show / cancellation of a confirmed meeting: release the
-- reservation, no gift.
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.release_meeting(p_meeting_id uuid, p_outcome text)
returns text language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is not null and not exists (select 1 from public.staff where auth_user_id = v_uid)
    then raise exception 'not_staff'; end if;
  if p_outcome not in ('no_show', 'cancelled') then raise exception 'bad_outcome'; end if;

  update public.meeting set status = p_outcome::public.meeting_status, credit_lot_id = null
    where id = p_meeting_id and status = 'confirmed';
  if not found then raise exception 'bad_state'; end if;

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
            (select id from public.staff where auth_user_id = v_uid),
            'meeting.' || p_outcome, 'meeting', p_meeting_id, '{}'::jsonb);
  return p_outcome;
end; $$;

-- ════════════════════════════════════════════════════════════════════════════
-- cancel_proposed_meeting — proposed -> cancelled (no credit was reserved at
-- proposed, so nothing to release). Closes the gap where this allowed edge had
-- no canonical caller.
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.cancel_proposed_meeting(p_meeting_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is not null and not exists (select 1 from public.staff where auth_user_id = v_uid)
    then raise exception 'not_staff'; end if;
  update public.meeting set status = 'cancelled' where id = p_meeting_id and status = 'proposed';
  if not found then raise exception 'bad_state'; end if;
  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
            (select id from public.staff where auth_user_id = v_uid),
            'meeting.cancelled', 'meeting', p_meeting_id, '{}'::jsonb);
  return 'cancelled';
end; $$;

-- ════════════════════════════════════════════════════════════════════════════
-- close_request — submitted -> closed (admin housekeeping for a stale/withdrawn
-- request). Closes the gap where `closed` was rendered but never set.
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.close_request(p_request_id uuid)
returns text language plpgsql security definer set search_path = '' as $$
declare v_uid uuid := (select auth.uid());
begin
  if v_uid is not null and not exists (select 1 from public.staff where auth_user_id = v_uid)
    then raise exception 'not_staff'; end if;
  update public.request set status = 'closed' where id = p_request_id and status = 'submitted';
  if not found then raise exception 'bad_state'; end if;

  -- Neutralise stale exec links so a closed request can no longer be acted on
  -- (V2_BUILD_PLAN: submitted -> closed includes token revocation).
  update public.email_action_token set status = 'revoked'
    where request_id = p_request_id and status = 'active';

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
            (select id from public.staff where auth_user_id = v_uid),
            'request.closed', 'request', p_request_id, '{}'::jsonb);
  return 'closed';
end; $$;

-- ════════════════════════════════════════════════════════════════════════════
-- apply_paid_invoice — the single money-unlock path (Xero webhook + admin
-- "simulate payment"). Locks + claims the invoice, then unlocks credits, anchors
-- / reopens the cycle, activates the vendor, and queues the receipt — all in one
-- transaction. Idempotent: a replay sees the already-claimed invoice and no-ops,
-- so it can never double-credit, and a mid-way failure rolls the claim back.
-- p_credits and the cycle dates come from pricing.
-- ════════════════════════════════════════════════════════════════════════════
create or replace function public.apply_paid_invoice(
  p_xero_invoice_id text,
  p_credits integer,
  p_cycle_ends_at timestamptz,
  p_now timestamptz
) returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid; v_vendor uuid; v_status text; v_amount integer;
  v_cycle_started timestamptz; v_owner uuid; v_lot_id uuid;
begin
  if v_uid is not null and not exists (select 1 from public.staff where auth_user_id = v_uid)
    then raise exception 'not_staff'; end if;

  select id, vendor_id, status::text, amount_cents
    into v_id, v_vendor, v_status, v_amount
  from public.invoice where xero_invoice_id = p_xero_invoice_id
  for update;
  if v_id is null then return jsonb_build_object('status', 'not_found'); end if;
  if v_status = 'paid' then return jsonb_build_object('status', 'already_paid'); end if;

  -- Serialize per vendor so two first-time payments cannot both anchor a cycle.
  perform pg_advisory_xact_lock(hashtextextended(v_vendor::text, 0));

  update public.invoice set status = 'paid' where id = v_id;

  insert into public.credit_lot (vendor_id, quantity, quantity_remaining, invoice_id)
    values (v_vendor, p_credits, p_credits, v_id)
    returning id into v_lot_id;

  -- DEC-8: a late payment reserves the vendor's OLDEST waiting overcommit
  -- meeting(s) (confirmed, no credit yet), up to the credits just bought, and
  -- clears their payment-due deadline. Without this an overcommit meeting would
  -- stay uncredited after payment and mark_held would mint a gift WITHOUT
  -- consuming a credit (the decrement only runs when credit_lot_id is set).
  update public.meeting set credit_lot_id = v_lot_id, payment_due_at = null
  where id in (
    select m.id from public.meeting m join public.request r on r.id = m.request_id
    where r.vendor_id = v_vendor and m.status = 'confirmed' and m.credit_lot_id is null
    order by m.created_at asc
    limit p_credits
  );

  select cycle_started_at, owner_user_id into v_cycle_started, v_owner
  from public.vendor where id = v_vendor;

  if v_cycle_started is null then
    insert into public.cycle (vendor_id, started_at, ends_at, held_meetings_count)
      values (v_vendor, p_now, p_cycle_ends_at, 0);
    update public.vendor
      set status = 'active', cycle_started_at = p_now, access_expires_at = p_cycle_ends_at
      where id = v_vendor;
  else
    update public.vendor set status = 'active', access_expires_at = p_cycle_ends_at where id = v_vendor;
  end if;

  insert into public.notification (recipient_type, recipient_id, channel, event, status, payload) values
    ('vendor_user', v_owner, 'email', 'A4_invoice_paid', 'queued',
       jsonb_build_object('credits', p_credits, 'amount_cents', v_amount)),
    ('staff', null, 'in_app', 'A4_invoice_paid_admin', 'queued',
       jsonb_build_object('credits', p_credits, 'amount_cents', v_amount));
  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
    values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
            (select id from public.staff where auth_user_id = v_uid),
            'invoice.paid', 'invoice', v_id, jsonb_build_object('credits', p_credits));
  return jsonb_build_object('status', 'applied', 'credits', p_credits);
end; $$;

-- ── Grants: staff (authenticated, guarded by is_staff inside) + service-role for
--    the webhook/cron paths. Mirrors how act_on_request_token is granted.
revoke all on function public.confirm_meeting(uuid, timestamptz, text, timestamptz, timestamptz, integer) from public;
revoke all on function public.mark_held(uuid, text, timestamptz, timestamptz, timestamptz, jsonb, text) from public;
revoke all on function public.reverse_held(uuid) from public;
revoke all on function public.release_meeting(uuid, text) from public;
revoke all on function public.cancel_proposed_meeting(uuid) from public;
revoke all on function public.close_request(uuid) from public;
revoke all on function public.apply_paid_invoice(text, integer, timestamptz, timestamptz) from public;

grant execute on function public.confirm_meeting(uuid, timestamptz, text, timestamptz, timestamptz, integer) to authenticated, service_role;
grant execute on function public.mark_held(uuid, text, timestamptz, timestamptz, timestamptz, jsonb, text) to authenticated, service_role;
grant execute on function public.reverse_held(uuid) to authenticated, service_role;
grant execute on function public.release_meeting(uuid, text) to authenticated, service_role;
grant execute on function public.cancel_proposed_meeting(uuid) to authenticated, service_role;
grant execute on function public.close_request(uuid) to authenticated, service_role;
grant execute on function public.apply_paid_invoice(text, integer, timestamptz, timestamptz) to authenticated, service_role;
