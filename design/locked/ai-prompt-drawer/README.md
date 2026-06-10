# AI Prompt drawer — LOCKED 2026-06-04 (pending the wordmark call)

Designed in Claude Design 2026-06-04 across two passes (2A: drawer shell +
Drafts tab + Context tab; 2B: Prompt tab + Unmatched drawer state). Pass 2 of
the Admin Inbox messaging work — companion to [`../admin-inbox/`](../admin-inbox/).

The side drawer that opens from the AI Prompt button on the Admin Inbox
composer (visible only in Internal Note mode). Surfaces every fact the platform
knows about a conversation's contact, and presents 3 AI-drafted reply variants
for Issy to pick from. **Never auto-sends** — "Use this draft" copies the body
into the composer for Issy to edit and click Send.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Admin Inbox" (drawer viewports are at the bottom of the same file as Pass 1) → File > Export HTML, drop here |
| `screenshot-drafts.png` | TO DROP | Drafts tab (default open) — 3 labelled drafts + tokens chips + Use draft buttons |
| `screenshot-context.png` | TO DROP | Context tab — 8 collapsible cards (some expanded, some collapsed per spec) |
| `screenshot-prompt.png` | TO DROP | Prompt tab — transparency view with system prompt expanded + metadata bar |
| `screenshot-unmatched.png` | TO DROP | Unmatched drawer state — NO CONTEXT YET callout + dimmed placeholder cards + Drafts (0) muted |

## Cold-chat read order

1. [`../../../FACTS.md`](../../../FACTS.md), [`../../../CALCULATIONS.md`](../../../CALCULATIONS.md).
2. [`../../../UI_KIT_DESIGN_LOG.md`](../../../UI_KIT_DESIGN_LOG.md) §"AI Prompt drawer".
3. [`../../../PORTAL_LAYOUT_BLUEPRINT.md`](../../../PORTAL_LAYOUT_BLUEPRINT.md) for shell, tokens, density.
4. [`../../../MESSAGING_AI_DRAFT_SPEC.md`](../../../MESSAGING_AI_DRAFT_SPEC.md) — the build-ready spec this design implements. Especially §2 (geometry), §3 (Context section's 8 cards), §4 (Drafts section's 3 labelled variants), §5 (Prompt tab transparency), §6 (unmatched behaviour), §11 (hard guardrails).
5. [`../../../ADMIN_INBOX_SPEC.md`](../../../ADMIN_INBOX_SPEC.md) §9.3 — the trigger (AI Prompt button visibility rule on the composer).
6. [`../admin-inbox/README.md`](../admin-inbox/README.md) — Pass 1 of this work (the Admin Inbox screen).
7. Open `screen.html` plus the four screenshots.

## What is locked

### Drawer geometry
- 560px wide.
- Slides from the right edge of the reading pane, **pushes thread leftward** (does NOT overlay).
- Composer at the bottom of the reading pane stays **fully visible and uncovered**.
- White drawer body (`--portal-card-reading`, the token introduced in Pass 1).
- Hairline left border (`--portal-line`) separating the drawer from the compressed reading pane.

### Sticky header (64px)
- Sparkle outline icon (matching the composer AI Prompt button) + H2 "AI Prompt" (Inter semibold 16-18px) + small muted timestamp ("Generated 12s ago" when linked; "Awaiting link" when unmatched).
- Close X right (24px ghost outline icon).

### Tabs strip (40px)
- Three tabs left-aligned, 32px gap: **CONTEXT · DRAFTS (3) · PROMPT** [with small "ADVANCED" micro-label to its right].
- Mono 11px uppercase tracking-[0.18em] when inactive; ink semibold when active.
- 2px `--portal-ink` underline on the active tab.
- When unmatched: Drafts count badge shows **"(0)"** muted, indicating no drafts are actionable.

### Sticky footer (88px)
- LEFT: Regenerate ghost button with refresh outline icon.
- MIDDLE: short prompt input (~280px wide), placeholder "Make it warmer, push back, shorter..."
- RIGHT: primary ink "Go →" button.
- 11px muted helper below input: "Modifies the next generation. The original drafts stay above."
- When unmatched: all three controls DISABLED, placeholder changes to "Drafts unavailable until linked." with helper "Drafts need a linked vendor or executive to generate accurately. Link the conversation above to enable."

### Drafts tab (default open on linked conversations)
- Eyebrow "DRAFTS · GENERATED FROM CONTEXT" left + small muted "12s ago" right.
- Three labelled draft cards stacked vertically, 16px gap:
  - **DIRECT · INFORMATIONAL** — crisp, low-warmth, answers the question.
  - **WARM · RELATIONAL** — leads with warmth or acknowledgment.
  - **STRATEGIC · PUSH-BACK** — challenges the premise or sets a boundary. Replaced with **CONCISE** (shorter variant of Direct) when no strategic angle exists.
