/**
 * Reconciles static portofino.ts ShopItem links against the persisted
 * `brand_intelligence.channel_type` classifications in the database.
 *
 * Source of truth: `founder_reference_products` + `brand_intelligence`.
 * This module mirrors the affiliate_direct_brand list as of Phase 2 Tier 1
 * close-out so that components rendering static look data can attribute
 * each link to the correct channel without an extra round-trip.
 */

export type AffiliateChannel =
  | "affiliate_retailer"
  | "affiliate_direct_brand"
  | "brand_direct";

/** Approved affiliate-retailer domains. Eligibility rules unchanged. */
const APPROVED_RETAILER_DOMAINS = new Set<string>([
  "mytheresa.com",
  "net-a-porter.com",
  "saksfifthavenue.com",
  "neimanmarcus.com",
  "bergdorfgoodman.com",
  "shopbop.com",
  "revolve.com",
  "nordstrom.com",
  "bloomingdales.com",
  "modaoperandi.com",
  "luisaviaroma.com",
  "fwrd.com",
  "ssense.com",
  "everythingbutwater.com",
  "farfetch.com",
]);

/**
 * Brands whose direct sites are registered affiliate partners.
 * Mirrors `brand_intelligence.channel_type = 'affiliate_direct_brand'`.
 */
const AFFILIATE_DIRECT_BRANDS = new Set<string>(
  [
    "Alexandra Miro",
    "Alighieri",
    "Ancient Greek Sandals",
    "Aquazzura",
    "Aranaz",
    "Biankina",
    "Brinker & Eliza",
    "Castañer",
    "Charo Ruiz Ibiza",
    "Cult Gaia",
    "David Yurman",
    "Dragon Diffusion",
    "Emme Parsons",
    "Heimat Atlantica",
    "Hemant & Nandita",
    "Hereu",
    "Jennifer Behr",
    "Jennifer Meyer",
    "Jenny Bird",
    "Johanna Ortiz",
    "Juliet Dunn",
    "Kayu",
    "Krewe",
    "La DoubleJ",
    "Loeffler Randall",
    "Mejuri",
    "Missoma",
    "Oradina",
    "Posse",
    "Retrofête",
    "Significant Other",
    "SIR.",
    "Souliers Martinez",
    "Zimmermann",
  ].map((b) => b.toLowerCase()),
);

function hostFromHref(href: string): string | null {
  if (!href) return null;
  try {
    const u = new URL(href, "https://placeholder.local");
    return u.hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

/** True when the link points at an approved affiliate retailer. */
export function isApprovedRetailerHref(href: string): boolean {
  const host = hostFromHref(href);
  if (!host) return false;
  for (const domain of APPROVED_RETAILER_DOMAINS) {
    if (host === domain || host.endsWith("." + domain)) return true;
  }
  return false;
}

/** True when the brand is a registered affiliate-direct-brand partner. */
export function isAffiliateDirectBrand(brand: string): boolean {
  return AFFILIATE_DIRECT_BRANDS.has(brand.trim().toLowerCase());
}

/**
 * Resolve the affiliate channel for a given (brand, href) pair.
 *
 * Resolution order (matches reconciliation policy):
 *   1. If href is on an approved affiliate retailer  → `affiliate_retailer`
 *   2. Else if brand has affiliate-direct status      → `affiliate_direct_brand`
 *   3. Else                                           → `brand_direct`
 */
export function resolveChannel(brand: string, href: string): AffiliateChannel {
  if (href && isApprovedRetailerHref(href)) return "affiliate_retailer";
  if (isAffiliateDirectBrand(brand)) return "affiliate_direct_brand";
  return "brand_direct";
}

/** True when the link earns affiliate commission under current rules. */
export function isAffiliateEligible(brand: string, href: string): boolean {
  return resolveChannel(brand, href) !== "brand_direct";
}