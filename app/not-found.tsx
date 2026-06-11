import { PageHero } from "./_components/ui";

export default function NotFound() {
  return (
    <PageHero
      eyebrow="404"
      title="This page does not exist"
      italicWord="yet"
      lede="The page may have moved, or it is still being built. The rest of the site is one click away."
      primaryCta="Back to home"
      primaryHref="/"
      secondaryLabel="Join the waitlist"
      secondaryHref="/waitlist"
    />
  );
}
