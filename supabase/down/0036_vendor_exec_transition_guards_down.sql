-- ─────────────────────────────────────────────────────────────────────────
-- DOWN for 0036_vendor_exec_transition_guards.sql. Removes the guard triggers +
-- functions, reverting Vendor/Executive to app-only guarding. Apply manually,
-- never via `supabase db reset`.
-- ─────────────────────────────────────────────────────────────────────────

drop trigger if exists t_vendor_guard    on public.vendor;
drop trigger if exists t_executive_guard on public.executive;
drop function if exists public.guard_vendor_transition();
drop function if exists public.guard_executive_transition();
