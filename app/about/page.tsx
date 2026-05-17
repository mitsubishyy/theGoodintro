import type { Metadata } from "next";
import { CallButton } from "../_components/call-button";
import { Mark } from "../_components/mark";
import { IcoBadgeCheck, IcoHeartPlus, IcoSparkleBig } from "../_components/icons";

export const metadata: Metadata = {
  title: "About. TheBigIntro.",
  description:
    "Why Isobel Hardwick is building TheBigIntro: fix irrelevant outreach for senior leaders and make every conversation count for a cause that matters.",
};

export default function About() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <span className="eyebrow">About</span>
          <h1>
            Built to fix <Mark>both sides</Mark>.
          </h1>
          <p className="lede">
            Senior people are buried in irrelevant outreach. Vendors with
            genuine value cannot get through honestly. TheBigIntro is an
            attempt to fix both at once, and to make every conversation count.
          </p>
          <div className="cta">
            <CallButton>Start a conversation</CallButton>
          </div>
        </div>
      </header>

      <section className="founder-sec">
        <div className="wrap">
          <div className="founder">
            <div className="ava">IH</div>
            <div>
              <span className="eyebrow">From the founder</span>
              <p style={{ marginTop: 12 }}>
                I spent a long time on the sending side of sales, watching good
                people fail to reach leaders who might actually have wanted to
                talk, and watching leaders drown in noise from people who did
                not. The fix was never another clever subject line. It was a
                rule: earn the conversation by being relevant, and make the
                conversation worth something beyond the deal.
              </p>
              <p style={{ marginTop: 12 }}>
                TheBigIntro is that rule, built into a place. Every
                conversation here funds a real donation to a cause the leader
                chooses. That is the whole point.
              </p>
              <div className="sig">Isobel Hardwick, founder</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <span className="eyebrow">What we believe</span>
          <h2>Three things we will not compromise.</h2>
          <div className="diff">
            <div className="d">
              <IcoBadgeCheck />
              <h3>Relevance is earned</h3>
              <p>
                No one reaches a leader without a stated, specific reason. That
                requirement is the product.
              </p>
            </div>
            <div className="d">
              <IcoHeartPlus />
              <h3>Giving stays whole</h3>
              <p>
                The donation figure is never blended with our costs. The admin
                fee is its own named line.
              </p>
            </div>
            <div className="d">
              <IcoSparkleBig />
              <h3>Small on purpose</h3>
              <p>
                We are starting with a deliberately small invite-only cohort so
                the first members shape it.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-mint">
        <div className="wrap">
          <div className="founding">
            <span className="glow" />
            <IcoSparkleBig />
            <span className="eyebrow">The first cohort</span>
            <h2>Help shape how this works.</h2>
            <p>
              Founding members, executives and vendors alike, get a direct say
              in how TheBigIntro runs.
            </p>
            <CallButton>Start a conversation</CallButton>
          </div>
        </div>
      </section>
    </>
  );
}
