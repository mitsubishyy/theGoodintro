# Photo upload pipeline: as-built + deferred

Status: the EXECUTIVE slice is BUILT on platform/v2-foundation, flag OFF
(`photo_upload`), uncommitted, full gate green. Branch + Issy go-live approval
still required per CHANGE_SAFETY.md. Produced 2026-06-17 from a mapped audit of
every image surface plus an adversarially judged design panel.

## The constraint that drove the design

No photo renders in any email. The exec request email (the only place a vendor's
identity reaches an exec) is locked to an initials avatar plus text (2026-06-12),
no image. Every other photo render point sits in an authenticated portal session.
So there is no signed-URL/expiry tension: a stable PUBLIC url is what the Avatar
component's static src wants, with zero render-side changes.

## What was built (exec slice)

- **Migration 0023** (+ down): one PUBLIC bucket `public-avatars` (file_size_limit
  1MB, allowed_mime_types png/jpeg/webp), `storage.objects` RLS (public read,
  staff-only insert/update/delete via `private.is_staff`), and the `photo_upload`
  flag seeded OFF.
- **`lib/upload/photo.ts`**: `processImage` (pure, unit-tested). Magic-byte sniff
  (rejects SVG and anything not png/jpeg/webp; never trusts extension or client
  Content-Type), 1MB cap, dimension bounds (64px to 6000px), animated-frame
  reject, then a sharp re-encode to WebP. The re-encode is the core security
  control: fresh pixels drop all EXIF/GPS and neutralise polyglots. avatar = 512
  square. Content-hashed object path; client filename discarded.
- **`lib/upload/url.ts`**: `isOwnAvatarUrl` origin guard so a column write only
  ever accepts a URL in our own bucket (upload-only rule).
- **`lib/upload/client.ts`**: `uploadPhotoFile`, the client fetch helper.
- **Route handler `app/api/upload/photo`** (nodejs runtime): flag gate, staff
  authz (returns 403 before any work), validate + re-encode, then writes the
  object with the staff SESSION client so the staff-only RLS policy is the real
  enforcement. Returns a stable public URL. It does NOT write any column.
- **Exec Profile** (`profile-view.tsx`): the camera chip + a "Change photo" link
  (edit mode only) now upload via the route, then persist through
  `saveProfilePhotoAction` (origin-checked, staff-acting-for-exec, audited). With
  the flag off they render the honest "coming soon" affordance.
- **Admin New/Edit Executive form**: the free-text "Photo URL" input is replaced
  by `PhotoUploadField` (file-upload only, per the locked spec), which stashes the
  returned public URL in the hidden `photo_url` the form already saves.
- **Tests** (`photo-upload.test.ts`): 11 cases. processImage (empty, oversize,
  SVG, fake bytes, too-small, valid-to-square-WebP, EXIF stripped) and storage
  RLS (staff writes; vendor + anon denied; public URL readable without a session).

## Decisions taken (confirmed with Issy)

- **Public bucket** (Issy chose, 2026-06-17): low-sensitivity headshots already
  shown to every paid vendor; content-hashed paths are unguessable.
- Avatar 512 square, 1MB cap (locked), WebP output.

## Deferred (not built; each is safe to leave)

- **CSP**: there is no Content-Security-Policy header today, so public images
  render. Adding one is the scope's stage-gated hardening (Report-Only first, then
  enforce) and needs all portal origins (Supabase, Xero, Calendly) enumerated.
- **Charity logo/hero**: `ASSET_SPECS` already has `charity-logo` / `charity-hero`
  entries (512 square / 1200x480). Wiring the admin charity form reuses the exact
  pipeline and closes the residual charity-image gap. Same staff authz, same
  bucket.
- **Vendor self-serve avatar**: Pass B per the vendor-settings-profile lock. Needs
  its own `vendor_photo_upload` flag and a path-scoped storage policy (vendor may
  write only its own `vendor-user/{id}/...` path) via a `private.storage_entity`
  helper. Staff-only INSERT means the bucket is never write-open until then.
- **private-uploads bucket** for future sensitive docs (the private read pattern).
- **Orphaned-object GC** on replace (harmless beyond storage cost).
- **next/image**: not adopted; assets are small re-encoded WebP served via plain
  `<img>`, so no `images.remotePatterns` needed.
