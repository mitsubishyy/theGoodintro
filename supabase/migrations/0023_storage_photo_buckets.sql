-- ─────────────────────────────────────────────────────────────────────────
-- theGoodintro platform — photo-upload storage foundation (2026-06-17)
--
-- The first Supabase Storage in the platform. Backs the executive photo-upload
-- pipeline (PHOTO_UPLOAD_SCOPE.md): the locked exec Profile camera affordance +
-- the admin New/Edit Executive photo control, both file-upload-only (no LinkedIn
-- pull). The same bucket is reused later for charity logo/hero (residual gap)
-- and, behind its own Pass-B flag, vendor self-serve avatars.
--
-- ONE public bucket. Every photo render point sits in an authenticated portal
-- AND the locked exec request email renders the vendor as initials only (no
-- image), so there is no email/expiry tension: a stable PUBLIC url is exactly
-- what the Avatar component's static src wants, with zero render-side changes.
-- Paths are server-composed + content-hashed (unguessable), the client filename
-- is discarded. Bucket-level file_size_limit + allowed_mime_types are
-- defence-in-depth alongside the route handler's own sniff/size/re-encode gates.
--
-- WRITE is staff-only via storage.objects RLS (private.is_staff, 0003); the
-- upload route uses the staff SESSION client so this policy is load-bearing, not
-- just belt-and-suspenders. Vendor-own write (path-scoped) is deliberately NOT
-- added here: vendor self-serve is Pass B, and staff-only INSERT means the
-- bucket is never write-open in the meantime. READ is public (anon) so the
-- public url resolves without a session.
--
-- Deferred (not built here): the private-uploads bucket for future sensitive
-- docs, and the private.storage_entity path-parser helper for vendor-own writes.
-- Both land with Pass B / the first sensitive-doc use, fully tested in use.
--
-- Reversible: see supabase/down/0023_storage_photo_buckets_down.sql.
-- ─────────────────────────────────────────────────────────────────────────

-- ── 1. Public bucket for avatars (+ later charity logo/hero) ───────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('public-avatars', 'public-avatars', true, 1048576,
        array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- ── 2. storage.objects RLS: public read, staff-only write ──────────────────
-- storage.objects has RLS enabled by the storage service; we add scoped policies.
-- Idempotent (drop-if-exists then create) so the migration is re-runnable.
drop policy if exists "p_public_avatars_read"   on storage.objects;
drop policy if exists "p_public_avatars_insert" on storage.objects;
drop policy if exists "p_public_avatars_update" on storage.objects;
drop policy if exists "p_public_avatars_delete" on storage.objects;

create policy "p_public_avatars_read" on storage.objects
  for select to public
  using (bucket_id = 'public-avatars');

create policy "p_public_avatars_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'public-avatars' and private.is_staff());

create policy "p_public_avatars_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'public-avatars' and private.is_staff())
  with check (bucket_id = 'public-avatars' and private.is_staff());

create policy "p_public_avatars_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'public-avatars' and private.is_staff());

-- ── 3. Feature flag (OFF by default, CHANGE_SAFETY.md) ─────────────────────
-- With the flag off the camera chip / admin file control render but stay inert.
insert into public.feature_flag (key, enabled, description) values
  ('photo_upload', false,
   'Executive/charity photo upload (Storage public-avatars). Off = affordances render inert.')
on conflict (key) do nothing;
