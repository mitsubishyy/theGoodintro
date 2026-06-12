# Vendor Portal — Flow Map and Gap Audit

**Created 2026-06-06 by Claude (planning chat).** This document audits how the
five locked vendor portal screens connect: every CTA, link, drawer overlay,
sidebar item, topbar element, count badge, and state refresh trigger. It also
lists every implied-but-not-yet-designed screen, every open decision blocking
an integrated build, and the cross-screen data integrity rules.

**Why this exists.** Issy raised on 2026-06-06 that locking five static screens
in isolation is not the same as proving the system flows together. This audit
makes the inter-screen contract explicit so (a) gaps surface by name before the
build chat starts and (b) the planning chat can be held accountable to the
system, not just to individual pages.

**Status: LOCKED v1, 2026-06-06.** Issy walked §6 in two rounds; all 19 open
decisions are resolved (see §6 Decisions log). The build chat can integrate the
five locked screens using this map as the inter-screen contract. Pass B work
backlog (re-prioritised after decisions) lives in §11.

**Headline decisions** (full reasoning in §6):
1. Vendor self-signup IS supported in v1, with a pre-payment lockout state on gated routes (not the full 5-state lifecycle).
2. After Request Form submit → redirect to Pending requests list with a toast.
3. Full notification dropdown popover designed in v1 (mirrors locked admin pattern, vendor signal types).
4. NO drilldown pages for individual requests / meetings — row-expand on lists instead.
5. Sidebar identity card is clickable → Settings / Company tab.
6. Sam Patel chip + topbar SP avatar both open a small user menu popover (My profile / Settings / Sign out).
7. Dashboard widget rows route to the corresponding full list page.
8. Executive cards (Dashboard) and rows (List) ALWAYS open Detail Drawer first; Drawer's CTA → Request Form.

---

## 1. Locked vendor portal screens (5)

| # | Screen | Primary route | Lock date |
|---|---|---|---|
| 1 | Vendor Dashboard | `/vendor` | 2026-06-05 |
| 2 | Vendor Executives List | `/vendor/executives` | 2026-06-06 |
| 3 | Vendor Executive Detail Drawer | overlay on `/vendor/executives` | 2026-06-06 |
| 4 | Vendor Request Form | `/vendor/executives/{exec_id}/request` | 2026-06-06 |
| 5 | Vendor Settings — Shell + Profile tab | `/vendor/settings/profile` | 2026-06-06 |

---

## 2. Implied but NOT YET DESIGNED (gap list)

These are referenced by locked screens (sidebar items, count badges, CTAs, deep
links) but have no design. The build chat cannot integrate without resolving
these — either by designing them next or by deciding they're stub pages in v1.

### 2a. Sidebar sub-routes referenced by locked screens

| Route | Referenced from | Status |
|---|---|---|
| `/vendor/requests/pending` | Sidebar (Pending [4]) + Dashboard "Pending" widget "View all →" | NOT DESIGNED |
| `/vendor/requests/accepted` | Sidebar | NOT DESIGNED |
| `/vendor/requests/declined` | Sidebar | NOT DESIGNED |
| `/vendor/meetings/upcoming` | Sidebar (Upcoming [2]) + Dashboard "Upcoming meetings" widget "View all →" | NOT DESIGNED |
| `/vendor/meetings/past` | Sidebar | NOT DESIGNED |
| `/vendor/giving` | Sidebar + Dashboard "Your impact" widget "View giving →" | NOT DESIGNED |
| `/vendor/get-started` | Sidebar (Get started [2]) + Dashboard get-started shortcut "Open checklist →" | NOT DESIGNED (vendor T6 noted as "to do" in design log) |
| `/vendor/team` | Sidebar (Owner-only) | NOT DESIGNED |
| `/vendor/billing` | Sidebar (Owner-only) + Dashboard "Buy more credits →" | NOT DESIGNED |
| `/vendor/settings/notifications` | Settings tab strip | NOT DESIGNED |
| `/vendor/settings/security` | Settings tab strip | NOT DESIGNED |
| `/vendor/settings/company` | Promised when we added sidebar identity card ("Upload control lives in Settings → Company profile") | NOT DESIGNED (Pass B) |

### 2b. Drill-down detail pages referenced by locked widgets

| Route | Referenced from | Status |
|---|---|---|
| `/vendor/requests/{request_id}` | Pending widget row click (?) + Pending list row click | NOT DESIGNED — and not yet decided whether vendors get a request detail page |
| `/vendor/meetings/{meeting_id}` | Upcoming meetings row click (?) + Meetings list row click | NOT DESIGNED — and not yet decided whether vendors get a meeting detail page |
| `/vendor/giving/{gift_id}` | Your impact gift row click (?) | NOT DESIGNED — likely not needed; gift row could just be display-only |