- Each draft card (24px padding, hairline border, hover state):
  - Top row: mono uppercase label left + small ghost "Copy" icon right.
  - Body: Inter 14px, line-height 1.5, on white.
  - Token chip row at bottom: soft-amber chips showing resolved token values (e.g. `{{credits_remaining}} → 2`), 11px mono. Proves every money figure came from the pricing engine.
  - Bottom right: primary ink "Use this draft →" button.

### Context tab
- Eyebrow "CONTEXT · WHAT THE PLATFORM KNOWS" left + small refresh ghost icon right (refreshes the Conversation Summary card).
- Eight collapsible cards stacked vertically, 12px gap, each with a mono uppercase eyebrow + chevron right + (when expanded) data rows in a compact label/value layout (32px row height, hairline between rows):

| # | Card | Default | Notes |
|---|---|---|---|
| 1 | WHO THEY ARE | expanded | Name, title, company (with logo), email, phone, country, industry, sender type, "Open profile →" |
| 2 | WHERE THEY ARE IN THE CYCLE | expanded (vendors only) | Band, credits remaining, meetings in cycle, cycle dates, days to renewal, next-band threshold, current charity-per-meeting + TheGoodIntro fee. Every $ figure shown with soft-amber "from pricing engine" micro-label. |
| 3 | ONBOARDING | collapsed | Header shows summary "5 of 6 steps · Calendar not connected" right-aligned. |
| 4 | RECENT ACTIVITY | expanded | Timeline of last 5 events, each one line, with "View full activity →" ghost link at bottom. |
| 5 | ORIGINAL REQUEST ANSWERS | collapsed | Header shows "Most recent: 22 Apr 2026" muted summary right. |
| 6 | CHARITY CHOICE + LIVE DONATION TOTAL | expanded | Chosen charity, ABN, total donated through this contact, count of meetings, last donation paid. |
| 7 | OPEN FLAGS | expanded | List of operational flags with coloured pills (overdue payment red, complaint amber, dormant amber, new signup info, high value info). |
| 8 | CONVERSATION SUMMARY | expanded | AI-generated 2-3 sentence summary of the current conversation, rendered on a **SAGE-tinted card** (--portal-sage-soft) since it's staff-only AI-generated content. Small "Refresh" ghost icon. 11px muted note "Generated by the same model as the drafts. Cached for 30 min or until a new message." |

### Prompt tab (transparency surface)
- Eyebrow "PROMPT · TRANSPARENCY" left + soft-amber chip "MODEL · CLAUDE-SONNET-4-6" + small ghost "Copy all" icon right.
- Five stacked section cards, each with mono uppercase header + chevron + per-card "copy" icon. Bodies rendered in **JetBrains Mono 12px**, line-height 1.5:

