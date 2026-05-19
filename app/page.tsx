import Link from "next/link";
import { CallButton } from "./_components/call-button";
import { CountUp } from "./_components/count-up";

// Homepage — Warm Manifesto / Philanthropic Forest. Mirrors
// mockups/leap-manifesto-v2.html (scaled up ~12% in globals.css).
export default function Home() {
  return (
    <>
      {/* ===================== HERO ===================== */}
      <header className="hero">
        <div className="blob blob-1" aria-hidden="true">
          <svg viewBox="0 0 600 600">
            <path
              fill="var(--shape-coral)"
              d="M455 95c64 52 102 138 88 219-14 80-79 156-160 188-82 33-180 22-238-32-58-53-77-149-52-235 25-87 95-163 178-182 84-19 119-10 184 42z"
            />
          </svg>
        </div>
        <div className="blob blob-2" aria-hidden="true">
          <svg viewBox="0 0 460 460">
            <path
              fill="var(--shape-mint-soft)"
              d="M360 92c50 47 70 132 50 200-21 69-82 118-152 130-71 12-150-12-186-72-36-61-28-158 22-214 50-57 138-79 206-58 30 9 38 13 60 14z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="hero-inner">
            <div className="chips">
              <span className="chip">
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" className="ln-c" strokeWidth="2.4" />
                  <path d="M8.5 12.5l2.4 2.4 4.6-5.4" className="ln-c" strokeWidth="2.4" />
                </svg>
                Invite only
              </span>
              <span className="chip">
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="8.5" className="ln-m" strokeWidth="2.4" />
                  <path d="M12 8v5M12 16h.01" className="ln-m" strokeWidth="2.4" />
                </svg>
                Australia first
              </span>
              <span className="chip">
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M12 19c-6-4-9-7.5-9-11a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3.5-3 7-9 11z"
                    className="ln-c"
                    strokeWidth="2.4"
                  />
                </svg>
                Funds charity
              </span>
            </div>
            <h1>
              Meetings that fund <span className="mk">what matters</span>.
            </h1>
            <p className="lede">
              You take a handful of conversations worth your time. Each one
              sends $1,000 to a charity you choose.
            </p>
            <div className="cta">
              <CallButton>Apply as a founding executive</CallButton>
              <Link className="inl" href="/vendors">
                Are you a vendor? <span className="arr">&rarr;</span>
              </Link>
            </div>
            <p className="trust">
              No cold pitches. No hard sells. Every meeting funds a cause that
              matters to you.
            </p>
          </div>
        </div>
      </header>

      {/* ===================== WHY THIS EXISTS ===================== */}
      <section className="manifesto" id="why">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 560 560">
            <path
              fill="var(--shape-coral-soft)"
              d="M420 78c62 50 100 140 84 222-16 81-86 152-168 178-82 25-176 4-228-56-52-61-62-163-26-244 36-82 118-142 200-150 56-6 76 0 138 50z"
            />
          </svg>
        </div>
        <div className="blob blob-b" aria-hidden="true">
          <svg viewBox="0 0 400 400">
            <path
              fill="var(--shape-mint-soft)"
              d="M312 76c44 42 62 118 44 178-18 61-72 104-134 114-62 11-132-12-162-66-30-55-22-142 24-188 46-47 122-64 184-44 26 9 32 12 44 6z"
            />
          </svg>
        </div>
        <div className="wrap-narrow reveal">
          <span className="eyebrow">Why this exists</span>
          <p className="pull">
            Your calendar is full of{" "}
            <span className="accent">pitches that go nowhere.</span>
          </p>
          <p className="body-after">
            What if the few conversations worth having also did some good? That
            is the whole idea. Fewer, more relevant meetings, each one sending
            $1,000 to a cause you care about.
          </p>
        </div>
      </section>

      {/* ===================== HOW IT WORKS ===================== */}
      <section className="how" id="how">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 500 500">
            <path
              fill="var(--shape-mint-soft)"
              d="M380 84c54 46 78 130 60 200-18 70-78 124-150 142-72 18-158-4-200-62-42-58-40-152 6-208 46-57 132-86 204-66 38 11 50 16 80-6z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">How it works</span>
            <h2>Three steps, for executives.</h2>
          </div>
          <div className="beats">
            <div className="beat reveal">
              <div className="beat-n">
                01
                <span className="ico" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                    <path
                      d="M14 14h26a8 8 0 0 1 8 8v12a8 8 0 0 1-8 8H26l-11 9V22a8 8 0 0 1 8-8z"
                      className="ln"
                      strokeWidth="2.8"
                    />
                    <path d="M24 26h16M24 32h10" className="ln" strokeWidth="2.8" />
                    <circle cx="44" cy="44" r="3" fill="#1f5d45" />
                  </svg>
                </span>
              </div>
              <div className="beat-c">
                <h3>You decide what&apos;s relevant</h3>
                <p>
                  Tell us the priorities you want to talk about. Nothing outside
                  that ever reaches you.
                </p>
              </div>
            </div>
            <div className="beat reveal">
              <div className="beat-n">
                02
                <span className="ico" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                    <path
                      d="M40 12H18a4 4 0 0 0-4 4v32a4 4 0 0 0 4 4h28a4 4 0 0 0 4-4V22z"
                      className="ln"
                      strokeWidth="2.8"
                    />
                    <path d="M40 12v10h10" className="ln" strokeWidth="2.8" />
                    <path d="M23 38l5 5 10-11" className="ln-c" strokeWidth="3" />
                  </svg>
                </span>
              </div>
              <div className="beat-c">
                <h3>You get qualified requests</h3>
                <p>
                  A vendor must state the specific initiative or problem before
                  they can ask. You see the reason, and you decide.
                </p>
              </div>
            </div>
            <div className="beat reveal">
              <div className="beat-n">
                03
                <span className="ico" aria-hidden="true">
                  <svg width="40" height="40" viewBox="0 0 64 64" fill="none">
                    <path
                      d="M13 16h24a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6H22l-9 8V22a6 6 0 0 1 0-6z"
                      className="ln"
                      strokeWidth="2.8"
                    />
                    <path
                      d="M35 30h12a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5l5 6-9-6h-9a5 5 0 0 1-5-5"
                      className="ln-m"
                      strokeWidth="2.8"
                    />
                  </svg>
                </span>
              </div>
              <div className="beat-c">
                <h3>One focused conversation</h3>
                <p>
                  You have one focused conversation, and $1,000 goes to the
                  charity you choose.
                </p>
              </div>
            </div>
          </div>
          <p className="loopline reveal">
            A vendor states a specific need, you approve only what fits, you
            have one short conversation, and $1,000 goes to your chosen charity.
          </p>
        </div>
      </section>

      {/* ===================== WHERE THE MONEY GOES ===================== */}
      <section className="money" id="money">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 680 680">
            <path
              fill="var(--shape-coral)"
              d="M510 96c74 60 116 162 98 256-18 92-96 174-190 204-94 30-204 8-264-62-60-70-72-186-30-280 42-94 138-162 232-170 64-6 80 0 154 52z"
            />
          </svg>
        </div>
        <div className="blob blob-b" aria-hidden="true">
          <svg viewBox="0 0 360 360">
            <path
              fill="var(--shape-mint-soft)"
              d="M280 70c40 38 56 106 40 160-16 55-64 94-120 102-56 9-118-12-146-60-28-49-20-128 22-170 42-43 110-58 166-40 24 8 30 11 38 8z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">Where the money goes</span>
            <h2>Full transparency.</h2>
          </div>
          <div className="reveal">
            <div className="bigmoment">
              <div className="bignum">
                <CountUp value={1000} prefix="$" />
                <span className="heart" aria-hidden="true">
                  <svg width="78" height="78" viewBox="0 0 64 64" fill="none">
                    <path
                      d="M32 53C19 44 12 35 12 25a10 10 0 0 1 20-5 10 10 0 0 1 20 5c0 10-7 19-20 28z"
                      className="ln-c"
                      strokeWidth="3"
                    />
                    <path
                      d="M32 23v18M27 28a5 5 0 0 1 5-4 4 4 0 0 1 0 8 4 4 0 0 0 0 8 5 5 0 0 1-5-4"
                      className="ln-c"
                      strokeWidth="2.6"
                    />
                  </svg>
                </span>
              </div>
              <p className="saying">
                goes to the cause you choose, every single meeting.
              </p>
            </div>
            <div className="mlines">
              <div className="r">
                <span className="k">To your chosen charity, per meeting</span>
                <span className="v">the full meeting gift</span>
              </div>
              <div className="r">
                <span className="k">Platform admin fee</span>
                <span className="v">paid by the vendor, never you</span>
              </div>
              <div className="r">
                <span className="k">What it costs you</span>
                <span className="v">nothing, ever</span>
              </div>
            </div>
            <p className="body-after">
              Every dollar of the gift reaches the charity. The platform covers
              its costs through a clearly named admin fee paid by the vendor,
              never taken from the donation.
            </p>
          </div>
          <div className="giveflow reveal">
            <div className="gf">
              <span className="gf-k">After the meeting</span>
              <span className="gf-v">
                the donation is sent to your chosen registered charity
              </span>
            </div>
            <div className="gf">
              <span className="gf-k">You get confirmation</span>
              <span className="gf-v">in writing, every time</span>
            </div>
            <div className="gf">
              <span className="gf-k">The admin fee</span>
              <span className="gf-v">
                is the vendor&apos;s, billed separately
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== CAUSES BAND ===================== */}
      <section className="causes-sec" id="causes">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 440 440">
            <path
              fill="var(--shape-mint-soft)"
              d="M340 84c48 42 68 116 50 178-18 63-72 108-134 118-62 11-132-14-162-68-30-55-22-140 22-184 44-45 116-62 178-42 28 9 34 12 46-2z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow mint">Causes you could choose</span>
            <h2>Real causes, your call.</h2>
          </div>
          <div className="causes reveal">
            <span className="cause">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"
                  className="ln-c"
                  strokeWidth="2.2"
                />
              </svg>
              Health and medical research
            </span>
            <span className="cause">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 7l9-4 9 4-9 4z" className="ln-m" strokeWidth="2.2" />
                <path
                  d="M7 9.5V15c0 1.5 5 3 5 3s5-1.5 5-3V9.5"
                  className="ln-m"
                  strokeWidth="2.2"
                />
              </svg>
              Education and young people
            </span>
            <span className="cause">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 21c0-7 3-12 9-15-1 8-4 12-9 15z"
                  className="ln-m"
                  strokeWidth="2.2"
                />
                <path
                  d="M12 21c0-5-2-9-7-11 1 6 3 9 7 11z"
                  className="ln-m"
                  strokeWidth="2.2"
                />
              </svg>
              Environment and climate
            </span>
            <span className="cause">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 20c-5-3.5-8-6.5-8-10a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 3.5-3 6.5-8 10z"
                  className="ln-c"
                  strokeWidth="2.2"
                />
              </svg>
              Community and crisis relief
            </span>
            <span className="cause">
              <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="7" cy="9" r="2.2" className="ln-c" strokeWidth="2" />
                <circle cx="12" cy="6.5" r="2.2" className="ln-c" strokeWidth="2" />
                <circle cx="17" cy="9" r="2.2" className="ln-c" strokeWidth="2" />
                <path
                  d="M8 17c0-3 2-5 4-5s4 2 4 5-2 4-4 4-4-1-4-4z"
                  className="ln-c"
                  strokeWidth="2"
                />
              </svg>
              Animal welfare
            </span>
          </div>
          <p className="note">
            Every donation goes to a registered Australian charity you name.
            These are the kinds of causes it can support.
          </p>
        </div>
      </section>

      {/* ===================== WHAT MAKES THIS DIFFERENT ===================== */}
      <section className="diff" id="diff">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 560 560">
            <path
              fill="var(--shape-coral-soft)"
              d="M420 80c62 52 100 142 82 224-18 82-90 152-172 176-82 24-174 0-224-62-50-62-58-162-20-242 38-81 122-138 204-146 56-4 78 2 130 50z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">What makes this different</span>
            <h2>Built around relevance and giving.</h2>
          </div>
          <div className="difflist reveal">
            <div className="row2">
              <span className="glyph" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 39C14 32 9 26 9 19a7 7 0 0 1 15-3 7 7 0 0 1 15 3c0 7-5 13-15 20z"
                    className="ln"
                    strokeWidth="2.4"
                  />
                  <path d="M19 23l4 4 7-8" className="ln-c" strokeWidth="2.8" />
                </svg>
              </span>
              <div>
                <h3>Qualified by requirement</h3>
                <p>
                  Access is earned, not bought. A vendor states the specific
                  reason a conversation is worth your time, or it never reaches
                  you.
                </p>
              </div>
            </div>
            <div className="row2">
              <span className="glyph" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 40C14 33 8 26 8 18a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 8-6 15-16 22z"
                    className="ln-c"
                    strokeWidth="2.4"
                  />
                  <path d="M24 16v12M19 21h10" className="ln-c" strokeWidth="2.4" />
                </svg>
              </span>
              <div>
                <h3>A deliberately big gift</h3>
                <p>
                  $1,000 a meeting is set high on purpose, so the giving means
                  something, not a token gesture.
                </p>
              </div>
            </div>
            <div className="row2">
              <span className="glyph" aria-hidden="true">
                <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="16" className="ln" strokeWidth="2.4" />
                  <circle cx="24" cy="24" r="8" className="ln" strokeWidth="2.4" />
                  <circle cx="24" cy="24" r="2.6" fill="#1f5d45" />
                </svg>
              </span>
              <div>
                <h3>No fine print</h3>
                <p>
                  The full money flow is on this page. No vague claims, nothing
                  buried in terms.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== WHO THIS IS FOR ===================== */}
      <section className="whofor" id="who-for">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 600 600">
            <path
              fill="var(--shape-mint)"
              d="M450 92c66 56 104 152 86 244-18 92-98 168-192 196-94 28-200 4-258-66-58-70-66-180-24-272 42-93 138-160 232-168 64-6 90 10 156 66z"
            />
          </svg>
        </div>
        <div className="blob blob-b" aria-hidden="true">
          <svg viewBox="0 0 340 340">
            <path
              fill="var(--shape-coral-soft)"
              d="M264 66c38 36 52 100 36 152-16 53-62 90-114 98-52 9-110-12-138-58-28-47-20-122 20-162 40-41 104-56 156-38 22 7 28 10 40 6z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow mint">Who this is for</span>
            <h2>Built for senior leaders.</h2>
            <p className="lede">
              Invite only, and curated on purpose. We are starting with senior
              leaders in Australia whose time is genuinely in demand, and who
              would value a few relevant conversations that also fund a cause
              they choose.
            </p>
          </div>
          <div className="standardrow reveal">
            <div className="std">
              <span className="std-k">The executive</span>
              <p>
                Director, executive or equivalent, where your attention is the
                scarce thing. You set the topics, and nothing outside them
                reaches you.
              </p>
            </div>
            <div className="std">
              <span className="std-k">The bar for vendors</span>
              <p>
                A specific initiative, genuine intent, no hard sell. Held to
                that standard before they can ask.{" "}
                <Link className="inl" href="/vendors">
                  The vendor page &rarr;
                </Link>
              </p>
            </div>
            <div className="std">
              <span className="std-k">Where we start</span>
              <p>
                Australia first, with a small founding cohort, so the first
                members shape how it works.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== YOU STAY IN CONTROL ===================== */}
      <section className="control" id="control">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 520 520">
            <path
              fill="var(--shape-coral-soft)"
              d="M392 78c58 48 92 132 76 208-16 76-82 142-160 166-78 24-166 2-214-56-48-58-56-152-20-228 36-77 116-132 194-140 52-4 66 2 124 50z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="sect-head reveal">
            <span className="eyebrow">What to expect</span>
            <h2>You stay in control, always.</h2>
          </div>
          <div className="control-list reveal">
            <div className="ctl">
              <span className="glyph" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M24 39C14 32 9 26 9 19a7 7 0 0 1 15-3 7 7 0 0 1 15 3c0 7-5 13-15 20z"
                    className="ln"
                    strokeWidth="2.4"
                  />
                  <path d="M19 23l4 4 7-8" className="ln-c" strokeWidth="2.8" />
                </svg>
              </span>
              <p>
                <strong>Every request states its reason.</strong> You see the
                specific initiative before anything happens.
              </p>
            </div>
            <div className="ctl">
              <span className="glyph" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M30 8H14a3 3 0 0 0-3 3v26a3 3 0 0 0 3 3h20a3 3 0 0 0 3-3V15z"
                    className="ln"
                    strokeWidth="2.4"
                  />
                  <path d="M30 8v7h7" className="ln" strokeWidth="2.4" />
                  <path d="M17 28l4 4 9-10" className="ln-c" strokeWidth="2.8" />
                </svg>
              </span>
              <p>
                <strong>You approve or decline each one.</strong> Nothing is
                automatic, and a no needs no explanation.
              </p>
            </div>
            <div className="ctl">
              <span className="glyph" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                  <path
                    d="M10 12h18a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5H17l-7 6V17a5 5 0 0 1 0-5z"
                    className="ln"
                    strokeWidth="2.4"
                  />
                  <path
                    d="M27 23h9a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4l4 5-7-5h-6a4 4 0 0 1-4-4"
                    className="ln-m"
                    strokeWidth="2.4"
                  />
                </svg>
              </span>
              <p>
                <strong>One short conversation, on your terms.</strong> No hard
                sell, and no obligation to meet again.
              </p>
            </div>
            <div className="ctl">
              <span className="glyph" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="16" className="ln" strokeWidth="2.4" />
                  <circle cx="24" cy="24" r="8" className="ln" strokeWidth="2.4" />
                  <circle cx="24" cy="24" r="2.6" fill="#1f5d45" />
                </svg>
              </span>
              <p>
                <strong>Your details are never sold or shared.</strong> You can
                step away at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOUNDING MEMBER ===================== */}
      <section className="founding-sec" id="apply">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 560 560">
            <path
              fill="var(--shape-mint)"
              d="M420 80c62 52 100 142 82 226-18 84-92 156-176 180-84 24-176-2-226-66-50-64-56-166-18-246 38-81 124-138 208-144 56-4 68 4 130 50z"
            />
          </svg>
        </div>
        <div className="blob blob-b" aria-hidden="true">
          <svg viewBox="0 0 380 380">
            <path
              fill="var(--shape-coral-soft)"
              d="M296 74c42 40 58 112 40 170-18 59-70 100-128 108-58 9-122-14-152-66-30-52-22-136 22-178 44-43 114-58 172-38 24 8 30 12 46-6z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="founding reveal">
            <span className="eyebrow mint">The first cohort</span>
            <h2>Join as a founding member.</h2>
            <p>
              We are starting small on purpose. Founding members help shape how
              this works, for the executives who join and the causes they
              support.
            </p>
            <CallButton>Request your place</CallButton>
          </div>
        </div>
      </section>

      {/* ============ FROM THE FOUNDER (the one dark moment) ============ */}
      <section className="founder-sec">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 480 480">
            <path
              fill="var(--shape-coral-soft)"
              d="M360 76c54 46 84 126 68 196-16 70-78 130-152 152-74 22-156 0-202-56-46-56-52-146-16-220 36-75 116-126 190-132 50-4 58 14 112 60z"
            />
          </svg>
        </div>
        <div className="blob blob-b" aria-hidden="true">
          <svg viewBox="0 0 320 320">
            <path
              fill="var(--shape-mint-soft)"
              d="M248 64c36 34 50 96 34 146-16 50-60 86-110 92-50 6-104-14-130-58-26-44-18-114 20-150 38-37 98-50 148-32 20 7 26 10 38 2z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="founder reveal">
            <span className="eyebrow light">From the founder</span>
            <blockquote>
              I kept seeing senior people buried in irrelevant outreach, and
              vendors with something genuine to say unable to get through
              honestly. TheBigIntro fixes both at once, and turns every meeting
              into{" "}
              <span className="hl">
                $1,000 for a cause the executive chooses.
              </span>
            </blockquote>
            <div className="sig-row">
              <div className="ava" aria-hidden="true">
                IH
              </div>
              <div>
                <div className="sig-name">Isobel Hardwick</div>
                <div className="sig-role">Founder</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ===================== */}
      <section className="faq" id="faq">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 500 500">
            <path
              fill="var(--shape-coral-soft)"
              d="M380 82c54 46 78 128 60 198-18 70-78 124-150 142-72 18-156-4-198-62-42-58-40-152 6-208 46-57 130-86 202-66 38 11 50 16 80-4z"
            />
          </svg>
        </div>
        <div className="wrap-narrow">
          <div className="sect-head reveal">
            <span className="eyebrow">Questions</span>
            <h2>Good things to ask.</h2>
          </div>
          <div className="reveal">
            <details open>
              <summary>
                Is this just a sales meeting in disguise?
                <span className="i" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>
                No. A vendor cannot reach you without stating a specific,
                relevant reason, and the conversation is about your priorities,
                not a hard sell.
              </p>
            </details>
            <details>
              <summary>
                Which charities can I choose?
                <span className="i" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>
                Any registered charity you choose. You name it, and that is
                exactly where your $1,000 goes.
              </p>
            </details>
            <details>
              <summary>
                What does it cost an executive?
                <span className="i" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>
                Nothing. It is free for executives. Vendors pay, and that is
                what funds the donation to your charity.
              </p>
            </details>
            <details>
              <summary>
                Why founding members?
                <span className="i" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>
                We are starting deliberately small so the first members shape
                how this works.
              </p>
            </details>
            <details>
              <summary>
                How much of my time is this?
                <span className="i" aria-hidden="true">
                  +
                </span>
              </summary>
              <p>
                One short, focused conversation. You only take the ones you
                choose.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* ===================== CLOSING CTA ===================== */}
      <section className="closing">
        <div className="blob blob-a" aria-hidden="true">
          <svg viewBox="0 0 720 720">
            <path
              fill="var(--shape-coral)"
              d="M540 100c78 64 122 172 102 270-20 98-102 184-202 216-100 32-216 8-280-66-64-74-76-196-32-296 44-100 146-170 246-178 68-6 88 0 166 54z"
            />
          </svg>
        </div>
        <div className="blob blob-b" aria-hidden="true">
          <svg viewBox="0 0 440 440">
            <path
              fill="var(--shape-mint-soft)"
              d="M340 82c50 44 72 122 54 188-18 67-72 116-134 126-62 11-132-14-162-68-30-55-22-142 22-186 44-45 116-62 178-42 28 9 34 12 42-18z"
            />
          </svg>
        </div>
        <div className="wrap">
          <div className="closecard reveal">
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
