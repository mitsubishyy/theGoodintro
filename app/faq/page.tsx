import Link from "next/link";
import { PageHero, SectionHead, Faq, ClosingCta } from "../_components/ui";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "FAQ. TheGoodIntro.",
  description:
    "The questions executives and CFOs actually ask: is this a sales trap, which charities qualify, how the money is handled, what it costs, and who is behind it.",
  path: "/faq",
});

export default function FAQ() {
  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="The real"
        italicWord="questions"
        lede="The ones senior leaders ask before they will take this seriously. Straight answers, no hedging. If yours is not here, raise it on the call."
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        secondaryLabel="How it works"
        secondaryHref="/how-it-works"
        bg="var(--cream-11)"
      />

      <section style={{ background: "var(--paper-oat)" }}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-24 md:py-32">
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4">
              <SectionHead
                label="Questions"
                title="Good things to ask."
                lede="Grouped by what leaders raise first. The model only works if you genuinely want to be here, so these are answered around your interests."
              />
            </div>
            <div className="lg:col-span-8">
              <Faq q="Is this just a sales meeting in disguise?" open>
                No. A vendor cannot reach you without writing the specific
                initiative or problem they want to discuss, and that reason
                is shown to you in plain language before the meeting is
                requested. The conversation itself is led by your priorities,
                not a sales pitch. Vendors who treat it as a cold pitch lose
                access. The model only works if executives genuinely want to
                be here, so it is designed around your interests, not theirs.
              </Faq>
              <Faq q="What actually counts as relevant?">
                You define it. You tell us the priorities, initiatives, and
                problems you would take a conversation about, as broad or as
                narrow as you like. Anything outside that scope never reaches
                you. You can update or pause your topics at any time, and a
                vendor still has to state a specific reason that fits before a
                request is shown to you.
              </Faq>
              <Faq q="How many requests will I get? Will I be flooded?">
                No. We hold a deliberate 10:1 balance, at least ten
                executives for every vendor we admit, so no leader is ever
                the whole room. For a typical founding executive that is two
                to four requests a quarter that actually fit, not a daily
                inbox to manage.
              </Faq>
              <Faq q="What happens if I decline?">
                Nothing. Declining is the normal case, not the exception.
                There is no penalty, no score, no follow-up, and no
                explanation required. You see the stated reason first
                precisely so that saying no is fast and free. A vendor cannot
                contact you again about a declined request.
              </Faq>
              <Faq q="Which charities can I choose? Are there restrictions?">
                Any Australian charity that holds deductible gift recipient
                (DGR) endorsement. DGR is a higher-bar Australian Taxation
                Office endorsement, listed on the public register. You can
                change your nominated charity at any time,
                and nominate a different one for each meeting. Restricting it
                to DGR keeps every gift verifiable on the public register and
                traceable to a recognised Australian cause.
              </Faq>
              <Faq q="When is the charity gift paid?">
                Once the meeting is held, the gift is paid to your chosen
                charity within 14 days and confirmed to you in writing. The
                amount is set by the published tier and paid in full.
              </Faq>
              <Faq q="What if a meeting does not go well? Can the donation be reversed?">
                Once the meeting takes place, the donation is committed and is
                paid within 14 days regardless of the outcome. That is
                deliberate. It stops vendors from gaming the system and
                removes any incentive to mediate the gift. If a vendor behaves
                badly in a meeting, the gift is still paid in full and the
                vendor loses access.
              </Faq>
              <Faq q="What does it actually cost an executive?">
                Nothing. Joining, declining requests, taking meetings, and
                leaving are all free. Vendors fund the platform and the
                donation. There is no future paid tier and no model where
                executives are charged. If that ever changed, the founding
                cohort is grandfathered in permanently.
              </Faq>
              <Faq q="How does TheGoodIntro verify a vendor is genuine?">
                Vendors apply, are interviewed, and are vetted before they can
                request a meeting. Every request is reviewed against your
                stated priorities; requests that do not fit are rejected
                before they reach you. Vendors who get repeated rejections,
                behave badly, or whose stated reason does not match what
                happens in the conversation lose access.
              </Faq>
              <Faq q="How much of my time is this, realistically?">
                One short, focused meeting per request you accept, typically
                45 minutes. No preparation, no follow-up homework, no
                obligation to continue after the call. You only take the
                meetings you want, and only see requests in categories you
                opted into. For a typical founding executive that is two to
                four meetings a quarter.
              </Faq>
              <Faq q="Who is behind TheGoodIntro?">
                It is being built by Isobel Hardwick, an Australian operator
                with a long background on the sending side of B2B sales.
                There is no outside funding yet and the platform is in
                pre-launch validation. There is more on the{" "}
                <Link
                  href="/how-it-works#about"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  how it works page
                </Link>
                . Isobel personally vets every founding-cohort application.
              </Faq>
            </div>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Still have a"
        italicWord="question?"
        lede="Join the waitlist and ask it on the call when the founder gets in touch. Executives decide what is relevant, take only the conversations they want, and the charity they choose receives a real gift each time."
        secondaryLabel="See the giving"
        secondaryHref="/giving"
      />
    </>
  );
}
