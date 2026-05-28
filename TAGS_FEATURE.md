# Tags (admin-only annotations on vendors and executives)

A feature surfaced during design (2026-05-28). The admin can attach free-form
**tags** to vendors and, separately, to executives, to triage and segment them,
both individually on a record and in bulk from a list.

## Hard rule: admin-only, enforced at the DATA layer (not just the UI)

Tags are internal admin annotations. They are **visible ONLY in the admin portal.**
A vendor must never see the tags on their own record (e.g. "Slow payer"), and an
executive must never see theirs. This is a security rule, not a UI preference:

- `tag`, `vendor_tag`, and `executive_tag` are **staff-only under RLS** (the same
  posture as the `expense` table): vendor users, executives, and EAs cannot read tag
  rows through the API at all.
- No vendor-portal or exec-portal query or API response ever includes tags.

Hiding tags only in the UI is insufficient and counts as a defect; the database must
block non-staff reads. An RLS test must prove a vendor user and an executive cannot
read any tag row.

## Separate sets per entity type

Vendor tags and executive tags are **separate sets**. A tag created for vendors
(e.g. "Priority") does not appear in the executive tag picker, and vice versa.

## Tags vs structured fields (do not conflate)

Tags are free-form labels the admin invents (Priority, VIP, Slow payer, Champion).
They are NOT the structured fields that merely render as chips:
- **Tier** (Founder / Growth / Select) is a controlled classification that drives
  segmentation and reporting; it stays a structured enum field, never a tag.
- The **vendor / executive ID** and **derived indicators** (e.g. "Renewal due") are
  not tags. Render tags visually distinct from these.

## Data model (schema addition; reversible migration, paired down)

```sql
create type tag_entity as enum ('vendor','executive');

create table public.tag (
  id          uuid primary key default gen_random_uuid(),
  entity_type tag_entity not null,
  name        text not null,
  color       text,                  -- optional; default to the amber-soft chip
  created_at  timestamptz not null default now(),
  unique (entity_type, lower(name))  -- no duplicate names within a type
);

create table public.vendor_tag (
  vendor_id uuid not null references public.vendor(id) on delete cascade,
  tag_id    uuid not null references public.tag(id) on delete cascade,
  primary key (vendor_id, tag_id)
);

create table public.executive_tag (
  executive_id uuid not null references public.executive(id) on delete cascade,
  tag_id       uuid not null references public.tag(id) on delete cascade,
  primary key (executive_id, tag_id)
);
-- Integrity: a vendor_tag's tag must have entity_type='vendor', an executive_tag's
-- must be 'executive'. Enforce with a trigger (or a composite-FK pattern).
```

RLS: enable + force on all three tables; **staff-only** select/insert/update/delete
via `private.is_staff()`, exactly like `expense`. No vendor/exec read policy exists.

## UI (admin portal only)

- **Individual:** tags are NOT shown in the profile header. They live in a **"Tags"
  item in the record's left module rail** (the T4 rail, alongside Overview / Users &
  Seats / Requests / Meetings / Billing & Credits / Checklist / Notes), with a small
  count badge. Selecting it shows the tag manager in the centre panel: the record's
  current tags as removable amber-soft `Badge` chips, plus an "+ Add tag" control
  that creates a new tag or picks an existing one (scoped to that entity type), with
  the existing-tags / create-new dropdown. The header keeps only the structured chips
  (Tier, ID, derived indicators), never tags.
- **Bulk ("at scale"):** in the admin **vendors list** and **executives list**,
  select multiple rows (the T3 table multi-select) and apply or remove a tag across
  all selected.
- **Management:** a light tag-management view (Settings, or inline) to rename,
  recolour, or delete a tag, per entity type.
- The vendor and executive **portals get no tag UI and no tag data at all.**

## Build sequence

Schema migration (new tables + staff-only RLS) -> server actions (add / remove /
bulk, staff-only, service-role mediated) -> admin detail + list UI. The RLS test
(non-staff cannot read tags) is part of "done."
