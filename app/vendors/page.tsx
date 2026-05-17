import type { Metadata } from "next";
import { CallButton } from "../_components/call-button";
import { Mark } from "../_components/mark";

export const metadata: Metadata = {
  title: "For vendors. TheBigIntro.",
  description:
    "Reach senior leaders the honest way. State your reason, meet on their terms, and fund a real $1,000 donation to their chosen charity for every meeting.",
};

export default function Vendors() {
  return (
    <>
      <header className="wrap hero">
        <span className="eyebrow">For vendors</span>
        <h1>
          Reach leaders <Mark>honestly</Mark>.
        </h1>
        <p className="lede">
          A genuinely warm introduction to a senior leader, earned by being
          relevant and generous, not by buying a list and sending more cold
          email.
        </p>
        <div className="cta">
          <CallButton>Book a call</CallButton>
        </div>
        <p className="trust">
          You fund the model. Every meeting sends a real donation to the
          leader&apos;s chosen charity.
        </p>
      </header>

      <section id="who">
        <div className="wrap">
          <span className="eyebrow">Who this is for</span>
          <h2>Built for vendors who mean it.</h2>
          <div className="grid3">
            <div className="step">
              <div className="n">01</div>
              <h3>Socially minded</h3>
              <p>
                You are comfortable that the value you create here also
                produces a meaningful charitable gift, not a token one.
              </p>
            </div>
            <div className="step">
              <div className="n">02</div>
              <h3>Genuine intent</h3>
              <p>
                You have a specific initiative or problem to discuss and can
                state it plainly. No vague discovery, no laboured demos.
              </p>
            </div>
            <div className="step">
              <div className="n">03</div>
              <h3>Meet on their terms</h3>
              <p>
                One focused conversation, led by the leader&apos;s priorities.
                No hard selling. The relationship is the point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <span className="eyebrow">What is expected</span>
          <h2>State your reason up front.</h2>
          <p className="lede">
            Before a request reaches a leader you describe the specific
            initiative or challenge that makes the meeting relevant. That one
            requirement is what keeps the quality high on both sides, and it is
            why leaders agree to be here at all.
          </p>
        </div>
      </section>

      <section className="money">
        <div className="wrap">
          <span className="eyebrow">What it costs, in full</span>
          <h2>Transparent pricing.</h2>
          <div className="moneywrap">
            <div className="bignum">$1,000</div>
            <div className="mlines">
              <div className="r">
                <span className="k">To the leader&apos;s chosen charity, per meeting</span>
                <span>the full meeting gift</span>
              </div>
              <div className="r">
                <span className="k">Platform admin fee</span>
                <span>charged separately and clearly named</span>
              </div>
              <div className="r">
                <span className="k">Focus at launch</span>
                <span>Australia first</span>
              </div>
            </div>
          </div>
          <p className="lede" style={{ marginTop: 26 }}>
            The donation figure is never reduced to cover our costs. The admin
            fee is its own line, named, so you always know exactly what funds
            the charity and what funds the platform.
          </p>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <div className="founding">
            <span className="eyebrow" style={{ color: "rgba(255,255,255,.8)" }}>
              Founding vendors
            </span>
            <h2>Get in early.</h2>
            <p>
              We are starting deliberately small. Founding vendors help shape
              how this works and get first access as leaders join.
            </p>
            <CallButton>Book a call</CallButton>
          </div>
        </div>
      </section>
    </>
  );
}