### 2c. Cross-cutting interactions

| Element | Implied by | Status |
|---|---|---|
| **Vendor notification dropdown** off topbar bell | Admin version is LOCKED; vendor variant referenced but not designed | NOT DESIGNED |
| **Topbar search affordance** (the search-glass icon) | Topbar across all 5 locked screens | NOT DESIGNED — what does it search? Open decision §6 |
| **Topbar SP avatar click** | Topbar across all 5 locked screens | NOT DESIGNED — opens user menu? Goes to settings? Open decision §6 |
| **Sidebar identity card click** (AR vendor logo card above Sam Patel chip) | Sidebar across all 5 locked screens | NOT DESIGNED — opens /vendor/settings/company? Or static, not clickable? Open decision §6 |
| **Sam Patel chip click** (NOT the "sign out" text — the chip itself) | Sidebar bottom | NOT DESIGNED — opens user menu? Open decision §6 |
| **Sign-out action** | "sign out" text on Sam Patel chip | Affordance noted, destination route `/login` assumed; flow not explicitly designed |
| **Post-Request-Form submit destination** | Form's Send button has no follow-up state | NOT DESIGNED — brief says confirmation pop-up ("TheGoodIntro is working on it" + Back to Executives / Make another request); deferred to Pass B but blocks the flow |
| **Filter pill popover** (multi-select checkbox list off each filter pill) | Vendor Executives List filter bar | NOT DESIGNED — deferred to Pass B |
| **Settings MODIFIED state + sticky save bar** | Settings/Profile tab when fields dirtied | NOT DESIGNED — Pass B; pattern inherits admin Account tab |

### 2d. State variants of locked screens

| Variant | Locked screen | Status |
|---|---|---|
| Member-view variant (no Owner-only Get started / Team / Billing in sidebar; user chip shows role "Member") | Dashboard + all sidebar-bearing screens | NOT DESIGNED — Pass B |
| Vendor lifecycle states (signed_up / call_booked / approved / paid-loading / dormant / churned) | Dashboard primarily; Executives List shows pre-payment locked "book your call" state instead of the list | NOT DESIGNED — Pass B; this is the biggest functional gap because a brand-new vendor lands here pre-payment |
| Pre-payment locked Executives List ("book your call" lockout) | Executives List | NOT DESIGNED |
| Request Form: EMPTY (textareas blank, Send disabled) / SUBMITTING (spinner) / CONTENT-GUARD ERROR (inline amber warning) | Request Form | NOT DESIGNED — Pass B |
| Request Form Q3 "Someone else" expanded fields (Name / Title / Email) | Request Form | NOT DESIGNED — Pass B |
| Empty / loading / error states for every widget (Dashboard ribbon, all widgets, Executives table, every list) | All screens | NOT DESIGNED comprehensively — every screen ships these per the design log rule but they're not yet visualised |

---

## 3. Per-screen outbound CTAs — every click → where it goes

The build chat is responsible for wiring each of these. Items marked **OPEN**
require an Issy decision (see §6); items marked **DESIGNED** are covered by a
locked screen; items marked **STUB** can be a placeholder for v1.

### 3.1 Vendor Dashboard (`/vendor`)

