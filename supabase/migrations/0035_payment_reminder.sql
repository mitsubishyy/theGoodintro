-- ─────────────────────────────────────────────────────────────────────────
-- 0035 — D2 payment reminder for unpaid overcommit meetings (STATE_MACHINES.md
-- uncredited-payment sub-flow step 3: "Reminders: at booking, and ~7 days before
-- payment_due_at"; NOTIFICATION_TEMPLATES "D2 · Payment reminder").
--
-- An overcommit booking is a `confirmed` meeting with NO reserved credit
-- (credit_lot_id is null) and a `payment_due_at` deadline. D1 already fires at
-- booking and D3 (migration 0034) auto-cancels once the deadline passes. The
-- missing middle step is D2: a single nudge ~7 days before the deadline so the
-- vendor can still pay and keep the meeting. Until now nothing queued it.
--
-- D2 does NOT change meeting state (the meeting stays `confirmed`), so — unlike
-- the auto-cancel — the status flip cannot be the once-only guard. Idempotency
-- instead rides a new `meeting.payment_reminder_sent_at` stamp: the scan only
-- ever picks rows where it is null, and claims each row by setting it inside the
-- same locked pass. A daily cron can therefore re-run forever and a given
-- meeting is reminded exactly once. Setting that column is a non-status UPDATE,
-- so the 0012 transition guard passes it freely (new.status = old.status).
--
-- MONEY/targeting safety lives in the conditional SELECT + re-asserted UPDATE:
-- it only ever touches rows that are still `confirmed`, uncredited
-- (credit_lot_id is null), not yet reminded (payment_reminder_sent_at is null),
-- genuinely in the future (payment_due_at > p_now, so a past-due row is left to
-- D3, never reminded), and within the 7-day window (payment_due_at <=
-- p_window_end). It can never touch a credited booking (it has a credit_lot_id),
-- and queues only the D2 VENDOR email (the template has no exec/EA copy). The set
-- is locked FOR UPDATE ... SKIP LOCKED so a concurrent confirm / late payment /
-- auto-cancel on the same row wins or is skipped, never double-processed.
--
-- Date math is NOT duplicated here: payment_due_at was computed by
-- @thegoodintro/pricing at confirm/reschedule time, and the 7-day window edge
-- (p_window_end = now + PAYMENT_REMINDER_LEAD_DAYS) is computed by the caller and
-- passed in. This function only compares the stored deadline against the two
-- instants handed to it. Per CHANGE_SAFETY it ships behind the `payment_reminder`
-- flag, off by default; the daily SCHEDULE (pg_cron -> pg_net hitting
-- /api/jobs/payment-reminders) is a cloud/ops step, like B4 + auto-cancel, so the
-- flag stays off until Issy enables it on staging.
-- Reversible: see ../down/0035_payment_reminder_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- Once-only stamp for the D2 reminder (null = not yet reminded). Nullable, no
-- default, so every existing row reads "unsent" and the column is safe on live
-- data (no backfill, no rewrite).
alter table public.meeting add column if not exists payment_reminder_sent_at timestamptz;

create or replace function public.queue_overdue_payment_reminders(
  p_now timestamptz,
  p_window_end timestamptz
) returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_staff uuid := (select id from public.staff where auth_user_id = (select auth.uid()));
  v_count integer := 0;
  r record;
begin
  -- Staff/system only. A cron / service-role caller has a null auth.uid() and
  -- passes; an authenticated non-staff caller is rejected (fail closed).
  if v_uid is not null and v_staff is null then raise exception 'not_staff'; end if;

  for r in
    select m.id as meeting_id, m.request_id, req.requested_by_user_id
    from public.meeting m
    join public.request req on req.id = m.request_id
    where m.status = 'confirmed'
      and m.credit_lot_id is null
      and m.payment_reminder_sent_at is null
      and m.payment_due_at is not null
      and m.payment_due_at > p_now          -- still in the future (past-due is D3's)
      and m.payment_due_at <= p_window_end  -- within the ~7-day reminder window
    order by m.id
    for update of m skip locked
  loop
    -- Claim the row: stamp the reminder, re-asserting every condition so a row
    -- that changed between the select and here (a late payment just reserved a
    -- credit, a concurrent run already stamped it) is skipped, not re-reminded.
    update public.meeting
      set payment_reminder_sent_at = p_now
      where id = r.meeting_id
        and status = 'confirmed'
        and credit_lot_id is null
        and payment_reminder_sent_at is null
        and payment_due_at is not null
        and payment_due_at > p_now
        and payment_due_at <= p_window_end;
    if not found then continue; end if;

    -- D2 is a VENDOR-only nudge (the template has no exec/EA copy): to the
    -- requesting vendor user. The composer derives the meeting from request_id
    -- (the same parked inference as D1/C2/C6/D3 — correct while `cancelled` is
    -- terminal and rebooks only spawn from `held`).
    insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id)
    values ('vendor_user', r.requested_by_user_id, 'email', 'D2_payment_reminder', 'queued', r.request_id);

    insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
      values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
              v_staff, 'meeting.payment_reminder_queued', 'meeting', r.meeting_id, '{}'::jsonb);

    v_count := v_count + 1;
  end loop;

  return v_count;
end; $$;

-- Staff (authenticated, guarded by the is-staff check inside) + service-role for
-- the cron path. Mirrors the 0034 auto-cancel grants.
revoke all on function public.queue_overdue_payment_reminders(timestamptz, timestamptz) from public;
grant execute on function public.queue_overdue_payment_reminders(timestamptz, timestamptz) to authenticated, service_role;

-- Off by default (CHANGE_SAFETY). Read AUTHORITATIVELY by the cron route, since a
-- cron POST has no user session and a session-scoped flag read would always be
-- OFF (feature_flag RLS is authenticated-only). Staging first, Issy enables.
insert into public.feature_flag (key, enabled, description) values
  ('payment_reminder', false,
   'Queue the D2 payment reminder (STATE_MACHINES.md uncredited-payment sub-flow step 3): a CRON_SECRET-gated /api/jobs/payment-reminders run that queues a single vendor D2 email ~7 days before payment_due_at for confirmed, uncredited, not-yet-due meetings. Once-only per meeting via meeting.payment_reminder_sent_at. Off by default; staging first, Issy enables.')
on conflict (key) do nothing;
