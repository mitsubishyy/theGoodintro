# theGoodintro — Messaging AI Draft Specification

> **READ FIRST.** This is the build-ready specification for the AI Prompt
> drawer in the Admin Inbox: the side panel that surfaces all the platform's
> data about a conversation's contact and uses it to draft replies for Issy
> to review, edit, and send. Companions:
> [`ADMIN_INBOX_SPEC.md`](ADMIN_INBOX_SPEC.md) (the screen that opens this
> drawer) and [`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md)
> (the data layer that feeds the conversation). Money figures in drafts MUST
> come from [`CALCULATIONS.md`](CALCULATIONS.md) via the pricing engine,
> NEVER from the model's reasoning. Brand and naming rules from
> [`FACTS.md`](FACTS.md) apply to every draft.

## 0. One-paragraph summary (for the non-technical reader)

The AI Prompt drawer is the platform's brain for a conversation. When Issy
clicks the AI Prompt button (visible only when the composer is in Internal
Note mode), a side drawer slides in. The top half shows every fact the
platform knows about this conversation's contact in one compact view: who
they are, their band and credits, recent meetings, charity, payment status,
their original request answers, the conversation context. The bottom half
shows one or more AI-drafted replies, each tailored to that context, each
with a "Use draft" button. Clicking "Use draft" drops the text into the
composer and flips the toggle to Reply, so Issy can edit and click Send.
The AI never sends, never invents money figures (those come from the
pricing engine), and never contacts a customer without Issy's explicit
click on Send.

## 1. Scope

### 1.1 In scope

- The AI Prompt drawer's structure (the Context section and the Suggested
  Drafts section).
- The full list of data points surfaced in the Context section.
- The prompt construction logic.
- The model selection and config.
- The money-figure handling rule (tokens resolved from the pricing engine,
  not from the model).
- The draft-to-composer handoff ("Use draft").
- The regeneration flow.
- The audit trail.
- The hard guardrails (what the AI MUST NEVER do).
- The drawer's behaviour outside the inbox (forward compatibility for
  future AI features in other modules).

### 1.2 Out of scope (covered elsewhere)

- The drawer's trigger and visibility rules:
  [`ADMIN_INBOX_SPEC.md`](ADMIN_INBOX_SPEC.md) §7.3, §9.3.
- The conversation and message data model:
  [`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md) §10.
- The vendor / executive record schemas (which the Context section reads
  from): existing `DATA_MODEL.md` and the briefs.
- The pricing engine and money rules:
  [`CALCULATIONS.md`](CALCULATIONS.md) and [`packages/pricing/`](packages/pricing).
- LLM provider procurement, billing, infra: future engineering decision.
  This spec assumes Anthropic's Claude is the provider (consistent with the
  rest of the stack), but the abstraction in Section 8 is provider-agnostic.

### 1.3 Principle: human-in-the-loop, no exceptions

Per Issy's 2026-05-31 spec ("AI drafts it all and I review and then send
the final edit"), the AI Prompt drawer is a drafting assistant. It surfaces
context and proposes text. Issy is the only path to send. This is a HARD
guardrail, not a configurable behaviour. Every code path that emits an
outbound email MUST originate from a human click on Send.

See Section 11 for the full guardrail list.

## 2. The drawer (geometry and structure)

### 2.1 Geometry

- Width: 560px on desktop, full-screen on mobile.
- Position: slides in from the right edge of the reading pane, pushing the
  thread leftward (rather than overlaying it). On screens narrower than
  1400px, the thread compresses to a minimum 480px and the drawer overlays
  any remaining space.
- Composer remains fully visible and usable while the drawer is open. The
  drawer never covers the composer.
- A close X in the top-right of the drawer. Esc also closes.
- The drawer is keyboard-cyclable: Tab enters from the AI Prompt button,
  Shift+Tab exits back.

### 2.2 Structure (top to bottom)

