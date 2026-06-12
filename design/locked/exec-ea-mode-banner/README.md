# Exec EA Mode Banner — LOCKED 2026-06-11

Designed in Claude Design 2026-06-11. **The final exec-portal design item — with this lock the EXEC PORTAL IS DESIGN-COMPLETE** (Dashboard · Incoming Requests · Meetings · Impact · My charity · Profile · EA Mode).

Cross-cutting pattern, not a route: when an EA (Lena Park) signs in, she sees her principal's portal scoped to her, with a persistent charcoal "Acting for" banner on every page and a small set of affordances removed (an EA cannot change the charity or business context, and cannot forward requests to herself). Demonstrated on the dashboard; the rules propagate portal-wide (per-page map below).

Claude Design file: **"Exec Dashboard EA Mode"** — a separate file re-rendering the locked dashboard in EA mode. The original "Exec Portal Dashboard" file is untouched.

## Viewports

| VP | Route | State |
|---|---|---|
| 1 | `/exec` (EA session) | Dashboard in EA mode — full-width banner, greeting "Good morning, Lena.", sidebar chip swapped to Lena, charity-change + Forward affordances removed. Priya's data everywhere else, unchanged. |

The **executive switcher open state is SPECCED BUT NOT RENDERED** (see below) — same precedent as the Meetings drawer's Held-state footer. The closed trigger IS rendered in VP1.

## Files in this folder

| File | Status | Source |
|---|---|---|
| `screen.html` | TO EXPORT | Claude Design file "Exec Dashboard EA Mode" → File > Export HTML |
| `screenshot-vp1-banner-greeting.png` | TO DROP | Banner + "Good morning, Lena." + metric strip + incoming widget (Accept/Decline only) |
| `screenshot-vp1-direction-card.png` | TO DROP | Direction Card with single "Learn about" button + widget footer |
| `screenshot-vp1-upcoming.png` | TO DROP | Three upcoming cards without "Change charity →" |
| `screenshot-vp1-recent-impact-footer.png` | TO DROP | Recent Impact + footer |

## Cold-chat read order

1. [`../exec-dashboard/README.md`](../exec-dashboard/README.md) — the base screen this mode overlays; canonical spec for everything not listed as an EA delta.
2. [`../exec-profile/README.md`](../exec-profile/README.md) — the EA drawer that grants/edits access; the locked permission copy ("They cannot change your charity or your business context") this mode enforces.
3. [`../../../DATA_MODEL.md`](../../../DATA_MODEL.md) §EA + EAAssignment — many-to-many EA↔executive; every EA action audit-logged as "acting for [executive]".
4. [`../../../EXECUTIVE_PORTAL_BRIEF.md`](../../../EXECUTIVE_PORTAL_BRIEF.md) — EA persona context (email-first; the portal is a secondary/EA surface).
5. Open `screen.html` + screenshots.

## What is locked

### The banner (NEW portal-wide chrome — every page of an EA session)