| Element | Action → Destination | Status |
|---|---|---|
| Sidebar: Dashboard (active) | — | — |
| Sidebar: Executives | `/vendor/executives` | DESIGNED |
| Sidebar: Requests ▾ Pending [4] | `/vendor/requests/pending` | STUB needed |
| Sidebar: Requests ▾ Accepted | `/vendor/requests/accepted` | STUB needed |
| Sidebar: Requests ▾ Declined | `/vendor/requests/declined` | STUB needed |
| Sidebar: Meetings ▾ Upcoming [2] | `/vendor/meetings/upcoming` | STUB needed |
| Sidebar: Meetings ▾ Past | `/vendor/meetings/past` | STUB needed |
| Sidebar: Giving | `/vendor/giving` | STUB needed |
| Sidebar: Get started [2] | `/vendor/get-started` | STUB needed |
| Sidebar: Team | `/vendor/team` | STUB needed |
| Sidebar: Billing & credits | `/vendor/billing` | STUB needed |
| Sidebar: Settings | `/vendor/settings/profile` (default tab) | DESIGNED |
| Sidebar identity card (AR vendor logo card) | **OPEN** — clickable to `/vendor/settings/company` OR static / informational | **OPEN** |
| Sam Patel chip "sign out" text | Sign-out action → `/login` | implied; flow not explicitly designed |
| Sam Patel chip rest of chip | **OPEN** — opens user menu? Goes to `/vendor/settings/profile`? | **OPEN** |
| Topbar search-glass icon | **OPEN** — what does it search? Just execs by company name? Universal? | **OPEN** |
| Topbar bell | Opens vendor notification dropdown | NOT DESIGNED (mirror admin pattern) |
| Topbar SP avatar | **OPEN** — opens user menu (sign out, settings)? Or just `/vendor/settings/profile`? | **OPEN** |
| Get-started shortcut card "Open checklist →" | `/vendor/get-started` | STUB needed |
| Upcoming meetings widget "View all →" | `/vendor/meetings/upcoming` | STUB needed |
| Upcoming meetings row "Join Zoom →" / "Join Teams →" | External — `meeting.conference_url`, opens new tab | wired by build |
| Upcoming meetings row (rest of row click area) | **OPEN** — open `/vendor/meetings/{id}` detail? Currently no spec | **OPEN** |
| Executives for you "Browse all →" | `/vendor/executives` | DESIGNED |
| Executives for you card photo / name (click area outside the Request button) | **OPEN** — open Detail Drawer in-place? Route to list with drawer auto-open on that exec? | **OPEN** |
| Executives for you card Request button (default) | **OPEN** — open Detail Drawer first (matches list behaviour) OR direct to `/vendor/executives/{id}/request` (faster path) | **OPEN** |
| Executives for you card "Requested" chip (alt state, e.g. Helena Cho) | **OPEN** — view existing request (route to `/vendor/requests/pending` filtered to that exec)? Or do nothing (display only)? | **OPEN** |
| Pending widget "View all →" | `/vendor/requests/pending` | STUB needed |
| Pending widget row click | **OPEN** — open individual request detail? Currently no spec for `/vendor/requests/{id}` | **OPEN** |
| Your credits "Buy more credits →" | `/vendor/billing` | STUB needed |
| Your impact "View giving →" | `/vendor/giving` | STUB needed |
| Your impact gift row click | **OPEN** — route to `/vendor/giving` with that gift highlighted? Or just display-only? | **OPEN** |

### 3.2 Vendor Executives List (`/vendor/executives`)

| Element | Action → Destination | Status |
|---|---|---|
| Sidebar items | Same as Dashboard | — |
| Topbar items | Same as Dashboard | — |
| Header search input | Filter list in place; URL `?q={text}` | wired by build |
| Filters button | Open inline single-row filter bar (the locked pattern) | DESIGNED |
| Filter pill (e.g. "Industry · 3 ▾") click | Open multi-select popover anchored under the pill | NOT DESIGNED — Pass B |
| Filter "Clear all" | Reset all filters → URL clears `?filter*` params | DESIGNED |
| Column header EXECUTIVE | Click → sort by name; URL `?sort=name&dir=asc/desc` | DESIGNED |
| Column header COMPANY | Click → sort by company | DESIGNED |
| Row whole-row click | Open Detail Drawer overlay | DESIGNED |
| Pagination ◀ 1 2 … ▶ | URL `?page=N` | DESIGNED |
| **Drawer state in URL?** | **OPEN** — does opening the drawer mutate URL to `/vendor/executives/{id}` (so refresh / share-link works)? Or pure overlay state lost on refresh? | **OPEN** |

### 3.3 Vendor Executive Detail Drawer (overlay on `/vendor/executives`)

| Element | Action → Destination | Status |
|---|---|---|
| X close | Dismiss drawer, return to list state | DESIGNED |
| Backdrop click | Dismiss drawer | DESIGNED |
| ESC key | Dismiss drawer | affordance noted in spec |
| Drawer body (bio, charity card, member-since card) | Display only, no clicks | — |
| "Request a meeting →" sticky footer button | `/vendor/executives/{exec_id}/request` | DESIGNED |

### 3.4 Vendor Request Form (`/vendor/executives/{exec_id}/request`)

| Element | Action → Destination | Status |
|---|---|---|
| Sidebar items | Same as Dashboard | — |
| Topbar items | Same as Dashboard | — |
| Back ← | `/vendor/executives` (parent route, NOT browser history; locked rule) | DESIGNED |
| Q1 textarea | Local state; counter live | DESIGNED |
| Q2 textarea | Local state; counter live | DESIGNED |
| Q3 Me radio (selected) | Already selected | — |
| Q3 Someone else radio | Switch selection → reveal Name / Title / Email fields below | NOT DESIGNED — Pass B |
| Cancel | `/vendor/executives` | DESIGNED |
| Send request to Priya → | POST creates `request` row → **OPEN destination after success** | **OPEN** (Pass B: confirmation modal with "Back to Executives" / "Make another request"; without the modal, where does the user land?) |

