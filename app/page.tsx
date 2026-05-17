import Link from "next/link";
import { CallButton } from "./_components/call-button";
import { Mark } from "./_components/mark";

export default function Home() {
  return (
    <>
      <header className="hero">
        <span className="blob" />
        <div className="wrap inner">
          <div className="chips">
            <span className="chip c">Invite only</span>
            <span className="chip o">Australia first</span>
            <span className="chip o">Charity funded</span>
          </div>
          <h1>
            Meetings that fund <Mark>what matters</Mark>.
          </h1>
          <p className="lede">
            Relevant, qualified introductions with senior leaders. Every
            meeting sends a real donation to a charity they choose.
          </p>
          <div className="cta">
            <CallButton>Apply as a founding executive</CallButton>
            <Link className="inl" href="/vendors">
              Are you a vendor? &rarr;
            </Link>
          </div>
          <p className="trust">
            No cold pitches. No slide decks. One focused conversation, one
            meaningful gift.
          </p>
        </div>
      </header>

      <section className="dark" id="why">
        <div className="wrap">
          <span className="eyebrow">Why this exists</span>
          <h2>
            A senior leader&apos;s calendar is full of
            <br />
            pitches that go nowhere.
          </h2>
          <p className="lede">
            What if the few meetings actually worth taking also did real good.
            That is the whole idea. Fewer, sharper conversations, each one
            turned into a meaningful donation.
          </p>
        </div>
      </section>

      <section id="how">
        <div className="wrap">
          <span className="eyebrow">How it works</span>
          <h2>Three steps, for executives.</h2>
          <div className="grid3">
            <div className="step">
              <div className="n">01</div>
              <h3>You set what is relevant</h3>
              <p>
                Tell us the priorities you actually want to talk about. Nothing
                else reaches you.
              </p>
            </div>
            <div className="step">
              <div className="n">02</div>
              <h3>You get qualified requests</h3>
              <p>
                A vendor must state the specific initiative or problem before
                they can ask. You see the reason first.
              </p>
            </div>
            <div className="step">
              <div className="n">03</div>
              <h3>One focused meeting</h3>
              <p>
                You take a single, well prepared conversation, and a
                substantial donation goes to your chosen charity.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="money" id="money">
        <div className="wrap">
          <span className="eyebrow">Where the money goes</span>
          <h2>Full transparency, by design.</h2>
          <div className="moneywrap">
            <div className="bignum">$1,000</div>
            <div className="mlines">
              <div className="r">
                <span className="k">To your chosen charity, per meeting</span>
                <span>the full meeting gift</span>
              </div>
              <div className="r">
                <span className="k">Platform admin fee</span>
                <span>charged separately and named</span>
              </div>
              <div className="r">
                <span className="k">Focus at launch</span>
                <span>Australia first</span>
              </div>
            </div>
          </div>
          <p className="lede" style={{ marginTop: 26 }}>
            The gift stays clean and whole. Running costs are recovered through
            a clearly labelled admin fee, never skimmed from what reaches the
            charity.
          </p>
        </div>
      </section>

      <section className="charities">
        <div className="wrap">
          <span className="eyebrow">Causes our members support</span>
          <div className="row">
            <div className="ph">LOGO</div>
            <div className="ph">LOGO</div>
            <div className="ph">LOGO</div>
            <div className="ph">LOGO</div>
            <div className="ph">LOGO</div>
          </div>
          <p className="note">
            Real charity logos and bespoke illustrations go here in the
            engagement pass.
          </p>
        </div>
      </section>

      <section id="diff">
        <div className="wrap">
          <span className="eyebrow">What makes this different</span>
          <h2>Built around relevance and honesty.</h2>
          <div className="diff">
            <div>
              <h3>Qualified by requirement</h3>
              <p>
                No cold asks. A vendor must show why the meeting earns your
                time before it ever reaches you.
              </p>
            </div>
            <div>
              <h3>A deliberately larger gift</h3>
              <p>
                The donation is set high on purpose, so the impact is real, not
                a token gesture.
              </p>
            </div>
            <div>
              <h3>Nothing hidden</h3>
              <p>
                The full money flow is on the page. No vague claims, no fine
                print games.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="alt">
        <div className="wrap">
          <div className="founding">
            <span className="eyebrow" style={{ color: "rgba(255,255,255,.8)" }}>
              The first cohort
            </span>
            <h2>Join as a founding member.</h2>
            <p>
              The first group is invite only and small on purpose. Founding
              members help shape how this works, and places are limited.
            </p>
            <CallButton>Request your place</CallButton>
          </div>
        </div>
      </section>

      <section id="apply">
        <div className="wrap">
          <span className="eyebrow">Two ways in</span>
          <h2>Start a conversation.</h2>
          <div className="paths">
            <div className="path exec" id="exec">
              <span className="tag">For executives</span>
              <h3>Free to join.</h3>
              <p>
                You decide what is relevant, you take only the meetings you
                want, and your charity benefits every single time.
              </p>
              <CallButton>Book a call</CallButton>
            </div>
            <div className="path vend" id="vendor">
              <span className="tag">For vendors</span>
              <h3>Reach leaders honestly.</h3>
              <p>
                State your reason, meet on their terms, and fund real impact
                while you build the relationships you need.
              </p>
              <CallButton>Book a call</CallButton>
            </div>
          </div>
        </div>
      </section>

      <section className="dark">
        <div className="wrap">
          <div className="founder">
            <div className="ava">IH</div>
            <div>
              <span className="eyebrow">From the founder</span>
              <p style={{ marginTop: 14 }}>
                I kept seeing senior people buried in irrelevant outreach, and
                vendors with genuine value unable to get through honestly.
                TheBigIntro is my attempt to fix both at once, and to make
                every meeting count for a cause that matters.
              </p>
              <div className="sig">Isobel Hardwick, founder</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="wrap">
          <span className="eyebrow">Questions</span>
          <h2 style={{ marginBottom: 20 }}>Good things to ask.</h2>
          <details open>
            <summary>
              Is this just a sales meeting in disguise?
              <span className="i">+</span>
            </summary>
            <p>
              No. A vendor cannot reach you without stating a specific,
              relevant reason, and the meeting is about your priorities, not a
              hard sell.
            </p>
          </details>
          <details>
            <summary>
              Which charities can I choose?<span className="i">+</span>
            </summary>
            <p>
              Your chosen registered charity. You direct exactly where the
              donation goes.
            </p>
          </details>
          <details>
            <summary>
              What does it cost an executive?<span className="i">+</span>
            </summary>
            <p>Nothing. It is free for executives. Vendors fund the model.</p>
          </details>
          <details>
            <summary>
              Why founding members?<span className="i">+</span>
            </summary>
            <p>
              We are starting deliberately small so the first members shape how
              this works. Places are limited.
            </p>
          </details>
        </div>
      </section>
    </>
  );
}
