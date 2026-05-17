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
  title: "For executives. TheBigIntro.",
  description:
    "Free for senior leaders. You decide what is relevant, take only the conversations worth your time, and a real donation goes to a charity you choose.",
};

export default function Executives() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <span className="eyebrow">For executives · Invite only</span>
          <h1>
            Conversations worth <Mark>your time</Mark>.
          </h1>
          <p className="lede">
            You are senior enough that your calendar is a target. TheBigIntro
            turns the few conversations worth having into a real gift for a
            cause you choose.
          </p>
          <div className="cta">
            <CallButton>Apply as a founding executive</CallButton>
          </div>
          <p className="trust">
            Free to join. No cold pitches. You stay in control of every
            request.
          </p>
        </div>
      </header>

      <section id="how">
        <div className="wrap">
          <span className="eyebrow">How it works for you</span>
          <h2>Three steps, nothing hidden.</h2>
          <div className="grid3">
            <div className="card">
              <IcoRelevant />
              <h3>You set what is relevant</h3>
              <p>
                Tell us the priorities and challenges you actually want to talk
                about. Anything outside that never reaches you.
              </p>
            </div>
            <div className="card">
              <IcoQualified />
              <h3>You get qualified requests</h3>
              <p>
                A vendor must state the specific initiative or problem before
                they can ask. You see the reason and decide. No obligation.
              </p>
            </div>
            <div className="card">
              <IcoMeeting />
              <h3>One meaningful conversation</h3>
              <p>
                You have a single, well prepared conversation, and a
                substantial donation goes to your chosen registered charity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <span className="eyebrow">The honest answer</span>
          <h2>Is this a sales trap?</h2>
          <p className="lede">
            No. A vendor cannot reach you without stating a specific, relevant
            reason, and the conversation is about your priorities, not a hard
            sell. If a conversation is not useful, you simply do not take the
            next one. The model only works if executives genuinely want to be
            here.
          </p>
        </div>
      </section>

      <section className="soft-coral">
        <div className="wrap">
          <span className="eyebrow">What your time is worth</span>
          <h2>Full transparency, by design.</h2>
          <div className="moneywrap">
            <div className="bignum">
              $1,000
              <IcoHeartDollar />
            </div>
            <div className="mlines">
              <div className="r">
                <span className="k">To your chosen charity, per meeting</span>
                <span>the full meeting gift</span>
              </div>
              <div className="r">
                <span className="k">Platform admin fee</span>
                <span>charged separately to the vendor and named</span>
              </div>
              <div className="r">
                <span className="k">Cost to you</span>
                <span>nothing, ever</span>
              </div>
            </div>
          </div>
          <p className="lede" style={{ marginTop: 24 }}>
            You direct exactly where the donation goes. The gift stays clean
            and whole, never reduced by running costs.
          </p>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="founding">
            <span className="glow" />
            <IcoSparkleBig />
            <span className="eyebrow">The first cohort</span>
            <h2>Join as a founding member.</h2>
            <p>
              We are starting small on purpose. Founding members help shape how
              this works, for executives and for the causes they support.
            </p>
            <CallButton>Apply as a founding executive</CallButton>
          </div>
        </div>
      </section>
    </>
  );
}
