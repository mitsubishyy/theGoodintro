import Image from "next/image";
import { notFound } from "next/navigation";
import { ClosingCta } from "../../_components/ui";
import { BreadcrumbJsonLd } from "../../_components/json-ld";
import CharityGallery from "../../_components/charity-gallery";
import { getCharity } from "@/lib/charities";
import { HIGHLIGHT_SLUG } from "@/lib/demo";
import { pageMetadata } from "@/lib/metadata";

// Demo site: only the highlighted charity has a profile page.
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ slug: HIGHLIGHT_SLUG }];
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

// Intrinsic pixel dimensions of each logo asset, keyed by charity slug. Used
// so the logo can sit inline beside the name at a uniform height with its own
// natural width (the assets range from wide wordmarks to tall badges). Keep in
// sync if a logo file under /public/charities is replaced.
const LOGO_DIMS: Record<string, { w: number; h: number }> = {
  "leukaemia-foundation": { w: 800, h: 145 },
  rfds: { w: 178, h: 147 },
  ruok: { w: 800, h: 425 },
  headspace: { w: 800, h: 693 },
  starlight: { w: 800, h: 232 },
  "ronald-mcdonald-house": { w: 800, h: 439 },
  "st-vincent-de-paul": { w: 800, h: 132 },
  "childrens-ground": { w: 574, h: 800 },
  "wwf-australia": { w: 537, h: 800 },
  "rspca-australia": { w: 800, h: 258 },
  "guide-dogs-australia": { w: 800, h: 584 },
  "save-the-children": { w: 800, h: 172 },
  "world-vision-australia": { w: 800, h: 166 },
  "cerebral-palsy-alliance": { w: 800, h: 180 },
  "cancer-council-australia": { w: 430, h: 215 },
};

export default async function CharityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCharity(slug);
  if (!c) notFound();

  const logo = LOGO_DIMS[c.slug] ?? { w: 200, h: 80 };

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
          <span
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--cream-9)" }}
          >
            Charity profile
          </span>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Image
              src={c.logo}
              alt={`${c.name} logo`}
              width={logo.w}
              height={logo.h}
              className="h-10 w-auto md:h-12"
              sizes="(max-width: 768px) 40px, 48px"
              priority
            />
            <h1
              className="font-extrabold tracking-[-0.02em]"
              style={{
                color: "var(--cream-11)",
                fontSize: "clamp(2.25rem, 4.4vw, 3.25rem)",
                lineHeight: 1.04,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {c.name}
            </h1>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span
              className="font-mono text-[12px] uppercase tracking-[0.18em]"
              style={{ color: "var(--cream-9)" }}
            >
              {c.tagline}
            </span>
            <span aria-hidden style={{ color: "var(--cream-9)" }}>
              &middot;
            </span>
            <a
              href={c.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] underline underline-offset-4 hover:text-primary"
              style={{ color: "var(--cream-10)" }}
            >
              {c.website.replace("https://www.", "")}
            </a>
          </div>
          <div
            className="mt-8 max-w-3xl space-y-5 text-lg leading-relaxed"
            style={{ color: "var(--cream-10)" }}
          >
            {c.about.map((p) => (
              <p key={p.slice(0, 32)}>{p}</p>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <a
              href={c.donateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hp-btn-primary demo-live-btn inline-flex items-center gap-2"
            >
              <span className="pulse" aria-hidden="true" />
              Donate to {c.name} now
              <span aria-hidden="true" className="inline-flex">
                <svg width="14" height="14" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 8 L8 2 M3.5 2 H8 V6.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </a>
          </div>

          <CharityGallery logo={c.logo} images={c.images} />
        </div>
      </section>

      {/* ── What a gift funds (oat band) ──────────────────────────── */}
      <section
        className="border-y"
        style={{ background: "var(--paper-oat)", borderColor: "var(--border)" }}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-10 py-16 md:py-20">
          <div className="max-w-3xl">
            <h2
              className="font-bold tracking-[-0.02em]"
              style={{
                color: "var(--primary)",
                fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                lineHeight: 1.12,
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {c.impact.heading}
            </h2>
            <div
              className="mt-6 space-y-5 text-lg leading-relaxed"
              style={{ color: "var(--cream-10)" }}
            >
              {c.impact.body.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
            {c.note && (
              <p
                className="mt-6 text-lg leading-relaxed"
                style={{ color: "var(--cream-10)" }}
              >
                {c.note}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Fund through a meeting (white closing) ────────────────── */}
      <ClosingCta
        eyebrow="The giving"
        title={`Fund ${c.name}`}
        italicWord="through a meeting."
        lede={`Executives on TheGoodIntro direct each meeting's gift, $900 to $1,200 of the vendor's flat fee, to a charity they choose. ${c.name} can be that choice, with every gift paid within 14 days and confirmed in writing.`}
        primaryCta="Join the waitlist"
        primaryHref="/waitlist"
        secondaryLabel="How the giving works"
        secondaryHref="/giving"
        sub="Free for executives · The executive chooses the charity"
        tone="white"
      />
    </>
  );
}
