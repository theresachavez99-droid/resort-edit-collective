import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./admin-auth.server";

export const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

/**
 * Approved retailer allowlist for Yacht Day pilot — full Resort Edit
 * affiliate ecosystem. Order is the rotation order used to diversify
 * search coverage so we don't sit on Mytheresa for every brand.
 */
export const APPROVED_RETAILERS = [
  "net-a-porter.com",
  "mytheresa.com",
  "saksfifthavenue.com",
  "neimanmarcus.com",
  "bergdorfgoodman.com",
  "modaoperandi.com",
  "shopbop.com",
  "luisaviaroma.com",
  "harrods.com",
  "bloomingdales.com",
  "nordstrom.com",
  "farfetch.com",
  "fwrd.com",
  "revolve.com",
  "everythingbutwater.com",
] as const;

/** Soft cap — share of accepted finalists allowed for any one retailer. */
const RETAILER_SHARE_CAP = 0.4;

const COLLECTION_PATTERNS = [
  /\/collections?\//i,
  /\/category\//i,
  /\/c\//i,
  /\/search/i,
  /\/shop\/?$/i,
  /\/women\/?$/i,
  /\/sale\/?/i,
  /\/new-in\/?/i,
];

// Per-retailer URL patterns that strongly indicate a real PDP (product detail page).
// When a retailer is listed here, we REQUIRE the pattern to match; otherwise we fall
// back to the looser slug-length heuristic. This eliminates designer index pages
// (/designer/eres), category landings (/shop/clothing/swimwear-and-beachwear),
// and editorial articles from the dry-run candidate list.
const PDP_PATTERNS: Record<string, RegExp> = {
  "mytheresa.com": /-p\d{6,}/i,
  "net-a-porter.com": /\/shop\/product\/.+\/\d{6,}$/i,
  "modaoperandi.com": /\/(?:women|resort)\/.+_cod\d+\.html/i,
  "saksfifthavenue.com": /\/product\/.+-\d{6,}\.html/i,
  "neimanmarcus.com": /\/p\/.+-prod\w+/i,
  "bergdorfgoodman.com": /\/p\/.+-prod\w+/i,
  "shopbop.com": /\/[\w-]+\/vp\/v=1\/\d+\.htm/i,
  "luisaviaroma.com": /\/en-[a-z]{2}\/p\/[\w-]+\/[\w-]+\/\d+-[\w]+/i,
  "harrods.com": /\/p0+\d+/i,
  "bloomingdales.com": /\/shop\/product\/.+\?ID=\d+/i,
  "nordstrom.com": /\/s\/[\w-]+\/\d{6,}/i,
  "farfetch.com": /-item-\d{6,}\.aspx/i,
  "fwrd.com": /\/product-[\w-]+\/[\w]+\/?/i,
  "revolve.com": /\/dp\/[\w-]+\/?/i,
  "everythingbutwater.com": /\/products\/[\w-]+/i,
};

const EXTRA_BLOCK_PATTERNS = [
  /\/designer(s)?\//i,
  /\/brand(s)?\//i,
  /\/editorial\//i,
  /\/stories\//i,
  /\/magazine\//i,
  /\/blog\//i,
  /\/journal\//i,
  /\/gift/i,
  /\/lookbook/i,
];

/**
 * URL-shape prefilter — fired BEFORE any brand/title/silhouette work to bucket
 * obvious non-PDPs (designer / collection / category / editorial landing pages)
 * separately from "URL didn't match the retailer's PDP signature". Keeps the
 * `not_pdp` ledger reflecting genuine PDP-shape failures only.
 */
const PREFILTER_NON_PDP_PATTERNS: RegExp[] = [
  /\/designer(s)?(\/|$)/i,
  /\/shop\/designer(s)?(\/|$)/i,
  /\/brand(s)?(\/|$)/i,
  /\/collection(s)?(\/|$)/i,
  /\/category(\/|$)/i,
  /\/editorial(\/|$)/i,
  /\/stories(\/|$)/i,
  /\/magazine(\/|$)/i,
  /\/journal(\/|$)/i,
  /\/blog(\/|$)/i,
  /\/lookbook(\/|$)/i,
  /\/(porter|the-edit|the-edit-magazine)(\/|$)/i,
  /\/shop\/?$/i,
  /\/women\/?$/i,
  /\/sale(\/|$)/i,
  /\/new-in(\/|$)/i,
];

