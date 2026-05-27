/* Avatar — cartoon-human identity mark, deterministic from name. Ported
   component-for-component from the committed mockup
   (apps/web/app/mockup/_components/avatar.tsx). Uses DiceBear (lorelei) so every
   person gets a consistent illustrated face.

   Note: the brand "no human characters" rule applies to MARKETING-site page
   illustrations. Platform UI avatars use cartoon people on purpose (warmer than
   abstract shapes for "who is this person"). Re-toned to portal tokens: the
   logged-in user's ring is amber, not emerald (emerald stays on the sidebar). */

const DICEBEAR_STYLE = "lorelei";
const DICEBEAR_BG = "F4ECDC,E7DBC2,D8E6D4,E3D8C1"; // cream + tan tones, brand-aligned

function dicebearUrl(seed: string) {
  const u = new URL(`https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg`);
  u.searchParams.set("seed", seed);
  u.searchParams.set("backgroundColor", DICEBEAR_BG);
  u.searchParams.set("backgroundType", "solid");
  u.searchParams.set("radius", "50");
  return u.toString();
}

export type AvatarProps = {
  name: string;
  size?: number;
  ring?: boolean;
};

export function Avatar({ name, size = 36, ring = false }: AvatarProps) {
  return (
    <span
      className="inline-block shrink-0 overflow-hidden"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        boxShadow: ring
          ? "0 0 0 1.5px var(--portal-card), 0 0 0 2.5px var(--border-strong)"
          : "0 0 0 1px var(--portal-line)",
        background: "var(--portal-amber-soft)",
      }}
      aria-hidden
    >
      {/* External SVG — plain img to skip next/image domain config */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dicebearUrl(name)}
        alt=""
        width={size}
        height={size}
        style={{ display: "block", width: "100%", height: "100%" }}
        loading="lazy"
      />
    </span>
  );
}

/* The logged-in user gets an amber ring so their own avatar stands apart from
   vendors / donors / counterparties (emerald is reserved for the sidebar). */
export function UserAvatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 overflow-hidden relative"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        boxShadow: "0 0 0 1.5px var(--portal-card), 0 0 0 2.5px var(--portal-amber)",
        background: "var(--portal-amber-soft)",
      }}
      aria-hidden
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={dicebearUrl(name)}
        alt=""
        width={size}
        height={size}
        style={{ display: "block", width: "100%", height: "100%" }}
        loading="lazy"
      />
    </span>
  );
}
