#!/usr/bin/env node
// Honest live probe for the category_scrape provider.
//
// Hits ONE category page per retailer (page 1 only), extracts JSON-LD product
// cards, and reports how many real candidates each retailer yields. This is
// the empirical floor for SS-2026-06-28-001; a full deep_buy sweep multiplies
// these numbers by (categories × pages).
//
// Usage:
//   FIRECRAWL_API_KEY=... node scripts/probe-category-scrape.mjs

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";
const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
  console.error("FIRECRAWL_API_KEY not set");
  process.exit(1);
}

// One representative category URL per retailer for Arrival-Day adjacency.
const PROBES = [
  ["revolve.com", "elevated_matching_set", "https://www.revolve.com/womens-matching-sets/br/a8e981/"],
  ["mytheresa.com", "elevated_matching_set", "https://www.mytheresa.com/en-us/clothing/matching-sets.html"],
  ["net-a-porter.com", "elevated_matching_set", "https://www.net-a-porter.com/en-us/shop/clothing/matching-sets"],
  ["shopbop.com", "elevated_matching_set", "https://www.shopbop.com/matching-sets/br/v=1/13474.htm"],
  ["saksfifthavenue.com", "structured_day_dress", "https://www.saksfifthavenue.com/c/women/clothing/dresses/day-dresses"],
  ["neimanmarcus.com", "elevated_matching_set", "https://www.neimanmarcus.com/c/womens-clothing-matching-sets-cat81120732"],
  ["bloomingdales.com", "elevated_matching_set", "https://www.bloomingdales.com/shop/womens-apparel/sets?id=1003186"],
  ["nordstrom.com", "elevated_matching_set", "https://www.nordstrom.com/browse/women/clothing/matching-sets"],
  ["fwrd.com", "structured_day_dress", "https://www.fwrd.com/category-day-dresses/8ab7a2/"],
  ["luisaviaroma.com", "luxury_shirt_dress", "https://www.luisaviaroma.com/en-us/shop/women/clothing/dresses"],
];

async function scrape(url) {
  const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url, formats: ["html"], onlyMainContent: false, waitFor: 1500 }),
  });
  if (!res.ok) return { ok: false, status: res.status, body: await res.text().catch(() => "") };
  const json = await res.json();
  const data = json.data ?? json;
  return { ok: true, html: data.html ?? "", url };
}

function extractProducts(html) {
  const out = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(m[1].trim());
      const blocks = Array.isArray(parsed) ? parsed : [parsed];
      for (const block of blocks) {
        const t = block["@type"];
        const types = Array.isArray(t) ? t : [t];
        if (types.includes("ItemList")) {
          for (const it of block.itemListElement ?? []) {
            const item = it.item ?? it;
            if (item && typeof item === "object") out.push(item);
          }
        } else if (types.includes("Product")) {
          out.push(block);
        }
      }
    } catch {}
  }
  return out;
}

console.log("=== category_scrape probe — SS-2026-06-28-001 (page 1 only) ===\n");
let total = 0;
const results = [];
for (const [retailer, category, url] of PROBES) {
  process.stdout.write(`${retailer.padEnd(22)} ${category.padEnd(28)} … `);
  const t0 = Date.now();
  const r = await scrape(url);
  if (!r.ok) {
    console.log(`FAIL http=${r.status} (${Date.now() - t0}ms)`);
    results.push({ retailer, category, cards: 0, fail: r.status });
    continue;
  }
  const products = extractProducts(r.html);
  const namedWithUrl = products.filter((p) => p?.name && (p.url || p["@id"]));
  console.log(`html=${(r.html.length / 1024).toFixed(0)}kb jsonld_products=${products.length} usable=${namedWithUrl.length} (${Date.now() - t0}ms)`);
  results.push({ retailer, category, cards: namedWithUrl.length });
  total += namedWithUrl.length;
}

console.log(`\nTotal usable JSON-LD product cards across 10 retailers, page 1, 1 category each: ${total}`);
console.log("\nProjection for SS-2026-06-28-001 full sweep (8 categories × 4 pages, depth=deep_buy):");
console.log(`  Approx upper bound: ${total} × 8 × 4 = ${total * 32} raw candidates`);
console.log("  (Real yield is lower after dedupe, category coverage gaps, and editorial scoring.)");
console.log("\nResults JSON:");
console.log(JSON.stringify(results, null, 2));