```
┌─ AI Prompt drawer (560px wide) ─────────────────────────┐
│ Header bar                                       [X]    │
│   "AI Prompt" + tiny "Generated 12s ago"               │
├─────────────────────────────────────────────────────────┤
│ Tabs: [Context] [Drafts (3)] [Prompt]                  │
├─────────────────────────────────────────────────────────┤
│ Tab body (scrollable):                                  │
│                                                         │
│   Context tab:                                          │
│     - Who they are                                      │
│     - Where they are in the cycle                       │
│     - Onboarding                                        │
│     - Recent activity                                   │
│     - Original request answers                          │
│     - Charity choice + live donation total              │
│     - Open flags                                        │
│     - Conversation summary                              │
│                                                         │
│   Drafts tab (default open):                            │
│     - Draft 1 [Use draft]                               │
│     - Draft 2 [Use draft]                               │
│     - Draft 3 [Use draft]                               │
│                                                         │
│   Prompt tab (advanced):                                │
│     - The exact prompt the model received               │
│     - The system prompt                                 │
│     - Token counts                                      │
│     - Model + temperature                               │
├─────────────────────────────────────────────────────────┤
│ Footer:                                                 │
│   [Regenerate]  prompt: [short input ........]  [Go →] │
└─────────────────────────────────────────────────────────┘
```

The three tabs (Context, Drafts, Prompt) give Issy three lenses on the same
AI request. Default on first open: Drafts. The non-technical user spends
most of her time here. Context is for "wait, what does the platform actually
know about this person", which is the question she named when she described
this feature. Prompt is for "I want to see exactly what the AI was told"
(a transparency surface; rarely needed but always available).

## 3. Context section (the data points surfaced)

This is the heart of Issy's spec. She said: "when I click on that AI button,
it will have all of those functions appear as data points I would like to
understand and know about." The Context section is THE LIST.

The Context section is organised into eight collapsible cards. Each card has
a mono uppercase eyebrow, the data, and (if relevant) a small "View profile"
link to the full vendor/exec page. Cards collapse to a one-line summary;
expanded by default on first open.

### 3.1 WHO THEY ARE

| Field | Source | Example |
|---|---|---|
| Name | `vendor_user.full_name` or `executive.full_name` | Sam Patel |
| Title | `vendor_user.title` or `executive.title` | Head of RevOps |
| Company | `vendor.company_name` or `executive.company` | Acme Robotics |
| Photo / Logo | record | (40px round) |
| Primary email | `vendor_user.email` / `executive.email` | sam@acmerobotics.com |
| Phone (if known) | record | +61 4XX XXX XXX |
| Country / region | record | Australia / NSW |
| Industry | record | B2B SaaS / Robotics |
| Sender type | matched record | VENDOR / EXECUTIVE / EA |
| Linked record link | record id | "Open profile →" |

For an unmatched conversation: show only the From address, sender name (from
the email header), and an inline "Link to..." typeahead. The other cards
fall back to a muted "Not available — link to a vendor or exec first."

### 3.2 WHERE THEY ARE IN THE CYCLE (vendors only)

| Field | Source | Example |
|---|---|---|
| Band | `pricing.bandForMeetingNumber()` | Tier 2 (meetings 6-10) |
| Credits remaining | `pricing.creditsRemaining()` | 2 of 5 |
| Meetings in current cycle | `pricing.cycleMeetingsCount()` | 7 |
| Cycle started | `vendor.cycle_started_at` | 12 Mar 2026 |
| Cycle renews | `vendor.cycle_renewal_date` | 12 Mar 2027 |
| Days to renewal | derived | 285 days |
| Next-band threshold | derived | 4 meetings to Tier 3 |
| Current charity-per-meeting amount | `pricing.charityShare()` | $1,000 of $1,500 |
| Current TheGoodIntro fee | `pricing.platformShare()` | $500 of $1,500 |

**Every dollar figure in this card is pulled live from the pricing engine
on render**, not from a snapshot. If the engine is unavailable, the card
shows "Pricing engine offline" rather than a stale figure.

For executives: this card is replaced by §3.2b (Executive activity), which
shows meetings completed, response rate, last-meeting outcome, and current
charity choice.

### 3.3 ONBOARDING

| Field | Source | Example |
|---|---|---|
| Onboarding progress | `vendor_checklist` / `exec_checklist` | 5 of 6 steps |
| Outstanding steps | derived | "Calendar not connected" |
| Vetting status | `vendor.vetting_status` | Vetted (12 Feb 2026) |
| Application Q&A | `vendor.application_answers` | "Why TheGoodIntro: ..." (expandable) |
| EA on file | `executive.ea_email` | jane@... |

### 3.4 RECENT ACTIVITY

A timeline of the last 8 activity events, each one line:

- Meeting completed with Priya R., outcome: Held, 14 May 2026
- Credit purchased, +5 meetings, 12 Feb 2026
- Onboarding step "Calendar connected" completed, 8 Feb 2026
- Vetting call held, 25 Jan 2026
- Application submitted, 20 Jan 2026

