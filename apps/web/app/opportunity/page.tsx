import Link from "next/link";
import { BadgeCheck, Heart, HeartHandshake, Target } from "lucide-react";
import { pageMetadata } from "@/lib/metadata";
import {
  PageHero,
  SectionHead,
  ClosingCta,
  PrimaryCta,
} from "../_components/ui";
import {
  IconBriefcase,
  IconHandshake,
  IconIntro,
  IconHeartCircle,
  IconNetwork,
} from "../_components/icons";
import { OpportunityIllustration } from "../_components/illustrations";

export const metadata = pageMetadata({
  title: "Partner with me. theGoodintro.",
  description:
    "theGoodintro is early. An invite-only network where senior leaders take only relevant meetings and every one sends a real gift to a charity they choose. I am looking for one person to build it into a company.",
  path: "/opportunity",
});

export default function Opportunity() {
  return (
    <>
      <PageHero
        eyebrow="The opportunity"
        title="Build this"
        italicWord="with me"
        lede="theGoodintro is early. An invite-only network where senior leaders take only the meetings worth their time, and every one sends a real gift to a charity they choose. The idea is on the page. I am looking for one person to build it into a company."
        primaryCta="Start a conversation"
        pill="Honest about the stage · Australia first"
        bg="var(--cream-6)"
        illustration={<OpportunityIllustration className="w-full h-auto" />}
      />

      {/* ── Why this is worth building ───────────────────────────── */}
      <section style={{ background: "var(--paper-oat)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Why this is worth building"
            title="Two broken sides, one fix."
            lede="Senior leaders ignore most outreach because almost none of it is relevant. Vendors spend heavily to reach them and mostly fail. Neither side has a reason to make the exchange worth anything beyond the deal. theGoodintro changes the incentive: a meeting happens only when it is genuinely relevant, and when it does, real money goes to a cause the leader chose."
          />
        </div>
      </section>

      {/* ── The model ────────────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-white)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead label="The model" title="Simple, and hard to game." />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <OpCard
              icon={IconHandshake}
              title="Qualified by requirement"
              body="A vendor must state a specific initiative before a request reaches a leader. Relevance is the entry fee."
            />
            <OpCard
              icon={IconHeartCircle}
              title="A real gift, every meeting"
              body="Every meeting sends a real gift to the leader's chosen registered charity, $900 to $1,200 of the $1,500 fee. The rest runs the platform."
            />
            <OpCard
              icon={IconIntro}
              title="Free for the scarce side"
              body="Executives join free. Vendors pay, because access to a vetted, relevant audience is worth it."
            />
          </div>
          <p className="mt-10 text-center text-base text-muted-foreground">
            The full flow, end to end, is on the{" "}
            <Link className="underline underline-offset-4 hover:text-primary transition-colors" href="/how-it-works">
              how it works page
            </Link>
            .
          </p>
        </div>
      </section>

      {/* ── The wedge ────────────────────────────────────────────── */}
      <section style={{ background: "var(--paper-oat)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead label="Why it can work" title="The wedge." />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <OpCard
              icon={BadgeCheck}
              title="Relevance changes who says yes"
              body="The one requirement is what makes a senior person willing to be here at all. It is the product, not a feature."
              lucide
            />
            <OpCard
              icon={Heart}
              title="Giving changes the story"
              body="A real gift per meeting is a reason to take the call, and a story worth repeating. It compounds goodwill instead of spending it."
              lucide
            />
            <OpCard
              icon={Target}
              title="Australia first keeps it provable"
              body="Starting in one market keeps the giving verifiable and the quality high while the model is proven."
              lucide
            />
          </div>
        </div>
      </section>

      {/* ── Where it is today ────────────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-white)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="Where it is today"
            title="Honest about the stage."
            lede="This is a validation site, not the platform. There is no outside funding, no team yet, and no inflated numbers on this page on purpose. What exists is a clear model, a name, and the conviction to build it. The next step is proving demand on both sides and building the first version."
          />
        </div>
      </section>

      {/* ── Who I am looking for ─────────────────────────────────── */}
      <section style={{ background: "var(--paper-oat)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead label="Who I am looking for" title="One person to build it with." />
          <div className="mt-16 grid md:grid-cols-3 gap-4">
            <OpCard
              icon={HeartHandshake}
              title="You open doors"
              body="You can reach senior leaders or vendors, and people take your introductions seriously."
              lucide
            />
            <OpCard
              icon={IconNetwork}
              title="You build product"
              body="You can take this from a page to a working platform, and ship without waiting to be told how."
            />
            <OpCard
              icon={IconBriefcase}
              title="You have done this"
              body="You have built a two-sided business or invite-only network before and know where they break."
            />
          </div>
          <p className="mt-10 text-center text-base text-muted-foreground italic max-w-3xl mx-auto">
            You do not need all three. You need to complement what I bring,
            and care that the giving is real. This is a founding partner,
            shaping it from here, not a hire.
          </p>
        </div>
      </section>

      {/* ── From the founder ─────────────────────────────────────── */}
      <section
        className="border-t"
        style={{ background: "var(--paper-white)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div
            className="rounded-3xl border p-10 md:p-14 max-w-4xl mx-auto"
            style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
          >
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              From the founder
            </div>
            <h2 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
              I would rather build it well than{" "}
              <span className="serif-italic">alone</span>.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              I am Isobel Hardwick. I have spent a long time on the sending
              side of sales and I know exactly why this is needed. What I
              want now is the right person to build it with.
            </p>
            <div className="mt-8">
              <PrimaryCta>Start a conversation</PrimaryCta>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="If this is your kind"
        italicWord="of problem."
        lede="Tell me what you would change, what you would own, and where you think it breaks. That is the conversation I want to have."
        primaryCta="Start a conversation"
        sub="Early and honest · One conversation to start"
        tone="oat"
      />
    </>
  );
}

function OpCard({
  icon: Icon,
  title,
  body,
  lucide,
}: {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  body: string;
  lucide?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-6 transition-all duration-300 hover:-translate-y-0.5"
      style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
    >
      <div className="size-10 rounded-xl bg-foreground/[0.04] grid place-items-center mb-6">
        {lucide ? (
          <Icon className="size-5 text-foreground" />
        ) : (
          <Icon size={20} className="text-foreground" />
        )}
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}
