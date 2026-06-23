import type { Metadata } from "next";
import { SITE_DESCRIPTION } from "@/lib/config";
import { pageMetadata } from "@/lib/metadata";
import HeroSection from "./_components/home/hero-section";
import WhySection from "./_components/home/why-section";
import CharityMarqueeSection from "./_components/home/charity-marquee-section";
import TwoSidesSection from "./_components/home/two-sides-section";
import HowItWorksSection from "./_components/home/how-it-works-section";
import ImpactSection from "./_components/home/impact-section";
import CharityGallerySection from "./_components/home/charity-gallery-section";
import FinalCtaSection from "./_components/home/final-cta-section";

// Give the homepage an explicit self-canonical + per-page OpenGraph URL.
// (Every other public route already does this via pageMetadata.)
export const metadata: Metadata = pageMetadata({
  title: "TheGoodIntro. Meetings that fund what matters.",
  description: SITE_DESCRIPTION,
  path: "/",
});

export default function Home() {
  return (
    <>
      <HeroSection />
      <WhySection />
      <CharityMarqueeSection />
      <TwoSidesSection />
      <HowItWorksSection />
      <ImpactSection />
      <CharityGallerySection />
      <FinalCtaSection />
    </>
  );
}