Each event is clickable, linking to the relevant module (meeting record,
invoice, checklist).

### 3.5 ORIGINAL REQUEST ANSWERS (vendors only, when conversation relates to a request)

The structured form data from when the vendor submitted their current
request. Verbatim. Includes:

- Which executive they want to meet
- Topic
- Proposed dates
- The pitch (free text)
- The "why this person" reason
- Any custom fields

If multiple recent requests exist, show the most recent first with the
others collapsed.

### 3.6 CHARITY CHOICE + LIVE DONATION TOTAL

| Field | Source | Example |
|---|---|---|
| Chosen charity | `executive.chosen_charity` | Royal Flying Doctor Service |
| Charity ABN | derived from `charity_directory` | 74 438 059 643 |
| Total donated through this exec | `gift_record` aggregate | $4,700 (8 meetings) |
| Last donation paid | `gift_record.paid_date` | 18 May 2026 |

For vendors: total donated triggered by their meetings, same query.

This is the section Issy emphasised in her positioning: "every donation
amount and recipient is real, published, auditable, and updated daily."
The AI should be able to cite this in drafts (with money tokens, never
direct figures from the model).

### 3.7 OPEN FLAGS

A small list of any flags that should warn Issy before she replies. Each
flag is one line, with a coloured pill:

- 🟥 (red pill) **OVERDUE PAYMENT** — invoice INV-1043 due 15 days ago.
- 🟥 (red pill) **PAUSED ACCOUNT** — paused by Issy on 12 Feb for ...
- 🟧 (amber pill) **OPEN COMPLAINT** — vendor reported no-show on meeting M-204.
- 🟧 (amber pill) **DORMANT** — no activity in 90 days.
- 🟦 (info pill) **NEW SIGNUP** — joined less than 7 days ago.
- 🟦 (info pill) **HIGH VALUE** — > $10k purchased lifetime.

Flags are computed from existing tables, not stored. The query lives in
`apps/platform/lib/flags.ts`. The list is open-extension as new operational
signals come up.

### 3.8 CONVERSATION SUMMARY

