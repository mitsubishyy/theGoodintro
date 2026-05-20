import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  ShieldCheck,
  HeartHandshake,
  Quote,
} from "lucide-react";
import { IconCheck, IconX } from "./_components/icons";
import { HeroIllustration } from "./_components/illustrations";
import { MetricCard } from "./_components/ui";
import { LogoMarquee } from "./_components/LogoMarquee";
import { CALENDLY_URL, DGR_CHARITY_EXAMPLES } from "@/lib/config";

export default function Home() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "var(--cream-1)" }}
      >
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-20 pb-20 md:pt-24 md:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <h1 className="reveal reveal-1 text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.03em] leading-[1.02]">
                Meetings that fund{" "}
                <span className="serif-italic">what matters</span>.
              </h1>
              <p className="reveal reveal-2 mt-7 max-w-xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                A handful of relevant conversations, on your terms. Each one
                sends{" "}
                <span className="font-medium text-foreground">a real gift</span> to
                an Australian charity{" "}
                <span className="font-medium text-foreground">you</span>{" "}
                choose. No cold pitches, no hard sells, no obligation to take
                the next one.
              </p>
              <div className="reveal reveal-3 mt-9 flex flex-col sm:flex-row items-start gap-3">
                <a
                  href={CALENDLY_URL}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3.5 text-sm font-medium hover:bg-primary transition-colors"
                >
                  Apply as a founding executive
                  <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                </a>
                <Link
                  href="/how-it-works"
                  className="group inline-flex items-center gap-2 rounded-full border border-border bg-card hover:bg-accent px-6 py-3.5 text-sm font-medium transition-colors"
                >
                  See how it works
                  <ArrowUpRight className="size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
              <p className="reveal reveal-4 mt-6 text-sm text-muted-foreground">
                Bringing something genuine to senior leaders?{" "}
                <Link
                  href="/vendors"
                  className="font-medium hover:text-primary transition-colors underline underline-offset-4"
                >
                  See the vendor page
                </Link>
                .
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="reveal reveal-3 relative">
                <HeroIllustration className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Charity rotator ───────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--card)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20 md:py-24">
          <p className="text-center text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mb-10">
            Where your gift can go
          </p>
          <LogoMarquee
            items={DGR_CHARITY_EXAMPLES}
            ariaLabel="Example Australian charities"
          />
          <p className="mt-6 text-center text-xs text-muted-foreground italic">
            Illustrative Australian charities, all DGR-endorsed for tax-deductible giving. You choose your own.
          </p>
        </div>
      </section>

      {/* ── Metrics ────────────────────────────────────────────── */}
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              value="Real"
              label="Gift to your chosen charity"
              note="Every meeting, in full, confirmed in writing"
            />
            <MetricCard
              value="100%"
              label="Reaches the charity"
              note="Delivered in full and confirmed to you in writing"
            />
            <MetricCard
              value="$0"
              label="Cost to you"
              note="Free to join, free to decline, free to leave. Always."
            />
          </div>
        </div>
      </section>

      {/* ── How it works for you ───────────────────────────────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-5">
              <SectionLabel>How it works for you</SectionLabel>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                Three steps.{" "}
                <span className="serif-italic">Nothing hidden</span>.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                You set the topics you will take a meeting about. Before
                anything reaches you, a vendor has to state, specifically, why
                a conversation is relevant. You choose which ones happen,
                decline the rest with no follow-up, and every meeting you take
                sends a real gift to a charity you choose.
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
                body="Tell us the priorities, initiatives, or problems you would actually take a conversation about. Anything outside that scope never reaches you. You can update the list any time."
              />
              <BigStepCard
                n="02"
                icon={ShieldCheck}
                title="You see a stated reason, then decide"
                body="A vendor must write the specific initiative or problem before they can ask. You see it in plain language and decide freely. No obligation, no penalty for declining, no follow-up unless you invite it."
              />
              <BigStepCard
                n="03"
                icon={HeartHandshake}
                title="One short meeting funds a real cause"
                body="A scheduled conversation, on your terms. A real gift reaches your chosen charity within 14 days, confirmed in writing. You can step away at any point, and your details are never sold or shared."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── The 3:1 rule ───────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--cream-1)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6">
              <SectionLabel>The 3:1 rule</SectionLabel>
              <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
                You are never the{" "}
                <span className="serif-italic">whole room</span>.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                For every vendor we admit, there are at least three
                executives. Your inbox is not an auction where everyone
                chases the same few names. Requests stay scarce, relevant, and
                easy to decline.
              </p>
              <ul className="mt-8 space-y-3 text-sm md:text-base max-w-xl">
                <ComparisonRow text="At least three executives for every vendor we admit" />
                <ComparisonRow text="Vendors are not bidding against a crowd for your attention" />
                <ComparisonRow text="Fewer, better requests, never a flooded inbox" />
              </ul>
            </div>
            <div className="lg:col-span-6">
              <div
                className="rounded-3xl border p-10 md:p-16 text-center"
                style={{ background: "var(--mint-tint)", borderColor: "var(--border)" }}
              >
                <div className="display-serif text-[clamp(4rem,12vw,9rem)] leading-none text-primary">
                  3:1
                </div>
                <div className="mt-5 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  Executives to vendors, deliberately
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Is this a sales trap? ──────────────────────────────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="max-w-3xl">
            <SectionLabel>The honest answer</SectionLabel>
            <h2 className="mt-4 text-4xl md:text-5xl font-semibold tracking-tight">
              Is this a{" "}
              <span className="serif-italic">sales trap</span>?
            </h2>
            <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
              No. A vendor cannot reach you without stating a specific,
              relevant reason, and the conversation is about your priorities,
              not a pitch. If one is not useful, you simply do not take the
              next. The model only works if executives genuinely want to be
              here, so it is built around your interests, not the vendor&apos;s.
            </p>
          </div>
        </div>
      </section>

      {/* ── Founding-member spotlight (honest preview) ─────────── */}
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

      {/* ── Founder teaser ─────────────────────────────────────── */}
      <section style={{ background: "var(--card)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div
            className="relative rounded-3xl overflow-hidden p-10 md:p-16 border"
            style={{ background: "var(--cream-2)", borderColor: "var(--border)" }}
          >
            <div className="grid md:grid-cols-12 gap-10 md:gap-12 items-start">
              <div className="md:col-span-4">
                <div className="relative w-full aspect-[2/3] overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border)" }}>
                  <Image
                    src="/issy.jpg"
                    alt="Isobel Hardwick, founder of theGoodintro"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover"
                    priority={false}
                  />
                </div>
                <div className="mt-6 text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                  From the founder
                </div>
              </div>
              <div className="md:col-span-8">
                <Quote className="size-8 text-muted-foreground/40" />
                <p className="mt-4 text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                  I kept seeing senior people buried in irrelevant outreach,
                  and good people with something genuine to say unable to
                  get through honestly. theGoodintro fixes that, and turns
                  every meeting into a{" "}
                  <span className="serif-italic">real</span> gift for a cause
                  you choose.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <span>Isobel Hardwick · Founder</span>
                  <Link
                    href="/how-it-works#about"
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

      {/* ── Final CTA ──────────────────────────────────────────── */}
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
            receives a real gift each time.
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
