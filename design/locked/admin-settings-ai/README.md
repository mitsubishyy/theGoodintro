# Admin Settings · AI tab — LOCKED 2026-06-04 (pending the wordmark call)

Designed in Claude Design 2026-06-04. The per-user AI preferences tab inside
the locked Admin Settings shell. Controls how the AI Prompt drawer (Pass 2 of
Admin Inbox) behaves on Issy's inbox. Referenced by
[`MESSAGING_AI_DRAFT_SPEC.md`](../../../MESSAGING_AI_DRAFT_SPEC.md) §13 and the
Notification dropdown's cog footer link.

Inserted as a new tab between **Email signatures** and **Feature flags** in
the locked Settings tab strip. Also the first locked use of the **portal-wide
36×20 toggle pill pattern** (codified as a Global decision this pass — see
[`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) Global
decisions).

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Settings AI" → File > Export HTML, drop here |
| `screenshot-default.png` | TO DROP | VP1 — Loaded with all defaults, no save bar |
| `screenshot-modified.png` | TO DROP | VP2 — 3 settings changed, sticky save bar visible, CUSTOM chips replace DEFAULT |
| `screenshot-loading.png` | TO DROP | VP3 — 5 skeleton section cards |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"Admin Settings · AI tab" + the Global decisions Toggle pill entry.
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) — Settings shell pattern.
4. [`../../../MESSAGING_AI_DRAFT_SPEC.md`](../../../MESSAGING_AI_DRAFT_SPEC.md) §13 — the per-user preferences this tab implements + §11 hard guardrails surfaced in the Hard rules block.
5. [`../admin-settings/README.md`](../admin-settings/README.md) — the locked Settings shell + Integrations tab + Gmail OAuth drawer (Pass 1 of Settings).
6. Open `screen.html` plus the three screenshots.

## What is locked

### Tab strip update
The locked Settings tab order is now: **Account · Security · Integrations (default) · Email signatures · AI · Feature flags · Staff [soon]**. AI inserted between Email signatures and Feature flags. Tab anatomy unchanged (mono-uppercase text labels, 32px gap, ink 2px underline under active tab).

### Toggle pill pattern (first locked use this pass)
Codified as a portal-wide Global decision (see design log). Used here on three toggles:

- **Track:** 36px wide × 20px tall horizontal pill (stadium shape), border-radius 10px (full pill).
- **Thumb:** 16px diameter circle, centred vertically, 2px padding inside the track.
- **ON state:** `--portal-ink` track + white thumb on the RIGHT.
- **OFF state:** `--portal-line` muted-grey track with hairline border + muted-grey thumb on the LEFT.
- **LOCKED state** (Show Prompt tab in admin context): muted/desaturated track + 12px padlock outline icon immediately to the RIGHT of the toggle (NOT inside the track). The "ADMIN OVERRIDE" chip stays in its row position.
- Thumb slides with a 150ms ease transition between ON ↔ OFF.

### Six sections (stacked vertically, max-width 720px content column)

1. **AUTO-GENERATE DRAFTS** ("How drafts are created") — toggle, default ON. When ON, background drafts are generated on each inbound; drawer's Drafts tab shows them on open.
2. **DRAFT VARIETY** ("How many and which angles") — two-column field grid. Drafts per generation select (1 / 3 / 5, default 3) + Default label preference select (Direct / Warm / Strategic / Concise, default Direct). Helpers explain cost impact and drawer sort behaviour.
3. **REGENERATION** ("When you ask for another take") — Use Opus on regenerate toggle, default OFF (4× cost impact vs Sonnet 4.6).
4. **TRANSPARENCY** ("Behind-the-scenes detail") — Show Prompt tab toggle, **LOCKED for admin users** with padlock + "ADMIN OVERRIDE" amber-soft chip. Helper: "Admins always see the Prompt tab. This setting is for staff accounts."
5. **USAGE THIS MONTH** ("1 - 4 June 2026", read-only stats card) — Drafts generated 84 / Drafts used 62 (74%) / Median edit distance 23 characters / Cost USD $3.74 in soft-amber chip with "from Anthropic billing" provenance label. "View full breakdown →" ghost link (destination deferred).
6. **HARD RULES** ("What the AI never does, by design", SAGE-tinted read-only block) — mono uppercase "LOCKED · NOT USER-CONFIGURABLE" eyebrow in `--portal-sage-ink` + 6 bullets:
   - Never sends an email without your explicit click on Send.
   - Never invents a dollar amount — all money figures resolve from the pricing engine.
   - Never breaks brand naming rules (TheGoodIntro stays capital T, G, I).
   - Never uses forbidden vocabulary (marketplace, magic, wizard, coaching, program).
   - Never uses em or en dashes in prose.
   - Never persists conversation content to third-party model training.
   11px note at the bottom: "These are enforced in code, not by prompt instruction. See MESSAGING_AI_DRAFT_SPEC.md §11."

### DEFAULT / CUSTOM chip pattern (locked this pass)
Small soft-amber mono chip inline with each field label / toggle:
- **DEFAULT** — value is at the system default.
- **CUSTOM** — value has been overridden by the user.

Reusable for any per-user settings surface going forward.

### Sticky bottom save bar (VP2 only)
- 88px tall, hairline above, `--portal-card` background, sticky to bottom of viewport.
- LEFT: small mono muted "N UNSAVED CHANGES" + small ghost "View diff" link.
- RIGHT: ghost "Discard changes" + primary ink "Save changes" button.
- 11px muted helper below the save button: "Changes apply to your AI drawer immediately after save."
- Appears ONLY when there are unsaved changes (VP2). Absent on VP1 (defaults) and VP3 (loading).

### Three states designed
- **VP1 LOADED (defaults):** all toggles at default, all chips read DEFAULT. No save bar.
- **VP2 MODIFIED (3 settings changed):** Auto-generate OFF, Drafts per generation 5, Label preference Warm, Use Opus ON, Show Prompt tab unchanged (locked). CUSTOM chips replace DEFAULT on the changed rows. Sticky save bar visible.
- **VP3 LOADING:** 5 skeleton section cards matching loaded anatomy + skeleton toggle/select placeholders + skeleton form rows. No save bar.

## What's NOT designed in this pass (deferred)

- **"View full breakdown →" page** — link in the Usage section points nowhere designed yet.
- **Other tabs' content** (Account / Security / Email signatures / Feature flags / Staff) — still deferred per the original Settings lock.
- **Per-section "Reset to default" affordance** — no way to revert a single CUSTOM row to DEFAULT without manually changing it back.
- **Save confirmation toast / modal** — currently the save bar disappears on save; visual feedback for "Saved" state deferred.
- **Cost projection on toggle change** — no preview of cost impact when toggling Drafts per generation 3 → 5 (more drafts = higher cost).
- **Mobile layout** — Issy works on desktop.

## Issy's fixes applied (2026-06-04)

- **Duplicate STATE annotation:** VP2 originally rendered a STATE row at the top AND bottom (same drift as Meeting detail had). Stripped the top one. Single STATE row at the bottom with VIEWING NOW pill.
- **Toggle shape:** initial render had toggles as rounded SQUARES (track was square-ish with a circular thumb). Fixed to proper 36×20 pill/stadium shape. Codified as a global portal pattern. Padlock for the LOCKED toggle moved from beside the title to immediately right of the toggle.

## Open decisions (not silently resolved)

- **Per-section "Reset to default" affordance** — currently absent.
- **"View full breakdown →" destination** — design deferred.
- **Cost projection on Drafts per generation change** — could surface a small inline estimate (e.g. "Estimated cost change: +USD $1.20/mo").
- **Wordmark** parked across all locked screens.

## Click flow

`Sidebar / Settings` → `/admin/settings` → defaults to `/admin/settings/integrations` (Integrations is the default tab per the locked shell) → click "AI" in the tab strip → `/admin/settings/ai` (this screen).

Inside the AI tab:
- Toggle any setting → CUSTOM chip replaces DEFAULT, sticky save bar appears.
- Click "Save changes" → saves to the user's AI preferences record, save bar disappears.
- Click "Discard changes" → reverts all unsaved changes, save bar disappears.
- Click "View diff" → shows the changeset before saving (deferred — UI not designed yet).
- Click "View full breakdown →" on Usage this month → future detailed breakdown page (deferred).

Notification dropdown footer cog ("Notification settings") links to `/admin/settings/notifications` — a separate Settings sub-tab not yet designed.
