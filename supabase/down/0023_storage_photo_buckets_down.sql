-- Down: 0023_storage_photo_buckets.
drop policy if exists "p_public_avatars_read"   on storage.objects;
drop policy if exists "p_public_avatars_insert" on storage.objects;
drop policy if exists "p_public_avatars_update" on storage.objects;
drop policy if exists "p_public_avatars_delete" on storage.objects;
-- Local-only: remove any objects then the bucket (cascade is not assumed).
delete from storage.objects where bucket_id = 'public-avatars';
delete from storage.buckets where id = 'public-avatars';
delete from public.feature_flag where key = 'photo_upload';
