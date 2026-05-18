import type { Metadata } from "next";
import { CALENDLY_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "For executives. TheBigIntro.",
  description:
    "Free for senior leaders. You decide what is relevant, take only the conversations worth your time, and $1,000 goes to a charity you choose every meeting.",
};

export default function Executives() {
  return (
    <article>
      <header>
        <p>For executives · Invite only</p>
        <h1>Conversations worth your time.</h1>
        <p>
          You are senior enough that your calendar is a target. TheBigIntro
          turns the few conversations worth having into $1,000 for a cause you
          choose.
        </p>
        <p>
          <a href={CALENDLY_URL}>Apply as a founding executive</a>
        </p>
        <p>
          Free to join. No cold pitches. You stay in control of every request.
        </p>
      </header>

      <section>
        <p>How it works for you</p>
        <h2>Three steps, nothing hidden.</h2>
        <ol>
          <li>
            <h3>You set what is relevant</h3>
            <p>
              Tell us the priorities and challenges you want to talk about.
              Anything outside that never reaches you.
            </p>
          </li>
          <li>
            <h3>You get qualified requests</h3>
            <p>
              A vendor must state the specific initiative or problem before
              they can ask. You see the reason and decide. No obligation.
            </p>
          </li>
          <li>
            <h3>One focused conversation</h3>
            <p>
              You have one focused conversation, and $1,000 goes to your
              chosen registered charity.
            </p>
          </li>
        </ol>
        <p>
          A vendor states a specific need, you approve only what fits, you
          have one short conversation, and $1,000 goes to your chosen charity.
        </p>
      </section>

      <section>
        <p>The honest answer</p>
        <h2>Is this a sales trap?</h2>
        <p>
          No. A vendor cannot reach you without stating a specific, relevant
          reason, and the conversation is about your priorities, not a hard
          sell. If a conversation is not useful, you simply do not take the
          next one. The model only works if executives genuinely want to be
          here.
        </p>
      </section>

      <section>
        <p>What your time is worth</p>
        <h2>Full transparency.</h2>
        <p>$1,000</p>
        <ul>
          <li>To your chosen charity, per meeting — the full meeting gift</li>
          <li>Platform admin fee — paid by the vendor, never you</li>
          <li>What it costs you — nothing, ever</li>
        </ul>
        <p>
          You direct exactly where the donation goes. Every dollar of the
          gift reaches the charity, never reduced by running costs.
        </p>
        <ul>
          <li>After the meeting — the donation is sent to your chosen registered charity</li>
          <li>You get confirmation — in writing, every time</li>
          <li>The admin fee — is the vendor&apos;s, billed separately</li>
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
          <a href={CALENDLY_URL}>Apply as a founding executive</a>
        </p>
      </section>

      <section>
        <p>The invitation</p>
        <h2>Conversations worth your time.</h2>
        <p>
          Apply as a founding executive. You decide what is relevant, you
          take only the conversations you want, and the charity you choose
          receives $1,000 each time.
        </p>
        <p>
          <a href={CALENDLY_URL}>Apply as a founding executive</a>
        </p>
        <p>Free for executives. Invite only. One short call to start.</p>
      </section>
    </article>
  );
}
