import type { Metadata } from "next";
import Link from "next/link";
import { CallButton } from "../_components/call-button";
import { Mark } from "../_components/mark";
import {
  IcoQualified,
  IcoHeartDollar,
  IcoBadgeCheck,
  IcoHeartPlus,
  IcoTarget,
  IcoMeeting,
  IcoSparkleBig,
} from "../_components/icons";

export const metadata: Metadata = {
  title: "Partner with me. TheBigIntro.",
  description:
    "TheBigIntro is early. A marketplace where senior leaders take only relevant meetings and every one sends $1,000 to a charity they choose. I am looking for one person to build it into a company.",
};

export default function Opportunity() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <div className="hero-copy">
            <span className="eyebrow">The opportunity</span>
            <h1>
              Build this with <Mark>me</Mark>.
            </h1>
            <p className="lede">
              TheBigIntro is early. A marketplace where senior leaders take
              only the meetings worth their time, and every one sends $1,000 to
              a charity they choose. The idea is on the page. I am looking for
              one person to build it into a company.
            </p>
            <div className="cta">
              <CallButton>Start a conversation</CallButton>
            </div>
            <p className="trust">
              Honest about the stage. No funding claimed, no team yet. A clear
              model and the will to build it.
            </p>
          </div>
        </div>
      </header>

      <section id="why">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Why this is worth building</span>
            <h2>Two broken sides, one fix.</h2>
            <p className="lede">
              Senior leaders ignore most outreach because almost none of it is
              relevant. Vendors spend heavily to reach them and mostly fail.
              Neither side has a reason to make the exchange worth anything
              beyond the deal. TheBigIntro changes the incentive: a meeting
              happens only when it is genuinely relevant, and when it does,
              real money goes to a cause the leader chose.
            </p>
          </div>
        </div>
      </section>

      <section className="soft-mint" id="model">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">The model</span>
            <h2>Simple, and hard to game.</h2>
          </div>
          <div className="grid3 reveal">
            <div className="card">
              <IcoQualified />
              <h3>Qualified by requirement</h3>
              <p>
                A vendor must state a specific initiative before a request
                reaches a leader. Relevance is the entry fee.
              </p>
            </div>
            <div className="card">
              <IcoHeartDollar />
              <h3>$1,000 a meeting to charity</h3>
              <p>
                Every meeting sends $1,000 to the leader&apos;s chosen
                registered charity. A separate, clearly named admin fee covers
                the platform.
              </p>
            </div>
            <div className="card">
              <IcoBadgeCheck />
              <h3>Free for the scarce side</h3>
              <p>
                Executives join free. Vendors pay, because access to a vetted,
                relevant audience is worth it.
              </p>
            </div>
          </div>
          <p className="loopline reveal">
            The full flow, end to end, is on the{" "}
            <Link className="inl" href="/how-it-works">
              how it works page
            </Link>
            .
          </p>
        </div>
      </section>

      <section id="wedge">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Why it can work</span>
            <h2>The wedge.</h2>
          </div>
          <div className="difflist reveal">
            <div className="row2">
              <IcoBadgeCheck />
              <div>
                <h3>Relevance changes who says yes</h3>
                <p>
                  The one requirement is what makes a senior person willing to
                  be here at all. It is the product, not a feature.
                </p>
              </div>
            </div>
            <div className="row2">
              <IcoHeartPlus />
              <div>
                <h3>Giving changes the story</h3>
                <p>
                  A $1,000 gift per meeting is a reason to take the call, and a
                  story worth repeating. It compounds goodwill instead of
                  spending it.
                </p>
              </div>
            </div>
            <div className="row2">
              <IcoTarget />
              <div>
                <h3>Australia first keeps it provable</h3>
                <p>
                  Starting in one market keeps the giving verifiable and the
                  quality high while the model is proven.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-coral" id="status">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Where it is today</span>
            <h2>Honest about the stage.</h2>
            <p className="lede">
              This is a validation site, not the platform. There is no outside
              funding, no team yet, and no inflated numbers on this page on
              purpose. What exists is a clear model, a name, and the conviction
              to build it. The next step is proving demand on both sides and
              building the first version.
            </p>
          </div>
        </div>
      </section>

      <section id="partner">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Who I am looking for</span>
            <h2>One person to build it with.</h2>
          </div>
          <div className="difflist reveal">
            <div className="row2">
              <IcoMeeting />
              <div>
                <h3>You open doors</h3>
                <p>
                  You can reach senior leaders or vendors, and people take your
                  introductions seriously.
                </p>
              </div>
            </div>
            <div className="row2">
              <IcoQualified />
              <div>
                <h3>You build product</h3>
                <p>
                  You can take this from a page to a working platform, and
                  ship without waiting to be told how.
                </p>
              </div>
            </div>
            <div className="row2">
              <IcoTarget />
              <div>
                <h3>You have done this</h3>
                <p>
                  You have built a marketplace or a two-sided business before
                  and know where they break.
                </p>
              </div>
            </div>
          </div>
          <p className="loopline reveal">
            You do not need all three. You need to complement what I bring, and
            care that the giving is real. This is a founding partner, shaping
            it from here, not a hire.
          </p>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="founding reveal">
            <span className="glow" />
            <IcoSparkleBig />
            <span className="eyebrow">From the founder</span>
            <h2>I would rather build it well than alone.</h2>
            <p>
              I am Isobel Hardwick. I have spent a long time on the sending
              side of sales and I know exactly why this is needed. What I want
              now is the right person to build it with.
            </p>
            <CallButton>Start a conversation</CallButton>
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="wrap">
          <div className="closecard reveal">
            <span className="glow" />
            <span className="eyebrow">The invitation</span>
            <h2>If this is your kind of problem.</h2>
            <p>
              Tell me what you would change, what you would own, and where you
              think it breaks. That is the conversation I want to have.
            </p>
            <CallButton>Start a conversation</CallButton>
            <p className="closing-sub">
              Early and honest. One conversation to start.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
