# Supabase — theGoodintro platform

Database for the internal platform (`apps/platform`). Hosted on **AWS Sydney
(`ap-southeast-2`)** for AU data residency (SECURITY_AND_COMPLIANCE.md).

## Environments

- **Staging / dev (current connected project):** where all schema is built and
  tested first, with **synthetic data only**. Resettable. This is the project
  the Supabase MCP is connected to.
- **Production:** a **separate** Sydney project, created at go-live. The same
  migrations in `migrations/` run against it once Issy approves (CHANGE_SAFETY.md
  "you approve every go-live").

Never edit the database by hand. All schema changes are **reversible migrations**
in `migrations/`, applied in order.

## Migrations

| File | What |
|---|---|
| `0001_foundation.sql` | Enums, helper functions, all v1 tables, constraints, indexes, `updated_at` + append-only triggers (DATA_MODEL.md). |
| `0002_rls.sql` | First RLS pass: enable + force RLS, identity helpers, staff + vendor policies. |
| `0003_rls_hardening.sql` | Advisor fixes: pinned `search_path`, helpers moved to a private (unexposed) schema, consolidated policies, FK indexes. Security advisors clean after this. |

Applied to staging via the Supabase MCP `apply_migration`. Keep these files as
the source of truth; they are replayed against production at launch.

## The tenant boundary (RLS)

- `private.is_staff()` — true if the signed-in user is in `staff`.
- `private.current_vendor_id()` — the vendor org of the signed-in active vendor user.
- Staff (admin) can read/write everything. Vendor users can **read only their own
  org's rows**; all vendor-facing writes go through the server (service role) with
  explicit validation. RLS is verified by tests, not assumed.
