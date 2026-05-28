# Reverse-DDL companions (down migrations)

DEC-11 (COLD_START_GAPS.md) requires every forward migration to ship a paired,
reversible down. These are those down files, one per forward migration in
`../migrations/`, named `NNNN_<name>_down.sql`.

**Why they live here and not in `../migrations/`:** the Supabase CLI applies
*every* `.sql` file in `migrations/` as a forward migration, in filename order. A
`_down.sql` sitting next to its `_up` would run immediately after it (tearing the
schema back down) and collide on the migration version. Supabase migrations are
forward-only by design, so the reverse DDL is kept in this companion directory.

**How to apply a down (manual, deliberate):** run the specific file against the
target DB, e.g. locally
`./node_modules/.bin/supabase db query --file supabase/down/0012_transition_guards_down.sql`
(or `psql`), reversing in descending order (0012, 0011, 0010, ...). They are NOT
run by `supabase db reset` / `start`. For a full local wipe, just
`supabase db reset` (forward-only, clean).

Coverage today: 0001 (the previously dangling reference, now created) and the v2
set 0010-0012. Migrations 0002-0009 do not yet have downs (they predate this
convention); creating them is a tracked follow-up under DEC-11.
