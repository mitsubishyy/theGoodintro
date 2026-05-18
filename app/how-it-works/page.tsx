import type { Metadata } from "next";
import { CALENDLY_URL } from "@/lib/config";

export const metadata: Metadata = {
  title: "How it works. TheBigIntro.",
  description:
    "The full model end to end: how relevant conversations are matched, how the $1,000 charity gift and separate named admin fee work, and how leaders choose where the giving goes.",
};

export default function HowItWorks() {
  return (
    <article>
      <header>
        <p>How it works</p>
        <h1>The whole model, in the open.</h1>
        <p>
          One requirement keeps it honest: a vendor must say why a
          conversation is relevant before a leader ever sees it. Everything
          else, including the giving, follows from that.
        </p>
        <p>
          <a href={CALENDLY_URL}>Start a conversation</a>
        </p>
      </header>

      <section>
        <p>End to end</p>
        <h2>From request to real giving.</h2>
        <ol>
          <li>
            <h3>The leader sets relevance</h3>
            <p>
              An executive joins free and tells us the priorities they will
              take conversations about. Nothing outside that gets near them.
            </p>
          </li>
          <li>
            <h3>The vendor qualifies the ask</h3>
            <p>
              A vendor states the specific initiative or problem. That context
              is shown to the leader, who decides freely. No obligation.
            </p>
          </li>
          <li>
            <h3>The conversation funds a cause</h3>
            <p>
              One focused conversation happens, and $1,000 goes to the
              leader&apos;s chosen registered charity.
            </p>
          </li>
        </ol>
        <p>
          A vendor states a specific need, the leader approves only what fits,
          one short conversation happens, and $1,000 goes to their chosen
          charity.
        </p>
      </section>

      <section>
        <p>Where the money goes</p>
        <h2>The money flow, exactly.</h2>
        <p>$1,000</p>
        <ul>
          <li>To the chosen charity, per meeting — the full meeting gift</li>
          <li>Platform admin fee — paid by the vendor, a separate named line</li>
          <li>Taken from the donation — nothing</li>
        </ul>
        <p>
          The charity figure stays whole on purpose. Running costs are
          recovered through the named admin fee, so the two numbers never get
          blended.
        </p>
        <ul>
          <li>After the meeting — the donation is sent to the leader&apos;s chosen registered charity</li>
          <li>Confirmation — in writing, every time</li>
          <li>The admin fee — is the vendor&apos;s, never blended with the gift</li>
        </ul>
      </section>

      <section>
        <p>Choosing the charity</p>
        <h2>The leader decides, every time.</h2>
        <p>
          The executive directs where the donation goes, to their chosen
          registered charity. It is their conversation and their cause. At
          launch we are Australia first, so the giving stays local and
          verifiable while the model is proven.
        </p>
      </section>

      <section>
        <p>Questions</p>
        <h2>Good things to ask.</h2>
        <details open>
          <summary>Who pays for the meeting?</summary>
          <p>
            The vendor. It is free for executives. The vendor funds both the
            charity gift and the separate admin fee.
          </p>
        </details>
        <details>
          <summary>Can a leader decline a request?</summary>
          <p>
            Always. Seeing the stated reason first means declining is easy
            and normal. There is no penalty and no obligation.
          </p>
        </details>
        <details>
          <summary>Why Australia first?</summary>
          <p>
            Starting in one market keeps the charity giving verifiable and the
            quality high while the model is proven.
          </p>
        </details>
      </section>

      <section>
        <p>The first cohort</p>
        <h2>Be part of shaping it.</h2>
        <p>
          Invite only and small on purpose. Founding members help decide how
          this works in practice.
        </p>
        <p>
          <a href={CALENDLY_URL}>Start a conversation</a>
        </p>
      </section>

      <section>
        <p>The invitation</p>
        <h2>See it work for you.</h2>
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
