/**
 * Normalization helpers for destination + moment values written by the Hero
 * Outfit Studio. The Studio captures human labels (e.g. "Portofino",
 * "Arrival Day"), but every downstream consumer — `/portofino/$moment`,
 * `founder_reference_products` tag matching, `editorial_memory_usages` —
 * expects canonical slugs.
 *
 * Keep this list aligned with `PORTOFINO_MOMENT_DEFS` /
 * `PORTOFINO_ADDITIONAL_MOMENT_DEFS` in `portofino-moment-fallbacks.ts`.
 */

export function slugifyLabel(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Map free-text moment labels to canonical Portofino moment_slug. */
const MOMENT_LABEL_TO_SLUG: Record<string, string> = {
  "arrival-day": "arrival",
  "arrival": "arrival",
  "espresso-morning": "espresso-morning",
  "market-morning": "espresso-morning",
  "yacht-day": "yacht-day",
  "harbor-aperitivo": "harbor-aperitivo",
  "harbour-aperitivo": "harbor-aperitivo",
  "sunset-views": "sunset-views",
  "riviera-dinner": "riviera-dinner",
  "explore-the-harbor": "exploring-the-harbor",
  "exploring-the-harbor": "exploring-the-harbor",
  "beach-club": "beach-club",
  "beach-club-long-lunch": "beach-club",
  "pool-lounging": "pool-lounging",
  "pool-lounging-and-shopping": "pool-lounging",
  "pool-lounging-shopping": "pool-lounging",
  "shopping": "shopping",
  "long-lunch": "long-lunch",
  "nightcap": "nightcap",
};

export function normalizeMomentSlug(input: string | null | undefined): string {
  if (!input) return "";
  const base = slugifyLabel(input);
  return MOMENT_LABEL_TO_SLUG[base] ?? base;
}

export function normalizeDestinationSlug(input: string | null | undefined): string {
  if (!input) return "";
  return slugifyLabel(input);
}