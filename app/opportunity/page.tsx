import type { Metadata } from "next";
import Link from "next/link";
import { CALENDLY_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "Partner with me. TheBigIntro.",
  description:
    "TheBigIntro is early. A marketplace where senior leaders take only relevant meetings and every one sends $1,000 to a charity they choose. I am looking for one person to build it into a company.",
};

export default function Opportunity() {
  return (
    <article>
      <header>
        <p>The opportunity</p>
        <h1>Build this with me.</h1>
        <p>
          TheBigIntro is early. A marketplace where senior leaders take only
          the meetings worth their time, and every one sends $1,000 to a
          charity they choose. The idea is on the page. I am looking for one
          person to build it into a company.
        </p>
        <p>
          <a href={CALENDLY_URL}>Start a conversation</a>
        </p>
        <p>
          Honest about the stage. No funding claimed, no team yet. A clear
          model and the will to build it.
        </p>
      </header>

      <section>
        <p>Why this is worth building</p>
        <h2>Two broken sides, one fix.</h2>
        <p>
          Senior leaders ignore most outreach because almost none of it is
          relevant. Vendors spend heavily to reach them and mostly fail.
          Neither side has a reason to make the exchange worth anything
          beyond the deal. TheBigIntro changes the incentive: a meeting
          happens only when it is genuinely relevant, and when it does, real
          money goes to a cause the leader chose.
        </p>
      </section>

      <section>
        <p>The model</p>
        <h2>Simple, and hard to game.</h2>
        <ul>
          <li>
            <h3>Qualified by requirement</h3>
            <p>
              A vendor must state a specific initiative before a request
              reaches a leader. Relevance is the entry fee.
            </p>
          </li>
          <li>
            <h3>$1,000 a meeting to charity</h3>
            <p>
              Every meeting sends $1,000 to the leader&apos;s chosen
              registered charity. A separate, clearly named admin fee covers
              the platform.
            </p>
          </li>
          <li>
            <h3>Free for the scarce side</h3>
            <p>
              Executives join free. Vendors pay, because access to a vetted,
              relevant audience is worth it.
            </p>
          </li>
        </ul>
        <p>
          The full flow, end to end, is on the{" "}
          <Link href="/how-it-works">how it works page</Link>.
        </p>
      </section>

      <section>
        <p>Why it can work</p>
        <h2>The wedge.</h2>
        <ul>
          <li>
            <h3>Relevance changes who says yes</h3>
            <p>
              The one requirement is what makes a senior person willing to be
              here at all. It is the product, not a feature.
            </p>
          </li>
          <li>
            <h3>Giving changes the story</h3>
            <p>
              A $1,000 gift per meeting is a reason to take the call, and a
              story worth repeating. It compounds goodwill instead of spending
              it.
            </p>
          </li>
          <li>
            <h3>Australia first keeps it provable</h3>
            <p>
              Starting in one market keeps the giving verifiable and the
              quality high while the model is proven.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <p>Where it is today</p>
        <h2>Honest about the stage.</h2>
        <p>
          This is a validation site, not the platform. There is no outside
          funding, no team yet, and no inflated numbers on this page on
          purpose. What exists is a clear model, a name, and the conviction
          to build it. The next step is proving demand on both sides and
          building the first version.
        </p>
      </section>

      <section>
        <p>Who I am looking for</p>
        <h2>One person to build it with.</h2>
        <ul>
          <li>
            <h3>You open doors</h3>
            <p>
              You can reach senior leaders or vendors, and people take your
              introductions seriously.
            </p>
          </li>
          <li>
            <h3>You build product</h3>
            <p>
              You can take this from a page to a working platform, and ship
              without waiting to be told how.
            </p>
          </li>
          <li>
            <h3>You have done this</h3>
            <p>
              You have built a marketplace or a two-sided business before and
              know where they break.
            </p>
          </li>
        </ul>
        <p>
          You do not need all three. You need to complement what I bring, and
          care that the giving is real. This is a founding partner, shaping
          it from here, not a hire.
        </p>
      </section>

      <section>
        <p>From the founder</p>
        <h2>I would rather build it well than alone.</h2>
        <p>
          I am Isobel Hardwick. I have spent a long time on the sending side
          of sales and I know exactly why this is needed. What I want now is
          the right person to build it with.
        </p>
        <p>
          <a href={CALENDLY_URL}>Start a conversation</a>
        </p>
      </section>

      <section>
        <p>The invitation</p>
        <h2>If this is your kind of problem.</h2>
        <p>
          Tell me what you would change, what you would own, and where you
          think it breaks. That is the conversation I want to have.
        </p>
        <p>
          <a href={CALENDLY_URL}>Start a conversation</a>
        </p>
        <p>Early and honest. One conversation to start.</p>
      </section>
    </article>
  );
}
