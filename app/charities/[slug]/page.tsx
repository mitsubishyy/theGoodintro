import Image from "next/image";
import { notFound } from "next/navigation";
import { ClosingCta } from "../../_components/ui";
import { BreadcrumbJsonLd } from "../../_components/json-ld";
import CharityGallery from "../../_components/charity-gallery";
import { CHARITIES, getCharity } from "@/lib/charities";
import { ABN_LOOKUP_URL } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";

// Profiles are generated only for charities in lib/charities.ts.
export const dynamicParams = false;

export function generateStaticParams() {
  return CHARITIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCharity(slug);
  if (!c) return {};
  return pageMetadata({
    title: `${c.name}. TheGoodIntro.`,
    description: `What ${c.name} does, what a gift there funds, and how executives on TheGoodIntro can direct a meeting's gift of $900 to $1,200 to it.`,
    path: `/charities/${c.slug}`,
  });
}

// Deep-link to the ABN Lookup record once the ABN is confirmed; until then
// the [VERIFY...] marker sends readers to the lookup itself.
function abnLookupHref(abn: string): string {
  const digits = abn.replace(/\s/g, "");
  return /^\d{11}$/.test(digits)
    ? `https://abr.business.gov.au/ABN/View?abn=${digits}`
    : ABN_LOOKUP_URL;
}

export default async function CharityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCharity(slug);
  if (!c) notFound();

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Charities", path: "/charities" },
          { name: c.name, path: `/charities/${c.slug}` },
        ]}
      />
      {/* ── Who they are (white band) ─────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-10 pt-24 md:pt-32 pb-16 md:pb-20">
          <div className="relative mb-7 h-12 w-44">
            <Image
              src={c.logo}
              alt={`${c.name} logo`}
              fill
              className="object-contain object-left"
              sizes="176px"
            />
          </div>
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--cream-9)" }}
          >
            Charity profile
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
            {c.name}
          </h1>
          <p
            className="mt-3 font-mono text-[12px] uppercase tracking-[0.18em]"
            style={{ color: "var(--cream-9)" }}
          >
            {c.tagline}
          </p>
          <div
            className="mt-8 max-w-3xl space-y-5 text-lg leading-relaxed"
            style={{ color: "var(--cream-10)" }}
          >
            {c.about.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>

          <CharityGallery logo={c.logo} images={c.images} />

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a
              href={c.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] underline underline-offset-4 hover:text-primary"
              style={{ color: "var(--cream-10)" }}
            >
              {c.website.replace("https://www.", "")}
            </a>
            <a
              href={c.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hp-btn-ghost"
            >
              Donate to {c.name} directly
              <span className="circle" aria-hidden="true">
                <svg viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 11 L11 3 M5 3 H11 V9"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>
          <p
            className="mt-8 text-sm italic max-w-2xl"
            style={{
              fontFamily: "var(--font-fraunces), serif",
              color: "var(--cream-9)",
            }}
          >
            {c.name} is not affiliated with TheGoodIntro. Executives choose
            from our curated shortlist and may nominate any DGR-endorsed
            Australian charity.
          </p>
        </div>
      </section>

      {/* ── What a gift funds (oat band) ──────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-16 md:py-20">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--cream-9)" }}
          >
            {c.impact.heading}
          </span>
          <p
            className="mt-6 max-w-3xl text-lg leading-relaxed"
            style={{ color: "var(--cream-10)" }}
          >
            {c.impact.body}
          </p>
          {c.note && (
            <p
              className="mt-5 max-w-3xl text-[15px] leading-relaxed"
              style={{ color: "var(--cream-9)" }}
            >
              {c.note}
            </p>
          )}
        </div>
      </section>

      {/* ── Registration (white band) ─────────────────────────────── */}
      <section style={{ background: "var(--paper-white)" }}>
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-16 md:py-20">
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--cream-9)" }}
          >
            Registration
          </span>
          <dl className="mt-6 space-y-2 text-[15px] leading-relaxed">
            <div className="flex flex-wrap gap-x-3">
              <dt className="font-semibold" style={{ color: "var(--cream-11)" }}>
                Entity
              </dt>
              <dd style={{ color: "var(--cream-10)" }}>{c.entity}</dd>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <dt className="font-semibold" style={{ color: "var(--cream-11)" }}>
                ABN
              </dt>
              <dd style={{ color: "var(--cream-10)" }}>{c.abn}</dd>
            </div>
            <div className="flex flex-wrap gap-x-3">
              <dt className="font-semibold" style={{ color: "var(--cream-11)" }}>
                DGR status
              </dt>
              <dd style={{ color: "var(--cream-10)" }}>{c.dgr}</dd>
            </div>
          </dl>
          <p className="mt-6 text-[15px]" style={{ color: "var(--cream-9)" }}>
            Check the public record yourself on{" "}
            <a
              href={abnLookupHref(c.abn)}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              ABN Lookup
            </a>
            . Nothing rests on our word.
          </p>
        </div>
      </section>

      {/* ── Fund through a meeting (oat closing) ──────────────────── */}
      <ClosingCta
        eyebrow="The giving"
        title={`Fund ${c.name}`}
        italicWord="through a meeting."
        lede={`Executives on TheGoodIntro direct each meeting's gift, $900 to $1,200 of the vendor's flat fee, to a DGR-endorsed Australian charity they choose. ${c.name} can be that choice, with every gift paid within 14 days and confirmed in writing.`}
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        secondaryLabel="How the giving works"
        secondaryHref="/giving"
        sub="Free for executives · The executive chooses the charity"
        tone="oat"
      />
    </>
  );
}
