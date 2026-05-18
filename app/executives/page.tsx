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
    "Free for senior leaders. You decide what is relevant, take only the conversations worth your time, and $1,000 goes to a charity you choose every meeting.",
};

export default function Executives() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <div className="hero-copy">
            <span className="eyebrow">For executives · Invite only</span>
            <h1>
              Conversations worth <Mark>your time</Mark>.
            </h1>
            <p className="lede">
              You are senior enough that your calendar is a target. TheBigIntro
              turns the few conversations worth having into $1,000 for a cause
              you choose.
            </p>
            <div className="cta">
              <CallButton>Apply as a founding executive</CallButton>
            </div>
            <p className="trust">
              Free to join. No cold pitches. You stay in control of every
              request.
            </p>
          </div>
        </div>
      </header>

      <section id="how">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">How it works for you</span>
            <h2>Three steps, nothing hidden.</h2>
          </div>
          <div className="grid3 reveal">
            <div className="card">
              <div className="ictop">
                <IcoRelevant />
                <span className="step-n">01</span>
              </div>
              <h3>You set what is relevant</h3>
              <p>
                Tell us the priorities and challenges you want to talk about.
                Anything outside that never reaches you.
              </p>
            </div>
            <div className="card">
              <div className="ictop">
                <IcoQualified />
                <span className="step-n">02</span>
              </div>
              <h3>You get qualified requests</h3>
              <p>
                A vendor must state the specific initiative or problem before
                they can ask. You see the reason and decide. No obligation.
              </p>
            </div>
            <div className="card">
              <div className="ictop">
                <IcoMeeting />
                <span className="step-n">03</span>
              </div>
              <h3>One focused conversation</h3>
              <p>
                You have one focused conversation, and $1,000 goes to your
                chosen registered charity.
              </p>
            </div>
          </div>
          <p className="loopline reveal">
            A vendor states a specific need, you approve only what fits, you
            have one short conversation, and $1,000 goes to your chosen
            charity.
          </p>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">The honest answer</span>
            <h2>Is this a sales trap?</h2>
            <p className="lede">
              No. A vendor cannot reach you without stating a specific,
              relevant reason, and the conversation is about your priorities,
              not a hard sell. If a conversation is not useful, you simply do
              not take the next one. The model only works if executives
              genuinely want to be here.
            </p>
          </div>
        </div>
      </section>

      <section className="soft-coral" id="money">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">What your time is worth</span>
            <h2>Full transparency.</h2>
          </div>
          <div className="moneywrap reveal">
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
                <span>paid by the vendor, never you</span>
              </div>
              <div className="r">
                <span className="k">What it costs you</span>
                <span>nothing, ever</span>
              </div>
            </div>
          </div>
          <p className="lede" style={{ marginTop: 24 }}>
            You direct exactly where the donation goes. Every dollar of the
            gift reaches the charity, never reduced by running costs.
          </p>
          <div className="giveflow reveal">
            <div className="gf">
              <span className="gf-k">After the meeting</span>
              <span className="gf-v">
                the donation is sent to your chosen registered charity
              </span>
            </div>
            <div className="gf">
              <span className="gf-k">You get confirmation</span>
              <span className="gf-v">in writing, every time</span>
            </div>
            <div className="gf">
              <span className="gf-k">The admin fee</span>
              <span className="gf-v">
                is the vendor&apos;s, billed separately
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="founding reveal">
            <span className="glow" />
            <IcoSparkleBig />
            <span className="eyebrow">The first cohort</span>
            <h2>Join as a founding member.</h2>
            <p>
              We are starting small on purpose. Founding members help shape
              how this works, for the executives who join and the causes they
              support.
            </p>
            <CallButton>Apply as a founding executive</CallButton>
          </div>
        </div>
      </section>

      <section className="closing">
        <div className="wrap">
          <div className="closecard reveal">
            <span className="glow" />
            <span className="eyebrow">The invitation</span>
            <h2>Conversations worth your time.</h2>
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
