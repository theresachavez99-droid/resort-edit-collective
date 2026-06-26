import heroMuseAsset from "@/assets/hero-lilla-portofino-waterfront-floral.png.asset.json";
import {
  PORTOFINO_MOMENT_DEFS,
  PORTOFINO_ADDITIONAL_MOMENT_DEFS,
} from "@/lib/portofino-moment-fallbacks";

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

/**
 * Editorial moment order for Portofino — derived from the canonical
 * moment registries so the homepage hero nav always reflects every
 * published moment without manual updates.
 */
const portofinoMomentLabels: FeaturedMoment[] = [
  ...PORTOFINO_MOMENT_DEFS,
  ...PORTOFINO_ADDITIONAL_MOMENT_DEFS,
].map((m) => ({ label: m.moment_name, slug: m.moment_slug }));

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
    totalMoments: portofinoMomentLabels.length,
    primaryCtaHref: "/portofino",
    momentLabels: portofinoMomentLabels,
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