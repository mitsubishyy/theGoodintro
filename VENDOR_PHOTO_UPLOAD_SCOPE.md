# Vendor photo upload, build spec (PLAN, pre-build)

Status: PLAN for review. Nothing here is built yet. Awaiting Issy's approval to
build. Produced 2026-06-20 from a two-part audit of the platform (executive photo
display + vendor photo story).

This reuses the already-built executive photo slice as its blueprint end to end:
upload route (`apps/platform/app/api/upload/photo/route.ts`), pure processor
(`apps/platform/lib/upload/photo.ts`), client helper (`apps/platform/lib/upload/client.ts`),
origin-guarded save action (`apps/platform/app/exec/actions.ts:127`), and the
`PhotoUploadField` control (`apps/platform/app/admin/_components/photo-upload-field.tsx`).

## Decisions locked with Issy (2026-06-20)

1. Vendor self-serve photo lives on the vendor settings / profile page. NOT in signup.
2. Admin override: staff can also upload a photo for a vendor from the admin vendor
   detail screen.
3. Person photos only. No company logos anywhere.
4. The vendor person's photo now renders inside the executive request email, reusing
   the email's existing avatar slot with an initials fallback. This intentionally
   amends the 2026-06-12 "no image in any email" lock (see section 7).

## Build status (2026-06-20, branch `platform/vendor-photo-upload`, local only, nothing on cloud)

DONE + verified locally:
- Migration 0026 (helper `private.current_vendor_user_id()`, path-scoped storage
  RLS, `vendor_photo_upload` flag OFF). Applied locally, idempotent, 0023 staff
  policies intact. Verified at the DB: vendor may write only its own path,
  forged path denied by RLS.
- Upload pipeline + route: `lib/upload/photo.ts` + `client.ts` gain the
  `vendor-user` entity; `app/api/upload/photo/route.ts` branches authz (vendor
  self-serve OR staff admin-override under `vendor_photo_upload`). Verified 3
  ways: vendor self-upload ok, forged ownerId 403, admin-override ok.
- Companion fix `lib/supabase/middleware.ts`: demo mode no longer account-switches
  `/api/*` routes (it dropped the upload POST body). Production behavior unchanged.
- Display wiring: admin Users & seats renders `vendor_user.photo_url` (verified as
  a real `<img>`); admin executive detail header gains an avatar; exec-portal
  vendor surfaces already render it. `PhotoUploadField` accepts the vendor entity.

DEFERRED to Claude Design (Issy, 2026-06-20) — do NOT freelance:
- Admin-override upload control placement (Users & seats is locked T4).
- Vendor self-serve control + the vendor settings page (currently ComingSoon, portal paused).

STILL TO BUILD (after the two designs land):
- Save actions: `saveVendorPhotoAction` (vendor; note `logAudit` is staff-only,
  so vendor audit needs `actor_type` handling) + an admin-override save action in
  `app/admin/vendors/actions.ts`. Wiring depends on the designed UIs.
- Email: vendor photo in the request card with cartoon-then-initials fallback
  (section 7). Independent of the UIs, but only shows real photos once uploads exist.
- Tests + full gate.

## CLOUD ROLLOUT STATUS (2026-06-20) — read before touching the cloud

The **executive** photo slice is LIVE on the cloud demo (project ojizccgnnfmigizqgthp):
- Migration **0023** was applied to cloud via the Supabase MCP (bucket `public-avatars`,
  staff-only storage RLS, `photo_upload` flag). The `photo_upload` flag is **ON**.
- The deployed v2-foundation code already had the exec photo UI, so no redeploy was
  needed; the admin New/Edit Executive + exec Profile photo controls are now active on
  https://thegoodintro-platform.vercel.app . `executive.photo_url` already existed (0001).
- Issy authorised this one cloud write explicitly, overriding the CLAUDE.md "local DB
  only" rule for the exec slice. That rule is self-contradictory (it also calls the cloud
  the staging/demo) and should be reconciled.

