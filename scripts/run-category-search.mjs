#!/usr/bin/env node
// Live validation harness for the category_scrape provider.
// Re-runs Search Session SS-2026-06-28-001 across editorially equivalent
// Hero Categories (Arrival Day, Tailored Coordinated Short Set + adjacents).
//
// Usage:
//   FIRECRAWL_API_KEY=... node scripts/run-category-search.mjs [--retailers=revolve.com,mytheresa.com] [--depth=quick]
//
// Honest defaults: --depth=quick limits each (retailer × category) to 1 page,
// keeping a full sweep under ~50 Firecrawl scrape calls. Use --depth=deep_buy
// only when you have the budget for a full 10×8×4 sweep (~320 calls).

import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("ts-node/esm", pathToFileURL("./"));

const { makeCategoryScrapeProvider } = await import(
  "../src/lib/product-search/category-scrape-provider.server.ts"
);

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? "true"];
  }),
);

const ALL_RETAILERS = [
  "revolve.com",
  "mytheresa.com",
  "net-a-porter.com",
  "shopbop.com",
  "saksfifthavenue.com",
  "neimanmarcus.com",
  "bloomingdales.com",
  "nordstrom.com",
  "fwrd.com",
  "luisaviaroma.com",
];

const retailers = (args.retailers ? args.retailers.split(",") : ALL_RETAILERS);
const depth = args.depth ?? "quick";

const provider = makeCategoryScrapeProvider({
  categoryKeys: [
    "tailored_coordinated_short_set",
    "tailored_linen_set",
    "vest_short_set",
    "luxury_shirt_dress",
    "structured_day_dress",
    "elevated_matching_set",
    "tailored_playsuit",
    "modern_daywear_set",
  ],
});

const result = await provider.search({
  sessionId: "SS-2026-06-28-001",
  heroCategory: {
    primary: "tailored_coordinated_short_set",
    adjacent: [
      "tailored_linen_set",
      "vest_short_set",
      "luxury_shirt_dress",
      "structured_day_dress",
      "elevated_matching_set",
      "tailored_playsuit",
      "modern_daywear_set",
    ],
  },
  retailers,
  strategy: "editorial_first",
  depth,
  priceCeiling: 1000,
});

const byRetailer = {};
for (const c of result.candidates) {
  byRetailer[c.retailer] = (byRetailer[c.retailer] ?? 0) + 1;
}

console.log("=== Category Scrape Provider — SS-2026-06-28-001 ===");
console.log(`Depth: ${depth}`);
console.log(`Retailers queried: ${retailers.length}`);
console.log(`Pages paginated: ${result.coverage.reduce((s, c) => s + c.pages_paginated, 0)}`);
console.log(`Raw cards found: ${result.coverage.reduce((s, c) => s + c.raw_cards_found, 0)}`);
console.log(`Normalized candidates (deduped, ≤$1000): ${result.candidates.length}`);
console.log("\nBy retailer:");
for (const [r, n] of Object.entries(byRetailer)) console.log(`  ${r}: ${n}`);
console.log("\nCoverage errors:");
for (const c of result.coverage) {
  if (c.errors.length) console.log(`  ${c.retailer}/${c.category}: ${c.errors.join(" | ")}`);
}
console.log("\nTop 10 candidates:");
for (const c of result.candidates.slice(0, 10)) {
  console.log(`  [${c.retailer}] ${c.brand ?? "?"} — ${c.title} — ${c.currency ?? "$"}${c.price ?? "?"}`);
  console.log(`     ${c.source_url}`);
}