import type { Metadata } from "next";
import { CallButton } from "../_components/call-button";
import { Mark } from "../_components/mark";
import {
  IcoRelevant,
  IcoQualified,
  IcoMeeting,
  IcoHeartDollar,
  IcoSparkleBig,
} from "../_components/icons";

export const metadata: Metadata = {
  title: "How it works. TheBigIntro.",
  description:
    "The full model end to end: how relevant conversations are matched, how the $1,000 charity gift and separate named admin fee work, and how leaders choose where the giving goes.",
};

export default function HowItWorks() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <div className="hero-copy">
            <span className="eyebrow">How it works</span>
            <h1>
              The whole model, <Mark>in the open</Mark>.
            </h1>
            <p className="lede">
              One requirement keeps it honest: a vendor must say why a
              conversation is relevant before a leader ever sees it. Everything
              else, including the giving, follows from that.
            </p>
            <div className="cta">
              <CallButton>Start a conversation</CallButton>
            </div>
          </div>
        </div>
      </header>

      <section id="how">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">End to end</span>
            <h2>From request to real giving.</h2>
          </div>
          <div className="grid3 reveal">
            <div className="card">
              <div className="ictop">
                <IcoRelevant />
                <span className="step-n">01</span>
              </div>
              <h3>The leader sets relevance</h3>
              <p>
                An executive joins free and tells us the priorities they will
                take conversations about. Nothing outside that gets near them.
              </p>
            </div>
            <div className="card">
              <div className="ictop">
                <IcoQualified />
                <span className="step-n">02</span>
              </div>
              <h3>The vendor qualifies the ask</h3>
              <p>
                A vendor states the specific initiative or problem. That
                context is shown to the leader, who decides freely. No
                obligation.
              </p>
            </div>
            <div className="card">
              <div className="ictop">
                <IcoMeeting />
                <span className="step-n">03</span>
              </div>
              <h3>The conversation funds a cause</h3>
              <p>
                One focused conversation happens, and $1,000 goes to the
                leader&apos;s chosen registered charity.
              </p>
            </div>
          </div>
          <p className="loopline reveal">
            A vendor states a specific need, the leader approves only what
            fits, one short conversation happens, and $1,000 goes to their
            chosen charity.
          </p>
        </div>
      </section>

      <section className="soft-coral" id="money">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Where the money goes</span>
            <h2>The money flow, exactly.</h2>
          </div>
          <div className="moneywrap reveal">
            <div className="bignum">
              $1,000
              <IcoHeartDollar />
            </div>
            <div className="mlines">
              <div className="r">
                <span className="k">To the chosen charity, per meeting</span>
                <span>the full meeting gift</span>
              </div>
              <div className="r">
                <span className="k">Platform admin fee</span>
                <span>paid by the vendor, a separate named line</span>
              </div>
              <div className="r">
                <span className="k">Taken from the donation</span>
                <span>nothing</span>
              </div>
            </div>
          </div>
          <p className="lede" style={{ marginTop: 24 }}>
            The charity figure stays whole on purpose. Running costs are
            recovered through the named admin fee, so the two numbers never get
            blended.
          </p>
          <div className="giveflow reveal">
            <div className="gf">
              <span className="gf-k">After the meeting</span>
              <span className="gf-v">
                the donation is sent to the leader&apos;s chosen registered
                charity
              </span>
            </div>
            <div className="gf">
              <span className="gf-k">Confirmation</span>
              <span className="gf-v">in writing, every time</span>
            </div>
            <div className="gf">
              <span className="gf-k">The admin fee</span>
              <span className="gf-v">
                is the vendor&apos;s, never blended with the gift
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Choosing the charity</span>
            <h2>The leader decides, every time.</h2>
            <p className="lede">
              The executive directs where the donation goes, to their chosen
              registered charity. It is their conversation and their cause. At
              launch we are Australia first, so the giving stays local and
              verifiable while the model is proven.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Questions</span>
            <h2 style={{ marginBottom: 24 }}>Good things to ask.</h2>
          </div>
          <details open>
            <summary>
              Who pays for the meeting?<span className="i">+</span>
            </summary>
            <p>
              The vendor. It is free for executives. The vendor funds both the
              charity gift and the separate admin fee.
            </p>
          </details>
          <details>
            <summary>
              Can a leader decline a request?<span className="i">+</span>
            </summary>
            <p>
              Always. Seeing the stated reason first means declining is easy
              and normal. There is no penalty and no obligation.
            </p>
          </details>
          <details>
            <summary>
              Why Australia first?<span className="i">+</span>
            </summary>
            <p>
              Starting in one market keeps the charity giving verifiable and
              the quality high while the model is proven.
            </p>
          </details>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="founding reveal">
            <span className="glow" />
            <IcoSparkleBig />
            <span className="eyebrow">The first cohort</span>
            <h2>Be part of shaping it.</h2>
            <p>
              Invite only and small on purpose. Founding members help decide
              how this works in practice.
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
            <h2>See it work for you.</h2>
            <p>
              Apply as a founding executive. You decide what is relevant, you
              take only the conversations you want, and the charity you choose
              receives $1,000 each time.
            </p>
            <CallButton>Apply as a founding executive</CallButton>
            <p className="closing-sub">
              Free for executives. Invite only. One short call to start.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
