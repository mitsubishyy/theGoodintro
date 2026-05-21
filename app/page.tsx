import HeroSection from "./_components/home/hero-section";
import CharityMarqueeSection from "./_components/home/charity-marquee-section";
import TwoSidesSection from "./_components/home/two-sides-section";
import HowItWorksSection from "./_components/home/how-it-works-section";
import ImpactSection from "./_components/home/impact-section";
import CharityGallerySection from "./_components/home/charity-gallery-section";
import FinalCtaSection from "./_components/home/final-cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <CharityMarqueeSection />
      <TwoSidesSection />
      <HowItWorksSection />
      <ImpactSection />
      <CharityGallerySection />
      <FinalCtaSection />
    </>
  );
}
