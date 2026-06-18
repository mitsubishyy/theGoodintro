-- Down: 0023_storage_photo_buckets. Local-only reversal aid (not auto-applied).
--
-- IMPORTANT: storage.objects and storage.buckets carry protect_objects_delete /
-- protect_buckets_delete triggers OWNED BY supabase_storage_admin. The migration
-- role can neither delete those rows directly nor disable the triggers ("must be
-- owner of table objects"). So the bucket + its objects CANNOT be removed in pure
-- SQL — they are emptied and dropped through the Storage API or Studio, e.g.:
--
--   # CLI (local stack):
--   supabase storage rm ss://public-avatars --recursive --experimental
--   # then delete the bucket in Studio (Storage tab) or as supabase_storage_admin.
--
-- The grants + flag below DO reverse in SQL and are the parts that gate access; a
-- leftover public bucket with the policies dropped and the flag off is inert (no
-- upload path), so emptying it is housekeeping, not a security step (orphaned
-- objects are harmless beyond storage cost, per PHOTO_UPLOAD_SCOPE.md).

-- 1. Drop the scoped RLS policies (SQL-reversible; the migration role owns them).
drop policy if exists "p_public_avatars_read"   on storage.objects;
drop policy if exists "p_public_avatars_insert" on storage.objects;
drop policy if exists "p_public_avatars_update" on storage.objects;
drop policy if exists "p_public_avatars_delete" on storage.objects;

-- 2. Drop the feature flag.
delete from public.feature_flag where key = 'photo_upload';

-- 3. The bucket + objects: remove via the Storage API / Studio (see header).
