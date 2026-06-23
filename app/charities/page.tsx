import Image from "next/image";
import Link from "next/link";
import { ClosingCta } from "../_components/ui";
import { CollectionPageJsonLd } from "../_components/json-ld";
import { CHARITIES } from "@/lib/charities";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Charities. TheGoodIntro.",
  description:
    "Every gift goes to a charity the executive chooses. These are some of the causes leaders can direct their meetings to.",
  path: "/charities",
});

export default function CharitiesIndex() {
  return (
    <>
      <CollectionPageJsonLd
        name="Charities executives can choose"
        description="DGR-endorsed Australian charities an executive can direct a meeting's gift to on TheGoodIntro."
        path="/charities"
        items={CHARITIES.map((c) => ({
          name: c.name,
          path: `/charities/${c.slug}`,
        }))}
      />
      {/* ── Header (white band) ───────────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-10 pt-24 md:pt-32 pb-16 md:pb-20">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--cream-9)" }}
          >
            Charities
          </span>
          <h1
            className="mt-5 font-extrabold tracking-[-0.02em]"
            style={{
              color: "var(--cream-11)",
              fontSize: "clamp(2.25rem, 4.4vw, 3.25rem)",
              lineHeight: 1.04,
              fontFamily: "var(--font-inter), sans-serif",
            }}
          >
            <span className="hp-serif-italic">Good</span> causes we support
          </h1>
          <p
            className="mt-6 max-w-2xl text-[16px] leading-relaxed"
            style={{ color: "var(--cream-9)" }}
          >
            Every gift goes to a charity the executive chooses. These are some
            of the causes leaders can direct their meetings to.
          </p>
        </div>
      </section>

      {/* ── The profiles (oat band) ───────────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-16 md:py-20">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CHARITIES.map((c) => (
              <Link
                key={c.slug}
                href={`/charities/${c.slug}`}
                className="group rounded-2xl border p-6 md:p-7 transition-all duration-200 hover:-translate-y-0.5"
                style={{ background: "var(--cream-1)", borderColor: "var(--hair)" }}
              >
                <div className="relative mb-5 h-9 w-28">
                  <Image
                    src={c.logo}
                    alt=""
                    fill
                    className="object-contain object-left"
                    sizes="112px"
                  />
                </div>
                <div className="text-[17px] font-semibold tracking-tight">
                  {c.name}
                </div>
                <div
                  className="mt-1.5 text-[13px]"
                  style={{ color: "var(--cream-9)" }}
                >
                  {c.tagline}
                </div>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium group-hover:text-primary transition-colors">
                  Read the profile
                  <span aria-hidden>&rarr;</span>
                </span>
              </Link>
            ))}
          </div>
          <p
            className="mt-10 text-sm italic max-w-2xl"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "var(--cream-9)",
            }}
          >
            Executives choose from our curated shortlist and may nominate any
            DGR-endorsed Australian charity.
          </p>
        </div>
      </section>

      <ClosingCta
        eyebrow="The giving"
        title="A relevant meeting,"
        italicWord="a chosen cause."
        lede="Join the waitlist. Executives direct each meeting's gift, $900 to $1,200, to the charity they choose, paid within 14 days and confirmed in writing."
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        secondaryLabel="How the giving works"
        secondaryHref="/giving"
        tone="white"
      />
    </>
  );
}
