-- Down for 0039_fix_mark_held_cycle_skew. Restores the 0027 mark_held body
-- (the pre-fix cycle find-or-create keyed on `started_at <= p_now and
-- ends_at > p_now`). Reinstating this re-introduces the duplicate-cycle race, so
-- only roll back if 0039 itself is at fault. Grants are preserved by CREATE OR
-- REPLACE and do not need re-issuing.

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

  perform pg_advisory_xact_lock(hashtextextended(v_vendor::text, 0));

  update public.meeting set status = 'held', outcome_source = p_source::public.meeting_outcome_source
    where id = p_meeting_id and status = 'confirmed';
  if not found then raise exception 'bad_state'; end if;

  select id into v_cycle from public.cycle
    where vendor_id = v_vendor and started_at <= p_now and ends_at > p_now
    order by started_at desc limit 1
    for update;
  if v_cycle is null then
    insert into public.cycle (vendor_id, started_at, ends_at, held_meetings_count)
      values (v_vendor, p_cycle_window_start, p_cycle_window_end, 0)
      returning id into v_cycle;
  end if;

  update public.cycle set held_meetings_count = held_meetings_count + 1
    where id = v_cycle
    returning held_meetings_count - 1 into v_held_before;
  v_position := v_held_before + 1;

  select count(*) into v_cycle_number from public.cycle c2
    where c2.vendor_id = v_vendor
      and c2.started_at <= (select started_at from public.cycle where id = v_cycle);

  select b.band_key, b.charity_cents, b.admin_cents
    into v_band_key, v_charity_cents, v_admin_cents
  from jsonb_to_recordset(p_bands)
    as b(band_key text, lo integer, hi integer, charity_cents integer, admin_cents integer)
  where v_position >= b.lo and (b.hi is null or v_position <= b.hi)
  order by b.lo desc limit 1;
  if v_band_key is null then raise exception 'no_band_for_position'; end if;

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
