/**
 * Retailer listing-URL builders. Each adapter returns a category-scoped
 * listing URL for a given brand on a given retailer. Used by bulkSourceBrand
 * to drive Firecrawl `map()` over a focused page rather than the whole site.
 */

export type Category = "swimwear" | "dresses" | "coverups" | "shoes" | "bags" | "jewelry" | "sunglasses" | "hats";

type Adapter = (brandSlug: string, brandName: string, category: Category | null) => string;

function slugifyBrand(name: string): string {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const CATEGORY_TO_MYTHERESA: Record<Category, string> = {
  swimwear: "beachwear",
  coverups: "beachwear",
  dresses: "clothing/dresses",
  shoes: "shoes",
  bags: "bags",
  jewelry: "accessories/fine-jewelry",
  sunglasses: "accessories/sunglasses",
  hats: "accessories/hats",
};

const CATEGORY_TO_NAP: Record<Category, string> = {
  swimwear: "clothing/beachwear",
  coverups: "clothing/beachwear",
  dresses: "clothing/dresses",
  shoes: "shoes",
  bags: "bags",
  jewelry: "accessories/fine-jewelry",
  sunglasses: "accessories/sunglasses",
  hats: "accessories/hats",
};

export const RETAILER_ADAPTERS: Record<string, Adapter> = {
  "mytheresa.com": (slug, _name, category) => {
    const cat = category ? CATEGORY_TO_MYTHERESA[category] : "clothing";
    return `https://www.mytheresa.com/en-us/women/${cat}/designers/${slug}`;
  },
  "net-a-porter.com": (slug, _name, category) => {
    const cat = category ? CATEGORY_TO_NAP[category] : "clothing";
    return `https://www.net-a-porter.com/en-us/shop/designer/${slug}/${cat}`;
  },
  "modaoperandi.com": (slug, _name, category) => {
    const cat = category ?? "ready-to-wear";
    return `https://www.modaoperandi.com/women/designers/${slug}/${cat}`;
  },
  "fwrd.com": (_slug, name, category) => {
    const q = encodeURIComponent(`${name} ${category ?? ""}`.trim());
    return `https://www.fwrd.com/search?q=${q}`;
  },
  "shopbop.com": (_slug, name, category) => {
    const q = encodeURIComponent(`${name} ${category ?? ""}`.trim());
    return `https://www.shopbop.com/actions/searchAction.action?searchTerm=${q}`;
  },
};

export function buildListingUrl(
  retailer: string,
  brand: { name: string; slug?: string | null; retailer_hints?: Record<string, string> | null },
  category: Category | null,
): string | null {
  const hint = brand.retailer_hints?.[retailer];
  if (hint) return hint;
  const adapter = RETAILER_ADAPTERS[retailer];
  if (!adapter) return null;
  return adapter(brand.slug || slugifyBrand(brand.name), brand.name, category);
}

export const SUPPORTED_RETAILERS = Object.keys(RETAILER_ADAPTERS);