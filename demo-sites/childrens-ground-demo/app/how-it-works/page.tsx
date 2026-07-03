import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { Quote } from "lucide-react";
import {
  PageHero,
  SectionHead,
  ComparisonRow,
  ClosingCta,
} from "../_components/ui";
import { VendorsFlow } from "../_components/vendors-flow";
import {
  IconIntro,
  IconHandshake,
  IconHeartCircle,
  IconLinkedIn,
  IconMail,
} from "../_components/icons";
import { FOUNDER_LINKEDIN } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "How it works. TheGoodIntro.",
  description:
    "The whole model in the open: how a relevant conversation becomes a real gift, and who is building it.",
  path: "/how-it-works",
});

const MODEL_STEPS = [
  "A vendor states the specific initiative.",
  "It is matched to the executive’s stated priorities.",
  "The executive sees the reason and decides.",
  "One focused conversation happens.",
  "A real gift reaches the executive’s chosen charity.",
];

export default function HowItWorks() {
  const hasFounderPhoto = existsSync(
    path.join(process.cwd(), "public", "founder.jpg"),
  );
  return (
    <>
      <PageHero
        eyebrow="How it works"
        title="The whole model,"
        italicWord="in the open"
        lede="One requirement keeps it honest: a vendor must say why a conversation is relevant before a leader ever sees it. Everything else, including the giving, follows from that."
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        secondaryLabel="See the giving"
        secondaryHref="/giving"
        bg="var(--cream-5)"
      />

      {/* ── The model diagram ────────────────────────────────────── */}
      <VendorsFlow
        id="how"
        eyebrow="The model"
        title={
          <>
            From request to real{" "}
            <span className="serif-italic">giving</span>.
          </>
        }
        lede="Five steps. The executive decides at every one."
        steps={MODEL_STEPS}
      />

      {/* ── From the founder ─────────────────────────────────────── */}
      <section
        id="about"
        className="border-b scroll-mt-24"
        style={{ background: "var(--paper-white)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div
            className="relative rounded-3xl border overflow-hidden p-10 md:p-16 grid md:grid-cols-12 gap-10"
            style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
          >
            <div className="md:col-span-4">
              <div
                className="relative aspect-square rounded-2xl overflow-hidden border grid place-items-center"
                style={{ background: "var(--background)", borderColor: "var(--border)" }}
              >
                {hasFounderPhoto ? (
                  <Image
                    src="/founder.jpg"
                    alt="Isobel Hardwick, founder of TheGoodIntro"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover object-top"
                    priority={false}
                  />
                ) : (
                  <div
                    className="size-32 rounded-full grid place-items-center font-semibold text-4xl text-primary-foreground"
                    style={{ background: "var(--primary)" }}
                    aria-label="Isobel Hardwick"
                  >
                    IH
                  </div>
                )}
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <a
                  href={FOUNDER_LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconLinkedIn size={16} />
                  LinkedIn
                </a>
                <a
                  href="mailto:issy@thegoodintros.com"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconMail size={16} />
                  issy@thegoodintros.com
                </a>
              </div>
            </div>
            <div className="md:col-span-8">
              <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
                From the founder
              </div>
              <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
                Isobel Hardwick
              </h2>
              <div className="mt-2 text-sm text-muted-foreground">
                Founder · TheGoodIntro · Australia
              </div>
              <Quote className="mt-8 size-7 text-muted-foreground/40" />
              <p className="mt-4 text-lg md:text-xl leading-relaxed">
                I spent a long time on the sending side of sales, watching{" "}
                good people fail to reach leaders who might actually have
                wanted to talk, and watching leaders drown in noise from
                people who did not. The fix was never another clever subject
                line. It was a rule: earn the conversation by being relevant,
                and make the conversation worth something beyond the deal.
              </p>
              <p className="mt-5 text-lg md:text-xl leading-relaxed">
                TheGoodIntro is that rule, built into a place. Every
                conversation here sends a{" "}
                <span className="serif-italic">real</span> gift to a cause the
                leader chooses. That is the whole point.
              </p>
              <p className="mt-5 text-lg md:text-xl leading-relaxed">
                We are starting in Australia, on purpose. One market keeps
                every gift local, verifiable, and easy to stand behind while
                the model is proven with a small founding group. I would
                rather earn a reputation slowly than borrow one.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── What we believe ──────────────────────────────────────── */}
      <section style={{ background: "var(--paper-oat)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <SectionHead
            label="What we believe"
            title="Three things we will not compromise."
          />
          <div className="mt-14 grid md:grid-cols-3 gap-4">
            <PrincipleCard
              n="01"
              icon={IconHandshake}
              title="Relevance is earned"
              body="No one reaches a leader without a stated, specific reason. That requirement is the product."
            />
            <PrincipleCard
              n="02"
              icon={IconHeartCircle}
              title="Giving stays whole"
              body="The charity's share is set by the tier, published, and paid in full, from $900 to $1,200 a meeting."
            />
            <PrincipleCard
              n="03"
              icon={IconIntro}
              title="Small on purpose"
              body="We are starting with a deliberately small invite-only cohort so the first members shape it."
            />
          </div>
        </div>
      </section>

      {/* ── How we keep this honest ──────────────────────────────── */}
      <section
        className="border-y overflow-hidden relative"
        style={{ background: "var(--paper-white)", borderColor: "var(--border)" }}
      >
        <div className="absolute inset-0 dotgrid opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5">
              <SectionHead
                label="How we keep this honest"
                title="Checkable, not just stated."
                lede="Trust on a finance-facing site has to be verifiable. Here is what that means in practice, with the receipts."
              />
            </div>
            <div className="lg:col-span-7">
              <ul className="space-y-3 text-sm md:text-base">
                <ComparisonRow text="The charity's share is set by the tier and published, from $900 to $1,200 a meeting" />
                <ComparisonRow text="Every nominated charity holds deductible gift recipient (DGR) endorsement" />
                <ComparisonRow text="The executive receives written confirmation of every gift" />
                <ComparisonRow text="Your details are never sold, traded, or published" />
                <ComparisonRow text="No invented testimonials, no inflated numbers, no funding we do not have" />
              </ul>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="See it work"
        italicWord="for you."
        lede="Join the waitlist. Executives decide what is relevant, take only the conversations they want, and the charity they choose receives a real gift each time."
        secondaryLabel="For vendors"
        secondaryHref="/vendors"
        tone="oat"
      />
    </>
  );
}

function PrincipleCard({
  n,
  icon: Icon,
  title,
  body,
}: {
  n: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  title: string;
  body: string;
}) {
  return (
    <div className="group rounded-2xl border p-6 transition-all duration-300 [background:var(--cream-1)] [border-color:var(--hair)] hover:scale-[1.01] hover:[background:var(--mint-tint)] hover:[border-color:var(--primary)] hover:shadow-[0_8px_30px_-12px_rgba(20,83,45,0.28)]">
      <div className="flex items-center justify-between mb-8">
        <div className="size-10 rounded-xl grid place-items-center transition-colors [background:var(--mint-tint)] [color:var(--primary-ink)] group-hover:[background:var(--primary)] group-hover:[color:var(--cream-1)]">
          <Icon size={20} />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          {n}
        </span>
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        {body}
      </p>
    </div>
  );
}