export function isObviousNonPdp(url: string): boolean {
  try {
    const u = new URL(url);
    return PREFILTER_NON_PDP_PATTERNS.some((re) => re.test(u.pathname));
  } catch {
    return true;
  }
}

/**
 * Google-style negative operators appended to every Firecrawl /search query.
 * Drops most designer-index, collection, and editorial articles before they
 * burn raw-result budget.
 */
export const QUERY_EXCLUSIONS =
  " -inurl:designer -inurl:designers -inurl:collection -inurl:collections" +
  " -inurl:category -inurl:editorial -inurl:stories -inurl:magazine" +
  " -inurl:journal -inurl:blog -inurl:lookbook -inurl:porter";

/**
 * Conservative per-brand alias map. ONLY add aliases when the alias tokens
 * still match the brand exactly — never partial. "Calla" is deliberately
 * NOT a Callas Milano alias because it would collide with Suzie Kondi's
 * "Calla" product line.
 */
const BRAND_ALIASES: Record<string, string[]> = {
  Eres: ["Eres", "ERES"],
  Etro: ["Etro", "ETRO"],
  "Callas Milano": ["Callas Milano", "CALLAS MILANO", "callas-milano", "Callas"],
};

function aliasesFor(brand: string): string[] {
  const list = BRAND_ALIASES[brand];
  if (list && list.length) return list;
  return [brand];
}

/**
 * Per-category query templates. A brand only gets searches for categories
 * it's actually tagged in — we don't run "bikini" against a sandal brand.
 * Yacht Day must surface editorial variety: swim + coverups + resort
 * separates + raffia accessories + sandals + jewelry + sunglasses + bags.
 */
const CATEGORY_QUERY_TEMPLATES: Record<string, string[]> = {
  swimwear: ["{brand} swimsuit", "{brand} bikini", "{brand} one piece"],
  coverups: ["{brand} kaftan", "{brand} pareo", "{brand} cover up"],
  dresses: ["{brand} resort dress", "{brand} linen dress", "{brand} maxi dress"],
  separates: ["{brand} linen pants", "{brand} linen shirt", "{brand} resort skirt"],
  shoes: ["{brand} raffia sandal", "{brand} flat sandal", "{brand} espadrille"],
  bags: ["{brand} raffia tote", "{brand} beach bag", "{brand} woven bag"],
  jewelry: ["{brand} gold hoops", "{brand} pendant necklace"],
  sunglasses: ["{brand} sunglasses", "{brand} cat eye sunglasses"],
  hats: ["{brand} sun hat", "{brand} straw hat"],
};

const YACHT_DAY_CATEGORIES = [
  "swimwear",
  "coverups",
  "dresses",
  "separates",
  "shoes",
  "bags",
  "jewelry",
  "sunglasses",
  "hats",
] as const;

// ──────────────────────────────────────────────────────────────
// Brand identity helpers — normalization + exact-match detection
// ──────────────────────────────────────────────────────────────

/** Lowercase, accent-strip, &→and, drop all non-alphanumerics. */
function normalizeBrand(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "");
}

/** Tokenize text by stripping accents and splitting on non-alphanumerics. */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

/** Brand → its ordered normalized token list, e.g. "Callas Milano" → ["callas","milano"]. */
function brandTokens(brand: string): string[] {
  return tokenize(brand);
}

/**
 * True when `tokens` contains the exact ordered token sequence `needle`.
 * "Calla" (["calla"]) is NOT contained in ["callas","milano"] (no substring
 * matching), and "Callas Milano" (["callas","milano"]) is NOT contained
 * in ["suzie","kondi","calla","dress"]. This is the exact-brand guarantee.
 */
function containsTokenSequence(tokens: string[], needle: string[]): boolean {
  if (needle.length === 0) return false;
  outer: for (let i = 0; i <= tokens.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) {
      if (tokens[i + j] !== needle[j]) continue outer;
    }
    return true;
  }
  return false;
}

type BrandSignals = {
  url: boolean;
  title: boolean;
  description: boolean;
  /** Sources that explicitly carry the brand. Higher = more confidence. */
  matchedSources: string[];
  /** Sources whose tokens look like a *different* brand from the same retailer. */
  conflictingTokens: string[];
};

