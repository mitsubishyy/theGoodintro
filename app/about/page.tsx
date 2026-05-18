import type { Metadata } from "next";
import { CALENDLY_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "About. TheBigIntro.",
  description:
    "Why Isobel Hardwick is building TheBigIntro: fix irrelevant outreach for senior leaders and turn every conversation into $1,000 for a cause that matters.",
};

export default function About() {
  return (
    <article>
      <header>
        <p>About</p>
        <h1>Built to fix both sides.</h1>
        <p>
          Senior people are buried in irrelevant outreach. Vendors with
          genuine value cannot get through honestly. TheBigIntro fixes both at
          once, and turns every conversation into $1,000 for a cause the
          leader chooses.
        </p>
        <p>
          <a href={CALENDLY_URL}>Start a conversation</a>
        </p>
      </header>

      <section>
        <p>From the founder</p>
        <p>
          I spent a long time on the sending side of sales, watching good
          people fail to reach leaders who might actually have wanted to talk,
          and watching leaders drown in noise from people who did not. The fix
          was never another clever subject line. It was a rule: earn the
          conversation by being relevant, and make the conversation worth
          something beyond the deal.
        </p>
        <p>
          TheBigIntro is that rule, built into a place. Every conversation
          here sends $1,000 to a cause the leader chooses. That is the whole
          point.
        </p>
        <p>Isobel Hardwick, founder</p>
      </section>

      <section>
        <p>What we believe</p>
        <h2>Three things we will not compromise.</h2>
        <ul>
          <li>
            <h3>Relevance is earned</h3>
            <p>
              No one reaches a leader without a stated, specific reason. That
              requirement is the product.
            </p>
          </li>
          <li>
            <h3>Giving stays whole</h3>
            <p>
              The donation figure is never blended with our costs. The admin
              fee is its own named line.
            </p>
          </li>
          <li>
            <h3>Small on purpose</h3>
            <p>
              We are starting with a deliberately small invite-only cohort so
              the first members shape it.
            </p>
          </li>
        </ul>
      </section>

      <section>
        <p>The first cohort</p>
        <h2>Help shape how this works.</h2>
        <p>
          Founding members, executives and vendors alike, get a direct say in
          how TheBigIntro runs.
        </p>
        <p>
          <a href={CALENDLY_URL}>Start a conversation</a>
        </p>
      </section>

      <section>
        <p>The invitation</p>
        <h2>A few better conversations.</h2>
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