The **vendor** photo slice is HANDED TO THE BUILD CHAT (Issy, 2026-06-20). It is NOT on
the cloud. To roll it out the build chat must:
1. Cloud DB is genuinely behind: `vendor_user.photo_url` (migration **0019**) does NOT
   exist on cloud, and 0017–0026 are pending. Apply the pending migrations the proper way
   (the original `supabase db push` runbook) — note 0023 is ALREADY applied via MCP, so
   reconcile the history. The vendor slice strictly needs 0019 (column) + 0023 (done) + 0026.
2. Deploy this branch's code onto `platform/v2-foundation` (the demo's deploy branch),
   integrating the build chat's newer commits — do NOT force-push.
3. Then turn `vendor_photo_upload` ON, run the full gate, and verify.

Local branch `platform/vendor-photo-upload` = v2-foundation + one commit (bc5b35b) with
the whole feature. Builds clean locally.

## Current state (from the audit)

- `vendor_user.photo_url` exists (migration `0019_exec_portal_schema.sql:78-80`) but
  is never written today, so it is always null.
- No photo upload exists in vendor signup, application, or settings.
- Exec-portal surfaces already render `vendor_user.photo_url` (requests + dashboard),
  so they need no display work; they simply show initials until a photo exists.
- Admin vendor "Users & seats" list shows initials only (no `src`), so it needs wiring.
- Storage bucket `public-avatars` exists with staff-only write (migration
  `0023_storage_photo_buckets.sql:39-43`). READ is public.

## 1. Feature flag

`vendor_photo_upload`, seeded OFF, in the new migration below. Governs BOTH the
vendor self-serve control and the admin override control. The existing `photo_upload`
(exec) flag stays as is.

## 2. Migration `0026_vendor_photo_storage.sql` (+ down), the one security-sensitive piece

Only the vendor self-serve path needs new permissions. The admin override path reuses
the existing staff-only write, so it needs no new RLS.

- Add `private.storage_entity(name text)` helper that parses a storage object path
  into its `{entity, ownerId}` segments. SECURITY DEFINER, `search_path=''`, granted
  to `authenticated` (mirror the `0003` helper conventions). Named as a TODO in
  `0023:26` but does not exist yet.
- Add a helper resolving `auth.uid()` to the caller's own `vendor_user.id`
  (analogous to `private.current_vendor_id()` at `0003:45`, but returning `vu.id`).
  Uses the existing `vendor_user.auth_user_id` link (`0006:52`).
- Add path-scoped INSERT / UPDATE / DELETE policies on `storage.objects` for
  `bucket_id='public-avatars'` where the path entity is `vendor-user` AND its ownerId
  equals the caller's own `vendor_user.id`. ADDITIVE. The existing staff-only policies
  stay untouched; do not loosen them.
- Seed the `vendor_photo_upload` flag OFF.

## 3. Upload route + pipeline, add the vendor entity

- `lib/upload/photo.ts:28,35`: extend `AssetEntity` + `ASSET_SPECS` with a vendor
  avatar spec (512px square WebP, reuse the exec variant). The storage path segment
  must be `vendor-user` to match the RLS policy.
- `lib/upload/client.ts:13`: add the entity to the union.
- `app/api/upload/photo/route.ts`: branch authz.
  - Vendor session path: gated on `vendor_photo_upload`; caller must own `ownerId`
    (= their `vendor_user.id`); path-scoped RLS is the real enforcement. Reject any
    cross-vendor `ownerId`.
  - Staff session path (admin override): also accepts the vendor entity; gated on
    `vendor_photo_upload`; existing staff RLS enforces.

## 4. Save actions

- `saveVendorPhotoAction` (vendor self-serve): mirror `saveProfilePhotoAction`
  (`app/exec/actions.ts:127-135`). Flag-check, reuse `isOwnAvatarUrl()` origin guard
  (`lib/upload/url.ts`), write the caller's OWN `vendor_user.photo_url` only, audited.