/**
 * Multi-signal brand detection at the search-result stage. We don't have
 * PDP scrape yet, so we use the three signals Firecrawl /search returns:
 * URL path slug, title, description. The brand must appear as an exact
 * ordered token sequence in at least one signal; matching only in the
 * description is treated as low confidence and rejected.
 */
export function detectBrandSignals(
  brand: string,
  url: string,
  title: string | null,
  description: string | null,
): BrandSignals {
  const needles = aliasesFor(brand).map(brandTokens).filter((n) => n.length > 0);
  let pathTokens: string[] = [];
  try {
    pathTokens = tokenize(new URL(url).pathname);
  } catch {
    /* leave empty */
  }
  const titleTokens = tokenize(title ?? "");
  const descTokens = tokenize(description ?? "");
  const anyContains = (tokens: string[]) =>
    needles.some((n) => containsTokenSequence(tokens, n));
  const matchedSources: string[] = [];
  if (anyContains(pathTokens)) matchedSources.push("url");
  if (anyContains(titleTokens)) matchedSources.push("title");
  if (anyContains(descTokens)) matchedSources.push("description");
  return {
    url: matchedSources.includes("url"),
    title: matchedSources.includes("title"),
    description: matchedSources.includes("description"),
    matchedSources,
    conflictingTokens: [],
  };
}

// ──────────────────────────────────────────────────────────────
// Canonical URL + product-ID extraction (regional dedup)
// ──────────────────────────────────────────────────────────────

/** Region prefixes we strip before hashing. Covers /en-us/, /us/, /en/, /intl/, etc. */
const REGION_PREFIX_RE = /^\/((?:en|fr|it|de|es|jp|kr)[-_][a-z]{2}|[a-z]{2}|intl|international)(?=\/|$)/i;

/**
 * Reduce a URL to a retailer-stable canonical key. Same product surfaced
 * across regional domains/paths collapses to one key.
 */
export function canonicalProductKey(url: string, retailer: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  const host = parsed.hostname.replace(/^www\./, "").replace(/\.(ca|au|uk|jp|de|fr|it|kr|cn|hk)$/i, "");
  let path = parsed.pathname.replace(/\/+$/, "");
  // Strip leading region prefix.
  path = path.replace(REGION_PREFIX_RE, "");
  // Per-retailer ID extraction — collapses /shop/product/{slug}-A/{id} and
  // /shop/product/{slug}-B/{id} (same ID, different paths) to one candidate.
  const idExtractors: Record<string, (p: string, q: URLSearchParams) => string | null> = {
    "mytheresa.com": (p) => p.match(/-p(\d{6,})/i)?.[1] ?? null,
    "net-a-porter.com": (p) => p.match(/\/(\d{6,})\/?$/)?.[1] ?? null,
    "modaoperandi.com": (p) => p.match(/_cod(\d+)\.html/i)?.[1] ?? null,
    "saksfifthavenue.com": (p) => p.match(/-(\d{6,})\.html/i)?.[1] ?? null,
    "neimanmarcus.com": (p) => p.match(/-prod(\w+)/i)?.[1] ?? null,
    "bergdorfgoodman.com": (p) => p.match(/-prod(\w+)/i)?.[1] ?? null,
    "shopbop.com": (p) => p.match(/\/(\d+)\.htm/)?.[1] ?? null,
    "luisaviaroma.com": (p) => p.match(/\/(\d+-[\w]+)/)?.[1] ?? null,
    "harrods.com": (p) => p.match(/\/(p0+\d+)/i)?.[1] ?? null,
    "bloomingdales.com": (_p, q) => q.get("ID"),
    "nordstrom.com": (p) => p.match(/\/(\d{6,})/)?.[1] ?? null,
    "farfetch.com": (p) => p.match(/-item-(\d{6,})\.aspx/i)?.[1] ?? null,
    "fwrd.com": (p) => p.match(/\/product-[\w-]+\/([\w]+)/i)?.[1] ?? null,
    "revolve.com": (p) => p.match(/\/dp\/([\w-]+)/i)?.[1] ?? null,
    "everythingbutwater.com": (p) => p.match(/\/products\/([\w-]+)/i)?.[1] ?? null,
  };
  const id = idExtractors[retailer]?.(path, parsed.searchParams);
  if (id) return `${retailer}#${id.toLowerCase()}`;
  // Fallback — host + normalized path (regional host stripped).
  return `${host}${path.toLowerCase()}`;
}

