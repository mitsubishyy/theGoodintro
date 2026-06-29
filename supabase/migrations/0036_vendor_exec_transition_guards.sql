-- ─────────────────────────────────────────────────────────────────────────
-- 0036 — DB-level lifecycle transition guards for Vendor and Executive
-- (DEC-6, defense in depth; the same pattern as 0012's Meeting/Gift guards).
--
-- Meeting and GiftRecord status moves are DB-guarded (0012); Vendor and
-- Executive were only app-guarded (the admin actions + apply_paid_invoice), so a
-- direct or buggy UPDATE could move a vendor/exec into an illegal lifecycle state
-- (e.g. active -> signed_up, a terminal `left`/`churned` reactivated out of band).
-- This encodes the documented lifecycles (DATA_MODEL.md) at the DB level so an
-- illegal status move is impossible even by direct SQL.
--
-- Guards fire on UPDATE only (INSERT sets the initial state). A status that does
-- NOT change is always allowed, so non-status updates (name, photo, owner,
-- access_expires_at, paid_date, etc.) pass freely, and an idempotent re-write of
-- the same status (e.g. apply_paid_invoice paying a top-up while already
-- `active`) is a no-op. Terminal states have no outgoing transition.
--
-- The allow-lists are the UNION of the DATA_MODEL.md chains and what the current
-- code actually performs (audited 2026-06-29), NOT a stricter linear reading:
--   Vendor (DATA_MODEL: signed_up -> call_booked -> approved -> paid -> active
--   -> dormant -> churned):
--     • signed_up  -> call_booked   (0007 vetting call booked)
--     • signed_up  -> approved       (admin approve; canApprove allows signed_up)
--     • call_booked-> approved       (admin approve; the chain step)
--     • approved   -> paid           (chain)
--     • approved   -> active         (apply_paid_invoice first payment; skips paid)
--     • paid       -> active         (chain / apply_paid_invoice)
--     • active     -> dormant        (chain; access lapse, setter deferred)
--     • dormant    -> active         (apply_paid_invoice reactivates a returner)
--     • dormant    -> churned        (chain; setter deferred)
--   Executive (DATA_MODEL + the admin NEXT_STATUS map agree exactly):
--     • invited -> set_up · set_up -> active · active -> paused · active -> left
--     • paused  -> active · paused -> left      (`left` terminal)
--
-- This adds NO new lifecycle states and changes NO business policy; it only
-- enforces the transitions already specced. Adding the triggers does NOT validate
-- existing rows; it only governs future updates, so it is safe on live data.
-- Reversible: see ../down/0036_vendor_exec_transition_guards_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.guard_vendor_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;  -- no status change (e.g. owner_user_id / access_expires_at edit)
  end if;
  if (old.status::text, new.status::text) in (
    ('signed_up','call_booked'),
    ('signed_up','approved'),
    ('call_booked','approved'),
    ('approved','paid'),
    ('approved','active'),
    ('paid','active'),
    ('active','dormant'),
    ('dormant','active'),
    ('dormant','churned')
  ) then
    return new;
  end if;
  raise exception 'illegal vendor transition: % -> %', old.status, new.status;
end;
$$;

create trigger t_vendor_guard
  before update on public.vendor
  for each row execute function public.guard_vendor_transition();

create or replace function public.guard_executive_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;  -- no status change (e.g. auth_user_id / default_charity_id edit)
  end if;
  if (old.status::text, new.status::text) in (
    ('invited','set_up'),
    ('set_up','active'),
    ('active','paused'),
    ('active','left'),
    ('paused','active'),
    ('paused','left')
  ) then
    return new;
  end if;
  raise exception 'illegal executive transition: % -> %', old.status, new.status;
end;
$$;

create trigger t_executive_guard
  before update on public.executive
  for each row execute function public.guard_executive_transition();
