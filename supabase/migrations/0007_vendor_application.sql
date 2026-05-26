-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — Pillar 3b: vendor application (vetting)
--
-- A vendor submits the short application that precedes the Calendly vetting
-- call. Self-serve write goes through a SECURITY DEFINER RPC (RLS writes are
-- staff-only). Moves the org signed_up -> call_booked. Approval is a staff
-- action (plain RLS write) handled in the admin portal.
-- ─────────────────────────────────────────────────────────────────────────

create or replace function public.submit_application(p_answers jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_uid uuid := (select auth.uid());
  v_vendor uuid;
  v_user uuid;
  v_app uuid;
begin
  if v_uid is null then raise exception 'not_authenticated'; end if;

  select vendor_id, id into v_vendor, v_user
  from public.vendor_user
  where auth_user_id = v_uid and status = 'active' and deleted_at is null
  limit 1;
  if v_vendor is null then raise exception 'no_vendor'; end if;

  insert into public.application (vendor_id, answers, outcome)
    values (v_vendor, coalesce(p_answers, '{}'::jsonb), 'pending')
    returning id into v_app;

  update public.vendor set status = 'call_booked'
    where id = v_vendor and status = 'signed_up';

  insert into public.audit_entry (actor_type, actor_id, action, target_type, target_id)
    values ('vendor_user', v_user, 'application.submitted', 'application', v_app);

  return v_app;
end;
$$;

revoke all on function public.submit_application(jsonb) from public;
grant execute on function public.submit_application(jsonb) to authenticated;