### 3.5 Vendor Settings — Profile tab (`/vendor/settings/profile`)

| Element | Action → Destination | Status |
|---|---|---|
| Sidebar items | Same as Dashboard | — |
| Topbar items | Same as Dashboard | — |
| Tab Profile (active) | — | — |
| Tab Notifications | `/vendor/settings/notifications` | NOT DESIGNED — Pass B |
| Tab Security | `/vendor/settings/security` | NOT DESIGNED — Pass B |
| Avatar / Upload photo | File picker → upload flow → POST `vendor_user.photo_url` | NOT DESIGNED — Pass B |
| Field edits (First name / Last name / Display name / Title / Phone / LinkedIn / About) | Local state; DEFAULT → CUSTOM chip; surfaces sticky save bar | Sticky save bar Pass B |
| Email helper "hello@thegoodintro.com" | `mailto:hello@thegoodintro.com` | wired by build |
| Visibility row 1, 2, 3 toggles | DISABLED (padlock); no action | DESIGNED |
| Save (when bar visible) | POST diff → success state | NOT DESIGNED — Pass B |
| Discard (when bar visible) | Revert local state to last saved | NOT DESIGNED — Pass B |

---

## 4. Sidebar IA — every item, every screen, source of truth

The sidebar is the same across all 5 vendor screens. This table is the single
source of truth for IA + destinations.

| Group | Item | Count badge source | Destination | Visibility |
|---|---|---|---|---|
| REQUEST | Dashboard | — | `/vendor` | All |
| REQUEST | Executives | — | `/vendor/executives` | All |
| REQUEST | Requests ▾ Pending | `count(request WHERE vendor_id=? AND status='submitted')` | `/vendor/requests/pending` | All |
| REQUEST | Requests ▾ Accepted | (none — could add if useful) | `/vendor/requests/accepted` | All |
| REQUEST | Requests ▾ Declined | (none) | `/vendor/requests/declined` | All |
| REQUEST | Meetings ▾ Upcoming | `count(meeting WHERE vendor_id=? AND status IN ('proposed','confirmed') AND scheduled_at >= now)` | `/vendor/meetings/upcoming` | All |
| REQUEST | Meetings ▾ Past | — | `/vendor/meetings/past` | All |
| GOOD | Giving | — | `/vendor/giving` | All |
| ACCOUNT | Get started | `count(checklist_item WHERE assignment.vendor_id=? AND completed_at IS NULL)` | `/vendor/get-started` | **Owner only** (recedes when 0; consider hiding entirely once checklist complete) |
| ACCOUNT | Team | — | `/vendor/team` | **Owner only** |
| ACCOUNT | Billing & credits | — | `/vendor/billing` | **Owner only** |
| ACCOUNT | Settings | — | `/vendor/settings/profile` | All |

**Member-view variant** hides the entire ACCOUNT group's first three items
(Get started / Team / Billing). Settings stays visible. Not yet designed.

---

## 5. Count badge data sources + refresh triggers

| Badge | Source query | Refresh on |
|---|---|---|
| Sidebar Pending [4] | `count(request WHERE vendor_id=? AND status='submitted')` | Page mount; after Request Form submit; **server push** when admin updates request status (Supabase realtime) |
| Sidebar Upcoming [2] | `count(meeting WHERE vendor_id=? AND status IN ('proposed','confirmed') AND scheduled_at >= now)` | Page mount; **server push** when admin creates / updates a meeting |
| Sidebar Get started [2] | `count(checklist_item WHERE assignment.vendor_id=? AND completed_at IS NULL)` | Page mount; after user completes a checklist item |
| Dashboard ribbon Credits available | `sum(credit_lot.quantity_remaining) - count(reserved meetings)` | Page mount; after payment confirms (server push); after meeting status changes |
| Dashboard ribbon Credits reserved | `count(meeting WHERE vendor_id=? AND status IN ('proposed','confirmed') AND credit_lot_id IS NOT NULL)` | Same |
| Dashboard ribbon Meetings pending / held | `count(meeting WHERE vendor_id=? AND status IN (…))` | Page mount; server push |
| Dashboard ribbon To charity via you | `vendorCharityForPeriod(vendor.id, financialYearWindow(now))` | Page mount; after a meeting is marked Held (server push) |
| Dashboard ribbon Your band | `bandForMeetingNumber(cycle.held_meetings_count + 1)` | Page mount; after a meeting is marked Held |
| Topbar bell amber dot | `exists(notification WHERE vendor_user_id=? AND read_at IS NULL)` | Page mount; server push; after user marks as read in dropdown |
| Filters button "Filters · N [▾]" | `length(active filters)` | Local state on filter change |