// ──────────────────────────────────────────────────────────────
// Silhouette inference — used for editorial diversity scoring
// ──────────────────────────────────────────────────────────────

const SILHOUETTE_TOKENS: Record<string, RegExp> = {
  "one-piece": /\b(onepiece|maillot|swimsuit|one\s?piece)\b/i,
  bikini: /\b(bikini|triangle|bandeau)\b/i,
  kaftan: /\b(kaftan|caftan)\b/i,
  pareo: /\b(pareo|sarong|wrap)\b/i,
  "cover-up": /\b(coverup|cover\s?up|tunic)\b/i,
  dress: /\b(dress|maxi|midi|gown)\b/i,
  "linen-pant": /\b(linen|pant|trouser)\b/i,
  shirt: /\b(shirt|blouse|polo)\b/i,
  skirt: /\b(skirt)\b/i,
  sandal: /\b(sandal|espadrille|slide|wedge|mule)\b/i,
  bag: /\b(bag|tote|clutch|basket|pouch)\b/i,
  hat: /\b(hat|fedora|boater|panama)\b/i,
  jewelry: /\b(earring|hoop|bracelet|necklace|pendant|cuff|ring)\b/i,
  sunglasses: /\b(sunglass|shades|cat\s?eye|aviator)\b/i,
};

export function inferSilhouette(title: string | null, url: string): string {
  const hay = `${title ?? ""} ${url}`;
  for (const [name, re] of Object.entries(SILHOUETTE_TOKENS)) {
    if (re.test(hay)) return name;
  }
  return "other";
}

const PALETTE_TOKENS: Record<string, RegExp> = {
  white: /\b(white|ivory|cream|ecru|chalk)\b/i,
  navy: /\b(navy|midnight|indigo)\b/i,
  black: /\b(black|noir)\b/i,
  natural: /\b(natural|tan|sand|raffia|straw|chestnut|cognac|camel)\b/i,
  print: /\b(print|floral|paisley|stripe|gingham|leopard)\b/i,
  red: /\b(red|coral|tomato|rust)\b/i,
  blue: /\b(blue|cobalt|aqua|sky|cerulean)\b/i,
  gold: /\b(gold|brass)\b/i,
};

export function inferPalette(title: string | null): string {
  const hay = title ?? "";
  for (const [name, re] of Object.entries(PALETTE_TOKENS)) {
    if (re.test(hay)) return name;
  }
  return "neutral";
}

// ──────────────────────────────────────────────────────────────
// Editorial scoring — pre-finalist, no PDP scrape required
// ──────────────────────────────────────────────────────────────

const YACHT_FIT_TOKENS = /\b(yacht|resort|riviera|capri|portofino|cruise|sail|sun|beach|seaside)\b/i;
const LUXURY_FABRIC_TOKENS = /\b(silk|linen|raffia|crochet|cashmere|cotton|leather)\b/i;
const STATEMENT_TOKENS = /\b(embellish|sequin|tassel|fringe|broderie|lace)\b/i;

export function editorialScore(input: {
  title: string | null;
  description: string | null;
  silhouette: string;
  /** Legacy fallback signal (deprecated). */
  brandTier?: string | null;
  /** v5 — primary brand-context signal, 0–100. */
  affinity?: number | null;
}): number {
  const hay = `${input.title ?? ""} ${input.description ?? ""}`;
  let s = 0;
  // v5: Editorial Affinity is the primary brand signal. Maps 0–100 onto
  // a 0–3 contribution so an 85+ brand outweighs a luxury-tier fallback.
  if (typeof input.affinity === "number" && input.affinity > 0) {
    s += Math.min(3, (input.affinity / 100) * 3);
  } else if (input.brandTier === "luxury") {
    s += 1; // legacy fallback when no affinity recorded yet
  } else if (input.brandTier === "mid-luxe") {
    s += 0.5;
  }
  if (LUXURY_FABRIC_TOKENS.test(hay)) s += 2;
  if (YACHT_FIT_TOKENS.test(hay)) s += 1;
  if (STATEMENT_TOKENS.test(hay)) s += 1;
  if (input.silhouette !== "other") s += 1;
  return Math.round(s * 100) / 100;
}

