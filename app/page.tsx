import Link from "next/link";
import { CALENDLY_URL } from "@/lib/config";

export default function Home() {
  return (
    <article>
      <header>
        <p>Invite only · Australia first · Funds charity</p>
        <h1>Meetings that fund what matters.</h1>
        <p>
          You take a handful of conversations worth your time. Each one sends
          $1,000 to a charity you choose.
        </p>
        <p>
          <a href={CALENDLY_URL}>Apply as a founding executive</a>
          {" · "}
          <Link href="/vendors">Are you a vendor?</Link>
        </p>
        <p>
          No cold pitches. No hard sells. Every meeting funds a cause that
          matters to you.
        </p>
      </header>

      <section>
        <p>Why this exists</p>
        <h2>Your calendar is full of pitches that go nowhere.</h2>
        <p>
          What if the few conversations worth having also did some good? That
          is the whole idea. Fewer, more relevant meetings, each one sending
          $1,000 to a cause you care about.
        </p>
      </section>

      <section>
        <p>How it works</p>
        <h2>Three steps, for executives.</h2>
        <ol>
          <li>
            <h3>You decide what&apos;s relevant</h3>
            <p>
              Tell us the priorities you want to talk about. Nothing outside
              that ever reaches you.
            </p>
          </li>
          <li>
            <h3>You get qualified requests</h3>
            <p>
              A vendor must state the specific initiative or problem before
              they can ask. You see the reason, and you decide.
            </p>
          </li>
          <li>
            <h3>One focused conversation</h3>
            <p>
              You have one focused conversation, and $1,000 goes to the charity
              you choose.
            </p>
          </li>
        </ol>
        <p>
          A vendor states a specific need, you approve only what fits, you have
          one short conversation, and $1,000 goes to your chosen charity.
        </p>
      </section>

      <section>
        <p>Where the money goes</p>
        <h2>Full transparency.</h2>
        <p>$1,000</p>
        <ul>
          <li>To your chosen charity, per meeting — the full meeting gift</li>
          <li>Platform admin fee — paid by the vendor, never you</li>
          <li>What it costs you — nothing, ever</li>
        </ul>
        <p>
          Every dollar of the gift reaches the charity. The platform covers
          its costs through a clearly named admin fee paid by the vendor,
          never taken from the donation.
        </p>
        <ul>
          <li>After the meeting — the donation is sent to your chosen registered charity</li>
          <li>You get confirmation — in writing, every time</li>
          <li>The admin fee — is the vendor&apos;s, billed separately</li>
        </ul>
      </section>

      <section>
        <p>Causes you could choose</p>
        <h2>Real causes, your call.</h2>
        <ul>
          <li>Health and medical research</li>
          <li>Education and young people</li>
          <li>Environment and climate</li>
          <li>Community and crisis relief</li>
          <li>Animal welfare</li>
        </ul>
        <p>
          Every donation goes to a registered Australian charity you name.
          These are the kinds of causes it can support.
        </p>
      </section>

      <section>
        <p>What makes this different</p>
        <h2>Built around relevance and giving.</h2>
        <ul>
          <li>
            <h3>Qualified by requirement</h3>
            <p>
              Access is earned, not bought. A vendor states the specific reason
              a conversation is worth your time, or it never reaches you.
            </p>
          </li>
          <li>
            <h3>A deliberately big gift</h3>
            <p>
              $1,000 a meeting is set high on purpose, so the giving means
              something, not a token gesture.
            </p>
          </li>
          <li>
            <h3>No fine print</h3>
            <p>
              The full money flow is on this page. No vague claims, nothing
              buried in terms.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <p>Who this is for</p>
        <h2>Built for senior leaders.</h2>
        <p>
          Invite only, and curated on purpose. We are starting with senior
          leaders in Australia whose time is genuinely in demand, and who
          would value a few relevant conversations that also fund a cause they
          choose.
        </p>
        <ul>
          <li>
            <h3>The executive</h3>
            <p>
              Director, executive or equivalent, where your attention is the
              scarce thing. You set the topics, and nothing outside them
              reaches you.
            </p>
          </li>
          <li>
            <h3>The bar for vendors</h3>
            <p>
              A specific initiative, genuine intent, no hard sell. Held to
              that standard before they can ask.{" "}
              <Link href="/vendors">The vendor page</Link>
            </p>
          </li>
          <li>
            <h3>Where we start</h3>
            <p>
              Australia first, with a small founding cohort, so the first
              members shape how it works.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <p>What to expect</p>
        <h2>You stay in control, always.</h2>
        <ul>
          <li>
            <strong>Every request states its reason.</strong> You see the
            specific initiative before anything happens.
          </li>
          <li>
            <strong>You approve or decline each one.</strong> Nothing is
            automatic, and a no needs no explanation.
          </li>
          <li>
            <strong>One short conversation, on your terms.</strong> No hard
            sell, and no obligation to meet again.
          </li>
          <li>
            <strong>Your details are never sold or shared.</strong> You can
            step away at any time.
          </li>
        </ul>
      </section>

      <section>
        <p>The first cohort</p>
        <h2>Join as a founding member.</h2>
        <p>
          We are starting small on purpose. Founding members help shape how
          this works, for the executives who join and the causes they support.
        </p>
        <p>
          <a href={CALENDLY_URL}>Request your place</a>
        </p>
      </section>

      <section>
        <p>From the founder</p>
        <p>
          I kept seeing senior people buried in irrelevant outreach, and
          vendors with something genuine to say unable to get through honestly.
          TheBigIntro fixes both at once, and turns every meeting into $1,000
          for a cause the executive chooses.
        </p>
        <p>Isobel Hardwick, founder</p>
      </section>

      <section>
        <p>Questions</p>
        <h2>Good things to ask.</h2>
        <details open>
          <summary>Is this just a sales meeting in disguise?</summary>
          <p>
            No. A vendor cannot reach you without stating a specific, relevant
            reason, and the conversation is about your priorities, not a hard
            sell.
          </p>
        </details>
        <details>
          <summary>Which charities can I choose?</summary>
          <p>
            Any registered charity you choose. You name it, and that is
            exactly where your $1,000 goes.
          </p>
        </details>
        <details>
          <summary>What does it cost an executive?</summary>
          <p>
            Nothing. It is free for executives. Vendors pay, and that is what
            funds the donation to your charity.
          </p>
        </details>
        <details>
          <summary>Why founding members?</summary>
          <p>
            We are starting deliberately small so the first members shape how
            this works.
          </p>
        </details>
        <details>
          <summary>How much of my time is this?</summary>
          <p>
            One short, focused conversation. You only take the ones you
            choose.
          </p>
        </details>
      </section>

      <section>
        <p>The invitation</p>
        <h2>Fewer meetings, real giving.</h2>
        <p>
          Apply as a founding executive. You decide what is relevant, you take
          only the conversations you want, and the charity you choose receives
          $1,000 each time.
        </p>
        <p>
          <a href={CALENDLY_URL}>Apply as a founding executive</a>
        </p>
        <p>Free for executives. Invite only. One short call to start.</p>
      </section>
    </article>
  );
}
