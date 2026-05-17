import type { Metadata } from "next";
import { CallButton } from "../_components/call-button";
import { Mark } from "../_components/mark";
import {
  IcoBadgeCheck,
  IcoHeartPlus,
  IcoTarget,
  IcoHeartDollar,
  IcoSparkleBig,
} from "../_components/icons";

export const metadata: Metadata = {
  title: "For vendors. TheBigIntro.",
  description:
    "Earn a qualified introduction to a vetted senior audience by being relevant and generous. Every meeting funds a real $1,000 donation to the leader's chosen charity.",
};

export default function Vendors() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <span className="eyebrow">For vendors</span>
          <h1>
            Reach leaders <Mark>honestly</Mark>.
          </h1>
          <p className="lede">
            A genuinely qualified introduction to a vetted, hard-to-reach
            senior audience, earned by being relevant and generous, not by
            buying a list and sending more cold email.
          </p>
          <div className="cta">
            <CallButton className="btn mint">Book a call</CallButton>
          </div>
          <p className="trust">
            You fund the giving. Every meeting sends a real donation to the
            leader&apos;s chosen charity.
          </p>
        </div>
      </header>

      <section id="who">
        <div className="wrap">
          <span className="eyebrow">Who this is for</span>
          <h2>Built for vendors who mean it.</h2>
          <div className="grid3">
            <div className="card">
              <IcoHeartPlus />
              <h3>Socially minded</h3>
              <p>
                You are glad that the value you create here also produces a
                meaningful charitable gift, not a token one.
              </p>
            </div>
            <div className="card">
              <IcoBadgeCheck />
              <h3>Genuine intent</h3>
              <p>
                You have a specific initiative or problem to discuss and can
                state it plainly. No vague discovery, no laboured demos.
              </p>
            </div>
            <div className="card">
              <IcoTarget />
              <h3>Meet on their terms</h3>
              <p>
                One meaningful conversation, led by the leader&apos;s
                priorities. No hard selling. The relationship is the point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <span className="eyebrow">What is expected</span>
          <h2>State your reason up front.</h2>
          <p className="lede">
            Before a request reaches a leader you describe the specific
            initiative or challenge that makes the conversation relevant. That
            one requirement is what keeps quality high on both sides, and it is
            why senior leaders agree to be here at all.
          </p>
        </div>
      </section>

      <section className="soft-coral">
        <div className="wrap">
          <span className="eyebrow">What it costs, in full</span>
          <h2>Transparent pricing.</h2>
          <div className="moneywrap">
            <div className="bignum">
              $1,000
              <IcoHeartDollar />
            </div>
            <div className="mlines">
              <div className="r">
                <span className="k">
                  To the leader&apos;s chosen charity, per meeting
                </span>
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
          <p className="lede" style={{ marginTop: 24 }}>
            The donation figure is never reduced to cover our costs. The admin
            fee is its own line, named, so you always know exactly what funds
            the charity and what funds the platform.
          </p>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="founding">
            <span className="glow" />
            <IcoSparkleBig />
            <span className="eyebrow">Founding vendors</span>
            <h2>Get in early.</h2>
            <p>
              We are starting deliberately small. Founding vendors help shape
              how this works and get first access as leaders join.
            </p>
            <CallButton className="btn mint">Book a call</CallButton>
          </div>
        </div>
      </section>
    </>
  );
}
