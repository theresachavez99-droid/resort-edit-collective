/**
 * CURATED INSTAGRAM STRIP — single source of truth.
 *
 * This is the ONE file to edit when you want to change what appears in
 * "Latest from @resort.edit" on the homepage, the /latest page, or beside a
 * Portofino experience.
 *
 * To add or swap a post:
 *   1. Copy the Instagram post/Reel URL (e.g. https://www.instagram.com/p/ABC123/)
 *   2. Paste it as `postUrl` on a card below, or add a new card.
 *   3. Optionally set a cover `image`, `title` and `caption`.
 *
 * Honesty rules:
 *   - `postUrl` is OPTIONAL. When it is missing the card links to the
 *     @resort.edit profile and is labelled "See on Instagram" — we never
 *     pretend a specific post exists.
 *   - Cover images are our own editorial Portofino imagery, not scraped.
 *   - No prices, no follower/engagement claims.
 */

import arrivalScene from "@/assets/uploads/portofino/arrival-portofino-scene-v2.jpg.asset.json";
import yachtHarbor from "@/assets/uploads/portofino/yacht-day-harbor.png.asset.json";
import longLunch from "@/assets/uploads/portofino/long-lunch-lilla-rima-ice-blue.png.asset.json";
import aperitivoGolden from "@/assets/uploads/portofino/harbor-aperitivo-banner-golden-hour.png.asset.json";
import espressoCafe from "@/assets/uploads/portofino/espresso-morning-banner-cafe-portofino.png.asset.json";
import nightcapPiazzetta from "@/assets/uploads/portofino/nightcap-piazzetta-night-harbor.jpg.asset.json";

export const INSTAGRAM_HANDLE = "@resort.edit";
export const INSTAGRAM_PROFILE_URL = "https://www.instagram.com/resort.edit/";

export type InstagramCardKind = "post" | "reel";

export type InstagramCard = {
  /** Stable key — keep it once shipped. */
  key: string;
  /** Short editorial title shown on the card. */
  title: string;
  /** One-line editorial caption. Keep it short. */
  caption: string;
  /** Cover image URL (project asset). */
  image: string;
  imageAlt: string;
  /** Exact Instagram post/Reel URL. Leave undefined to link to the profile. */
  postUrl?: string;
  kind?: InstagramCardKind;
  /** Optional Portofino experience key this post belongs to. */
  experienceKey?: string;
};

export const INSTAGRAM_CARDS: readonly InstagramCard[] = [
  {
    key: "ig-arrival",
    title: "Arriving by boat",
    caption: "The only entrance Portofino was designed for.",
    image: arrivalScene.url,
    imageAlt: "Portofino harbor at arrival — wooden launch and pastel facades",
    kind: "reel",
    experienceKey: "portofino-private-riviera-boat",
  },
  {
    key: "ig-boat-day",
    title: "A day on the water",
    caption: "Coves, cliffs and the promontory from the sea.",
    image: yachtHarbor.url,
    imageAlt: "Classic boats moored in the Portofino harbor",
    kind: "post",
    experienceKey: "portofino-private-riviera-boat",
  },
  {
    key: "ig-long-lunch",
    title: "The long lunch",
    caption: "Ice blue linen, one more carafe, no plans after.",
    image: longLunch.url,
    imageAlt: "Editorial look for a long harbourside lunch in Portofino",
    kind: "post",
    experienceKey: "portofino-pesto-boat-walk-lunch",
  },
  {
    key: "ig-aperitivo",
    title: "Golden hour aperitivo",
    caption: "The harbor turns apricot around seven.",
    image: aperitivoGolden.url,
    imageAlt: "Portofino harbor at golden hour, aperitivo tables on the quay",
    kind: "post",
    experienceKey: "portofino-sunset-boat-aperitif",
  },
  {
    key: "ig-espresso",
    title: "Espresso, standing up",
    caption: "Piazzetta mornings before the boats fill in.",
    image: espressoCafe.url,
    imageAlt: "Portofino cafe terrace in the early morning",
    kind: "post",
    experienceKey: "portofino-la-portofinese-eco-farm",
  },
  {
    key: "ig-nightcap",
    title: "Last call on the piazzetta",
    caption: "After ten, the harbor belongs to the locals.",
    image: nightcapPiazzetta.url,
    imageAlt: "Portofino piazzetta at night, lights reflected in the harbor",
    kind: "reel",
  },
];

/** The link a card should open — the exact post when we have it, else the profile. */
export function instagramHref(card: InstagramCard): string {
  return card.postUrl ?? INSTAGRAM_PROFILE_URL;
}

/** Label that stays truthful whether or not an exact post URL is set. */
export function instagramCardCta(card: InstagramCard): string {
  if (!card.postUrl) return "See on Instagram";
  return card.kind === "reel" ? "Watch on Instagram" : "View on Instagram";
}

export function latestInstagramCards(limit = 6): InstagramCard[] {
  return INSTAGRAM_CARDS.slice(0, limit);
}

export function instagramCardForExperience(experienceKey: string): InstagramCard | undefined {
  return INSTAGRAM_CARDS.find((c) => c.experienceKey === experienceKey);
}
