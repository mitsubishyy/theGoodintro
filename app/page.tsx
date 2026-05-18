import Link from "next/link";
import { CallButton } from "./_components/call-button";
import { Mark } from "./_components/mark";
import { HeroArt } from "./_components/hero-art";
import {
  ChipCheck,
  ChipInfo,
  ChipHeart,
  IcoRelevant,
  IcoQualified,
  IcoMeeting,
  IcoHeartDollar,
  IcoBadgeCheck,
  IcoHeartPlus,
  IcoTarget,
  IcoSparkleBig,
  IcoPerson,
  IcoChat,
  IcoCross,
  IcoBook,
  IcoLeaf,
  IcoHands,
  IcoPaw,
} from "./_components/icons";

export default function Home() {
  return (
    <>
      <header className="hero">
        <span className="b b1" />
        <span className="b b2" />
        <div className="wrap inner">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="chips">
                <span className="chip">
                  <ChipCheck />
                  Invite only
                </span>
                <span className="chip">
                  <ChipInfo />
                  Australia first
                </span>
                <span className="chip">
                  <ChipHeart />
                  Funds charity
                </span>
              </div>
              <h1>
                Meetings that fund <Mark>what matters</Mark>.
              </h1>
              <p className="lede">
                You take a handful of conversations worth your time. Each one
                sends $1,000 to a charity you choose.
              </p>
              <div className="cta">
                <CallButton>Apply as a founding executive</CallButton>
                <Link className="inl" href="/vendors">
                  Are you a vendor? &rarr;
                </Link>
              </div>
              <p className="trust">
                No cold pitches. No hard sells. Every meeting funds a cause
                that matters to you.
              </p>
            </div>
            <HeroArt />
          </div>
        </div>
      </header>

      <section className="soft-mint" id="why">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Why this exists</span>
            <h2>
              Your calendar is full of
              <br />
              pitches that go nowhere.
            </h2>
            <p className="lede">
              What if the few conversations worth having also did some good?
              That is the whole idea. Fewer, more relevant meetings, each one
              sending $1,000 to a cause you care about.
            </p>
          </div>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">How it works</span>
            <h2>Three steps, for executives.</h2>
          </div>
          <div className="grid3 reveal">
            <div className="card">
              <div className="ictop">
                <IcoRelevant />
                <span className="step-n">01</span>
              </div>
              <h3>You decide what&apos;s relevant</h3>
              <p>
                Tell us the priorities you want to talk about. Nothing outside
                that ever reaches you.
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
                they can ask. You see the reason, and you decide.
              </p>
            </div>
            <div className="card">
              <div className="ictop">
                <IcoMeeting />
                <span className="step-n">03</span>
              </div>
              <h3>One focused conversation</h3>
              <p>
                You have one focused conversation, and $1,000 goes to the
                charity you choose.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="soft-coral" id="money">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Where the money goes</span>
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
            Every dollar of the gift reaches the charity. The platform covers
            its costs through a clearly named admin fee paid by the vendor,
            never taken from the donation.
          </p>
        </div>
      </section>

      <section className="charities">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Causes you could choose</span>
            <h2>Real causes, your call.</h2>
          </div>
          <div className="causes reveal">
            <span className="cause">
              <IcoCross />
              Health and medical research
            </span>
            <span className="cause">
              <IcoBook />
              Education and young people
            </span>
            <span className="cause">
              <IcoLeaf />
              Environment and climate
            </span>
            <span className="cause">
              <IcoHands />
              Community and crisis relief
            </span>
            <span className="cause">
              <IcoPaw />
              Animal welfare
            </span>
          </div>
          <p className="note">
            Every donation goes to a registered Australian charity you name.
            These are the kinds of causes it can support.
          </p>
        </div>
      </section>

      <section id="diff">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">What makes this different</span>
            <h2>Built around relevance and giving.</h2>
          </div>
          <div className="difflist reveal">
            <div className="row2">
              <IcoBadgeCheck />
              <div>
                <h3>Qualified by requirement</h3>
                <p>
                  Access is earned, not bought. A vendor states the specific
                  reason a conversation is worth your time, or it never
                  reaches you.
                </p>
              </div>
            </div>
            <div className="row2">
              <IcoHeartPlus />
              <div>
                <h3>A deliberately big gift</h3>
                <p>
                  $1,000 a meeting is set high on purpose, so the giving means
                  something, not a token gesture.
                </p>
              </div>
            </div>
            <div className="row2">
              <IcoTarget />
              <div>
                <h3>No fine print</h3>
                <p>
                  The full money flow is on this page. No vague claims,
                  nothing buried in terms.
                </p>
              </div>
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
            <CallButton>Request your place</CallButton>
          </div>
        </div>
      </section>

      <section id="apply">
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Two ways in</span>
            <h2>Start a conversation.</h2>
          </div>
          <div className="paths reveal">
            <div className="path exec" id="exec">
              <IcoPerson />
              <span className="tag">For executives</span>
              <h3>On your terms.</h3>
              <p>
                You decide what&apos;s relevant, you take only the
                conversations you want, and the charity you choose receives
                $1,000 each time. Free for executives, always.
              </p>
              <CallButton>Book a call</CallButton>
            </div>
            <div className="path vend" id="vendor">
              <IcoChat />
              <span className="tag">For vendors</span>
              <h3>Reach leaders honestly.</h3>
              <p>
                Earn a qualified introduction to a vetted senior audience by
                being genuinely relevant. Every meeting you book sends $1,000
                to the executive&apos;s chosen charity.
              </p>
              <CallButton className="btn mint">Book a call</CallButton>
            </div>
          </div>
        </div>
      </section>

      <section className="founder-sec">
        <div className="wrap">
          <div className="founder reveal">
            <div className="ava">IH</div>
            <div>
              <span className="eyebrow">From the founder</span>
              <p style={{ marginTop: 12 }}>
                I kept seeing senior people buried in irrelevant outreach, and
                vendors with something genuine to say unable to get through
                honestly. TheBigIntro fixes both at once, and turns every
                meeting into $1,000 for a cause the executive chooses.
              </p>
              <div className="sig">Isobel Hardwick, founder</div>
            </div>
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
              Is this just a sales meeting in disguise?
              <span className="i">+</span>
            </summary>
            <p>
              No. A vendor cannot reach you without stating a specific,
              relevant reason, and the conversation is about your priorities,
              not a hard sell.
            </p>
          </details>
          <details>
            <summary>
              Which charities can I choose?<span className="i">+</span>
            </summary>
            <p>
              Any registered charity you choose. You name it, and that is
              exactly where your $1,000 goes.
            </p>
          </details>
          <details>
            <summary>
              What does it cost an executive?<span className="i">+</span>
            </summary>
            <p>
              Nothing. It is free for executives. Vendors pay, and that is
              what funds the donation to your charity.
            </p>
          </details>
          <details>
            <summary>
              Why founding members?<span className="i">+</span>
            </summary>
            <p>
              We are starting deliberately small so the first members shape
              how this works.
            </p>
          </details>
          <details>
            <summary>
              How much of my time is this?
              <span className="i">+</span>
            </summary>
            <p>
              One short, focused conversation. You only take the ones you
              choose.
            </p>
          </details>
        </div>
      </section>

      <section className="closing">
        <div className="wrap">
          <div className="closecard reveal">
            <span className="glow" />
            <span className="eyebrow">The invitation</span>
            <h2>Fewer meetings, real giving.</h2>
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