- **Full-width across the very top of the viewport — including over the sidebar.** The charcoal banner and charcoal sidebar share the same tone, so they read as one continuous chrome; the sidebar wordmark sits below the banner. (The issued spec said content-area-only; the full-width render is the better, conventional impersonation treatment and is what's locked.)
- Height 44px. Background `--exec-sidebar` charcoal `oklch(0.22 0.008 70)`. No border, no shadow. **Sticky on scroll. NOT dismissible** — no X, no collapse. Persists on every page of the EA session.
- **LEFT cluster** (24px x padding): 24px round photo-primary avatar of THE PRINCIPAL (Priya — never the EA) + 10px gap + italic Inter 13px `--exec-sidebar-text` "Acting for" + 6px + Inter 13px semibold cream "Priya Raghavan" + 8px + Inter 12px `--exec-sidebar-muted` "· CFO · Lumen Industries".
- **RIGHT cluster**: italic Inter 12px `--exec-sidebar-muted` "Every action is recorded in Priya's account history." + 16px + 1px white@15% vertical hairline + 16px + ghost trigger "Switch executive" Inter 12.5px semibold cream + 12px chevron-down outline.
  - **Conditional-render rule:** the hairline + trigger render ONLY when the EA assists more than one executive (`COUNT(EAAssignment WHERE ea_id=?) > 1`). The locked mockup shows the trigger despite Lena's single principal — accepted render deviation; the build applies the conditional.
- Banner renders ONLY for EA sessions. When the executive signs in themself, there is no banner.

### Executive switcher (SPECCED, NOT RENDERED — build implements from this spec)

Dropdown anchored below the trigger, right-aligned: 300px wide, white `--portal-card-reading`, 1px `--portal-line` border, 10px radius, shadow `0 8px 32px rgba(20,20,30,0.08)`, 8px y padding.
- Italic Inter 12px `--muted-foreground` eyebrow, 16px x padding: "Your executives"
- Rows (12px y / 16px x padding, hover `--portal-card-hover`, hairline between): 32px avatar + Inter 13.5px semibold name + Inter 12px muted "Title · Company" + right-aligned italic Inter 12px `--portal-emerald` "Current" on the active row.
- Selecting a row reloads the portal scoped to that executive.
- Demo principal for any future render: "Margaret Liu · CEO · Northgate Energy" (ML initials) — DEMONSTRATION DATA ONLY, not part of the cross-portal sample set.

### Shell deltas in EA mode

- **Greeting** reads the SIGNED-IN person: "Good morning, Lena." (capital "Good" emerald, unchanged). Date sub-line unchanged. The rule: greeting personalisation reads `auth.user.first_name`, never the principal's.
- **Sidebar user chip** (bottom): the signed-in EA — 32px "LP" initials avatar on `--portal-amber-soft` + "Lena Park" Inter 13px semibold + "Executive Assistant" Inter 11px muted. "Sign out →" unchanged.
- **Principal in the banner, EA in the chip — never swapped.**
- Everything else renders the PRINCIPAL'S data unchanged: metric strip, Direction Card content, incoming queue, upcoming meetings, Recent Impact, topbar + universal search.

### Permission hides (REMOVED, never greyed out)

A disabled change-charity button reads as broken, not forbidden — forbidden affordances are absent in EA mode:

| Surface | Hidden in EA mode | Kept |
|---|---|---|
| Dashboard Direction Card | "Change standing charity →" | "Learn about [charity] →" (single button; spacing closes naturally) |
| Dashboard Upcoming cards (all) | "Change charity →" | "Request reschedule →" · "View detail →" · Join button |
| Dashboard compact Incoming rows | "Forward" button (Lena IS the destination) | Accept · Decline · "More about [Vendor] →" |
| `/exec/requests` cards | "Forward to Lena (EA)" action (third button) | "Accept this meeting" · "Decline" (action row becomes two buttons, equal flex) |
| Meetings drawer | per-meeting charity affordances when present | Join · Request reschedule |
| My charity hero | "Change standing charity →" | "Learn about [charity] →" (single button) |
| My charity page | (picker modal unreachable — no trigger) | history, how-it-works, detail modal |
| Profile · Business context | "Edit" link (EA cannot change business context) | read view |
| Profile · You / Calendar & access / Requests | unchanged in v1 (see parked questions) | |
| Profile · Consent record / Your charity | already edit-free for everyone | |

**v1 permission matrix (source: the locked Profile EA drawer copy):** an EA CAN see incoming requests and the meeting calendar; accept, decline (and from email, forward); request reschedules. An EA CANNOT change the standing or per-meeting charity, edit business context, or forward portal requests to herself.

## Sample data

- Signed in: Lena Park · lena@lumenindustries.com · Executive Assistant ("LP" initials — no `ea.photo_url` field; initials fallback is the v1 treatment).
- Principal: Priya Raghavan · CFO · Lumen Industries (photo avatar in the banner).
- Dashboard content: identical to the locked Exec Dashboard sample (Monday, 8 June file-level date).

## Data corrections documented at lock (render ≠ build; no mockup redesign)

1. **Footer "Signed in as"** — the render shows `priya@lumenindustries.com`; in an EA session this MUST read the signed-in EA: "Signed in as lena@lumenindustries.com". Build reads `auth.user.email`. (The acting-for context lives in the banner, the session identity in the footer.)
2. **Recent Impact row 3** — the render inherited the pre-reconciliation dashboard sample ("03 MAY · David Wu · $1,000 to Beyond Blue"). Build follows the RECONCILED sample locked 2026-06-11: 05 MAY · David Wu · $1,000 to Royal Flying Doctor Service (standing). See the Exec Dashboard README reconciliation note.
3. **Switch executive trigger** — rendered despite a single principal; build renders conditionally (assignments > 1).

## Data sources per module (build-chat reference)

| Module | Source | Notes |
|---|---|---|
| EA session detection | `auth.user` resolves to an `ea` record (not an `executive`) | Banner + mode rules switch on this |
| Banner principal identity | active `EAAssignment` → `executive.name`, `.title`, `.company`, `.photo_url` | Multi-assignment: last-used or explicit pick at sign-in (build call) |
| Banner audit line | static copy, principal's first name interpolated | |
| Switch executive trigger | `COUNT(EAAssignment WHERE ea_id = ?) > 1` | Hidden at 1 |
| Switcher rows | `EAAssignment JOIN executive` | "Current" = active scope |
| Scope switch | full data-scope reload to the selected executive | Audit-logged |
| Greeting | `auth.user.first_name` ("Lena") | Rule applies in exec sessions too (reads the signed-in human) |
| Sidebar chip | `auth.user` (EA identity + static "Executive Assistant" label) | |
| Footer "Signed in as" | `auth.user.email` | Correction #1 above |
| Permission hides | role-based render guards per the matrix above | Server-enforced too — hiding is UX, not security |
| Every EA mutation | audit log entry "acting for [executive]" | Per DATA_MODEL §EA |

## Open decisions parked (do NOT silently resolve)

- **Can the EA use "Pause requests"** (dashboard footer link / Profile Requests section) on the principal's behalf? v1 default: YES, visible and usable (pausing is reversible and the EA manages the inbox load). Confirm with Issy at build.
- **Profile in EA mode beyond business context** — can the EA edit the You section, calendar window, or her own EA record (the Profile EA drawer)? v1 default: leave editable except Business context; the EA editing/removing herself via the drawer is acceptable. Confirm at build.
- **Multi-assignment sign-in landing** — which principal loads first for a multi-exec EA (last used vs explicit chooser)? Build call.
- **EA email-surface parity** — the email remains the EA's primary surface; portal EA mode is secondary. No portal feature may exist that breaks the email-first flow (brief rule; no action needed, recorded for orientation).

## Verify-at-port items

1. Footer email correction (#1 above) — `lena@` in EA sessions.
2. Recent Impact David Wu row uses the reconciled sample (#2 above).
3. Switch trigger conditional render (#3 above).
4. Banner stickiness + z-index above all page content including drawers' backdrops (banner sits above everything; drawer backdrops dim the page BELOW the banner — build judgement on whether the banner dims too; recommend the banner stays undimmed so the acting-for context never disappears).
5. Switcher dropdown built from the spec above (not rendered in the mockup).

## Anti-list (do not regress)

- **Banner is charcoal `--exec-sidebar`** — never emerald (accent abuse), never amber, never warning-yellow. Cream/muted text only.
- **NOT dismissible.** No X, no collapse, no auto-hide on scroll.
- **EA sessions only.** Executives never see it.
- **Principal's avatar in the banner; signed-in EA in the sidebar chip.** Never swapped.
- **Forbidden affordances are REMOVED, not disabled/greyed.**
- **Hiding is UX, not security** — the build enforces EA permissions server-side regardless of render guards.
- No pills, badges, or mono uppercase in the banner. Italic + semibold Inter only.
- Greeting always reads the signed-in human's first name.
- No emoji, no em or en dashes, hairlines not shadows, single emerald accent unchanged elsewhere.
- **Forbidden vocab** (brand-wide): marketplace, magic, wizard, coaching, program, MeetMagic, AlphaSights.

## Issy's fix passes (the design narrative)

Locked in a single pass. Claude Design produced the EA-mode dashboard as a separate file ("Exec Dashboard EA Mode") rather than appending viewports to the original — accepted; the original locked dashboard file stays pristine. Render deviations from the issued prompt: banner full-width instead of content-area-only (accepted and locked — the better treatment), switch trigger visible despite single principal (documented as conditional-render build rule), switcher-open viewport not produced (locked as specced-not-rendered). Two sample-data inheritances documented as build-side corrections (footer email, David Wu row).

## NOT designed in this pass (deferred)

- Switcher dropdown open state (fully specced above; render at port or in a future pass).
- EA mode renders of the other five pages (rules propagate via the per-page hide map; no per-page mockups).
- EA multi-principal sign-in chooser.
- EA empty state (EA record with zero assignments — admin-side prevention preferred).
- Mobile banner treatment (likely 2-line stack; pair with the portal-wide mobile pass).
