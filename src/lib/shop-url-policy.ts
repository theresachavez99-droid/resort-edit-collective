/**
 * Shop-URL policy — the single place that decides whether an outbound
 * commerce link points at an exact product detail page (PDP).
 *
 * Previously this logic lived only inside `/portofino/$moment`, so curated
 * data files could ship category, search or homepage links unnoticed. Import
 * this module anywhere a product URL is written, rendered or audited.
 */
import { isHttpUrl } from "./safe-url";

export type ShopUrlKind =
  | "product"
  | "search"
  | "category"
  | "homepage"
  | "placeholder"
  | "unsafe";

export type ShopUrlVerdict = {
  kind: ShopUrlKind;
  /** True only for `kind === "product"`. */
  publishable: boolean;
  reason?: string;
};

const PLACEHOLDER_PREFIXES = ["AFF-", "[INSERT", "[ADD", "[SOURCE", "TODO"];

/** Path segments that indicate a listing/category page rather than a PDP. */
const CATEGORY_SEGMENTS = [
  "/br/",
  "/c/",
  "/category/",
  "/categories/",
  "/shop-all",
  "/new-arrivals",
  "/all-products",
];

/**
 * Locale / region landing paths. Some brand sites 301 a dead PDP to their
 * regional home (e.g. aquazzura.com/us/<sku>.html → aquazzura.com/eu_en),
 * which is a generic redirect, not a product page.
 */
const LOCALE_LANDING = /^\/(?:[a-z]{2}(?:[-_][a-z]{2})?|[a-z]{2}\/[a-z]{2})$/;

function verdict(kind: ShopUrlKind, reason?: string): ShopUrlVerdict {
  return { kind, publishable: kind === "product", ...(reason ? { reason } : {}) };
}

export function classifyShopUrl(url: string | undefined | null): ShopUrlVerdict {
  if (!url || !url.trim()) return verdict("placeholder", "empty URL");
  const raw = url.trim();
  if (PLACEHOLDER_PREFIXES.some((p) => raw.toUpperCase().startsWith(p)))
    return verdict("placeholder", "placeholder token");
  if (!isHttpUrl(raw)) return verdict("unsafe", "not an absolute http(s) URL");

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return verdict("unsafe", "unparseable URL");
  }
  const path = u.pathname.replace(/\/+$/, "");
  const lowerPath = path.toLowerCase();

  // Search-engine and retailer search pages
  if (/(^|\.)(google|bing|duckduckgo)\.[a-z.]+$/.test(u.hostname) && lowerPath.startsWith("/search"))
    return verdict("search", "search-engine result page");
  if (lowerPath.includes("/product-search")) return verdict("search", "retailer product search");
  if (/(^|\/)search$/.test(lowerPath) || lowerPath.includes("/catalogsearch"))
    return verdict("search", "retailer search page");
  for (const key of ["q", "keywords", "keyword", "searchterm", "search"]) {
    if (u.searchParams.has(key) && !lowerPath.includes("/product"))
      return verdict("search", `search query param "${key}"`);
  }

  // Homepage / bare host
  if (path === "" || lowerPath === "/en-us" || lowerPath === "/us/en" || lowerPath === "/en")
    return verdict("homepage", "retailer homepage");
  if (LOCALE_LANDING.test(lowerPath))
    return verdict("homepage", "locale/region landing page");

  // Shopify-style collection listing without a product segment
  if (lowerPath.includes("/collections/") && !lowerPath.includes("/products/"))
    return verdict("category", "collection listing page");
  // Shopify content/landing pages (`/pages/...`) are editorial or collection
  // landings, never a product detail page.
  if (lowerPath.includes("/pages/") && !lowerPath.includes("/products/"))
    return verdict("category", "Shopify content/landing page");
  for (const seg of CATEGORY_SEGMENTS) {
    if (lowerPath.includes(seg)) return verdict("category", `listing path segment "${seg}"`);
  }

  return verdict("product");
}

/** Convenience guard: true only for exact-product URLs that may be published. */
export function isPublishableProductUrl(url: string | undefined | null): url is string {
  return classifyShopUrl(url).publishable;
}