export function looksLikePdp(url: string, retailer?: string | null): boolean {
  try {
    const u = new URL(url);
    if (COLLECTION_PATTERNS.some((re) => re.test(u.pathname))) return false;
    if (EXTRA_BLOCK_PATTERNS.some((re) => re.test(u.pathname))) return false;
    if (retailer && PDP_PATTERNS[retailer]) {
      // Strict: must match the retailer's PDP signature.
      return PDP_PATTERNS[retailer].test(u.pathname);
    }
    // Fallback for retailers without a known PDP signature.
    return u.pathname.split("/").filter(Boolean).length >= 2;
  } catch {
    return false;
  }
}

export function retailerOf(url: string): string | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return APPROVED_RETAILERS.find((d) => host === d || host.endsWith(`.${d}`)) ?? null;
  } catch {
    return null;
  }
}

type Candidate = {
  url: string;
  canonicalKey: string;
  title: string | null;
  description: string | null;
  brand: string;
  brand_slug: string;
  brandTier: string | null;
  retailer: string;
  matchedQuery: string;
  category: string;
  silhouette: string;
  palette: string;
  editorialScore: number;
  brandMatchSources: string[];
  alreadyCached: boolean;
};

type RejectionReason =
  | "no_url"
  | "regional_duplicate"
  | "duplicate_product"
  | "duplicate_url"
  | "retailer_not_approved"
  | "not_pdp"
  | "non_pdp_prefiltered"
  | "brand_mismatch"
  | "weak_brand_signal"
  | "duplicate_silhouette"
  | "retailer_share_cap"
  | "per_brand_cap";

type Rejection = {
  reason: RejectionReason;
  url: string;
  requestedBrand: string;
  retailer: string | null;
  detail?: string;
};

