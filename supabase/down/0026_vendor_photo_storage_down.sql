-- Reverse of 0026_vendor_photo_storage.sql.
-- Drops the vendor path-scoped storage policies, the helper, and the flag.
-- The 0023 staff-only policies and the `public-avatars` bucket are untouched.

drop policy if exists "p_vendor_avatars_insert" on storage.objects;
drop policy if exists "p_vendor_avatars_update" on storage.objects;
drop policy if exists "p_vendor_avatars_delete" on storage.objects;

drop function if exists private.current_vendor_user_id();

delete from public.feature_flag where key = 'vendor_photo_upload';
