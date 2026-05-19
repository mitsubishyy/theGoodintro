import { existsSync } from "node:fs";
import path from "node:path";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  ShieldCheck,
  HeartHandshake,
  Plus,
  Minus,
  Quote,
  Star,
} from "lucide-react";
import {
  IconStethoscope,
  IconBook,
  IconSapling,
  IconHandshake,
  IconPaw,
  IconBriefcase,
  IconNetwork,
  IconGift,
  IconColdInbox,
  IconIntro,
  IconTag,
  IconSeal,
  IconHeartCircle,
  IconCheck,
  IconX,
} from "./_components/icons";
import { HeroIllustration } from "./_components/illustrations";
import { MetricCard } from "./_components/ui";
import { LogoMarquee } from "./_components/LogoMarquee";
import { CALENDLY_URL, DGR_CHARITY_EXAMPLES } from "@/lib/config";

export default function Home() {
  const hasGivingPhoto = existsSync(
    path.join(process.cwd(), "public", "giving.jpg"),
  );
  return (
    <>
      {/* ── Hero — split with illustration, trust badges ───────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--cream-1)" }}
      >
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-20 md:pt-20 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <div className="reveal reveal-1">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur-sm pl-2.5 pr-4 py-1.5 text-xs">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium"
                    style={{ background: "var(--signal-soft)", color: "var(--signal)" }}
                  >
                    <span
                      className="size-1.5 rounded-full pulse-dot"
                      style={{ background: "var(--signal)" }}
                    />
                    Live
                  </span>
                  <span className="text-muted-foreground">
                    Founding cohort applications · Australia
                  </span>
                </span>
              </div>
              <h1 className="reveal reveal-2 mt-6 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.02]">
                Meetings that fund{" "}
                <span className="serif-italic">what matters</span>.
              </h1>
              <p className="reveal reveal-3 mt-7 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                A handful of relevant conversations, on your terms. Each one
                sends{" "}
                <span className="font-medium text-foreground">$1,000</span> to
                an Australian charity{" "}
                <span className="font-medium text-foreground">you</span>{" "}
                choose. No cold pitches. No hard sells. The whole money flow
                is on this page.
              </p>
              <div className="reveal reveal-4 mt-9 flex flex-col sm:flex-row items-start gap-3">
                <a
                  href={CALENDLY_URL}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-medium hover:bg-primary transition-colors"
                >
                  Apply as a founding executive
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link
                  href="/vendors"
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-accent px-6 py-3.5 text-sm font-medium transition-colors"
                >
                  Are you a vendor?
                  <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>

              {/* Trust badges — Employment Hero move */}
              <div className="reveal reveal-5 mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
                <TrustBadge stars={5} label="Founding cohort 2026" sub="Invite only · Australia" />
                <TrustBadge label="Registration in progress" sub="TheBigIntro Pty Ltd, Australia" mono />
                <TrustBadge label="DGR-endorsed charities" sub="Deductible gift recipient causes only" />
              </div>
            </div>
            <div className="lg:col-span-5">
              <div className="reveal reveal-3 relative">
                <HeroIllustration className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Partner / charity logo strip ──────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-10">
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-6">
            Examples of DGR-endorsed Australian charities
          </p>
          <LogoMarquee
            items={DGR_CHARITY_EXAMPLES}
            ariaLabel="Example DGR-endorsed Australian charities"
          />
          <p className="mt-6 text-center text-xs text-muted-foreground italic max-w-2xl mx-auto">
            Illustrative only. These are not partners. Each executive chooses
            their own charity from any organisation holding deductible gift
            recipient (DGR) endorsement in Australia.
          </p>
        </div>
      </section>

      {/* ── Big metrics strip ──────────────────────────────────── */}
      <section
        className="border-b"
        style={{ background: "var(--cream-1)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-24">
          <div className="text-center mb-14">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              The numbers that matter
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Built for{" "}
              <span className="serif-italic">accountability</span>.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              value="$1,000"
              label="To charity per meeting"
              note="The full gift, never reduced for platform costs"
            />
            <MetricCard
              value="100%"
              label="Of the gift reaches the charity"
              note="Admin fee is billed separately to the vendor"
            />
            <MetricCard
              value="$0"
              label="Cost to executives"
              note="Free to join. Free to decline. Always."
            />
            <MetricCard
              value="DGR"
              label="Endorsed charities only"
              note="Every gift goes to a deductible gift recipient charity, verifiable on the public register"
            />
          </div>
        </div>
      </section>

      {/* ── How it works — split layout with illustration ──────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <SectionLabel>How it works</SectionLabel>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                Three steps.{" "}
                <span className="serif-italic">Nothing hidden</span>.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                You define what is relevant. Vendors state why a conversation
                fits. You decide which ones happen. Each one sends a real
                gift. The whole loop takes less than an hour of your time per
                meeting, and the charity sees the money within 14 days.
              </p>
              <div className="mt-8">
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
                >
                  Read the full model end to end
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
            </div>
            <div className="lg:col-span-7 flex flex-col gap-4">
              <BigStepCard
                n="01"
                icon={Compass}
                title="You set what is relevant"
                body="Tell us the priorities, initiatives, or problems you'd actually take a conversation about. Anything outside that scope never reaches you. You can update the list any time."
              />
              <BigStepCard
                n="02"
                icon={ShieldCheck}
                title="You see qualified requests with a stated reason"
                body="A vendor must write the specific initiative or problem before they can ask. You see the reason in plain language and decide freely. No obligation, no penalty for declining, no follow-up unless you invite it."
              />
              <BigStepCard
                n="03"
                icon={HeartHandshake}
                title="One short, focused meeting funds a real cause"
                body="A scheduled conversation, on your terms. $1,000 lands in your chosen charity within 14 days, with written confirmation. You can step away at any point, and your details are never sold or shared."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Tabbed two-audience section (Employment Hero move) ── */}
      <section
        className="border-y"
        style={{ background: "var(--cream-1)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="max-w-3xl mb-16">
            <SectionLabel>Built for both sides</SectionLabel>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              An entry fee that{" "}
              <span className="serif-italic">earns</span> the meeting.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Most outreach platforms reward volume. We reward relevance and
              giving. Executives only see conversations that fit what they
              asked to hear about. Vendors only reach leaders by stating
              specifically why the conversation is worth taking.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <AudienceCard
              tag="For executives"
              title="Conversations worth your time."
              points={[
                "Set the topics you will take a meeting on, and nothing else reaches you",
                "See the stated reason before anything is scheduled",
                "Decline freely with no penalty or follow-up",
                "$1,000 to a charity you choose, every meeting that happens",
                "Free to join, free to leave, free for life",
              ]}
              cta="Apply as a founding executive"
              ctaHref={CALENDLY_URL}
              link={{ label: "For executives →", href: "/executives" }}
            />
            <AudienceCard
              tag="For vendors"
              title="A room you cannot cold-email into."
              points={[
                "Pre-qualified senior audience that opted in to your category",
                "Goodwill that lasts: $1,000 to charity every meeting you book",
                "Pricing transparent on the page, with no surprise fees",
                "Reach people who never reply to cold email",
                "Founding vendor cohort: shape how this works",
              ]}
              cta="Book a vendor call"
              ctaHref={CALENDLY_URL}
              link={{ label: "For vendors →", href: "/vendors" }}
              accent
            />
          </div>
        </div>
      </section>

      {/* ── The giving promise — split with photography ──────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div
              className="lg:col-span-6 relative aspect-[4/3] rounded-3xl overflow-hidden border"
              style={{ borderColor: "var(--border)" }}
            >
              {hasGivingPhoto ? (
                <Image
                  src="/giving.jpg"
                  alt="Charity work funded through TheBigIntro meetings."
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  priority={false}
                />
              ) : (
                <div
                  className="absolute inset-0 grid place-items-center text-center px-8"
                  style={{ background: "var(--mint-tint)" }}
                >
                  <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
                  <div className="relative">
                    <div className="display-serif text-6xl md:text-7xl leading-none text-primary">
                      $1,000
                    </div>
                    <div className="mt-4 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                      Real charity imagery added at launch
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-6">
              <SectionLabel>The giving promise</SectionLabel>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                Where the gift{" "}
                <span className="serif-italic">actually goes</span>.
              </h2>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                The donation is paid from the vendor to TheBigIntro, then on
                to the executive's chosen DGR-endorsed charity within{" "}
                <span className="font-medium text-foreground">14 days</span>{" "}
                of the meeting. The charity confirms receipt directly to the
                executive in writing. No part of the donation is taken to
                cover platform costs. Running the platform is funded by a
                separate admin fee billed to the vendor on a clearly named
                line item.
              </p>
              <div className="mt-8 space-y-4">
                <GivingRow k="Donation amount" v="$1,000 per meeting" />
                <GivingRow k="Payment to charity" v="Within 14 days of the meeting" />
                <GivingRow k="Charity choice" v="Any DGR-endorsed Australian charity" />
                <GivingRow k="Written confirmation" v="Sent direct from charity to executive" />
                <GivingRow k="Tax treatment" v="DGR receipt issued to the vendor" />
              </div>
              <Link
                href="/impact"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
              >
                See the public impact dashboard
                <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founding-member spotlight (honest preview, no fabricated quote) ── */}
      <section
        className="border-y"
        style={{ background: "var(--stone-tint)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-28">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionLabel>Founding member spotlight</SectionLabel>
              <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
                Real stories,{" "}
                <span className="serif-italic">once they are real</span>.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                We will not publish a quote we wrote ourselves. When founding
                executives agree to be named, each spotlight will appear here
                with their meetings taken, the total they have directed, and
                the charity they chose. This is the shape it will take.
              </p>
            </div>
            <div className="lg:col-span-7">
              <figure
                className="rounded-3xl border border-dashed p-8 md:p-10"
                style={{ background: "var(--card)", borderColor: "var(--border-strong)" }}
              >
                <Quote className="size-7 text-muted-foreground/30" />
                <div className="mt-5 space-y-3" aria-hidden>
                  <div
                    className="h-3.5 rounded-full"
                    style={{ background: "var(--accent)", width: "92%" }}
                  />
                  <div
                    className="h-3.5 rounded-full"
                    style={{ background: "var(--accent)", width: "85%" }}
                  />
                  <div
                    className="h-3.5 rounded-full"
                    style={{ background: "var(--accent)", width: "68%" }}
                  />
                </div>
                <figcaption className="mt-8 flex items-center gap-4">
                  <div
                    className="size-12 rounded-full grid place-items-center text-muted-foreground"
                    style={{ background: "var(--accent)" }}
                    aria-hidden
                  >
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      A founding executive
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Named with their permission, after launch
                    </div>
                  </div>
                </figcaption>
                <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t" style={{ borderColor: "var(--border)" }}>
                  <SpotPill label="Meetings taken" v="To come" />
                  <SpotPill label="Total directed" v="To come" />
                  <SpotPill label="Charity" v="Their choice" />
                </div>
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* ── Causes ───────────────────────────────────────────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-28">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionLabel>Your call</SectionLabel>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                Real causes.{" "}
                <span className="serif-italic">Your call</span>.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Every donation goes to a registered Australian charity you
                name. You can change your nominated charity at any time, and
                you can choose a different charity for each meeting. These
                are the kinds of causes the first cohort has nominated so
                far.
              </p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-3">
              <CauseRow icon={IconStethoscope} label="Health & medical research" />
              <CauseRow icon={IconBook} label="Education & young people" />
              <CauseRow icon={IconSapling} label="Environment & climate" />
              <CauseRow icon={IconHandshake} label="Community & crisis relief" />
              <CauseRow icon={IconPaw} label="Animal welfare" />
              <CauseRow icon={IconHeartCircle} label="Or any DGR-endorsed charity" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Cold inbox vs TheBigIntro (kept, refined) ────────── */}
      <section
        className="border-y"
        style={{ background: "var(--cream-1)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="max-w-2xl">
            <SectionLabel>Why the model works</SectionLabel>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              The cold inbox{" "}
              <span className="serif-italic">vs.</span> TheBigIntro.
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              Same goal, reaching a senior leader. Two completely different
              experiences for both sides. The difference comes from one
              requirement: a stated, specific reason before a meeting can be
              requested.
            </p>
          </div>

          <div className="mt-14 grid md:grid-cols-2 gap-4">
            <div
              className="rounded-2xl border p-8"
              style={{ background: "var(--stone-tint)", borderColor: "var(--stone-soft)" }}
            >
              <div
                className="size-12 rounded-xl grid place-items-center mb-6"
                style={{ background: "var(--stone-soft)", color: "var(--muted-foreground)" }}
              >
                <IconColdInbox size={22} />
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] mb-3 text-muted-foreground">
                The cold inbox
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-6">
                Generic outreach that goes nowhere.
              </h3>
              <ul className="space-y-3 text-sm">
                <ComparisonRow bad text="Sent without relevance to your priorities" />
                <ComparisonRow bad text="No accountability for wasting your time" />
                <ComparisonRow bad text="The same pitch sent to everyone" />
                <ComparisonRow bad text="Zero gift to anyone, ever" />
                <ComparisonRow bad text="Sales follow-up assumed by default" />
                <ComparisonRow bad text="Your time priced at zero" />
              </ul>
            </div>

            <div
              className="rounded-2xl border p-8"
              style={{ background: "var(--signal-soft)", borderColor: "var(--primary)" }}
            >
              <div
                className="size-12 rounded-xl grid place-items-center mb-6"
                style={{ background: "var(--card)", color: "var(--primary)" }}
              >
                <IconIntro size={22} />
              </div>
              <div
                className="text-[10px] font-mono uppercase tracking-[0.18em] mb-3"
                style={{ color: "var(--primary)" }}
              >
                TheBigIntro
              </div>
              <h3 className="text-xl font-semibold tracking-tight mb-6">
                A qualified, paid-for introduction.
              </h3>
              <ul className="space-y-3 text-sm">
                <ComparisonRow text="Qualified by stated, specific relevance" />
                <ComparisonRow text="You approve or decline every request" />
                <ComparisonRow text="One short conversation, on your terms" />
                <ComparisonRow text="$1,000 to a charity you choose, every time" />
                <ComparisonRow text="No follow-up unless you invite it" />
                <ComparisonRow text="Your time priced at $1,000 of giving" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder ─────────────────────────────────────────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 border"
            style={{ background: "var(--cream-2)", borderColor: "var(--border)" }}
          >
            <div className="grid md:grid-cols-12 gap-10 items-start">
              <div className="md:col-span-3">
                <div
                  className="size-20 rounded-full grid place-items-center font-semibold text-xl text-primary-foreground"
                  style={{ background: "var(--primary)" }}
                >
                  IH
                </div>
                <div className="mt-6 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  From the founder
                </div>
              </div>
              <div className="md:col-span-9">
                <Quote className="size-8 text-muted-foreground/40" />
                <p className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                  I kept seeing senior people buried in irrelevant outreach,
                  and vendors with something genuine to say unable to get
                  through honestly. TheBigIntro fixes both at once, and turns
                  every meeting into{" "}
                  <span className="serif-italic">$1,000</span> for a cause
                  the executive chooses.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span>Isobel Hardwick · Founder</span>
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    More about Isobel <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ — deep, 10 entries ────────────────────────────── */}
      <section
        className="border-t"
        style={{ background: "var(--cream-1)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionLabel>Questions</SectionLabel>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                Real{" "}
                <span className="serif-italic">questions</span>.
              </h2>
              <p className="mt-5 text-muted-foreground leading-relaxed">
                The ones executives and CFOs actually ask. If yours isn't
                here, get it on the call.
              </p>
              <a
                href={CALENDLY_URL}
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Book a call
                <ArrowUpRight className="size-4" />
              </a>
            </div>
            <div className="lg:col-span-8">
              <Faq q="Is this just a sales meeting in disguise?" open>
                No. A vendor cannot reach you without writing the specific
                initiative or problem they want to discuss, and that reason
                is shown to you in plain language before the meeting is
                requested. The conversation itself is led by your
                priorities, not a sales pitch. Vendors who treat it as a
                cold pitch lose access; vendors who treat it as a
                substantive conversation get to keep using the platform.
                Said plainly: the model only works if executives genuinely
                want to be here, so the model is designed around your
                interests, not theirs.
              </Faq>
              <Faq q="Which charities can I choose? Are there restrictions?">
                Any Australian charity that holds deductible gift recipient
                (DGR) endorsement. DGR is the Australian Taxation Office
                status that lets a charity issue a tax-deductible receipt to
                the giver, so every meeting produces a receipt the vendor can
                claim. You can change your nominated charity at any time, and
                you can nominate a different one for each individual meeting.
                Restricting gifts to DGR-endorsed charities keeps every
                donation verifiable on the public register and traceable to a
                recognised Australian cause.
              </Faq>
              <Faq q="How is the $1,000 actually paid? Who holds the money?">
                Vendors are invoiced for the donation plus a separately
                named admin fee at the point a meeting is confirmed.
                TheBigIntro Pty Ltd holds the donation in a separately
                administered account from the moment of invoice until it is
                paid to the chosen charity, which happens within 14 days of
                the meeting. The charity confirms receipt directly to you.
                The admin fee is recognised as platform revenue; the
                donation is not.
              </Faq>
              <Faq q="Is the donation tax-deductible?">
                Yes. The donation is made by the vendor, and because every
                nominated charity holds deductible gift recipient (DGR)
                endorsement, the charity issues a tax-deductible receipt
                directly to the vendor. The executive does not claim a
                deduction, because the executive does not pay the donation.
                DGR status is shown and is verifiable on the public register
                before any meeting is confirmed.
              </Faq>
              <Faq q="What if a meeting doesn't go well? Can the donation be reversed?">
                Once the meeting takes place, the donation is committed and
                is paid to the charity within 14 days regardless of the
                outcome of the conversation. That is deliberate. It stops
                vendors from gaming the system, and it stops anyone
                including TheBigIntro, from having an incentive to mediate
                the donation. If a vendor behaves badly in the meeting (hard
                sells, ignores your stated priorities, follows up without
                permission) we remove them from the platform.
              </Faq>
              <Faq q="What does it actually cost an executive?">
                Nothing. Joining, declining requests, taking meetings, and
                leaving are all free. Vendors fund the platform and the
                donation. Your nominated charity gets the full $1,000 from
                every meeting you take. There is no future paid tier, no
                premium plan, and no model where executives are charged. If
                that ever changes the existing founding cohort is
                grandfathered in permanently.
              </Faq>
              <Faq q="Why founding members? What does it actually mean?">
                We're starting with a deliberately small first cohort,
                roughly 50 executives in Australia, so the model can be
                refined against real feedback before scaling. Founding
                members get direct input on how requests are qualified,
                which categories of conversation are allowed, and which
                vendors get accepted. Founding members are also
                grandfathered against any future pricing changes. We are not
                creating artificial scarcity: the cohort is small because
                quality is the only moat this model has.
              </Faq>
              <Faq q="How does TheBigIntro verify a vendor is genuine?">
                Vendors apply, are interviewed, and are vetted before they
                can request a meeting with any executive. Every meeting
                request is reviewed against the executive's stated
                priorities; requests that don't fit are rejected by us
                before they reach the executive. Vendors who get repeated
                rejections, who behave badly in meetings, or whose stated
                reason doesn't match what actually happens in the
                conversation lose platform access. We don't pretend this
                replaces human judgement. It raises the floor.
              </Faq>
              <Faq q="How much of my time is this, realistically?">
                One short, focused meeting per request you accept, typically
                30 to 45 minutes depending on what you have agreed to. There is no
                meeting prep, no follow-up homework, no obligation to
                continue the conversation after the call ends. You only
                take the meetings you actually want, and you only see the
                requests that fit categories you've explicitly opted into.
                For a typical founding executive that's two to four
                meetings a quarter.
              </Faq>
              <Faq q="Who is behind TheBigIntro?">
                TheBigIntro is being built by Isobel Hardwick, an Australian
                operator with a long background on the sending side of B2B
                sales. There is no outside funding yet and the platform is
                in pre-launch validation. We are deliberately small, on
                purpose, while the model is proven. There is more on the{" "}
                <Link
                  href="/about"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  about page
                </Link>
                . Isobel personally vets every founding-cohort application.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-t"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-32 md:py-40 text-center">
          <SectionLabel>The invitation</SectionLabel>
          <h2 className="mt-6 text-5xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.02] max-w-3xl mx-auto">
            Fewer meetings.{" "}
            <span className="serif-italic">Real giving.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Apply as a founding executive. You decide what is relevant, take
            only the conversations you want, and the charity you choose
            receives $1,000 each time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={CALENDLY_URL}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-medium hover:bg-primary transition-colors"
            >
              Apply as a founding executive
              <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-accent px-6 py-3.5 text-sm font-medium transition-colors"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-10 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            Free for executives · Invite only · One short call to start
          </div>
        </div>
      </section>
    </>
  );
}

/* ─── Components ─────────────────────────────────────────── */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
      <span className="h-px w-6" style={{ background: "var(--border-strong)" }} />
      {children}
    </div>
  );
}

function TrustBadge({
  stars,
  label,
  sub,
  mono,
}: {
  stars?: number;
  label: string;
  sub: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/60 backdrop-blur-sm px-4 py-2.5" style={{ borderColor: "var(--border)" }}>
      {stars && (
        <div className="flex gap-0.5" aria-label={`${stars} out of 5`}>
          {Array.from({ length: stars }).map((_, i) => (
            <Star
              key={i}
              className="size-3.5"
              style={{ fill: "var(--ill-tan-deep)", color: "var(--ill-tan-deep)" }}
            />
          ))}
        </div>
      )}
      <div>
        <div className={"text-xs font-semibold " + (mono ? "font-mono tracking-[0.1em] uppercase" : "")}>{label}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function BigStepCard({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div
      className="rounded-2xl border p-6 md:p-8 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "var(--background)", borderColor: "var(--border)" }}
    >
      <div className="flex items-start gap-5">
        <div className="size-12 rounded-xl bg-foreground/[0.04] grid place-items-center shrink-0">
          <Icon className="size-5 text-foreground" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              Step {n}
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-semibold tracking-tight">{title}</h3>
          <p className="mt-3 text-sm md:text-base text-muted-foreground leading-relaxed">
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function AudienceCard({
  tag,
  title,
  points,
  cta,
  ctaHref,
  link,
  accent,
}: {
  tag: string;
  title: string;
  points: string[];
  cta: string;
  ctaHref: string;
  link: { label: string; href: string };
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-3xl border p-8 md:p-10"
      style={
        accent
          ? { background: "var(--signal-soft)", borderColor: "var(--primary)" }
          : { background: "var(--card)", borderColor: "var(--border)" }
      }
    >
      <div
        className="inline-flex items-center text-[10px] font-mono uppercase tracking-[0.18em] px-2.5 py-1 rounded-full"
        style={
          accent
            ? { background: "var(--card)", color: "var(--primary)" }
            : { background: "var(--accent)", color: "var(--muted-foreground)" }
        }
      >
        {tag}
      </div>
      <h3 className="mt-5 text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
        {title}
      </h3>
      <ul className="mt-6 space-y-3 text-sm md:text-base">
        {points.map((p) => (
          <li key={p} className="flex items-start gap-3">
            <span
              className="mt-0.5 size-5 rounded-full grid place-items-center shrink-0"
              style={
                accent
                  ? { background: "var(--card)", color: "var(--primary)" }
                  : { background: "var(--accent)", color: "var(--foreground)" }
              }
            >
              <IconCheck size={12} />
            </span>
            <span className="leading-relaxed">{p}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={ctaHref}
          className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-primary transition-colors"
        >
          {cta}
          <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <Link
          href={link.href}
          className="text-sm font-medium hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          {link.label}
        </Link>
      </div>
    </div>
  );
}

function GivingRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-2.5 border-b" style={{ borderColor: "var(--border)" }}>
      <span className="text-sm font-medium">{k}</span>
      <span className="text-xs font-mono uppercase tracking-[0.14em] text-muted-foreground text-right">{v}</span>
    </div>
  );
}

function SpotPill({ label, v }: { label: string; v: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ background: "var(--accent)" }}>
      <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <span className="text-xs font-semibold">{v}</span>
    </div>
  );
}

function CauseRow({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  label: string;
}) {
  return (
    <div
      className="group flex items-center gap-3 rounded-xl border bg-background px-4 py-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/20"
      style={{ borderColor: "var(--border)" }}
    >
      <div
        className="size-10 rounded-lg grid place-items-center text-foreground transition-colors"
        style={{ background: "var(--card)" }}
      >
        <Icon size={20} />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

function ComparisonRow({ text, bad }: { text: string; bad?: boolean }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 size-5 rounded-full grid place-items-center shrink-0"
        style={
          bad
            ? { background: "var(--stone-soft)", color: "var(--muted-foreground)" }
            : { background: "var(--card)", color: "var(--primary)" }
        }
      >
        {bad ? <IconX size={12} /> : <IconCheck size={12} />}
      </span>
      <span className="leading-relaxed">{text}</span>
    </li>
  );
}

function Faq({
  q,
  open,
  children,
}: {
  q: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={open}
      className="group border-b py-6 last:border-b-0"
      style={{ borderColor: "var(--border)" }}
    >
      <summary className="cursor-pointer list-none flex items-center justify-between gap-6 [&::-webkit-details-marker]:hidden">
        <span className="text-base md:text-lg font-medium tracking-tight pr-4">
          {q}
        </span>
        <span
          className="size-8 rounded-full border grid place-items-center text-muted-foreground group-open:bg-foreground group-open:text-background group-open:border-foreground transition-colors shrink-0"
          style={{ borderColor: "var(--border)" }}
        >
          <Plus className="size-4 group-open:hidden" />
          <Minus className="size-4 hidden group-open:block" />
        </span>
      </summary>
      <div className="mt-4 text-muted-foreground leading-relaxed max-w-2xl text-sm md:text-base">
        {children}
      </div>
    </details>
  );
}
