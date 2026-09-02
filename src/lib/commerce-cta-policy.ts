/**
 * Honest-commerce CTA policy.
 *
 * A CTA that implies a shoppable set ("Shop The Look", "Shop Complete Look",
 * "Shop The Edit", …) may only render when the section it points to actually
 * publishes at least one verified exact-product URL. Zero-link pages remain
 * fully editorial: no shopping CTA, no placeholder products, no "Coming
 * Soon", no prices.
 *
 * Pure and client-safe: imported by the moment route, the launch-slot audit
 * gate (`scripts/audit-launch-slots.ts`), and tests, so the rule cannot
 * drift between runtime and CI.
 */
import { isPublishableProductUrl } from "./shop-url-policy";

export type CommerceRowLike = { url?: string | null };

/** Count rows that carry a verified, publishable exact-product URL. */
export function countShoppableRows(rows: readonly CommerceRowLike[]): number {
  return rows.filter((r) => isPublishableProductUrl(r.url)).length;
}

/**
 * A shoppable-set CTA is allowed only when at least one verified product
 * link exists in the content the CTA points to.
 */
export function shopCtaAllowed(shoppableRowCount: number): boolean {
  return shoppableRowCount > 0;
}
