-- ─────────────────────────────────────────────────────────────────────────
-- 0037 — DB-level state-machine transition guard for Request (DEC-6, defense in
-- depth; the same pattern as 0012's Meeting/Gift and 0036's Vendor/Executive
-- guards).
--
-- Request is the first-class booking-loop record STATE_MACHINES.md defines
-- (submitted -> accepted | declined | closed) but, unlike its siblings Meeting
-- and GiftRecord (guarded by 0012), it was only app-guarded: act_on_request_token
-- and close_request check `status = 'submitted'` in-RPC, so a direct or buggy
-- UPDATE could still move a request into an illegal state (reopen a terminal
-- `closed`, un-decline a `declined`, or resurrect `accepted -> submitted`). This
-- encodes the documented Request state machine at the DB level so an illegal
-- status move is impossible even by direct SQL.
--
-- Guard fires on UPDATE only (INSERT sets the initial 'submitted' state). A status
-- that does NOT change is always allowed, so the non-status updates in the request
-- loop pass freely: forwarded_to_ea_at (send-to-EA, still 'submitted'),
-- decline_reason (set_decline_reason_for_token, still 'declined'), ea_forward_note
-- (still 'submitted'), and the existing t_request_updated timestamp touch.
-- `accepted`, `declined`, and `closed` are terminal (the Meeting takes over from
-- `accepted`), so they have no outgoing transition.
--
-- The allow-list is exactly the three transitions STATE_MACHINES.md documents and
-- the RPCs perform (act_on_request_token accept/decline, close_request); it adds
-- NO new states and changes NO business policy. Adding the trigger does NOT
-- validate existing rows; it only governs future updates, so it is safe on live
-- data. Reversible: see ../down/0037_request_transition_guard_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.guard_request_transition()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.status = old.status then
    return new;  -- no status change (forwarded_to_ea_at / decline_reason / ea_forward_note / updated_at)
  end if;
  if (old.status::text, new.status::text) in (
    ('submitted','accepted'),
    ('submitted','declined'),
    ('submitted','closed')
  ) then
    return new;
  end if;
  raise exception 'illegal request transition: % -> %', old.status, new.status;
end;
$$;

create trigger t_request_guard
  before update on public.request
  for each row execute function public.guard_request_transition();