**Refresh strategy decision needed (§6):** server-push via Supabase Realtime
on every count, or refresh-on-route-change only, or short polling. Each has
trade-offs (cost, freshness, UX).

---

## 6. Decisions log (all 19 resolved 2026-06-06)

Walked with Issy in two rounds. Eight product decisions answered by her; six
technical-only decisions taken by Claude with reasoning. Five more click-target
decisions resolved by inheriting from the eight headline decisions.

### 6a. Product decisions (Issy's calls)

| # | Decision | Resolution |
|---|---|---|
| 1 | Pre-payment vendor experience | **Self-signup with pre-payment lockout state.** Two states designed: locked-out vs full. Vendor self-signs-up on the website → lands on gated Dashboard with welcome / "book your call" CTA. Executives / Requests / Meetings / Giving routes all show one reusable lockout page until `vendor.status='active'`. Settings / Profile works throughout. Does NOT design all 5 lifecycle sub-states (signed_up / call_booked / approved / paid-loading / dormant) — the lockout page applies to any pre-active status. |
| 2 | After Request Form submit | **Redirect to `/vendor/requests/pending` with toast "Request sent to Priya".** Vendor sees the new request appear in their pipeline. Replaces the originally-planned confirmation modal (which is now cut from Pass B). |
| 3 | Notification bell scope | **Full notification dropdown popover designed in v1.** Mirrors locked admin 380px popover pattern; vendor-specific signal types per §10 (request accepted/declined, meeting confirmed/moved/cancelled/held, gift sent, payment receipt, onboarding reminders, access-window warnings). Adds one new screen to Pass B. |
| 4 | Request / meeting detail pages | **No drilldown pages for v1; row-expand on lists instead.** Clicking a Pending row → row expands inline to show Q1/Q2 answers + admin follow-up status. Clicking a Meetings row → row expands inline to show time / join link / outcome / gift link. Saves 2 standalone detail-page designs. |
| 5 | Sidebar identity card click | **Clickable → `/vendor/settings/company`.** Closes the loop on the vendor logo upload promise. Company tab now confirmed for Pass B. |
| 6 | Sam Patel chip + topbar SP avatar | **Both open the same user menu popover.** Three items: My profile (→ /vendor/settings/profile), Settings (→ /vendor/settings/profile, default tab), Sign out (action → /login). The existing "sign out" text on the chip stays as a one-click quick path. New small popover to design in Pass B. |
| 7 | Dashboard widget rows | **Route to the relevant full list page.** Upcoming row → /vendor/meetings/upcoming with that meeting row expanded. Pending row → /vendor/requests/pending with that request row expanded. Gift row → /vendor/giving with that gift highlighted. Consistent with the row-expand decision. |
| 8 | Executive cards (Dashboard) + rows (List) | **Always Drawer first.** Clicking anywhere on a card or row → Detail Drawer opens; Drawer's "Request a meeting →" CTA routes to Request Form. Same pattern on both surfaces. Qualification gate every time. |

### 6b. Click-target decisions inheriting from §6a

