/**
 * Public display policy for Portofino moment pages.
 *
 * The canonical journey (`PORTOFINO_JOURNEY` in
 * `src/lib/portofino-moment-fallbacks.ts`) is the single source of truth for
 * public moment names, sequence, and navigation. Featured-look headings flow
 * through `publicFeaturedTitle`, which (a) applies approved editorial title
 * overrides and (b) guarantees that retired internal/legacy look titles can
 * never render publicly — they fall back to the canonical moment name.
 *
 * Pure and client-safe: imported by the moment route, tests, and CI audits.
 */

/**
 * Legacy internal look titles that must never appear as a public heading.
 * These names predate the canonical moment migration (Aug 2026) and survive
 * only inside legacy lookbook data.
 */
export const RETIRED_LOOK_TITLES: ReadonlySet<string> = new Set([
  "Via Roma Boutiques",
  "Capri Aperitivo",
]);

/**
 * Approved editorial featured-look titles, keyed by canonical moment slug.
 * When present, the override wins over any DB / lookbook-derived candidate.
 */
export const MOMENT_FEATURED_TITLE_OVERRIDES: Record<string, string> = {
  "pool-lounging": "Poolside Glam",
  "long-lunch": "The Long Lunch",
  shopping: "Shopping in Portofino",
  "exploring-the-harbor": "Exploring the Harbor",
};

/**
 * Resolve the public featured-look heading for a moment.
 *
 * Priority: approved editorial override → candidate title (DB or lookbook),
 * unless blank or retired → canonical moment name.
 */
export function publicFeaturedTitle(
  momentSlug: string,
  candidate: string | null | undefined,
  canonicalMomentName: string,
): string {
  const override = MOMENT_FEATURED_TITLE_OVERRIDES[momentSlug];
  if (override) return override;
  const c = candidate?.trim();
  if (!c || RETIRED_LOOK_TITLES.has(c)) return canonicalMomentName;
  return c;
}
