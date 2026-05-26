# Positioning principles

> **Status:** Internal strategy / messaging reference. NOT live page copy.
> Do not apply to rendered pages unless explicitly instructed. Rendered page
> copy lives in `copy/`.
>
> **Brand-rule override:** This doc was drafted before our house style rules.
> Where it conflicts with an established rule, the house rule wins:
> - Never use the word **"marketplace"** (use "network" or another fit). The
>   homepage-hierarchy line below says "curated marketplace" — rewrite to
>   "network" before any of it ships.
> - Never use the word **"Coaching"** / never call things a **"program"** (not
>   relevant here but applies site-wide).
> - Every customer-facing **"good"** becomes **"Good"** in brand emerald.
> - No em/en dashes in prose (en dashes only for numeric ranges).
>
> **⚠ Pending principle (2026-05-24):** Principle 2 ("We never touch the
> donations") is under review and may change. See the flag on that section. Do
> not ship any donation-flow copy until the charity / fund flow is decided.

**Purpose of this doc.** Translate the research on competitor weaknesses into our positioning, messaging, and on-site language. We never name competitors. We never compare. We never imply someone else is doing it wrong. Every principle below is framed as **what we stand for**, and the on-site copy lives at the level of "this is how we operate" — not "this is how others don't."

**Mental model.** Our competitor has built a real business doing genuine good. Shaming them is wrong, legally risky, and weakens our own brand. Their contradictions are *intel*, not ammunition. We use that intel to clarify our own values and let the buyer figure out the rest on their own.

---

## The four principles

These four principles are the spine of the brand. Every page, every email, every sales conversation should be traceable back to one of these.

### 1. Full transparency

Buyers can see exactly where the money goes, how much, and when. No "substantial donation" language. No "up to" language. Real numbers, published, current, auditable.

**What this looks like in practice:**
- The per-meeting donation amount is stated in plain language on the homepage, the pricing page, and the executive landing page. The number on each page is the same number.
- A live impact counter shows total donated to date. It updates automatically, not manually.
- Each quarter we publish a one-page report: total meetings, total donated, charity-by-charity breakdown. Linked from the footer.
- Each charity partner provides a confirmation letter annually. We link to scanned copies (with their permission).
- The Terms of Service spell out the donation flow in one paragraph a non-lawyer can read.

**Copy patterns to use:**
- "Every meeting donates $X. That number doesn't move."
- "Here's where every dollar went last quarter." (with link)
- "We publish our numbers because we'd want to see them if we were you."

**Copy patterns to avoid:**
- "Substantial donation" / "significant contribution" / "meaningful impact" (all vague)
- "Up to $X" (implies a ceiling that's rarely hit)
- "100% of profits" (legal landmine; "profits" is undefinable)
- Any claim with the word "approximately" attached to a donation figure

---

### 2. We never touch the donations

> **⚠ STATUS: PENDING REVIEW (2026-05-24).** The platform may need to **hold both
> the revenue and the charity funds** and release the gift to the exec's chosen
> charity once the meeting has happened (see `PLATFORM_WORKFLOWS.md`, Finance and
> donations). If so, this principle and every copy line built on it ("the fee
> never enters our account", "we never touch the donations") no longer holds as
> written. **Do not ship any copy based on this principle until the charity /
> fund flow is decided.** It may be reframed to an honest "funds are held and
> released to your chosen charity once the meeting happens", or preserved via a
> non-custodial release mechanism (payment processor with delayed payout, or a
> fiscal sponsor / giving platform that holds and disburses). Pending Issy
> figuring out the flow, plus legal and accounting advice.

The donation is structurally separate from our revenue. We can't take a cut even if we wanted to, because the money never enters our operating account. Our revenue comes from one thing only: the vendor seat fee.

**What this looks like in practice:**
- Meeting fees flow from the vendor → directly to the charity (via a payment processor configured to route to the charity's account, not ours).
- Our operating costs (Stripe fees, platform hosting, salaries, marketing) come out of the vendor seat fee, never out of the meeting fee.
- The Terms of Service spell this out: "The meeting fee is not company revenue. We do not hold, invest, or earn interest on donation funds."
- If a vendor cancels, the meeting fee that was tied to a held meeting still goes to charity — we don't refund the charity portion.

**Why this matters for the model:**
- It removes any incentive for us to inflate meeting counts or pressure executives into more meetings.
- It makes "100% of meeting fees go to charity" a structural fact, not a marketing claim.
- It survives any future audit, ACCC inquiry, or journalist investigation untouched.

**Copy patterns to use:**
- "The meeting fee never enters our account. It goes from the vendor straight to the charity."
- "Our revenue is the vendor seat fee. That's it. That's the whole model."
- "We make money by being useful to vendors, not by skimming donations."

**Copy patterns to avoid:**
- "Most of the meeting fee goes to charity" (any qualifier is a tell)
- "After costs" / "after platform fees" / "net of expenses" (these are the loopholes that erode trust)

---

### 3. The executive chooses the charity. Properly.

Not from a fixed list of six children's-health charities. Any registered charity in the executive's country. We handle the verification and payment rails so the executive doesn't have to think about it.

**What this looks like in practice:**
- On sign-up, an executive nominates their charity. We verify it's a registered charity (ACNC for Australia, Charity Commission for UK, etc.) within 48 hours.
- If an executive wants to change charity later, they can. No hoops.
- We maintain a default list of pre-verified options for executives who don't want to nominate (refugee aid, climate, mental health, children's health, animal welfare, etc.) — but it's a convenience, not a constraint.
- Donations to nominated charities are paid via the same rails as default charities. No second-tier experience for non-default choices.

**Operational note for Claude Code:**
- This is the hardest principle to deliver on technically. Build the charity verification flow early. ACNC has a public API (ABN Lookup) — use it. UK Charity Commission has a similar public register.
- Budget time for the payment-routing layer. This is where the model is hard to copy.

**Copy patterns to use:**
- "Your meeting. Your charity. Your choice."
- "Any registered charity in [country]. We verify it within 48 hours."
- "We don't have a charity list. We have your charity."

---

### 4. Honest numbers, honest claims

Every quantitative claim on the site can be backed up by a screenshot, a document, or a database query. If we can't substantiate it, we don't say it. This applies to executive counts, meeting counts, donation totals, conversion rates, vendor pipeline figures — all of it.

**What this looks like in practice:**
- The homepage stats (executives, meetings, donations) are pulled from the database, not hard-coded.
- Testimonials include real numbers that reconcile with that executive's actual platform activity. If the headline says "$X raised" and the card says "$Y donated," X equals Y.
- Vendor-facing claims (conversion rate, pipeline impact) are based on real cohort data, with the cohort size and time period stated. No "30x industry average" hand-waving.
- We don't claim "AI-powered matching" unless we have actual ML in the matching layer. If it's a rules-based concierge service, we call it a concierge service — and own that as a feature, because it's a better experience than bad AI.
- Endorsers carry their actual title (e.g. "VP at [Company]"), not a confected one (e.g. "Chief Evangelist") unless that role is contractually real.

**Copy patterns to use:**
- "Based on [N] meetings between [date] and [date]."
- "Verified by [charity name] in their [year] annual report."
- "We've facilitated [exact number] meetings since launch."

**Copy patterns to avoid:**
- Any round number that looks suspiciously round ("over 1,000 meetings" when the real number is 847)
- "Industry-leading" / "best-in-class" / "world's #1" (unsubstantiable superlatives)
- "Trusted by thousands" without a number

---

## The "What makes us different" page

You mentioned potentially building a page like this. Here's the version that works without naming or shaming anyone.

**Page title options:**
- "How we work"
- "Our promises"
- "The way we run things"

**Structure:** Four sections, one per principle above. Each section is ~80 words. Each section ends with a concrete proof point (a link to the transparency report, a screenshot of the ACNC verification flow, a charity partner's confirmation letter).

**Tone:** First-person plural. Calm, factual, slightly understated. The vibe is "this is just how we do things" — not "look how amazing we are." Confidence without performance.

**What this page does NOT contain:**
- No competitor names
- No comparison tables that imply there's an "us vs them"
- No language like "unlike other platforms" or "while others may..."
- No screenshots, quotes, or callouts of anyone else's marketing
- No legal or regulatory language ("ACCC compliant," etc.) — we don't need to wear the badge because the conduct itself is the proof

**What this page DOES contain:**
- Plain statements of how we operate
- Links to evidence (transparency report, ToS, charity confirmations)
- One pull quote from an executive or charity partner about the experience of working with us

The reader who knows the competitor will draw their own conclusions. The reader who doesn't will just see a business that's clear about its values. Both responses are wins.

---

## Homepage messaging hierarchy

The order of claims on the homepage matters. Here's the hierarchy I'd suggest, in priority order:

1. **What this is** (one sentence): A curated network of 1:1 meetings between senior executives and vetted vendors, where the meeting fee funds the executive's chosen charity. *(Original draft said "marketplace" — replaced per house rule; never use "marketplace.")*
2. **The promise**: Every meeting donates [$X] to a registered charity of the executive's choice. The fee never touches our account.
3. **Proof**: Total donated to date (live counter). Number of meetings facilitated. Number of charities supported.
4. **How it works** (three steps, plain language).
5. **Who's on it** (logo wall — only with permission; never use logos as social proof without written approval).
6. **Why executives join** (3 short cards: real intelligence, no spam, fund a cause they choose).
7. **Why vendors join** (3 short cards: access to opted-in execs, transparent pricing, charity alignment).
8. **Footer CTA**.

**What's deliberately missing from this hierarchy:**
- No founder hero shot. The brand isn't a personality cult.
- No "AI-powered" claims unless and until we have ML in the matching layer.
- No celebrity endorser as a navigation-level fixture. If we ever land one, it's a testimonial card, not a title.

---

## Specific language to lock in

These phrasings should appear consistently across the site, app, emails, and sales conversations. Consistency is itself a trust signal.

**Donation language:**
- ✅ "Every meeting donates $X to the executive's chosen charity."
- ✅ "100% of the meeting fee goes to charity. We make our money on the vendor seat fee."
- ❌ "100% of profits to charity"
- ❌ "Substantial donation made on your behalf"

**Pricing language (vendor side):**
- ✅ "[$X] per seat per year. [N] meetings included. No per-meeting surcharges."
- ✅ "Pay for the seat. Pay nothing more."
- ❌ Tiered pricing where the per-meeting cost is identical across tiers (it's fake tiering)

**Vendor-side claims:**
- ✅ "Across [N] meetings in [period], [X]% led to a follow-up conversation."
- ❌ "30x the industry average"
- ❌ "Guaranteed pipeline"

**Executive-side claims:**
- ✅ "Pitch-free conversation. Vendors who pitch lose access. We enforce it."
- ❌ "No pitches, no pressure" (if we don't enforce it, this is empty)

**Total impact:**
- ✅ "$[exact figure] donated as of [date]. Updated daily."
- ❌ "Over $1 million raised" (if the real number is $1.4M, say $1.4M; round numbers feel rounded)

---

## What to build first (for Claude Code)

If we're sequencing the work, here's the dependency order:

1. **Transparency infrastructure** before anything else:
   - Donation tracking in the database (per meeting, with charity destination, status, and date)
   - Public-facing live counter pulling from that table
   - Quarterly report generation (template + cron job)
2. **Charity verification flow**:
   - ACNC API integration for AU charities
   - UK Charity Commission API for UK charities
   - Admin tool for verifying charities in countries without a public register
3. **Payment routing**:
   - Stripe Connect (or equivalent) so meeting fees route from vendor → charity without touching our account
   - Reconciliation reports that match what's on the live counter
4. **Then** the marketing site
5. **Then** the vendor sales pages

The site can't make the four promises until the infrastructure backs them up. If we launch the marketing first, every promise is a hostage to a future operational failure.

---

## The values test

Before publishing any new copy, claim, or page, run it through this test:

1. **Can I prove this with a screenshot or database query right now?** If no, rewrite or delete.
2. **Does this statement still hold if a journalist asks me about it in 18 months?** If no, soften or specify.
3. **Does this compare us favourably to anyone in particular?** If yes, rewrite to be about us, not them.
4. **Could a reasonable customer feel misled if they read this and then experienced the product?** If yes, the copy is overclaiming.
5. **Would I be comfortable if our competitor read this and recognised themselves in it?** If no, rewrite.

That last one is the discipline. The work isn't to make them look bad. The work is to make us look honest. Done well, those are the same thing — but only the second framing is safe to actually say out loud.

---

## What this doc isn't

This isn't a comparison strategy. It isn't competitive marketing. It isn't a list of attacks. It's a list of operating principles that happen to be the inverse of competitor weaknesses — but we never frame them that way externally, and ideally we don't frame them that way internally either. Over time, the team should think of these as "the way we do things," not "the way they don't."

The competitor exists. They do real good. We're building something cleaner, and the cleanness is the entire pitch.
