#!/usr/bin/env node
/**
 * Sources real, currently-listed product detail pages for supporting-look slots
 * from approved affiliate-friendly retailers, then verifies each candidate PDP
 * (HTTP 200 + JSON-LD/price + availability) before it may be published.
 *
 * Usage: node scripts/source-look-products.mjs spec.json > out.json
 * Spec: [{ "id": "moment/look/slot", "query": "Zimmermann midi dress revolve" }]
 */
import { readFile } from "node:fs/promises";

const AGW = process.env.AGW_URL;
const TOKEN = process.env.AGW_TOKEN;

const APPROVED_HOSTS = [
  "revolve.com",
  "shopbop.com",
  "saksfifthavenue.com",
  "neimanmarcus.com",
  "nordstrom.com",
  "bloomingdales.com",
];
const BLOCKED_HOSTS = ["harrods.com"];

const PDP_PATTERNS = [
  /revolve\.com\/[^?]+\/dp\/[A-Z0-9-]+/i,
  /shopbop\.com\/.+\/vp\/v=1\/\d+/i,
  /saksfifthavenue\.com\/product\/.+/i,
  /neimanmarcus\.com\/p\/.+/i,
  /nordstrom\.com\/s\/.+\/\d+/i,
  /bloomingdales\.com\/shop\/product\/.+/i,
];

const isApproved = (url) => {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (BLOCKED_HOSTS.some((h) => host.endsWith(h))) return false;
  return APPROVED_HOSTS.some((h) => host.endsWith(h));
};
const isPdp = (url) => PDP_PATTERNS.some((re) => re.test(url));

async function gateway(path, body) {
  const res = await fetch(`${AGW}${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} failed [${res.status}]: ${await res.text()}`);
  return res.json();
}

async function search(query) {
  const data = await gateway("/f/websearch/search", { query, numResults: 8, contents: { text: true } });
  return (data.results ?? []).filter((r) => {
    try {
      return isApproved(r.url) && isPdp(r.url);
    } catch {
      return false;
    }
  });
}

/**
 * Fetches a PDP and verifies it is a live product detail page.
 * Retailer pages are JS-rendered and expose no JSON-LD through the fetch
 * gateway, so verification reads the rendered page: HTTP 200, a real product
 * title (not a 404/search/category shell), a plausible price, and no
 * page-level sold-out signal.
 */
async function verify(url, snippet = "") {
  const data = await gateway("/f/website-fetch/v1/scrape", { url, formats: ["markdown"] });
  const md = data?.data?.markdown ?? "";
  const status = data?.data?.metadata?.statusCode;
  const rawTitle = data?.data?.metadata?.title ?? "";
  if (status !== 200 || !md) return { ok: false, reason: `status ${status}` };
  if (/page not found|404|search results|shop all|we couldn't find/i.test(rawTitle)) {
    return { ok: false, reason: `non-product title: ${rawTitle}` };
  }

  const title = rawTitle.replace(/\s*[|-]\s*(REVOLVE|Nordstrom|Saks Fifth Avenue|SHOPBOP|Shopbop|Bloomingdale's|Neiman Marcus).*$/i, "").trim();

  // Price lines that are promotions, financing, or gift add-ons are excluded.
  const priceFrom = (text) =>
    text
      .split("\n")
      .filter((line) => !/off\b|cardmember|points|interest-free|pay in 4|gift bag|shipping|reward/i.test(line))
      .flatMap((line) => line.match(/\$[0-9][0-9,]*(?:\.[0-9]{2})?/g) ?? [])
      .map((p) => p.replace(/\.00$/, ""))
      .find((p) => Number(p.replace(/[$,]/g, "")) >= 45);

  const price = priceFrom(snippet) ?? priceFrom(md.slice(0, 8000));

  // Sold-out signals only count when they sit in the main product block, not in
  // recommendation rails further down the page.
  const soldOut = /sold out|out of stock|no longer available/i.test(md.slice(0, 2500));

  return {
    ok: !soldOut,
    reason: soldOut ? "sold out signal on page" : "",
    title,
    // Rendered retailer markdown mixes the product price with rail prices, so a
    // page price is reported as a hint only and is never published verbatim.
    priceHint: price,
    soldOut,
  };
}

/** Slot-appropriate keywords a candidate product title must satisfy. */
const SLOT_KEYWORDS = {
  Dress: /dress|kaftan|caftan|gown/i,
  Kaftan: /kaftan|caftan|dress|robe/i,
  "Cover-Up": /caftan|kaftan|cover ?-?up|robe|tunic/i,
  Sarong: /sarong|pareo|wrap/i,
  Swim: /swim|bikini|one[- ]piece|maillot/i,
  Skirt: /skirt/i,
  Shorts: /short/i,
  Trousers: /pant|trouser/i,
  Shirt: /shirt|blouse|top/i,
  Top: /top|blouse|cami|shirt/i,
  Shoes: /sandal|pump|espadrille|flat|mule|slide|slingback|heel|wedge|loafer|ballet/i,
  Bag: /bag|tote|clutch|pouch|basket|hobo|satchel/i,
  Earrings: /earring|hoop|huggie/i,
  Necklace: /necklace|pendant|lariat|collar|chain/i,
  Bracelet: /bracelet|bangle|cuff/i,
  Ring: /\bring\b|\brings\b/i,
  Sunglasses: /sunglass/i,
  Hat: /hat|visor/i,
};

/** True when the candidate title is a real, correctly-slotted women's product. */
function titleMatchesSlot(title, slot, brand) {
  if (!title) return false;
  if (/category index|designers|shop all|collection|new arrivals|search/i.test(title)) return false;
  if (/\(men\)|\bmen's\b/i.test(title)) return false;
  const slotKey = Object.keys(SLOT_KEYWORDS).find((k) => slot.includes(k));
  const slotRe = slotKey ? SLOT_KEYWORDS[slotKey] : null;
  if (slotRe && !slotRe.test(title)) return false;
  // Rings must not be satisfied by "earring"/"wrap ring detail" style titles.
  if (slotKey === "Ring" && /earring/i.test(title)) return false;
  if (slotKey === "Necklace" && /bracelet|earring/i.test(title)) return false;
  if (slotKey === "Bracelet" && /necklace|earring/i.test(title)) return false;
  if (brand) {
    const token = brand.toLowerCase().replace(/[^a-z ]/g, " ").trim().split(" ")[0];
    if (token.length > 2 && !title.toLowerCase().includes(token)) return false;
  }
  return true;
}

const pool = async (items, limit, fn) => {
  const out = [];
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (i < items.length) {
        const idx = i++;
        out[idx] = await fn(items[idx]).catch((e) => ({ error: String(e) }));
      }
    })
  );
  return out;
};

const spec = JSON.parse(await readFile(process.argv[2], "utf8"));

const results = await pool(spec, 8, async (entry) => {
  const queries = entry.queries ?? [entry.query];
  const candidates = (await Promise.all(queries.map((q) => search(q).catch(() => [])))).flat();
  const seen = new Set();
  for (const candidate of candidates.filter((c) => !seen.has(c.url) && seen.add(c.url)).slice(0, 6)) {
    const v = await verify(candidate.url, candidate.text ?? "");
    if (v.ok && titleMatchesSlot(v.title, entry.slot ?? "", entry.brand)) {
      return { ...entry, status: "verified", url: candidate.url, ...v };
    }
  }
  return {
    ...entry,
    status: "unsourced",
    tried: candidates.slice(0, 6).map((c) => c.url),
  };
});

process.stdout.write(JSON.stringify(results, null, 2));