A 2-3 sentence AI-generated summary of THIS conversation's content, with a
"Refresh" button (so it doesn't get stale). Example:

> Sam is asking how many meeting credits Acme has left and when the cycle
> resets. He wants to plan their next intros. Mid-cycle (Tier 2), 2 credits
> remaining, cycle resets 12 Mar 2027.

The summary is generated by the same model as the drafts (see Section 8)
on conversation open and cached for 30 minutes or until a new message
arrives.

### 3.9 What is NOT in the Context section

The Context section is for **decision-relevant facts**. Out of scope:

- Marketing-side data (their website visit history, ad attribution).
- Anything from external CRMs not synced into the platform.
- Email headers in detail (those live in the message metadata, accessed
  via the per-message overflow).
- The conversation thread itself (visible in the main reading pane already).

If a field is missing from this list and Issy reaches for it, add it. The
spec is open-extension.

## 4. Drafts section

### 4.1 Number of drafts per request

The AI generates **three drafts in parallel**, each with a different angle:

1. **Direct / informational** — answers the question crisply, low warmth.
2. **Warm / relational** — answers the question but leads with warmth or
   acknowledgment.
3. **Pushing back / strategic** — challenges the premise, suggests an
   alternative, or sets a boundary, if the conversation context warrants
   it. If the conversation has no premise to push back on (e.g. it's a
   simple "what are my credits" question), Draft 3 is replaced with a
   shorter / more concise variant of Draft 1.

Issy can pick whichever matches the moment. Generating three at once means
she doesn't have to regenerate to see alternatives.

### 4.2 Each draft's structure

```
┌─ Draft 1 — Direct / informational ──────────────────────┐
│ Hi Sam,                                                 │
│                                                         │
│ You have 2 credits left in your current cycle (Tier 2). │
│ The cycle resets on 12 March 2027 — that's 285 days    │
│ from today. Plenty of time for the next few intros.    │
│                                                         │
│ Want me to send through some executive options?         │
│                                                         │
│ Cheers,                                                 │
│ Issy                                                    │
│                                                         │
│ [Use this draft]                  Tokens: $1,500/$1,000 │
└─────────────────────────────────────────────────────────┘
```

Per-draft elements:

- The body text (rendered as plain text, no rich formatting in v1; rich
  text in v2).
- A label ("Direct / informational" etc.) at the top-right.
- A "Use this draft" button.
- A "Tokens" indicator at the bottom-right showing which money tokens (if
  any) the draft references. If a draft references `{{charity_amount}}`,
  it shows `Tokens: $1,000` (the resolved value). This is for Issy's
  verification: every money figure has come from the engine.

### 4.3 The "Use draft" handoff

Clicking "Use this draft":

1. Copies the draft body into the composer's body field.
2. Flips the composer's toggle from Internal Note back to Reply.
3. Closes the AI Prompt drawer (or leaves it open with the chosen draft
   highlighted; user setting; default: leave open).
4. Focuses the composer body, cursor at end, ready for edit.
5. Writes a row to `ai_draft_usage` recording which draft was picked.

The composer body now contains the draft as a starting point. Issy edits,
clicks Send. The eventual `message` row records `ai_draft_id` so the audit
trail links the sent email back to the AI's contribution.

### 4.4 Regeneration

Footer of the drawer:

- **Regenerate** button (regenerates all three drafts with the original
  prompt).
- **Prompt input** (short free-text, e.g. "make it warmer", "push back on
  the date", "shorter").
- **Go** sends the modified prompt and regenerates all three.

Regeneration writes a new `ai_draft_generation` row so the history is
preserved. The drawer always shows the latest set, with a small "← Prev
generation" link to step back through history if Issy wants the older
take.

### 4.5 Tokens in drafts

The model is instructed to insert **tokens** for any money figure, charity
name, date, or other live fact, rather than rendering the value directly.
The token resolver (Section 7) substitutes the live value into the text
that Issy sees. This means:

- The model never has to "remember" that the fee is $1,500. It writes
  `{{meeting_fee}}` and the resolver substitutes.
- If pricing changes, all in-flight drafts surface the new value.
- If a token cannot be resolved (e.g. a charity that's no longer in the
  directory), the draft is flagged and shown to Issy with a clear "could
  not resolve {{charity_name}}" inline.

Token catalogue (extensible):

| Token | Resolves to | Source |
|---|---|---|
| `{{meeting_fee}}` | "$1,500" | pricing engine |
| `{{charity_amount}}` | "$1,000" (per current band) | pricing engine |
| `{{platform_share}}` | "$500" (per current band) | pricing engine |
| `{{vendor_name}}` | "Acme Robotics" | record |
| `{{vendor_contact_first_name}}` | "Sam" | record |
| `{{credits_remaining}}` | "2" | pricing engine |
| `{{cycle_resets}}` | "12 March 2027" | record |
| `{{chosen_charity}}` | "Royal Flying Doctor Service" | record |
| `{{total_donated_through_them}}` | "$4,700" | aggregate query |
| `{{exec_first_name}}` | "Priya" | record |
| `{{last_meeting_outcome}}` | "Held" | record |
| `{{my_first_name}}` | "Issy" | session user |
| `{{tgi_brand}}` | "TheGoodIntro" | FACTS.md |

The token list is enforced by a JSON schema (`apps/platform/lib/ai/tokens.ts`)
that the model is shown in its system prompt. Tokens not in the catalogue
are rejected at render and surfaced as a draft-generation error.

## 5. Prompt tab (transparency)

The Prompt tab shows the exact prompt the model received, broken into:

- **System prompt**: the static instructions about role, tone, guardrails,
  brand rules, money-token catalogue.
- **Context**: a serialised version of Section 3's data, in markdown form
  (so the model has structured facts).
- **Conversation thread**: the last 20 messages from this conversation,
  in chronological order, with sender / time / body.
- **Issy's last action**: any internal notes she's written on this
  conversation in the last 24h (treated as "what Issy is thinking").

Also shown: model name, model version, temperature, max tokens, input token
count, output token count, generation time, cost in cents.

This tab is rarely used in normal operation but is essential for debugging
("why did the AI write that?") and for the eventual compliance / audit
review.

## 6. Behaviour when the conversation is unmatched

If the conversation is `match_status='unmatched'` (per
[`GMAIL_INTEGRATION_CONTRACT.md`](GMAIL_INTEGRATION_CONTRACT.md) §7):

- The Context section is mostly empty, with a prominent banner: "This
  conversation isn't linked to a vendor or executive yet. Link it to load
  context and generate accurate drafts." plus a "Link to..." typeahead.
- The Drafts section is disabled, with a one-line message: "Drafts are
  generated from context. Link this conversation first."
- The Prompt tab still works (shows whatever minimal prompt would have been
  used) for transparency.

Once Issy links the conversation, the AI Prompt drawer reloads with full
context and drafts.

## 7. Token resolution mechanics

The token resolver lives at `apps/platform/lib/ai/resolveTokens.ts`. It:

1. Takes a draft body (string) and a context object (vendor / exec /
   conversation / session user).
2. Scans for `{{token_name}}` patterns.
3. For each, calls the relevant source (pricing engine for money tokens,
   record fields for identifiers, aggregate queries for derived figures).
4. Substitutes the resolved value.
5. Returns the resolved body + a per-token resolution log.

Rules:

- **Money tokens MUST go through `packages/pricing` reporting functions, not
  raw DB queries.** This is the only path that guarantees the 10 reconciliation
  invariants in [`CALCULATIONS.md`](CALCULATIONS.md) hold.
- **Brand name tokens MUST go through `FACTS.md` constants (TheGoodIntro with
  capitals), not free-text.** The `check:copy` script catches drift.
- **Date tokens render in `D MMMM YYYY` AU format**, e.g. "12 March 2027".
- **Tokens with no resolved value DO NOT silently render empty.** They become
  a visible `[?charity_name]` marker in the draft, and the draft is flagged
  as "incomplete" in the UI. Issy must resolve or remove the token before
  sending. The composer Send button is disabled while any unresolved token
  is in the body.

## 8. Model and prompt engineering

### 8.1 Model selection

- **Provider**: Anthropic (consistent with the rest of the stack).
- **Model**: Claude Sonnet 4.6 for v1 drafts; Claude Opus 4.7 reserved for
  the regeneration path (slower, more thoughtful) when Issy explicitly
  requests "better".
- **Temperature**: 0.4 for default drafts (slight variety across the three
  drafts), 0.2 for regeneration with explicit instruction.
- **Max output tokens**: 800 per draft (longer drafts are almost always
  worse).
- **Prompt caching**: ENABLE on the system prompt + token catalogue + the
  vendor/exec record (those rarely change within a session). This is
  important; see [`claude-api skill`](https://claude.com/skills/claude-api)
  or the equivalent guidance for the chosen SDK.

### 8.2 System prompt structure

Sections in the system prompt (kept stable for cache hits):

1. **Role**: "You draft email replies for Issy at TheGoodIntro, an Australian
   network connecting senior executives to vendors for charity-funding meetings."
2. **Voice and tone**: "Confident concierge. Warm but selective. Premium
   hospitality without gushing. Australian English. No emojis. No em or en
   dashes." (Pulled from [`POSITIONING.md`](POSITIONING.md) and
   [`feedback_no_dashes`](../.claude/projects/-Users-isobelhardwick/memory/feedback_no_dashes.md).)
3. **Brand naming**: "TheGoodIntro, always with capital T, G, I. Never
   'theGoodintro', never 'TGI', never 'the Good Intro'."
4. **Forbidden vocabulary**: "Never 'marketplace', 'magic', 'wizard',
   'coaching', 'program'."
5. **Money rule**: "All money figures must be emitted as tokens. Catalogue
   below. Do not invent a dollar amount in any context."
6. **Token catalogue**: full list from Section 4.5.
7. **Draft variety rule**: "Generate three drafts. Label them Direct,
   Warm, and Strategic. If no strategic angle exists, label the third
   Concise and shorten it."
8. **Hard guardrails**: full list from Section 11.

### 8.3 User-message structure

For each draft request, the user message contains:

```
<context>
{serialised vendor/exec context from Section 3, markdown}
</context>

<conversation>
{last 20 messages, oldest first, formatted as From / Time / Body}
</conversation>

<internal_notes>
{any internal notes from the last 24h, marked "Issy's thinking"}
</internal_notes>

<regenerate_prompt>
{the user's regenerate input if any, else empty}
</regenerate_prompt>

<task>
Draft three replies to the latest inbound message. Follow the voice, tone,
and guardrails in the system prompt. Use tokens for any money figure or
factual variable. Label them Direct, Warm, and Strategic (or Concise if no
strategic angle exists).
</task>
```

Wrapping each section in tags makes it easy for the model to parse and for
us to test prompt changes in isolation.

### 8.4 Response parsing

The model returns three labelled drafts. Parsed into the `ai_draft` table
rows with their label. If the model returns fewer than three or in the
wrong format, the request is marked failed and retried once. After two
failures, the drawer shows "Could not generate drafts. [Retry]"

### 8.5 Cost expectation

At Sonnet 4.6 pricing and a typical context size of ~3,000 input tokens
+ 1,200 output tokens per request (three drafts of ~400 each):

- Per draft generation: under USD 0.05 with prompt caching warmed up.
- At 100 drafts/day: ~USD 5/day, ~USD 150/month. Comfortable.

Monitor in telemetry (Section 12).

## 9. Data model

```sql
-- One row per generation request.
create table ai_draft_generation (
  id                   uuid primary key default gen_random_uuid(),
  conversation_id      uuid not null references conversation(id) on delete cascade,
  requested_by_user_id uuid not null references app_user(id),
  trigger              text not null check (trigger in
                          ('auto_on_inbound','manual_open','manual_regenerate')),
  regenerate_prompt    text,
  model                text not null,
  model_version        text not null,
  temperature          numeric(3,2) not null,
  input_tokens         int not null,
  output_tokens        int not null,
  cost_cents           int not null,
  generation_ms        int not null,
  status               text not null check (status in ('ok','failed','timeout')),
  error                text,
  created_at           timestamptz not null default now()
);

-- One row per draft (typically 3 per generation).
create table ai_draft (
  id                   uuid primary key default gen_random_uuid(),
  generation_id        uuid not null references ai_draft_generation(id) on delete cascade,
  conversation_id      uuid not null references conversation(id) on delete cascade,
  label                text not null check (label in
                          ('Direct','Warm','Strategic','Concise')),
  body_with_tokens     text not null,        -- raw, with {{tokens}} unresolved
  body_resolved        text not null,        -- after token resolution
  token_resolution_log jsonb not null default '[]',  -- [{token, resolved_value, source}]
  has_unresolved_token boolean not null default false,
  used_at              timestamptz,          -- when Issy clicked "Use draft"
  used_by_user_id      uuid references app_user(id),
  resulting_message_id uuid references message(id),  -- the sent message, if any
  created_at           timestamptz not null default now()
);

create index on ai_draft (conversation_id, created_at desc);
create index on ai_draft (used_at) where used_at is not null;

-- Telemetry on usage (kept lightweight; full per-draft history is above).
create table ai_draft_usage (
  id                   uuid primary key default gen_random_uuid(),
  draft_id             uuid not null references ai_draft(id),
  conversation_id      uuid not null references conversation(id),
  user_id              uuid not null references app_user(id),
  picked_at            timestamptz not null default now(),
  edit_distance        int,         -- char-level distance from draft to final send
  time_to_send_ms      int,         -- ms from pick to send click
  edited_money_token   boolean not null default false  -- did Issy edit a resolved $ value?
);
```

RLS: same as the messaging tables — `staff` and `admin` only. Audit-log
`SELECT` by `inspector` role.

## 10. Generation triggers

When does the platform generate AI drafts?

### 10.1 Automatic, on inbound

When a new inbound message arrives in an `open` or `waiting` conversation
that is linked to a vendor or executive, the platform automatically
generates drafts in the background. The drawer's "Drafts" tab shows the
result the moment Issy opens the drawer (no waiting).

The auto-trigger respects a per-user setting (Section 13) that can be
turned off for cost or noise control.

### 10.2 Manual, on drawer open (if no fresh draft)

If Issy opens the AI Prompt drawer and there is no draft generated in the
last 5 minutes for the latest inbound message, the platform generates one
on demand. The Drafts tab shows a skeleton + progress bar while the
generation is in flight.

### 10.3 Manual, on regenerate click

The Footer's Regenerate button (with optional prompt input) always
generates a new set.

### 10.4 What does NOT trigger generation

- Outbound messages (we already replied; nothing to draft).
- System events (no message body to react to).
- Internal notes (those don't go to the customer; no reply needed).
- Unmatched conversations (no context to ground on; explicitly skipped).
- Resolved or archived conversations (no need; if reopened, generation
  triggers then).

## 11. Hard guardrails (the AI MUST NEVER)

These are non-negotiable. Each is enforced by code, not by prompt
instruction alone, because prompt instructions can be bypassed.

| # | Guardrail | Enforcement |
|---|---|---|
| 1 | Auto-send any email. | Send button is the only path from `message` row to Gmail API. No background job ever calls `messages.send` unless a `client_send_id` was generated by a human click. |
| 2 | Emit a money figure that did not come from the pricing engine. | The model is instructed to use tokens; the token resolver substitutes from the engine; a draft with a literal "$" character not preceded by a token marker fails validation and is rejected before display. |
| 3 | Invent facts not in the Context section. | The user message tags scope (Context, Conversation, Internal notes) so the model knows the source. A post-generation grounding check (Section 11.b) flags drafts that mention names, dates, or amounts not present in the context. Flagged drafts are still shown but with a yellow "Verify before sending" warning. |
| 4 | Contact a charity directly (or any third party). | The drafts go to `conversation.linked_record` only. The composer's To field is auto-populated from the conversation and changing it is a manual user action. |
| 5 | Use the brand name incorrectly. | `check:copy` runs in the build chat (already implemented; see [`FACTS.md`](FACTS.md)). The AI's system prompt locks the spelling; a post-generation regex check enforces it. |
| 6 | Use forbidden vocabulary. | Same enforcement as #5. The forbidden list lives in `FACTS.md` and is mirrored in the system prompt + a regex check. |
| 7 | Use em or en dashes in prose. | Regex check (only en dash allowed inside `[digit]–[digit]`). Drafts with disallowed dashes are auto-corrected (en dash and em dash replaced with comma + space or sentence break) before display, with a small "auto-formatted" pill. |
| 8 | Persist conversation contents to any third-party LLM provider for training. | Use Anthropic's no-training endpoint (default for API). |
| 9 | Take any action without a user click. | The drawer is a read + draft surface. The only actions are: regenerate (writes `ai_draft_generation`), use draft (copies to composer). Neither sends or modifies a customer-facing record. |
| 10 | Speak in the first person as the customer. | System prompt locks first-person to "we / I" meaning TheGoodIntro / Issy. |

### 11.b Post-generation grounding check

After a draft is generated, a lightweight validation pass runs:

1. Extract all named entities (people, companies, charities, dates,
   numbers) from the draft.
2. Check each is present in the Context block or the conversation
   thread.
3. If not, flag the draft with "Verify before sending" and a list of
   un-grounded entities. The draft is still usable (Issy might add them
   knowingly) but she sees the warning.

The check is best-effort (it's NER on small text and will have false
positives) but catches the obvious hallucinations.

## 12. Telemetry

- Drafts generated per day (auto vs manual vs regenerate).
- Drafts used (`ai_draft_usage` rows).
- Median and p90 edit distance from draft to send.
- Median and p90 time-to-send after picking a draft.
- Generation failure rate.
- Cost per day (USD cents).
- Token resolution failures (per token name).
- Grounding flag rate (drafts with `has_unresolved_token` or
  un-grounded entities).
- Money-token edit rate: how often Issy changes a resolved `$` figure
  (sign that the engine's value didn't match what she expected).

No customer PII in telemetry events. Conversation IDs only.

## 13. User settings

Per-user (in `/admin/settings/ai`):

- **Auto-generate drafts on inbound**: on / off (default on).
- **Drafts per generation**: 3 / 1 (default 3).
- **Default draft label preference**: Direct / Warm / Strategic / Concise
  (used to sort drafts in the drawer; default Direct).
- **Use Opus on regenerate**: on / off (default off; on costs more).
- **Show Prompt tab**: on / off (default off for non-admin; admin always
  sees it).

## 14. Failure modes

| Failure | Detection | Response |
|---|---|---|
| Anthropic API outage | 5xx rate > 25% over 5 min | Drawer shows "AI drafting is offline. Replies will need to be written manually for the moment." Issy can still write Reply and Internal Note normally. Banner clears when API recovers. |
| Cost runaway | Spend > USD 50 in a single day | Auto-disable auto-generation; manual generation still available. Notify Issy. |
| Token resolver failure (e.g. pricing engine down) | Resolver raises | Draft is shown with `[?token]` markers and a "Pricing engine offline; values not resolved" warning. Send is blocked while any `[?]` marker is in the body. |
| Forbidden-vocabulary post-check fails | Regex match | Draft is auto-edited (offending term replaced with a neutral alternative or removed) and a small "auto-corrected" pill appears. If auto-edit can't recover, the draft is rejected and regenerated. |
| Grounding check fails | NER mismatch | Draft is shown with a "Verify before sending" warning, listing the un-grounded entities. Send is not blocked (Issy may know more than the platform). |
| Model returns malformed response | Parse fails | Retry once. If still failing, drawer shows "Could not generate. [Retry manually]" and writes `ai_draft_generation.status='failed'`. |

## 15. Forward compatibility (AI in other modules)

The drawer's architecture is intentionally generic so future AI features
in other modules (vendor profile, meeting prep, post-meeting LinkedIn
drafts, etc.) can reuse:

- The token resolver (`apps/platform/lib/ai/resolveTokens.ts`).
- The token catalogue (`apps/platform/lib/ai/tokens.ts`).
- The provider abstraction (`apps/platform/lib/ai/provider.ts`).
- The grounding check (`apps/platform/lib/ai/grounding.ts`).
- The `ai_draft_generation` / `ai_draft` schema (extended with a
  `feature` column to distinguish messaging drafts from LinkedIn drafts,
  etc.).

The hard guardrails (Section 11) are owned by the AI layer and apply to
all features that emit text, not just messaging.

When the LinkedIn post-meeting drafting feature is built (per
[`PLATFORM_WORKFLOWS.md`](PLATFORM_WORKFLOWS.md)), reference this spec
and extend rather than re-invent.

## 16. Acceptance criteria

The AI Prompt drawer is shipped when ALL of the following are true:

1. Clicking the AI Prompt button in Internal Note mode opens the drawer
   per [`ADMIN_INBOX_SPEC.md`](ADMIN_INBOX_SPEC.md) §9.3.
2. The Context tab shows all data points from Section 3 for a known vendor
   or executive, populated from live data.
3. The Drafts tab shows three labelled drafts (or two + Concise where no
   strategic angle exists), each with a working "Use draft" button.
4. "Use draft" copies the body into the composer, flips the toggle to
   Reply, and writes `ai_draft_usage`.
5. The resulting sent `message` row has `ai_draft_id` set to the chosen
   draft.
6. Every money figure in a draft is rendered via a token from the
   catalogue (Section 4.5) and resolved by the pricing engine.
7. Drafts referencing an unresolved token are visually flagged and Send is
   disabled until the token is resolved or removed.
8. Forbidden vocabulary and em/en dashes do not appear in shown drafts
   (post-generation checks active).
9. Grounding warnings appear on drafts that name un-grounded entities,
   without blocking send.
10. Unmatched conversations show the "link first" banner and disable
    draft generation.
11. Regeneration writes a new `ai_draft_generation` row; history is
    navigable via the "Prev generation" link.
12. The Prompt tab shows the exact system prompt, user prompt, model
    config, and cost.
13. Auto-generation on inbound respects the per-user setting and triggers
    only for `open` / `waiting` linked conversations.
14. Anthropic API outage degrades gracefully (per Section 14).
15. Telemetry events from Section 12 fire as listed.
16. RLS verified: vendor/exec users cannot SELECT any `ai_draft` row.

## 17. Open decisions for Issy (resolve before build)

These intentionally NOT decided in this spec. The build chat MUST NOT
proceed past them without Issy's answer.

- [ ] **Number of drafts per generation.** Default 3 (variety). Issy may
      prefer 1 (focus) or 5 (more options). Affects cost linearly.
- [ ] **Auto-generation default.** Default ON (drafts ready when Issy
      opens the drawer). Issy may want OFF (cost / privacy concern over
      auto-prompting the model on every inbound).
- [ ] **Opus on regenerate default.** Default OFF (cost). Issy may want ON
      if she finds Sonnet's drafts insufficient.
- [ ] **Grounding-warning aggressiveness.** Default soft warning (Issy
      can still send). Could be hardened to block-send if false-positive
      rate is low.
- [ ] **Token catalogue extensions.** Current catalogue in Section 4.5
      is the starting set. Add any tokens for fields Issy wants
      referenced (e.g. `{{next_renewal_amount}}`, `{{outstanding_balance}}`).
- [ ] **System-prompt voice phrasing.** Current draft of the voice
      instruction in Section 8.2 #2 pulls from POSITIONING. Issy should
      read it and confirm she hears her own voice in it.
- [ ] **Conversation summary refresh policy.** Default: cached for 30 min
      or until new message. Issy may want manual-only.

## 18. Change history

- 2026-05-31 — Initial spec. Captures Issy's 2026-05-31 design feedback
  ("AI button next to Internal Note shows all the data points") and the
  human-in-the-loop rule ("AI drafts it all and I review and then send
  the final edit").
