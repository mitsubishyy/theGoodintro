import type { Metadata } from "next";
import { CallButton } from "../_components/call-button";
import { Mark } from "../_components/mark";
import {
  IcoBadgeCheck,
  IcoQualified,
  IcoHeartPlus,
  IcoMeeting,
  IcoHeartDollar,
  IcoSparkleBig,
} from "../_components/icons";

export const metadata: Metadata = {
  title: "For vendors. TheBigIntro.",
  description:
    "A qualified introduction to a vetted, hard-to-reach senior audience. Every meeting you book sends $1,000 to the leader's chosen charity. Australia first, invite only.",
};

export default function Vendors() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <div className="hero-copy">
            <span className="eyebrow">For vendors</span>
            <h1>
              Reach leaders <Mark>honestly</Mark>.
            </h1>
            <p className="lede">
              A genuinely qualified introduction to a vetted, hard-to-reach
              senior audience. Earned by being relevant, not by buying a list
              and sending more cold email.
            </p>
            <div className="cta">
              <CallButton className="btn mint">Book a call</CallButton>
            </div>
            <p className="trust">
              You fund the giving. Every meeting you book sends $1,000 to the
              leader&apos;s chosen charity.
            </p>
          </div>
        </div>
      </header>

      <section id="access">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">What you get</span>
            <h2>A room you cannot cold-email into.</h2>
          </div>
          <div className="grid3 reveal">
            <div className="card">
              <IcoBadgeCheck />
              <h3>A vetted senior audience</h3>
              <p>
                Leaders who opted in and set their own priorities. Not a
                scraped list, and not someone screening on their behalf.
              </p>
            </div>
            <div className="card">
              <IcoQualified />
              <h3>A qualified introduction</h3>
              <p>
                You state the specific initiative. It reaches the leader only
                when it genuinely fits what they asked to hear about.
              </p>
            </div>
            <div className="card">
              <IcoHeartDollar />
              <h3>Goodwill that lasts</h3>
              <p>
                Every meeting sends $1,000 to the leader&apos;s chosen charity.
                You are remembered as the introduction that did some good.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-mint" id="who">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Who this is for</span>
            <h2>Built for vendors who mean it.</h2>
          </div>
          <div className="grid3 reveal">
            <div className="card">
              <IcoHeartPlus />
              <h3>Socially minded</h3>
              <p>
                You are glad that the value you create here also sends a
                substantial gift to a cause the leader chooses.
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
              <IcoMeeting />
              <h3>Meet on their terms</h3>
              <p>
                One focused conversation, led by the leader&apos;s priorities.
                No hard selling. The relationship is the point.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="expected">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">What is expected</span>
            <h2>State your reason up front.</h2>
            <p className="lede">
              Before a request reaches a leader you describe the specific
              initiative or challenge that makes the conversation relevant.
              That one requirement is what keeps quality high on both sides,
              and it is why senior leaders agree to be here at all.
            </p>
          </div>
        </div>
      </section>

      <section className="soft-coral" id="pricing">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">What it costs, in full</span>
            <h2>Transparent pricing.</h2>
          </div>
          <div className="moneywrap reveal">
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
                <span>billed to you, separately and clearly named</span>
              </div>
              <div className="r">
                <span className="k">What the leader pays</span>
                <span>nothing, ever</span>
              </div>
            </div>
          </div>
          <p className="lede" style={{ marginTop: 24 }}>
            The donation is never reduced to cover our costs. The admin fee is
            its own named line, so you always know exactly what funds the
            charity and what funds the platform.
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
              <span className="gf-k">You get confirmation</span>
              <span className="gf-v">in writing, every time</span>
            </div>
            <div className="gf">
              <span className="gf-k">The admin fee</span>
              <span className="gf-v">
                is billed to you, never blended with the gift
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
            <span className="eyebrow">Founding vendors</span>
            <h2>Help shape how this works.</h2>
            <p>
              We are starting small on purpose. Founding vendors help shape
              how this works, alongside the first leaders who join.
            </p>
            <CallButton className="btn mint">Book a call</CallButton>
          </div>
        </div>
      </section>

      <section className="closing vend">
        <div className="wrap">
          <div className="closecard reveal">
            <span className="glow" />
            <span className="eyebrow">The invitation</span>
            <h2>Be the introduction worth taking.</h2>
            <p>
              Reach senior leaders by being relevant, and fund a real gift
              while you do it. Every meeting you book sends $1,000 to the
              leader&apos;s chosen charity.
            </p>
            <CallButton className="btn mint">Book a call</CallButton>
            <p className="closing-sub">
              One short call to start. You fund the giving.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
