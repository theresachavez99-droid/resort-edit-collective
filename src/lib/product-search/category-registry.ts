// Retailer × Editorial-Category → category-page URL templates.
// Each template supports {page} substitution for pagination.
// Only categories the Founder has approved for Arrival-Day adjacency are listed.
// Adding a category requires a Founder review — do not extend casually.

import type { ApprovedRetailer } from "./provider";

export type EditorialCategoryKey =
  | "tailored_coordinated_short_set"
  | "tailored_linen_set"
  | "vest_short_set"
  | "luxury_shirt_dress"
  | "structured_day_dress"
  | "elevated_matching_set"
  | "tailored_playsuit"
  | "modern_daywear_set";

export interface CategoryEndpoint {
  /** URL template; {page} replaced with 1-based page index. */
  template: string;
  /** Max pages to traverse per Search Depth. */
  maxPages: { quick: number; standard: number; deep_buy: number };
}

type Registry = Partial<
  Record<ApprovedRetailer, Partial<Record<EditorialCategoryKey, CategoryEndpoint[]>>>
>;

const defaultDepth = { quick: 1, standard: 2, deep_buy: 4 };

export const CATEGORY_REGISTRY: Registry = {
  "revolve.com": {
    elevated_matching_set: [
      { template: "https://www.revolve.com/womens-matching-sets/br/a8e981/?pageNum={page}", maxPages: defaultDepth },
    ],
    tailored_coordinated_short_set: [
      { template: "https://www.revolve.com/womens-shorts/br/6a52f8/?pageNum={page}&filter=Style:Tailored", maxPages: defaultDepth },
    ],
    vest_short_set: [
      { template: "https://www.revolve.com/womens-vests/br/d49a2a/?pageNum={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.revolve.com/womens-shirt-dresses/br/64bd00/?pageNum={page}", maxPages: defaultDepth },
    ],
    structured_day_dress: [
      { template: "https://www.revolve.com/womens-day-dresses/br/3a8a91/?pageNum={page}", maxPages: defaultDepth },
    ],
    tailored_playsuit: [
      { template: "https://www.revolve.com/womens-rompers/br/89c12a/?pageNum={page}", maxPages: defaultDepth },
    ],
  },
  "mytheresa.com": {
    elevated_matching_set: [
      { template: "https://www.mytheresa.com/en-us/clothing/matching-sets.html?page={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.mytheresa.com/en-us/clothing/dresses/shirt-dresses.html?page={page}", maxPages: defaultDepth },
    ],
    structured_day_dress: [
      { template: "https://www.mytheresa.com/en-us/clothing/dresses/day-dresses.html?page={page}", maxPages: defaultDepth },
    ],
    tailored_linen_set: [
      { template: "https://www.mytheresa.com/en-us/clothing/matching-sets.html?fabric=linen&page={page}", maxPages: defaultDepth },
    ],
  },
  "net-a-porter.com": {
    elevated_matching_set: [
      { template: "https://www.net-a-porter.com/en-us/shop/clothing/matching-sets?pageNumber={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.net-a-porter.com/en-us/shop/clothing/dresses/shirt-dresses?pageNumber={page}", maxPages: defaultDepth },
    ],
    structured_day_dress: [
      { template: "https://www.net-a-porter.com/en-us/shop/clothing/dresses/day?pageNumber={page}", maxPages: defaultDepth },
    ],
  },
  "shopbop.com": {
    elevated_matching_set: [
      { template: "https://www.shopbop.com/matching-sets/br/v=1/13474.htm?pageOffset={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.shopbop.com/shirtdresses-shop-by-style-dresses/br/v=1/2534374302074587.htm?pageOffset={page}", maxPages: defaultDepth },
    ],
  },
  "saksfifthavenue.com": {
    elevated_matching_set: [
      { template: "https://www.saksfifthavenue.com/c/women/clothing/matching-sets?page={page}", maxPages: defaultDepth },
    ],
    structured_day_dress: [
      { template: "https://www.saksfifthavenue.com/c/women/clothing/dresses/day-dresses?page={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.saksfifthavenue.com/c/women/clothing/dresses/shirtdresses?page={page}", maxPages: defaultDepth },
    ],
  },
  "neimanmarcus.com": {
    elevated_matching_set: [
      { template: "https://www.neimanmarcus.com/c/womens-clothing-matching-sets-cat81120732?page={page}", maxPages: defaultDepth },
    ],
    structured_day_dress: [
      { template: "https://www.neimanmarcus.com/c/womens-clothing-dresses-day-dresses-cat43830737?page={page}", maxPages: defaultDepth },
    ],
  },
  "bloomingdales.com": {
    elevated_matching_set: [
      { template: "https://www.bloomingdales.com/shop/womens-apparel/sets?id=1003186&pageIndex={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.bloomingdales.com/shop/womens-apparel/shirt-dresses?id=23938&pageIndex={page}", maxPages: defaultDepth },
    ],
  },
  "nordstrom.com": {
    elevated_matching_set: [
      { template: "https://www.nordstrom.com/browse/women/clothing/matching-sets?page={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.nordstrom.com/browse/women/clothing/dresses/shirtdresses?page={page}", maxPages: defaultDepth },
    ],
  },
  "fwrd.com": {
    elevated_matching_set: [
      { template: "https://www.fwrd.com/category-matching-sets/4f3e1c/?pageNum={page}", maxPages: defaultDepth },
    ],
    structured_day_dress: [
      { template: "https://www.fwrd.com/category-day-dresses/8ab7a2/?pageNum={page}", maxPages: defaultDepth },
    ],
  },
  "luisaviaroma.com": {
    elevated_matching_set: [
      { template: "https://www.luisaviaroma.com/en-us/shop/women/clothing/jumpsuits-rompers?page={page}", maxPages: defaultDepth },
    ],
    luxury_shirt_dress: [
      { template: "https://www.luisaviaroma.com/en-us/shop/women/clothing/dresses?categories=shirt-dress&page={page}", maxPages: defaultDepth },
    ],
  },
};

export function endpointsFor(
  retailer: ApprovedRetailer,
  category: EditorialCategoryKey,
): CategoryEndpoint[] {
  return CATEGORY_REGISTRY[retailer]?.[category] ?? [];
}
