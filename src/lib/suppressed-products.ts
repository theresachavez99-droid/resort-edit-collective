/**
 * CUSTOMER-FACING PRODUCT SUPPRESSION LIST (temporary code-side gate).
 *
 * SOURCE OF TRUTH: `shop_slot_products.status` / `.last_audit_verdict` in the
 * database. The Complete Look / editorial-card commerce rows still render from
 * the code-side registry (`registry_source` — `momentShopCurated` and
 * `momentEditorialCards`), so audit verdicts recorded on `shop_slot_products`
 * never reach the public page. Until the public page reads
 * `public_shop_slot_display`, this list mirrors the failed audit verdicts so
 * dead products stop rendering.
 *
 * Keying matches the registry (`src/lib/look-registry.ts`):
 *   hero look      → `portofino/<moment>`
 *   editorial look → `portofino/<moment>/<cardKey>`
 *
 * Nothing is deleted from the registry data — entries are gated only. When a
 * live replacement URL arrives, remove the entry here and update the DB row.
 */

export type SuppressedProduct = {
  /** Registry look key. */
  lookKey: string;
  brand: string;
  /** Product name as authored in the registry (prefix match, colorway-tolerant). */
  productName: string;
  /** Audit verdict from shop_slot_products. */
  reason: "404" | "sold_out" | "title_mismatch";
};

export const SUPPRESSED_PRODUCTS: SuppressedProduct[] = [
  // ── 404 ──────────────────────────────────────────────────────
  { lookKey: "portofino/long-lunch", brand: "Dragon Diffusion", productName: "Santa Croce Woven Leather Tote", reason: "404" },
  { lookKey: "portofino/long-lunch/white-eyelet-at-noon", brand: "Dragon Diffusion", productName: "Santa Croce Woven Leather Tote", reason: "404" },
  { lookKey: "portofino/nightcap", brand: "Citizens of Humanity", productName: "Darya Corset Top", reason: "404" },
  { lookKey: "portofino/pool-lounging", brand: "Alexandra Miro", productName: "Zella Bikini Top", reason: "404" },
  { lookKey: "portofino/riviera-dinner", brand: "Jimmy Choo", productName: "Emmie Clutch", reason: "404" },
  { lookKey: "portofino/riviera-dinner/tide-at-blue-hour", brand: "Jennifer Behr", productName: "Mireille Gold Drop Earrings", reason: "404" },
  { lookKey: "portofino/riviera-dinner/tide-at-blue-hour", brand: "Cult Gaia", productName: "Hera Nano Acrylic Clutch", reason: "404" },
  { lookKey: "portofino/riviera-dinner/tide-at-blue-hour", brand: "Aquazzura", productName: "So Nude 105 Leather Sandals", reason: "404" },
  // ── Sold out ─────────────────────────────────────────────────
  { lookKey: "portofino/arrival/butter-light-arrival", brand: "W. Cashmere", productName: "Asteria Cardigan", reason: "sold_out" },
  { lookKey: "portofino/arrival/butter-light-arrival", brand: "Le Specs", productName: "The Muse Sunglasses", reason: "sold_out" },
  { lookKey: "portofino/exploring-the-harbor/eloise-at-noon", brand: "SIMKHAI", productName: "Eloise Lace Maxi Dress", reason: "sold_out" },
  // Suppressed until a live colorway URL arrives.
  { lookKey: "portofino/long-lunch", brand: "L'AGENCE", productName: "Rima Belted Front Zip Midi Dress", reason: "sold_out" },
  { lookKey: "portofino/shopping", brand: "Missoma", productName: "Baya Claw Cuff", reason: "sold_out" },
  { lookKey: "portofino/shopping", brand: "Mister Zimi", productName: "Clara Maxi Dress in Mello", reason: "sold_out" },
  // ── Title mismatch ───────────────────────────────────────────
  { lookKey: "portofino/beach-club", brand: "Poupette St Barth", productName: "Estelle Printed Satin Minidress", reason: "title_mismatch" },
];

const norm = (s: string | null | undefined) =>
  (s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");

function matches(entry: SuppressedProduct, brand: string, name: string): boolean {
  if (norm(entry.brand) !== norm(brand)) return false;
  const a = norm(entry.productName);
  const b = norm(name);
  return a === b || b.startsWith(a) || a.startsWith(b);
}

/** True when this product must not render for the given registry look key. */
export function isSuppressedProduct(
  lookKey: string | null | undefined,
  brand: string | null | undefined,
  productName: string | null | undefined,
): boolean {
  if (!brand || !productName) return false;
  return SUPPRESSED_PRODUCTS.some(
    (e) => (!lookKey || e.lookKey === lookKey) && matches(e, brand, productName),
  );
}

/**
 * True when the product is suppressed for ANY look. Used by surfaces that
 * don't carry a registry look key (e.g. dedicated Complete Look pages).
 */
export function isSuppressedAnywhere(
  brand: string | null | undefined,
  productName: string | null | undefined,
): boolean {
  if (!brand || !productName) return false;
  return SUPPRESSED_PRODUCTS.some((e) => matches(e, brand, productName));
}