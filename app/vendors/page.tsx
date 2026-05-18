import type { Metadata } from "next";
import { CALENDLY_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "For vendors. TheBigIntro.",
  description:
    "A qualified introduction to a vetted, hard-to-reach senior audience. Every meeting you book sends $1,000 to the leader's chosen charity. Australia first, invite only.",
};

export default function Vendors() {
  return (
    <article>
      <header>
        <p>For vendors</p>
        <h1>Reach leaders honestly.</h1>
        <p>
          A genuinely qualified introduction to a vetted, hard-to-reach senior
          audience. Earned by being relevant, not by buying a list and
          sending more cold email.
        </p>
        <p>
          <a href={CALENDLY_URL}>Book a call</a>
        </p>
        <p>
          You fund the giving. Every meeting you book sends $1,000 to the
          leader&apos;s chosen charity.
        </p>
      </header>

      <section>
        <p>What you get</p>
        <h2>A room you cannot cold-email into.</h2>
        <ul>
          <li>
            <h3>A vetted senior audience</h3>
            <p>
              Leaders who opted in and set their own priorities. Not a scraped
              list, and not someone screening on their behalf.
            </p>
          </li>
          <li>
            <h3>A qualified introduction</h3>
            <p>
              You state the specific initiative. It reaches the leader only
              when it genuinely fits what they asked to hear about.
            </p>
          </li>
          <li>
            <h3>Goodwill that lasts</h3>
            <p>
              Every meeting sends $1,000 to the leader&apos;s chosen charity.
              You are remembered as the introduction that did some good.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <p>Who this is for</p>
        <h2>Built for vendors who mean it.</h2>
        <ul>
          <li>
            <h3>Socially minded</h3>
            <p>
              You are glad that the value you create here also sends a
              substantial gift to a cause the leader chooses.
            </p>
          </li>
          <li>
            <h3>Genuine intent</h3>
            <p>
              You have a specific initiative or problem to discuss and can
              state it plainly. No vague discovery, no laboured demos.
            </p>
          </li>
          <li>
            <h3>Meet on their terms</h3>
            <p>
              One focused conversation, led by the leader&apos;s priorities.
              No hard selling. The relationship is the point.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <p>What is expected</p>
        <h2>State your reason up front.</h2>
        <p>
          Before a request reaches a leader you describe the specific
          initiative or challenge that makes the conversation relevant. That
          one requirement is what keeps quality high on both sides, and it is
          why senior leaders agree to be here at all.
        </p>
      </section>

      <section>
        <p>What it costs, in full</p>
        <h2>Transparent pricing.</h2>
        <p>$1,000</p>
        <ul>
          <li>To the leader&apos;s chosen charity, per meeting — the full meeting gift</li>
          <li>Platform admin fee — billed to you, separately and clearly named</li>
          <li>What the leader pays — nothing, ever</li>
        </ul>
        <p>
          The donation is never reduced to cover our costs. The admin fee is
          its own named line, so you always know exactly what funds the
          charity and what funds the platform.
        </p>
        <ul>
          <li>After the meeting — the donation is sent to the leader&apos;s chosen registered charity</li>
          <li>You get confirmation — in writing, every time</li>
          <li>The admin fee — is billed to you, never blended with the gift</li>
        </ul>
      </section>

      <section>
        <p>Founding vendors</p>
        <h2>Help shape how this works.</h2>
        <p>
          We are starting small on purpose. Founding vendors help shape how
          this works, alongside the first leaders who join.
        </p>
        <p>
          <a href={CALENDLY_URL}>Book a call</a>
        </p>
      </section>

      <section>
        <p>The invitation</p>
        <h2>Be the introduction worth taking.</h2>
        <p>
          Reach senior leaders by being relevant, and fund a real gift while
          you do it. Every meeting you book sends $1,000 to the leader&apos;s
          chosen charity.
        </p>
        <p>
          <a href={CALENDLY_URL}>Book a call</a>
        </p>
        <p>One short call to start. You fund the giving.</p>
      </section>
    </article>
  );
}