| # | Element | Behaviour (inherits from) |
|---|---|---|
| 9 | Dashboard Executives for you Request button | Inherits from #8: opens Drawer first (not direct jump to form). |
| 10 | Dashboard Executives for you "Requested" chip | **Routes to `/vendor/requests/pending` filtered to that exec** (row-expand on that exec's request). Same as Pending widget row click. |
| 11 | Dashboard Upcoming row click (outside Join link) | Inherits from #7: routes to `/vendor/meetings/upcoming` row-expanded. |
| 12 | Dashboard Pending row click | Inherits from #7. |
| 13 | Dashboard Your impact gift row click | Inherits from #7: routes to `/vendor/giving` with that gift highlighted. |

### 6c. Technical decisions (Claude's calls, with reasoning)

| # | Decision | Resolution + reasoning |
|---|---|---|
| 14 | Detail Drawer URL behaviour | **URL mutates to `/vendor/executives/{exec_id}` when drawer opens.** Refresh + shareable links reopen the drawer on the right exec. Standard SaaS pattern. |
| 15 | Cancel button on Request Form | **`/vendor/executives` clean list (no drawer reopen).** Vendor cancelled deliberately; reopening the drawer they just left would feel like undoing their cancel. |
| 16 | Topbar search-glass scope | **Executive search only for v1** (same scope as the list page search input). Universal cross-record search deferred to v2. |
| 17 | Refresh strategy | **Supabase Realtime for sidebar count badges + Dashboard ribbon; route-change refresh for everything else.** Counts are visible on every page so realtime keeps them honest; widgets and lists are visited intentionally so route-change fetch is fine. Realtime cost stays low (~4-5 subscribed counts per vendor). |
| 18 | Sign-out flow | **Supabase `signOut()` (server-revoked) → `/login`.** Server-revoked closes any other tab the vendor had open. Never trust client-only logout. |
| 19 | Empty / loading / error state Pass B priority | **Dashboard widgets → Executives list → Request Form.** Dashboard is every-session-visible (highest impact). Executives list is the most-used surface. Request Form is visited a few times before a state matters. |

### Implications for Pass B work backlog

See §11.

---

## 7. Cross-screen data integrity rules

These are durable contracts the build chat MUST honour. Violations are bugs.

### 7.1 Same record = same image, name, role, charity across surfaces

For executive `EXC-1042` (Priya Raghavan):
- Photo `executive.photo_url` is THE source. Same image on:
  - Executives list row
  - Detail Drawer identity block
  - Request Form context strip
  - Upcoming meetings row on Dashboard
  - Pending widget row on Dashboard (if Priya is in there)
  - Your impact gift row "after Priya Raghavan" on Dashboard
  - Notification dropdown items mentioning Priya

For vendor `Acme Robotics`:
- Logo (or initials fallback) same across:
  - Sidebar identity card on every vendor screen
  - Future Company tab avatar
- Band same across:
  - Topbar eyebrow "ACME ROBOTICS · BAND 2"
  - Ribbon "YOUR BAND · Band 2 · $1,000 / mtg"
  - Sidebar identity card "Band 2 · Renews 12 Mar 2027"

For current user `Sam Patel`:
- Avatar SP same across:
  - Sam Patel chip in sidebar bottom
  - Topbar SP avatar
  - Request Form Q3 Me radio subtitle "Sam Patel · Head of RevOps · Acme Robotics"
  - (future) Profile tab avatar

### 7.2 Money figures read from one engine, never recomputed

- `$1,500` per meeting → `MEETING_FEE_AUD` from `@thegoodintro/pricing`
- Per-band charity rate ($900 / $1,000 / $1,100 / $1,200) → `bandForMeetingNumber(...).rateCents`
- Total to charity this FY → `vendorCharityForPeriod(...)` in `lib/reporting.ts`
- Charity gift amount displayed in `gift_record` rows → FROZEN `gift_record.charity_amount_cents` at Held moment, never recomputed

No vendor screen ever hardcodes a dollar figure.

### 7.3 Count badges + ribbon stats agree

If sidebar Pending [4] says 4, the Dashboard Pending widget count chip should
also say 4. If sidebar Upcoming [2] says 2, the Dashboard Upcoming meetings
widget count chip should say 2. The Dashboard ribbon Credits available should
agree with the Your credits widget Fraunces number. **Same query, same render.**

### 7.4 Status semantics

- Vendor exec status pill values: `Request sent` / `Meeting complete` / `Declined` / (blank). Computed: latest `request.status` per vendor+exec, with `Meeting complete` override when any `meeting.status='held'` exists for that vendor+exec pair.
- Dashboard "Executives for you" Requested chip = exec has any open `request` from this vendor (status IN ('submitted','accepted')).
- These must reconcile: if the list shows Helena as "Request sent" and the dashboard card shows Helena as "Requested", they're the same vendor+exec state.

---

## 8. State transitions — what happens when the user takes an action

### 8.1 Submit Request Form

1. User clicks "Send request to Priya →"
2. Client: disable form, show submitting state (Pass B — not designed)
3. POST `/api/vendor/requests` with `{ executive_id, qualifying_questions: { who_are_we, why_specifically }, attendee_kind, (optional attendee_other) }`
4. Server: content-guard sanitises Q1+Q2 (strip emails / phones / URLs), creates `request` row with `status='submitted'`
5. Server: enqueue exec email workflow (per `EMAIL_ACTIONS.md`)
6. Server: enqueue admin notification (per `NOTIFICATION_TEMPLATES.md`)
7. Server: increment `vendor.outstanding_request_count` if used for overcommit rule (4-beyond-credits cap)
8. Server: 200 + new request id
9. Client: dismiss form, route to OPEN destination (see §6.10), show toast or confirmation modal
10. **Side effects across the portal:**
    - Sidebar Pending count [4] becomes [5]
    - Executives list row for Priya: status pill updates to "Request sent"
    - Dashboard Executives for you card for Priya: button updates to "Requested" chip
    - Pending widget on Dashboard: new row added at top
    - Dashboard Pending sub-eyebrow "4 pending" becomes "5 pending"

All these must update without a full page reload. Either Supabase realtime on
the affected tables, or a refetch on route navigation back to dashboard.

### 8.2 Open Detail Drawer

1. User clicks row on Executives list
2. Client: opens drawer with that exec's id, dims backdrop
3. URL mutates to `/vendor/executives/{exec_id}` (RECOMMENDED — confirms §6.9)
4. Drawer hydrates from `executive` record (photo, bio, charity, joined_at)
5. ESC / X / backdrop / Cancel: URL → `/vendor/executives`, list re-rendered (no fetch)

### 8.3 Toggle a Settings field

1. User edits First name
2. Client local state: `first_name` changes
3. DEFAULT chip becomes CUSTOM chip on that field
4. `dirty_fields.length` becomes > 0
5. Sticky save bar slides in from below (Pass B)
6. User clicks Save: POST diff → success → DEFAULT chip restored, save bar dismisses
7. User clicks Discard: local state reverts to last saved, chips back to DEFAULT, save bar dismisses

### 8.4 Sign out

1. User clicks "sign out" text in Sam Patel chip
2. Client: confirm dialog? (Recommend NO — direct sign-out)
3. Supabase signOut + client session clear
4. Redirect to `/login`

### 8.5 Sidebar identity card click

OPEN (§6.1.1). Recommend: route to `/vendor/settings/company` (Pass B) — closes
the loop on the vendor logo upload promise we made when adding the card.

---

## 9. Edge cases the build chat must handle

| Case | Behaviour |
|---|---|
| Vendor refreshes mid-drawer | Drawer state preserved iff §6.9 URL-mutation decision is "yes URL mutates" |
| Vendor opens deep link `/vendor/executives/EXC-1042` directly (e.g. from email) | List loads + drawer opens on Priya (iff URL mutation enabled) |
| Vendor opens deep link `/vendor/executives/EXC-1042/request` directly | Form loads with Priya context; user can submit without ever seeing list or drawer |
| Vendor presses browser back from Request Form | Back-button rule says → `/vendor/executives` (parent), not browser back. Browser back behaviour is the SAME route per Next.js routing — both arrive at the list |
| Vendor presses browser back from Detail Drawer | Same effect as X close: URL → `/vendor/executives` |
| Vendor status changes mid-session (e.g. payment confirmed by admin) | Server push updates sidebar; pre-payment lockout state on Executives list dismisses; first-time-in-paid-state toast (NOT YET DESIGNED) |
| Vendor access window expires (12 months since first purchase) | Executives list re-locks to pre-payment "book your call" state; sidebar Executives item still visible but gated; Dashboard ribbon Credits available stays accurate; Pending widget still works (existing requests valid) |
| Owner role changes to Member (e.g. another teammate made owner) | Sidebar ACCOUNT group's Get started / Team / Billing items hide on next page load |
| Vendor uploads new profile photo | Photo cascades to: Sam Patel sidebar chip / topbar SP avatar / Request Form Q3 Me subtitle (NO photo there currently, just text) / future Profile tab avatar |
| Exec uploads new photo | Cascades to: Executives list row / Detail Drawer / Request Form context strip / Dashboard Upcoming meetings row / Pending widget row / future notification dropdown items |
| Two browser tabs open on same vendor account | Both tabs see realtime updates on their sidebar count badges; form state local to each tab |
| Vendor at overcommit cap (10 credits + 4 outstanding requests = 14 open) | Request Form Send button DISABLED with helper "You're at your request cap. Resolve a pending request or buy more credits." NOT YET DESIGNED |

---

## 10. Notifications — what fires when

Tied to `NOTIFICATION_TEMPLATES.md`. Each event below:
1. Creates a row in `notification` table (with `vendor_user_id`)
2. May send an email (per the user's Notifications tab prefs — Pass B)
3. Triggers bell amber dot + adds to dropdown (when dropdown is designed)

| Event | Fires on |
|---|---|
| Request accepted | admin marks `request.status = 'accepted'` (after exec accepts the email) |
| Request declined | admin marks `request.status = 'declined'` (after exec declines) |
| Meeting scheduled | admin creates `meeting` row tied to the request |
| Meeting time changed | admin updates `meeting.scheduled_at` (vendor and exec both notified) |
| Meeting cancelled | admin marks `meeting.status = 'cancelled'` |
| Meeting held (and credit consumed) | admin marks `meeting.status = 'held'` |
| Gift sent (post Held) | admin creates `gift_record` row |
| Payment receipt | Xero webhook confirms invoice paid → credits land |
| Onboarding checklist item assigned | admin attaches checklist (after vendor pays) |
| Onboarding reminder | nightly job iff checklist incomplete N days after assignment |
| Access window expiring | nightly job at 30 / 14 / 7 days before `vendor.access_window_ends_at` |
| Access window expired | nightly job on the day-of |

---

## 11. Pass B work backlog (re-prioritised after §6 decisions)

Order matters: each item below builds on the locks and decisions above. Items
1-3 unblock the biggest functional gap (a brand-new vendor's first session).
Items 4-7 fill out the routes the locked screens point to. Items 8-10 finish
the polish surfaces.

| Priority | Work item | Why first / Pass B notes |
|---|---|---|
| 1 | **Vendor signup form + pre-payment lockout state + pre-payment Dashboard** | The biggest functional gap. A brand-new vendor signs up on the website, lands on a gated Dashboard, can navigate Settings/Profile to fill in their About, sees "book your call" everywhere else. Three viewports in one Claude Design file. |
| 2 | **Vendor notification dropdown popover** | Now confirmed v1 scope (decision §6.3). 380px popover anchored under topbar bell. Mirror admin pattern; vendor-specific notification types from §10 (request accepted/declined, meeting confirmed/moved/held, gift sent, payment receipt, onboarding reminder, access-window warning). |
| 3 | **Pending requests list page (T3) + row-expand state** | Post-submit redirect destination (decision §6.2). Without this page existing, the form has nowhere to land. Row-expand shows Q1/Q2 answers + admin follow-up status when clicked. |
| 4 | **Meetings list page (Upcoming + Past tabs, T3) + row-expand state** | Sidebar Meetings ▾ Upcoming [2] / Past destinations. Row-expand shows time / join link / outcome (after Held) / gift link (after sent). |
| 5 | **Giving page (T3)** | Sidebar Giving destination. Read-only gift records list + total to Good FY + charity breakdown. Reads from `gift_record` (frozen amounts). |
| 6 | **Settings Notifications + Security + Company tabs** | Inherit locked admin patterns. Company tab confirmed by decision §6.5 (sidebar identity card click destination). Vendor logo upload lives here. |
| 7 | **Request Form Pass B states** | Q3 "Someone else" expansion (Name / Title / Email fields), empty / submitting / content-guard-error states. Note: confirmation modal CUT (decision §6.2 replaced it with toast + redirect to Pending). |
| 8 | **User menu popover** | Small popover off Sam Patel chip + topbar SP avatar (decision §6.6). 3 items: My profile / Settings / Sign out. ~1 screen of light design work. |
| 9 | **Get-started checklist (T6) + Team + Billing & credits pages** | Owner-only screens. Get-started clones the locked T6 component. Team is invite/seat management. Billing is credit history + Xero invoice link + buy more credits flow. |
| 10 | **Empty / loading / error states across Dashboard widgets, then Executives list, then Request Form** | Priority order per decision §6.6. Every widget ships these three states per the design log rule; coverage hasn't been visualised yet. |

**Cut from Pass B:** the post-submit confirmation modal (replaced by toast + redirect, decision §6.2).

**Not in Pass B (deferred to v2 or later):**
- Universal cross-record search (decision §6.4)
- Five-state vendor lifecycle granularity (decision §6.1 chose two-state lockout instead of all five)
- Standalone `/vendor/requests/{id}` and `/vendor/meetings/{id}` detail pages (decision §6.4 chose row-expand)
- Vendor self-onboarding wizard (different problem; out of scope)

## 12. How to use this document

For Issy (the planning chat):
- This is the system contract across all vendor screens. When designing a new screen, cross-reference §3 (CTAs), §7 (data integrity), and §9 (edge cases) BEFORE writing the Claude Design prompt.
- When locking a new vendor screen, update the relevant sections here in the same pass. This document is NOT versioned per screen; it evolves with the system.

For the build chat (future Supabase-connected window):
- This document is the inter-screen contract. The locked screen READMEs in `design/locked/` are the per-screen visual + data spec.
- §4 (sidebar IA) and §5 (count badge sources) are queries you implement directly.
- §6 (decisions log) is the source of truth for any "what should happen when…" question. If the locked screen READMEs and this document conflict, **this document wins** for cross-screen behaviour; the screen README wins for the visual treatment.
- §7 (cross-screen data integrity) is the contract you must NOT violate (one photo per exec across all surfaces, money from pricing engine, count badges agree across sidebar + dashboard).
- §10 (notifications) is the event catalogue. Each row is a separate `NOTIFICATION_TEMPLATES.md` entry.
