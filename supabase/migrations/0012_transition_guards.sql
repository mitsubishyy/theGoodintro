-- ─────────────────────────────────────────────────────────────────────────
-- 0012 — DB-level state-machine transition guards (DEC-6, defense in depth).
--
-- App-code checks alone are not enough; encode STATE_MACHINES.md at the DB level
-- so an illegal status move is impossible even by direct SQL. Guards fire on
-- UPDATE only (INSERT sets the initial state). A status that does not change is
-- always allowed, so non-status updates (join_url, scheduled_at, etc.) pass
-- freely. Terminal states have no outgoing transition.
--
-- `proposed -> cancelled` is allowed: a request accepted (meeting = proposed) can
-- be withdrawn before a time is confirmed. No credit is reserved at proposed, so
-- it is money-safe. (Issy approved 2026-05-28; STATE_MACHINES.md matches.)
--
-- Adding these triggers does NOT validate existing rows; it only governs future
-- updates, so it is safe on live data. Reversible: see the _down file.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.guard_meeting_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;  -- no status change (e.g. join_url / scheduled_at edit)
  end if;
  if (old.status::text, new.status::text) in (
    ('proposed','confirmed'),
    ('proposed','cancelled'),   -- request withdrawn before a time is confirmed
    ('confirmed','held'),
    ('confirmed','no_show'),
    ('confirmed','cancelled'),
    ('held','reversed')
  ) then
    return new;
  end if;
  raise exception 'illegal meeting transition: % -> %', old.status, new.status;
end;
$$;

create trigger t_meeting_guard
  before update on public.meeting
  for each row execute function public.guard_meeting_transition();

create or replace function public.guard_gift_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;
  end if;
  -- `paid` is terminal: no paid -> voided (DEC-6). `voided` is terminal.
  if (old.status::text, new.status::text) in (
    ('released','paid'),
    ('released','voided')
  ) then
    return new;
  end if;
  raise exception 'illegal gift_record transition: % -> %', old.status, new.status;
end;
$$;

create trigger t_gift_record_guard
  before update on public.gift_record
  for each row execute function public.guard_gift_transition();
