import heroMuseAsset from "@/assets/hero-lilla-portofino-waterfront-floral.png.asset.json";

/**
 * Featured Destination — single source of truth for the homepage editorial cover.
 *
 * To rotate the homepage spotlight to a new destination, swap
 * `featuredDestinationSlug` and add a matching entry below. No layout changes
 * required.
 */

export type FeaturedMoment = {
  /** Display label shown in the hero chapter rail. */
  label: string;
  /** Canonical moment slug — links to `/portofino/$moment` etc. */
  slug: string;
};

export type FeaturedDestination = {
  slug: string;
  name: string;
  country: string;
  heroImage: string;
  heroImageAlt: string;
  tagline: string;
  /** Total curated looks across the trip. */
  totalLooks: number;
  /** Total destination moments / chapters. */
  totalMoments: number;
  /** Primary CTA href — typically the destination landing page. */
  primaryCtaHref: string;
  /** Ordered chapter rail shown beneath the CTAs. */
  momentLabels: FeaturedMoment[];
};

export const featuredDestinationSlug = "portofino";

const FEATURED_DESTINATIONS: Record<string, FeaturedDestination> = {
  portofino: {
    slug: "portofino",
    name: "Portofino",
    country: "Italy",
    heroImage: heroMuseAsset.url,
    heroImageAlt:
      "Lilla walking along the Portofino waterfront in an elegant floral resort dress overlooking the Italian Riviera.",
    tagline: "Dressed for the destination.",
    totalLooks: 25,
    totalMoments: 9,
    primaryCtaHref: "/portofino",
    momentLabels: [
      { label: "Arrival Day", slug: "arrival-day" },
      { label: "Market Morning", slug: "market-morning" },
      { label: "Yacht Day", slug: "yacht-day" },
      { label: "Harbor Aperitivo", slug: "harbor-aperitivo" },
      { label: "Sunset Views", slug: "sunset-views" },
      { label: "Riviera Dinner", slug: "riviera-dinner" },
    ],
  },
};

export function getFeaturedDestination(
  slug: string = featuredDestinationSlug,
): FeaturedDestination {
  const dest = FEATURED_DESTINATIONS[slug];
  if (!dest) {
    throw new Error(`No featured destination configured for slug: ${slug}`);
  }
  return dest;
}