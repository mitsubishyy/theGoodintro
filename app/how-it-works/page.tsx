import type { Metadata } from "next";
import { CallButton } from "../_components/call-button";
import { Mark } from "../_components/mark";

export const metadata: Metadata = {
  title: "How it works. TheBigIntro.",
  description:
    "The full model end to end: how relevant meetings are matched, how the $1,000 charity gift and named admin fee work, and how leaders choose where the money goes.",
};

export default function HowItWorks() {
  return (
    <>
      <header className="wrap hero">
        <span className="eyebrow">How it works</span>
        <h1>
          The whole model, <Mark>in the open</Mark>.
        </h1>
        <p className="lede">
          One requirement keeps it honest: a vendor must say why a meeting is
          relevant before a leader ever sees it. Everything else follows from
          that.
        </p>
        <div className="cta">
          <CallButton>Start a conversation</CallButton>
        </div>
      </header>

      <section>
        <div className="wrap">
          <span className="eyebrow">End to end</span>
          <h2>From request to real giving.</h2>
          <div className="grid3">
            <div className="step">
              <div className="n">01</div>
              <h3>The leader sets relevance</h3>
              <p>
                An executive joins free and tells us the priorities they will
                actually take meetings about. Nothing outside that gets near
                them.
              </p>
            </div>
            <div className="step">
              <div className="n">02</div>
              <h3>The vendor qualifies the ask</h3>
              <p>
                A vendor states the specific initiative or problem. That
                context is shown to the leader, who decides freely. No
                obligation.
              </p>
            </div>
            <div className="step">
              <div className="n">03</div>
              <h3>The meeting funds a cause</h3>
              <p>
                One focused conversation happens, and a substantial donation
                goes to the leader&apos;s chosen registered charity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="money">
        <div className="wrap">
          <span className="eyebrow">Where the money goes</span>
          <h2>The money flow, exactly.</h2>
          <div className="moneywrap">
            <div className="bignum">$1,000</div>
            <div className="mlines">
              <div className="r">
                <span className="k">To the chosen charity, per meeting</span>
                <span>the full meeting gift</span>
              </div>
              <div className="r">
                <span className="k">Platform admin fee</span>
                <span>a separate, clearly named line paid by the vendor</span>
              </div>
              <div className="r">
                <span className="k">Taken from the donation</span>
                <span>nothing</span>
              </div>
              <div className="r">
                <span className="k">Focus at launch</span>
                <span>Australia first</span>
              </div>
            </div>
          </div>
          <p className="lede" style={{ marginTop: 26 }}>
            The charity figure stays whole on purpose. Running costs are
            recovered through the named admin fee, so the two numbers never get
            blended.
          </p>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <span className="eyebrow">Choosing the charity</span>
          <h2>The leader decides, every time.</h2>
          <p className="lede">
            The executive directs where the donation goes, to their chosen
            registered charity. It is their meeting and their cause. At launch
            we are Australia first so the giving stays local and verifiable
            while the model is proven.
          </p>
        </div>
      </section>

      <section>
        <div className="wrap">
          <span className="eyebrow">Questions</span>
          <h2 style={{ marginBottom: 20 }}>Good things to ask.</h2>
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

      <section className="alt">
        <div className="wrap">
          <div className="founding">
            <span className="eyebrow" style={{ color: "rgba(255,255,255,.8)" }}>
              The first cohort
            </span>
            <h2>Be part of shaping it.</h2>
            <p>
              Invite only and small on purpose. Founding members help decide
              how this works in practice.
            </p>
            <CallButton>Start a conversation</CallButton>
          </div>
        </div>
      </section>
    </>
  );
}
