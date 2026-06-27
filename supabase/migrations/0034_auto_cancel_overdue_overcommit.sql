-- ─────────────────────────────────────────────────────────────────────────
-- 0034 — Auto-cancel unpaid, overdue overcommit meetings (STATE_MACHINES.md
-- `confirmed -> cancelled`, the uncredited-payment sub-flow step 5).
--
-- An overcommit booking is a `confirmed` meeting with NO reserved credit
-- (credit_lot_id is null) and a `payment_due_at` deadline. If payment never
-- clears by that deadline the meeting must be auto-cancelled and the slot
-- released. Until now nothing did this: a stale unpaid overcommit just sat
-- `confirmed`, and — the money leak — mark_held would happily mint a real
-- charity GiftRecord for it WITHOUT consuming a credit (the credit decrement in
-- 0027.mark_held only runs when credit_lot_id is set). That is a free meeting
-- plus a real donation the vendor never paid for.
--
-- This adds the canonical transition as ONE atomic, idempotent, money-safe
-- function and queues the D3 vendor + exec + EA notices (NOTIFICATION_TEMPLATES
-- "D3 · Auto-cancel, unpaid at the deadline"; STATE_MACHINES: "notify vendor +
-- exec + EA"). Per CHANGE_SAFETY it ships behind the `auto_cancel_overcommit`
-- flag, off by default; the daily SCHEDULE (pg_cron -> pg_net hitting
-- /api/jobs/cancel-overdue) is a cloud/ops step, like the B4 reconcile job, so
-- the flag stays off until Issy enables it on staging.
--
-- Defense in depth: the `confirmed -> cancelled` state move is already in the
-- 0012 guard allow-list, so that transition is DB-enforced. The MONEY safety
-- specific to auto-cancel lives in this function's conditional UPDATE: it only
-- ever touches rows that are still `confirmed`, uncredited (credit_lot_id is
-- null), and genuinely past due (payment_due_at < p_now). It can therefore
-- never cancel a credited booking (nothing to release — credit_lot_id is
-- already null for everything it touches) nor a not-yet-due one, even if called
-- with a wrong p_now. The set is locked FOR UPDATE ... SKIP LOCKED so a
-- concurrent confirm/mark_held on the same row is left to win or be skipped,
-- never double-processed.
--
-- Date math is NOT duplicated here: payment_due_at was computed by
-- @thegoodintro/pricing at confirm/reschedule time; this function only compares
-- the stored deadline against the p_now passed in by the caller (now() from the
-- cron, a fixed instant from tests). Reversible: see
-- ../down/0034_auto_cancel_overdue_overcommit_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.cancel_overdue_overcommit_meetings(p_now timestamptz)
returns integer language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_staff uuid := (select id from public.staff where auth_user_id = (select auth.uid()));
  v_count integer := 0;
  r record;
begin
  -- Staff/system only. A cron / service-role caller has a null auth.uid() and
  -- passes; an authenticated non-staff caller is rejected (the public surfaces
  -- never reach this RPC, but fail closed regardless).
  if v_uid is not null and v_staff is null then raise exception 'not_staff'; end if;

  for r in
    select m.id as meeting_id, m.request_id, req.requested_by_user_id, e.ea_id
    from public.meeting m
    join public.request req on req.id = m.request_id
    join public.executive e on e.id = req.executive_id
    where m.status = 'confirmed'
      and m.credit_lot_id is null
      and m.payment_due_at is not null
      and m.payment_due_at < p_now
    order by m.id
    for update of m skip locked
  loop
    -- Idempotent + money-safe flip. Re-assert every condition so a row that
    -- changed between the select and here (e.g. a late payment just reserved a
    -- credit) is skipped, not wrongly cancelled.
    update public.meeting
      set status = 'cancelled'
      where id = r.meeting_id
        and status = 'confirmed'
        and credit_lot_id is null
        and payment_due_at is not null
        and payment_due_at < p_now;
    if not found then continue; end if;

    -- D3 notices: vendor (the requester) + the executive; the EA too when linked.
    insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id)
    values
      ('vendor_user', r.requested_by_user_id, 'email', 'D3_unpaid_cancelled', 'queued', r.request_id),
      ('executive',   null,                   'email', 'D3_unpaid_cancelled', 'queued', r.request_id);
    if r.ea_id is not null then
      insert into public.notification (recipient_type, recipient_id, channel, event, status, request_id)
        values ('ea', r.ea_id, 'email', 'D3_unpaid_cancelled', 'queued', r.request_id);
    end if;

    insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id, metadata)
      values (case when v_uid is null then 'system'::public.actor_type else 'staff'::public.actor_type end,
              v_staff, 'meeting.auto_cancelled', 'meeting', r.meeting_id, '{}'::jsonb);

    v_count := v_count + 1;
  end loop;

  return v_count;
end; $$;

-- Staff (authenticated, guarded by the is-staff check inside) + service-role for
-- the cron path. Mirrors the 0027 transition grants.
revoke all on function public.cancel_overdue_overcommit_meetings(timestamptz) from public;
grant execute on function public.cancel_overdue_overcommit_meetings(timestamptz) to authenticated, service_role;

-- Off by default (CHANGE_SAFETY). Read AUTHORITATIVELY by the cron route, since a
-- cron POST has no user session and a session-scoped flag read would always be
-- OFF (feature_flag RLS is authenticated-only). Staging first, Issy enables.
insert into public.feature_flag (key, enabled, description) values
  ('auto_cancel_overcommit', false,
   'Auto-cancel unpaid, overdue overcommit meetings (STATE_MACHINES.md confirmed -> cancelled): a CRON_SECRET-gated /api/jobs/cancel-overdue run that cancels confirmed, uncredited meetings past their payment_due_at and queues the D3 vendor + exec + EA notices. Off by default; staging first, Issy enables.')
on conflict (key) do nothing;
