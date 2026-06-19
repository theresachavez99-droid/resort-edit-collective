import type { ProductDNA } from "@/data/productLibrary";

/**
 * Product-image integrity gate.
 *
 * Live product cards on the recommendation rails must render only real
 * retailer/brand photography. This module filters out:
 *   - placeholder images (placehold.co text placeholders)
 *   - SVG sketches / illustrations (founder-library sketch fallbacks)
 *   - empty / unparseable image URLs
 *   - cross-brand image collisions (same image URL assigned to two
 *     different brands — almost always an upload-time mis-assignment)
 *   - exact duplicate image URLs across the rail (keeps first, drops rest)
 *
 * Returns the cleaned list plus an audit trail the caller can log or
 * surface in tooling. Filtering happens BEFORE scoring so a quarantined
 * card is replaced by the next eligible product, not left as a gap.
 */

const PLACEHOLDER_HOSTS = new Set(["placehold.co", "placeholder.com", "via.placeholder.com"]);

export interface ImageAudit {
  invalidUrl: ProductDNA[]; // empty/unparseable/placeholder/sketch
  crossBrandCollision: { url: string; brands: string[] }[];
  duplicateUrl: { url: string; brands: string[] }[];
}

export function isValidProductImage(url: string | undefined | null): boolean {
  if (!url) return false;
  const u = url.trim();
  if (!u) return false;
  // Sketches / illustrations
  if (/\.svg(\?|$)/i.test(u)) return false;
  if (u.includes("/src/assets/products/")) return false;
  // Placeholder services
  try {
    const parsed = new URL(u, "https://placeholder.invalid/");
    if (PLACEHOLDER_HOSTS.has(parsed.hostname.replace(/^www\./, ""))) return false;
  } catch {
    return false;
  }
  return true;
}

/**
 * Source-level allowlist. The Data API already filters to allowed sources,
 * but the static PRODUCT_LIBRARY fallback has no image_source — undefined
 * is treated as ALLOWED for backward compat. Founder DB rows always carry
 * a classification, so quarantined sources are blocked deterministically.
 */
const ALLOWED_SOURCES = new Set([
  "retailer_cdn",
  "brand_cdn",
  "cleaned_thumbnail",
]);
export function isAllowedImageSource(p: ProductDNA): boolean {
  if (!p.imageSource) return true; // static fallback rows
  return ALLOWED_SOURCES.has(p.imageSource);
}

/**
 * Apply integrity rules to a candidate pool. Order is preserved so the
 * caller's ranking (DNA score, activity score, etc.) decides which product
 * survives a collision — the first occurrence wins, the rest are dropped.
 */
export function filterAndDedupImages(
  products: readonly ProductDNA[],
): { kept: ProductDNA[]; audit: ImageAudit } {
  const audit: ImageAudit = {
    invalidUrl: [],
    crossBrandCollision: [],
    duplicateUrl: [],
  };

  // Pass 1: index URL → set of brands across the FULL input (not just
  // valid-URL rows) so cross-brand collisions are detected globally.
  const urlBrands = new Map<string, Set<string>>();
  for (const p of products) {
    if (!isValidProductImage(p.image)) continue;
    if (!isAllowedImageSource(p)) continue;
    const set = urlBrands.get(p.image) ?? new Set<string>();
    set.add(p.brand.toLowerCase());
    urlBrands.set(p.image, set);
  }
  const blacklisted = new Set<string>();
  for (const [url, brands] of urlBrands) {
    if (brands.size > 1) {
      blacklisted.add(url);
      audit.crossBrandCollision.push({ url, brands: [...brands] });
    }
  }

  // Pass 2: walk in input order, keep first valid+unique URL, log the rest.
  const seenUrl = new Map<string, string>(); // url → first brand that took it
  const kept: ProductDNA[] = [];
  for (const p of products) {
    if (!isValidProductImage(p.image)) {
      audit.invalidUrl.push(p);
      continue;
    }
    if (!isAllowedImageSource(p)) {
      audit.invalidUrl.push(p);
      continue;
    }
    if (blacklisted.has(p.image)) {
      // Already logged in crossBrandCollision; suppress all renders.
      continue;
    }
    const firstBrand = seenUrl.get(p.image);
    if (firstBrand) {
      // Duplicate URL — allowed only if it is the exact same product
      // (same brand AND same name). Otherwise quarantined.
      audit.duplicateUrl.push({ url: p.image, brands: [firstBrand, p.brand.toLowerCase()] });
      continue;
    }
    seenUrl.set(p.image, p.brand.toLowerCase());
    kept.push(p);
  }
  return { kept, audit };
}