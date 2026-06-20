-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — vendor self-serve avatar storage (2026-06-20)
--
-- Pass B of the photo-upload pipeline (PHOTO_UPLOAD_SCOPE.md +
-- VENDOR_PHOTO_UPLOAD_SCOPE.md): lets a vendor upload their OWN avatar from
-- vendor settings, gated behind the `vendor_photo_upload` flag.
--
-- The executive slice (0023) writes with a STAFF session under the staff-only
-- storage policies. A vendor writes with their OWN session, so this migration
-- adds the path-scoped storage policies that make "a vendor may write only its
-- own vendor-user/{id}/… object" load-bearing in the database, not just in the
-- route handler. The admin-override path (staff uploading a vendor's photo)
-- needs NO new policy: it reuses the existing staff-only INSERT/UPDATE/DELETE
-- from 0023.
--
-- Note (engineering): the scope named a `private.storage_entity` path-parser
-- helper. We inline `split_part(name, '/', n)` directly in the policies instead
-- — same security, one fewer object to maintain, and the path shape lives in
-- exactly one place (the upload route). If a second path-scoped bucket appears,
-- promote it to a helper then.
--
-- Additive and reversible: the 0023 staff-only policies are untouched (RLS
-- permissive policies combine with OR), and everything here is idempotent so a
-- re-run / db reset is safe. Reverse: supabase/down/0026_vendor_photo_storage_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. Helper: the caller's OWN vendor_user.id (mirror of current_vendor_id) ─
-- Returns null for staff / anon / a caller with no active vendor_user row, so
-- the path-scoped policies below simply deny them (they fall to other policies).
create or replace function private.current_vendor_user_id()
returns uuid language sql stable security definer set search_path = '' as $$
  select vu.id
  from public.vendor_user vu
  where vu.auth_user_id = (select auth.uid())
    and vu.status = 'active'
    and vu.deleted_at is null
  limit 1;
$$;

revoke all on function private.current_vendor_user_id() from public;
grant execute on function private.current_vendor_user_id() to authenticated;

-- ── 2. Path-scoped storage policies: a vendor may write ONLY its own avatar ──
-- Object paths are server-composed as `vendor-user/{vendor_user.id}/avatar-…`,
-- so we scope on the first two path segments. Additive to the 0023 staff
-- policies (permissive policies OR together). Idempotent via drop-if-exists.
drop policy if exists "p_vendor_avatars_insert" on storage.objects;
drop policy if exists "p_vendor_avatars_update" on storage.objects;
drop policy if exists "p_vendor_avatars_delete" on storage.objects;

create policy "p_vendor_avatars_insert" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'public-avatars'
    and split_part(name, '/', 1) = 'vendor-user'
    and split_part(name, '/', 2) = private.current_vendor_user_id()::text
  );

create policy "p_vendor_avatars_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'public-avatars'
    and split_part(name, '/', 1) = 'vendor-user'
    and split_part(name, '/', 2) = private.current_vendor_user_id()::text
  )
  with check (
    bucket_id = 'public-avatars'
    and split_part(name, '/', 1) = 'vendor-user'
    and split_part(name, '/', 2) = private.current_vendor_user_id()::text
  );

create policy "p_vendor_avatars_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'public-avatars'
    and split_part(name, '/', 1) = 'vendor-user'
    and split_part(name, '/', 2) = private.current_vendor_user_id()::text
  );

-- ── 3. Feature flag (OFF by default, CHANGE_SAFETY.md) ─────────────────────
-- Gates BOTH the vendor self-serve control and the admin-override control.
insert into public.feature_flag (key, enabled, description) values
  ('vendor_photo_upload', false,
   'Vendor avatar upload (self-serve in vendor settings + admin override). Off = controls render inert.')
on conflict (key) do nothing;