| # | Section | Default | Notes |
|---|---|---|---|
| 1 | SYSTEM PROMPT | expanded | Role / Voice & Tone / Brand Naming / Forbidden Vocabulary / Money Rule / Token Catalogue / Draft Variety Rule / Hard Guardrails. Truncated with "Show more (N more lines)" link if too long. |
| 2 | CONTEXT | collapsed | Header shows "~3,200 tokens · serialised from drawer Context tab" muted micro-label. Body deferred (too long to render default). |
| 3 | CONVERSATION | expanded | Last 20 messages, formatted as `[timestamp] sender to recipient: body`. Below: muted "Last 20 messages included; this thread has N." |
| 4 | INTERNAL NOTES | expanded, **sage left bar** | Internal notes from the last 24h, treated as "Issy's thinking". The sage bar signals staff-only content (same role as the sage on the inbox's INTERNAL NOTE band). |
| 5 | TASK | collapsed | Header shows "Draft three replies to the latest inbound" muted micro-label. |

- Bottom metadata bar (40px, hairline above and below, mono 11px uppercase):
  `MODEL claude-sonnet-4-6  ·  TEMPERATURE 0.4  ·  MAX TOKENS 800  ·  INPUT 3,247 t  ·  OUTPUT 1,184 t  ·  COST USD 4.6¢  ·  GEN 12.3s`

### Unmatched drawer state
- Header timestamp reads "Awaiting link" instead of "Generated Xs ago".
- Tabs: Context active, Drafts (0) muted (lower opacity), Prompt still selectable (transparency works regardless of match state).
- Context tab body:
  - **NO CONTEXT YET callout** at the top — full-width amber-soft tinted card (visually echoes the inline NOT LINKED YET card in the reading pane below). Mono uppercase eyebrow + body "This conversation isn't linked to a vendor or executive yet. Link it to load context and generate accurate drafts." + inline typeahead "Search vendors and execs" with chevron + 3-row autocomplete dropdown (Acme Robotics VEN-1044 / Priya Raghavan EXC-1042 / Helix Capital VEN-1052) + "Skip, link later" ghost link bottom right.
  - Below the callout: 8 context cards rendered as **DIMMED placeholders** (60% opacity, muted text). Each header shows the card name + "AWAITING LINK" mono 11px uppercase muted micro-label right-aligned. No chevrons (nothing to expand).
- Footer: Regenerate disabled, prompt input disabled with placeholder "Drafts unavailable until linked.", Go disabled, 11px helper "Drafts need a linked vendor or executive to generate accurately. Link the conversation above to enable."

### Sage usage codified this pass
The sage tint (`--portal-sage-soft`, introduced in Pass 1) is now used in **two** semantically-aligned places inside the drawer, codifying its meaning:
- **Conversation Summary card** (Context tab) — AI-generated, staff-only.
- **Internal Notes section** (Prompt tab, sage left bar) — staff-only thinking.

Both are "staff-only / internal / AI-generated content." The amber-soft tint stays reserved for "next action" surfaces (NOT-LINKED callout, draft token chips). Distinct roles, distinct colours. Don't conflate.

### Hard rules (carried from MESSAGING_AI_DRAFT_SPEC.md §11)
- **NEVER auto-sends.** "Use this draft" only copies the body to the composer (Pass 1 lock). Send requires a human click.
- **Money figures in drafts ALWAYS resolved via pricing engine tokens, NEVER invented.** The soft-amber token chip row beneath each draft proves where each $ value came from.
- **Brand name "TheGoodIntro"** enforced (capital T, G, I). Never "theGoodintro", never "TGI", never "the Good Intro".
- **Forbidden vocabulary** blocked: marketplace, magic, wizard, coaching, program.
- **No em or en dashes** in draft prose. En dashes only inside numeric ranges.
- **No emojis.**
- Outbound contact restricted to `conversation.linked_record` only — the composer's To field is auto-populated and changing it is a manual user action.

## What's NOT designed in this pass (deferred)

- The expanded CONTEXT section in the Prompt tab (currently collapsed). When expanded, would render the serialised markdown context — likely a JetBrains Mono code-block of the same data the Context tab shows.
- **Token resolution failure UI** — when `{{token}}` can't be resolved, the draft shows a visible `[?token_name]` marker and Send is blocked. Spec covers it; design deferred.
- **Grounding-warning UI** — "Verify before sending" warning on drafts that name un-grounded entities. Spec covers it.
- **API outage / cost-runaway degraded states** — "AI drafting is offline" banner. Spec covers it.
- **Per-user AI settings** (auto-generate on inbound on/off, drafts per generation 1/3/5, Opus on regenerate, show Prompt tab) — these live at `/admin/settings/ai`, a future Settings sub-tab.
- **"Prev generation" link** to step back through draft history.
- **Auto-correction pill** ("auto-formatted") on drafts where the model emitted forbidden vocab or dashes that were post-processed.

## Issy's fixes applied

None — both Pass 2A and Pass 2B landed cleanly on first iteration.

## Open decisions (not silently resolved)

- **"ADVANCED" micro-label on the Prompt tab** — keep, or strip if it reads as noise? Currently kept.
- **Model name exposure** — currently shown as "MODEL · CLAUDE-SONNET-4-6" soft-amber chip on the Prompt tab and as part of the metadata bar. Confirm Issy wants the specific model surfaced vs hidden.
- **Per-user AI settings** (auto-generate default, drafts count, etc.) — deferred to Settings sub-tab. Spec §13.
- **Wordmark** parked across all locked screens.
- **Number of drafts per generation** — currently 3 (one of each label). Spec §17 lists 1 or 5 as alternatives. Pending Issy's preference based on usage.

## Click flow

`Admin Inbox composer (Internal Note mode)` → click `AI Prompt button` → opens this drawer at **Drafts tab** (default; or Context tab when unmatched).

Inside the drawer:
- **Tab clicks** switch between Context / Drafts / Prompt.
- **"Use this draft →"** on a draft card → copies body to composer, flips composer toggle from Internal Note to Reply, closes drawer (or leaves it open per user setting, default: leave open with the chosen draft highlighted).
- **Regenerate** button → re-runs with same context, replaces drafts in the Drafts tab.
- **Prompt input + Go →** → re-runs with modified instruction (e.g. "make it warmer").
- **"Skip, link later"** on unmatched callout → closes drawer, leaves conversation unmatched.
- **Typeahead** in unmatched callout → picks vendor/exec → links conversation → drawer reloads with full context + drafts.
- **X / Esc / backdrop click** → closes drawer.

Also reachable from the action bar's AI Prompt icon (above the thread) — both surfaces open the same drawer.
