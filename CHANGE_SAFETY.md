# theGoodintro — Change Safety (v1)

How to change, fix, and extend the **live** platform without breaking what's
already running or corrupting the data behind it. This is for both Issy and the
agents who build and edit the platform. Companion to
[OPS_AND_COMPLIANCE.md](OPS_AND_COMPLIANCE.md). Last updated 2026-05-26.

> The fear this addresses: you edit one workflow and something unrelated breaks,
> or hundreds of existing records silently go wrong (the "butterfly effect"). The
> safeguards below make changes **isolated, reversible, and unable to reach back
> into history.**

## The seven safeguards

### 1. Records snapshot their own truth (history is append-only)
The main way an edit corrupts old data is when an old record needs *today's
rules* to be understood. We avoid that: every record stores the values it was
created under (e.g. a GiftRecord stores its `band_at_completion`, amount, and
charity at the time). Past records already know their own answer, so changing a
rule only affects **new** records going forward. Logs are **append-only**: you
add new entries, you never rewrite old ones. This alone removes most
butterfly risk on the hundreds of existing records.

### 2. Two environments, never edit live
- **Production** holds real data. **Staging** is a separate mirror used to build
  and test every change first.
- **Staging uses synthetic seeded data** (realistic fake vendors, execs,
  meetings). No real personal data ever leaves production, and staging can be
  reset freely.
- Nobody, human or agent, edits production directly.

### 3. Feature flags = an instant off-switch (you control them)
- Every new or changed behaviour ships **behind a feature flag, off by default**.
- Flags are **toggles in your admin portal** (stored in the database). You flip
  them yourself, instantly, no deploy needed.
- v1 is **simple on/off for everyone**. If a change misbehaves once live, you flip
  the flag **off** in one click and the platform reverts to the old behaviour
  immediately.
- This **separates "deploy" from "release"**: code can sit in production switched
  off and harmless until you decide to turn it on.

### 4. Reversible migrations + backups protect the data
- Schema changes (new fields/tables) go through **versioned migrations** that can
  be rolled back. Never hand-edit the live database.
- **Point-in-time recovery** (Supabase) means you can restore the database to a
  minute before a change if data ever gets into a bad state.

### 5. Modular, state-machine design keeps changes contained
- Workflows are defined as explicit transitions with explicit side effects
  ([STATE_MACHINES.md](STATE_MACHINES.md)). Editing "what happens on reschedule"
  means editing **one transition**, not hunting through code that touches twenty
  things.
- Clear seams between modules (the gift calculation is one box with one entrance;
  booking is another) mean a change in one **cannot leak** into another.

### 6. Automated tests gate every promotion
- A test suite, especially **golden tests on the money and state-machine paths**,
  runs **automatically before anything reaches production**. If a change would
  break the credit/gift math or let a record reach an impossible state, the
  promotion **fails before it goes live**, not after.

### 7. You approve every go-live
- Even after tests pass on staging, **nothing reaches production until you click
  promote.** Agents prepare the change; you make the final call. A human gate on
  a platform that moves money and donations.

## How to make a change (the standard loop)

Works the same for editing a workflow or adding a new feature:

1. **Describe it.** What should change, and the expected behaviour.
2. **Build on a branch, behind a new flag (off).** Schema changes use a reversible
   migration. Add tests for the new behaviour and the paths it touches.
3. **Deploy to staging**, flip the flag **on in staging**, and verify, plus the
   full test suite runs.
4. **You review** it on staging.
5. **Promote to production with the flag still OFF.** The code is now live but
   dormant, nothing has changed for anyone yet.
6. **You flip the flag ON** in the admin portal when ready. If anything looks
   wrong, flip it **OFF** instantly.
7. **Clean up later:** once the change is proven stable, retire the flag and
   delete the old code path.

## Rollback playbook (when something looks wrong)

| Problem | Fix | Speed |
|---|---|---|
| A workflow misbehaves after you turned it on | **Flip its flag off** | Instant |
| A whole deploy is bad | **Revert to the previous deploy** (Vercel) | Seconds |
| A schema change went wrong | **Roll back the migration** | Minutes |
| Data got into a bad state | **Point-in-time restore** to before the change | Minutes |

## Rules for agents building or editing the platform

These are non-negotiable guardrails:

- **Never** edit production data or schema directly. Migrations + staging first.
- **Every** behaviour change goes behind a feature flag, default **off**.
- **Never** mutate historical records; append new ones. New records must
  **snapshot** the values they depend on.
- **Keep** (don't reduce) test coverage on the money and state-machine paths; add
  tests for new behaviour.
- **One change per branch**, with a clear description of what and why.
- **Don't** remove a flag or old code path until the change is proven stable in
  production.

## Deferred / add when scale demands it

Deliberately **not** in v1 (you chose to keep it simple), but easy to add later:

- **Per-vendor canary** (turn a change on for one vendor before all).
- **Percentage rollout** (10% → 50% → 100%).
- A **dedicated flag service** (Flagsmith/PostHog) if admin-portal toggles are
  outgrown.

## Cross-refs

- Environments, backups, migrations baseline → [OPS_AND_COMPLIANCE.md](OPS_AND_COMPLIANCE.md).
- The transitions that make workflow edits contained → [STATE_MACHINES.md](STATE_MACHINES.md).
- Why records are self-describing → [DATA_MODEL.md](DATA_MODEL.md).