export const runYachtDayDryRun = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        maxBrands: z.number().int().min(1).max(30).default(12),
        retailersPerBrand: z.number().int().min(1).max(8).default(3),
        resultsPerSearch: z.number().int().min(1).max(10).default(4),
        maxCandidates: z.number().int().min(5).max(60).default(30),
        maxPerBrand: z.number().int().min(1).max(10).default(3),
        queryTemplates: z.array(z.string().min(3).max(120)).min(1).max(10).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "FIRECRAWL_API_KEY missing" };
    }

    // 1. Pull approved brands tagged Yacht Day across the full editorial
    //    Yacht Day surface — swim + coverups + dresses + separates + shoes
    //    + bags + jewelry + sunglasses + hats. Avoids the all-swimwear bias
    //    of the previous run.
    const { data: brands, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id,name,slug,tier,categories,activities")
      .eq("status", "approved")
      .contains("activities", ["Yacht Day"])
      .overlaps("categories", YACHT_DAY_CATEGORIES as unknown as string[])
      .order("name", { ascending: true })
      .limit(data.maxBrands);

    if (brandErr) return { ok: false as const, error: brandErr.message };
    if (!brands?.length) {
      return {
        ok: false as const,
        error:
          "No approved brands tagged Yacht Day across Yacht Day categories. Tag brands first.",
      };
    }

    // 2. Pre-load existing URLs so we can flag cached candidates
    const { data: vaultUrls } = await supabaseAdmin
      .from("vault_products")
      .select("affiliate_url,direct_product_url");
    const { data: sourcedUrls } = await supabaseAdmin
      .from("sourced_products")
      .select("source_url");

    const cachedSet = new Set<string>();
    vaultUrls?.forEach((r) => {
      if (r.affiliate_url) cachedSet.add(r.affiliate_url);
      if (r.direct_product_url) cachedSet.add(r.direct_product_url);
    });
    sourcedUrls?.forEach((r) => r.source_url && cachedSet.add(r.source_url));

    // 3. For each brand × first N retailers, Firecrawl /search (NO /scrape)
    const accepted: Candidate[] = [];
    const rejections: Rejection[] = [];
    const canonicalSeen = new Map<string, string>(); // key → kept URL
    const seenUrls = new Set<string>();
    let searchesIssued = 0;
    let searchesFailed = 0;
    let rawResultsSeen = 0;
    const errors: string[] = [];

    // Retailer rotation: walk the approved ecosystem starting at a different
    // offset for each brand so the first N retailers per brand vary. This
    // keeps Mytheresa from dominating every brand's coverage.
    const retailerCount = Math.min(data.retailersPerBrand, APPROVED_RETAILERS.length);

    // Track requested-brand stats independent of acceptance.
    const requestedBrands = brands.map((b) => b.name);
    const acceptedBrandSet = new Set<string>();

    for (let bi = 0; bi < brands.length; bi++) {
      const brand = brands[bi];
      const brandCats = (brand.categories ?? []) as string[];
      // Category-specific templates only — never query "bikini" against a sandal brand.
      const templateSet = new Set<string>();
      for (const cat of brandCats) {
        const tpls = data.queryTemplates ?? CATEGORY_QUERY_TEMPLATES[cat];
        tpls?.forEach((t) => templateSet.add(t));
      }
      const templates = Array.from(templateSet);
      if (templates.length === 0) continue;

      // Rotate retailer window per brand.
      const retailers: string[] = [];
      for (let k = 0; k < retailerCount; k++) {
        retailers.push(APPROVED_RETAILERS[(bi + k) % APPROVED_RETAILERS.length]);
      }

      for (const retailer of retailers) {
        for (const template of templates) {
          // Per-brand finalist cap is enforced post-collection (see below);
          // here we cap raw search effort to avoid runaway credits.
          const brandRaw = accepted.filter((c) => c.brand === brand.name).length;
          if (brandRaw >= data.maxPerBrand * 3) break;

          const brandPart = template.replace("{brand}", brand.name);
          const query = `${brandPart} site:${retailer}${QUERY_EXCLUSIONS}`;
          searchesIssued++;
          try {
            const res = await fetch(`${FIRECRAWL_BASE}/search`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ query, limit: data.resultsPerSearch }),
            });
            if (!res.ok) {
              searchesFailed++;
              errors.push(`${brand.name} / "${template}" @ ${retailer}: HTTP ${res.status}`);
              continue;
            }
            const payload = await res.json();
            const root = payload?.data ?? payload;
            const items: any[] =
              (Array.isArray(root) && root) ||
              root?.web ||
              root?.results ||
              root?.data?.web ||
              [];

            for (const item of items) {
              rawResultsSeen++;
              const url: string | undefined = item.url || item.link;
              if (!url) {
                rejections.push({
                  reason: "no_url",
                  url: "",
                  requestedBrand: brand.name,
                  retailer: null,
                });
                continue;
              }

              if (seenUrls.has(url)) {
                rejections.push({
                  reason: "duplicate_url",
                  url,
                  requestedBrand: brand.name,
                  retailer: null,
                });
                continue;
              }
              seenUrls.add(url);

              const matchedRetailer = retailerOf(url);
              if (!matchedRetailer) {
                rejections.push({
                  reason: "retailer_not_approved",
                  url,
                  requestedBrand: brand.name,
                  retailer: null,
                });
                continue;
              }
              if (isObviousNonPdp(url)) {
                rejections.push({
                  reason: "non_pdp_prefiltered",
                  url,
                  requestedBrand: brand.name,
                  retailer: matchedRetailer,
                });
                continue;
              }
              if (!looksLikePdp(url, matchedRetailer)) {
                rejections.push({
                  reason: "not_pdp",
                  url,
                  requestedBrand: brand.name,
                  retailer: matchedRetailer,
                });
                continue;
              }

              const title = item.title ?? item.metadata?.title ?? null;
              const description =
                item.description ?? item.snippet ?? item.metadata?.description ?? null;

              // EXACT brand match across URL + title + description.
              const sig = detectBrandSignals(brand.name, url, title, description);
              if (sig.matchedSources.length === 0) {
                rejections.push({
                  reason: "brand_mismatch",
                  url,
                  requestedBrand: brand.name,
                  retailer: matchedRetailer,
                  detail: `no signal contained "${brand.name}" as an exact token sequence`,
                });
                continue;
              }
              // Description-only matches are too weak — retailer SEO blurbs
              // sometimes name-drop adjacent brands.
              if (
                sig.matchedSources.length === 1 &&
                sig.matchedSources[0] === "description"
              ) {
                rejections.push({
                  reason: "weak_brand_signal",
                  url,
                  requestedBrand: brand.name,
                  retailer: matchedRetailer,
                  detail: "brand appeared only in description; URL + title disagreed",
                });
                continue;
              }

              // Canonical de-duplication (regional/same-product collapse).
              const canonicalKey = canonicalProductKey(url, matchedRetailer);
              const existing = canonicalSeen.get(canonicalKey);
              if (existing) {
                const sameHost = (() => {
                  try {
                    return new URL(existing).hostname === new URL(url).hostname;
                  } catch {
                    return false;
                  }
                })();
                rejections.push({
                  reason: sameHost ? "duplicate_product" : "regional_duplicate",
                  url,
                  requestedBrand: brand.name,
                  retailer: matchedRetailer,
                  detail: `collapsed into ${existing}`,
                });
                continue;
              }
              canonicalSeen.set(canonicalKey, url);

              const silhouette = inferSilhouette(title, url);
              const palette = inferPalette(title);
              const score = editorialScore({
                title,
                description,
                silhouette,
                brandTier: (brand.tier as string | null) ?? null,
              });

              accepted.push({
                url,
                canonicalKey,
                title,
                description,
                brand: brand.name,
                brand_slug: brand.slug,
                brandTier: (brand.tier as string | null) ?? null,
                retailer: matchedRetailer,
                matchedQuery: template,
                category: brandCats[0] ?? "unknown",
                silhouette,
                palette,
                editorialScore: score,
                brandMatchSources: sig.matchedSources,
                alreadyCached: cachedSet.has(url),
              });
              acceptedBrandSet.add(brand.name);
            }
          } catch (e: any) {
            searchesFailed++;
            errors.push(
              `${brand.name} / "${template}" @ ${retailer}: ${String(e?.message ?? e).slice(0, 120)}`,
            );
          }
        }
      }
    }

    // 4. FINALIST SELECTION — editorial-quality first, then enforce
    //    silhouette/brand/retailer diversity. Never just return first-N.
    // Sort: editorial score desc, then luxury tier first, then per-brand
    // brand-tier alphabetical for determinism.
    const tierRank = (t: string | null) =>
      t === "luxury" ? 0 : t === "mid-luxe" ? 1 : 2;
    const sorted = [...accepted].sort((a, b) => {
      if (b.editorialScore !== a.editorialScore) return b.editorialScore - a.editorialScore;
      const tr = tierRank(a.brandTier) - tierRank(b.brandTier);
      if (tr !== 0) return tr;
      return a.brand.localeCompare(b.brand);
    });

    const finalists: Candidate[] = [];
    const perBrandFinal: Record<string, number> = {};
    const perRetailerFinal: Record<string, number> = {};
    const perBrandSilhouette = new Map<string, Set<string>>();
    const target = data.maxCandidates;
    const retailerHardCap = Math.max(2, Math.ceil(target * RETAILER_SHARE_CAP));

    for (const c of sorted) {
      if (finalists.length >= target) break;
      if ((perBrandFinal[c.brand] ?? 0) >= data.maxPerBrand) {
        rejections.push({
          reason: "per_brand_cap",
          url: c.url,
          requestedBrand: c.brand,
          retailer: c.retailer,
        });
        continue;
      }
      if ((perRetailerFinal[c.retailer] ?? 0) >= retailerHardCap) {
        rejections.push({
          reason: "retailer_share_cap",
          url: c.url,
          requestedBrand: c.brand,
          retailer: c.retailer,
          detail: `retailer share already at cap (${retailerHardCap}/${target})`,
        });
        continue;
      }
      const sils = perBrandSilhouette.get(c.brand) ?? new Set<string>();
      if (sils.has(c.silhouette) && c.silhouette !== "other") {
        rejections.push({
          reason: "duplicate_silhouette",
          url: c.url,
          requestedBrand: c.brand,
          retailer: c.retailer,
          detail: `${c.brand} already has a ${c.silhouette}`,
        });
        continue;
      }
      sils.add(c.silhouette);
      perBrandSilhouette.set(c.brand, sils);
      perBrandFinal[c.brand] = (perBrandFinal[c.brand] ?? 0) + 1;
      perRetailerFinal[c.retailer] = (perRetailerFinal[c.retailer] ?? 0) + 1;
      finalists.push(c);
    }

    // 5. Build distribution / reporting.
    const brandHistogram: Record<string, number> = {};
    const retailerHistogram: Record<string, number> = {};
    const categoryHistogram: Record<string, number> = {};
    const silhouetteHistogram: Record<string, number> = {};
    const paletteHistogram: Record<string, number> = {};
    const queryHistogram: Record<string, number> = {};
    let cachedCount = 0;
    let scoreSum = 0;
    for (const c of finalists) {
      brandHistogram[c.brand] = (brandHistogram[c.brand] ?? 0) + 1;
      retailerHistogram[c.retailer] = (retailerHistogram[c.retailer] ?? 0) + 1;
      categoryHistogram[c.category] = (categoryHistogram[c.category] ?? 0) + 1;
      silhouetteHistogram[c.silhouette] = (silhouetteHistogram[c.silhouette] ?? 0) + 1;
      paletteHistogram[c.palette] = (paletteHistogram[c.palette] ?? 0) + 1;
      queryHistogram[c.matchedQuery] = (queryHistogram[c.matchedQuery] ?? 0) + 1;
      if (c.alreadyCached) cachedCount++;
      scoreSum += c.editorialScore;
    }
    const rejectionsByReason: Record<string, number> = {};
    for (const r of rejections) {
      rejectionsByReason[r.reason] = (rejectionsByReason[r.reason] ?? 0) + 1;
    }
    // Editorial diversity = unique silhouettes / finalists (1.0 = every piece unique).
    const diversityScore =
      finalists.length === 0
        ? 0
        : Object.keys(silhouetteHistogram).length / finalists.length;
    // Brand-match rate over candidates that survived URL/retailer/PDP gates.
    const surveyedForBrand = accepted.length + (rejectionsByReason.brand_mismatch ?? 0) + (rejectionsByReason.weak_brand_signal ?? 0);
    const brandMatchRate = surveyedForBrand === 0 ? 0 : accepted.length / surveyedForBrand;

    const brandsConsidered = brands.map((b) => ({
      name: b.name,
      slug: b.slug,
      tier: b.tier,
      foundCount: brandHistogram[b.name] ?? 0,
      accepted: acceptedBrandSet.has(b.name),
    }));

    return {
      ok: true as const,
      ranAt: new Date().toISOString(),
      pilot: {
        categories: YACHT_DAY_CATEGORIES as unknown as string[],
        activity: "Yacht Day",
        queryTemplates: Object.values(CATEGORY_QUERY_TEMPLATES).flat(),
        approvedRetailers: APPROVED_RETAILERS as unknown as string[],
      },
      telemetry: {
        searchesIssued,
        searchesFailed,
        rawResultsSeen,
        candidatesAfterFilters: finalists.length,
        rawAcceptedBeforeFinalists: accepted.length,
        rejected: rejections.length,
        regionalDuplicatesRemoved: rejectionsByReason.regional_duplicate ?? 0,
        duplicatesRemoved: rejectionsByReason.duplicate_product ?? 0,
        brandMismatches:
          (rejectionsByReason.brand_mismatch ?? 0) + (rejectionsByReason.weak_brand_signal ?? 0),
        brandMatchRate: Math.round(brandMatchRate * 1000) / 1000,
        editorialDiversityScore: Math.round(diversityScore * 1000) / 1000,
        avgEditorialScore:
          finalists.length === 0 ? 0 : Math.round((scoreSum / finalists.length) * 100) / 100,
        cachedCandidates: cachedCount,
        approxFirecrawlCreditsUsed: searchesIssued, // /search ≈ 1 credit
        scrapesPerformed: 0, // DRY RUN
        dbWrites: 0,
      },
      brandsConsidered,
      requestedBrands,
      acceptedBrands: Array.from(acceptedBrandSet).sort(),
      rejectedBrands: requestedBrands.filter((b) => !acceptedBrandSet.has(b)),
      brandHistogram,
      retailerHistogram,
      categoryHistogram,
      silhouetteHistogram,
      paletteHistogram,
      queryHistogram,
      rejectionsByReason,
      rejections: rejections.slice(0, 200), // cap payload size
      candidates: finalists,
      errors,
    };
  });
