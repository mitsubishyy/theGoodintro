import Image from "next/image";
import type { CharityImage } from "@/lib/charities";

// Photo gallery for a charity profile: one tall portrait frame beside two
// stacked landscape frames. Frames with a real photo render it; empty frames
// render an on-brand placeholder with the charity logo, so the page always
// looks intentional. Issy fills frames one at a time by adding entries to the
// charity's `images` array in lib/charities.ts.

function Frame({
  image,
  logo,
  aspect,
  sizes,
}: {
  image?: CharityImage;
  logo: string;
  aspect: string;
  sizes: string;
}) {
  return (
    <div
      className={`relative ${aspect} overflow-hidden rounded-2xl`}
      style={{ border: "1px solid var(--hair)" }}
    >
      {image?.src ? (
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover"
          sizes={sizes}
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center"
          style={{ background: "var(--mint-tint)" }}
        >
          <div className="relative h-1/3 w-1/2 opacity-25">
            <Image
              src={logo}
              alt=""
              fill
              className="object-contain"
              sizes="200px"
            />
          </div>
          <span
            className="absolute bottom-3 right-4 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "var(--cream-9)" }}
          >
            Photo
          </span>
        </div>
      )}
    </div>
  );
}

export default function CharityGallery({
  logo,
  images,
}: {
  logo: string;
  images?: CharityImage[];
}) {
  const portrait = images?.find((i) => i.orientation === "portrait");
  const landscapes = images?.filter((i) => i.orientation === "landscape") ?? [];

  return (
    <div className="mt-10 grid gap-3 sm:gap-4 md:grid-cols-2">
      <Frame
        image={portrait}
        logo={logo}
        aspect="aspect-[3/4]"
        sizes="(min-width: 768px) 33vw, 100vw"
      />
      <div className="grid gap-3 sm:gap-4">
        <Frame
          image={landscapes[0]}
          logo={logo}
          aspect="aspect-[4/3]"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
        <Frame
          image={landscapes[1]}
          logo={logo}
          aspect="aspect-[4/3]"
          sizes="(min-width: 768px) 33vw, 100vw"
        />
      </div>
    </div>
  );
}