- Admin vendor photo save (admin override): a staff-authorized action writing
  `vendor_user.photo_url` for the targeted `vendor_user`, audited.

## 5. UI

- Vendor: mount `PhotoUploadField` on the vendor settings page
  (`app/vendor/settings/page.tsx`, currently has no photo control). `enabled` wired to
  `vendor_photo_upload`, `ownerId` to the signed-in `vendor_user.id`, entity vendor.
- Admin override: mount `PhotoUploadField` on the admin vendor detail form
  (`app/admin/vendors/[id]/...`). Entity vendor, `ownerId` = that `vendor_user.id`,
  `enabled` = `vendor_photo_upload`.

## 6. Display wiring

- Admin "Users & seats" list (`app/admin/vendors/[id]/_detail-view.tsx:316`): pass
  `src={u.photoUrl}`; ensure the query selects `photo_url`.
- Exec portal surfaces already render the vendor photo. No change.
- Vendor list + detail header stay company-level (no person photo), confirmed.

## 7. Executive request email, render the photo (amends the 2026-06-12 lock)

Design reference: the marketing-site preview "What a request looks like"
(`apps/web`, the `/executives` page) already shows the vendor in a circular avatar
at the top of the request card, above name + verified badge + role + LinkedIn. That
preview uses a cartoon placeholder. The real sending email reuses that SAME card slot
and fills it with the vendor's real uploaded photo. Fallback when no photo exists:
the vendor's INITIALS (recommended, already built), not the cartoon placeholder.

- `lib/email/templates.ts` (the vendor card in `execRequestEmail`, around lines
  176 and 427): replace the initials-only monogram with a "bulletproof" circular
  avatar: a cell with a background colour + initials text, overlaid by an
  `<img src={photoUrl}>` at the EXISTING monogram size and shape. If `photoUrl` is
  absent, or the recipient's mail client blocks images, the initials show. No layout
  change; reuse the existing slot.
- `lib/email/sender.ts` (around line 151): pass `vendor_user.photo_url` into the
  template; ensure the data feeding the sender selects it.
- The `public-avatars` bucket already serves a stable public URL, which is exactly
  what an email needs, so no storage change for the email.
- Re-test rendering in Gmail (web + app), Outlook, and Apple Mail before go-live.
- Note for the record: this reverses the "no image in any email" rationale in
  `PHOTO_UPLOAD_SCOPE.md`. Update that doc and the email-surface lock note so future
  sessions know the email now shows the vendor photo when present, initials otherwise.

## 8. Companion fix (the one executive display gap)

- `app/admin/executives/[id]/page.tsx:51-64`: add `Avatar name={exec.name}
  src={exec.photo_url}` to the read header. The query already fetches `photo_url`, so
  this is render-only.

## 9. Tests

- Extend `tests/photo-upload.test.ts` (currently 11 cases, staff-only) with vendor-path
  RLS: a vendor may write only its own `vendor-user/{ownId}/...` path; cross-vendor and
  anon writes denied; staff path unaffected.
- Add an email-render assertion: photo present renders the img with an initials
  fallback; photo absent renders initials only.

## 10. Change safety (CHANGE_SAFETY.md)

- Work on a branch. `vendor_photo_upload` OFF by default. Test on the LOCAL stack
  first. Full gates before done: `npm test && npm run lint && npm run build && npm run
  check:copy`. Issy approves any cloud go-live. The email change is a live surface, so
  verify rendering across the main clients before enabling.

## Suggested build order

1. Migration + helpers + RLS (local).
2. Route / pipeline vendor entity + the two save actions.
3. Vendor settings UI + admin override UI.
4. Display wiring (admin Users & seats) + exec detail companion fix.
5. Email template + sender + render tests.
6. Full gate + local verification: upload as a vendor, upload as admin, confirm it
   shows in admin + exec portal + a test request email.

## Open items to confirm before build

- Flag name `vendor_photo_upload` acceptable?
- Admin override gated by the same `vendor_photo_upload` flag (recommended) rather than
  a separate staff flag?
