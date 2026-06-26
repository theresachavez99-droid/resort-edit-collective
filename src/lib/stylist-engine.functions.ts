/**
 * Resort Edit v3 — Luxury Stylist Engine (slot-aware discovery).
 *
 * The engine sources by OUTFIT SLOT, not by flat brand pool. For every
 * destination activity, each required slot gets its own brand subset,
 * its own query templates, and its own candidate quota.
 *
 * Pipeline:
 *   Brief → Per-slot brand subset (Brands I Love registry)
 *         → Per-slot Firecrawl /search (slot-specific templates)
 *         → Per-slot filtering (PDP shape, brand-match, canonical dedup)
 *         → Slot coverage gate (no Gemini if any required slot empty)
 *         → Gemini look assembly (slot-indexed candidate pool)
 *         → Look validation (every required slot must be filled)
 *         → Collection scoring + draft persistence
 *
 * No PDP scrapes. No publishing. No live-site writes.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import {
  APPROVED_RETAILERS,
  FIRECRAWL_BASE,
  QUERY_EXCLUSIONS,
  canonicalProductKey,
  detectBrandSignals,
  editorialScore as scoreEditorial,
  inferPalette,
  inferSilhouette,
  isObviousNonPdp,
  looksLikePdp,
  retailerOf,
} from "./yacht-day-pilot.functions";
import {
  SWIM_BRAND_CAPS,
  SIGNATURE_SWIM,
  SUPPORTING_ONLY_BRANDS,
  type SwimArchetypeId,
  type SwimDiagnostics,
  assignArchetypes,
  cohesionMatch,
  detectArchetypeForSwim,
  getArchetype,
  swimArchetypeBoost,
} from "./swim-archetypes";
import {
  evaluateProductFamily,
  type ApprovalLevel,
} from "./product-family-curation";
import {
  planEditorialCollection,
  rotationPenalty,
  ROTATION_TIE_THRESHOLD,
  RHYTHM_LABELS,
  type LookPlan,
  type RhythmRole,
} from "./collection-director";
import {
  computeAccessoryRotationScore,
  computeBrandDominanceScore,
  computeEditorialRhythmScore,
  computeHeroStrength,
  computeLuxuryPerceptionScore,
  computeMemorabilityScore,
  computeVisualRepetitionScore,
  fingerprintLook,
} from "./visual-fingerprint";
import { containsBannedPhrase, rewriteCollectionCopy } from "./editorial-copy";

// ──────────────────────────────────────────────────────────────
// Slot specs — every required slot has its own brand categories,
// templates, target candidate count, and silhouette fillers.
// ──────────────────────────────────────────────────────────────

export type SlotSpec = {
  slot: string;
  label: string;
  required: boolean;
  /** Brand registry categories that can fill this slot. */
  brandCategories: string[];
  /** Silhouette tokens (from inferSilhouette) that count as a fill. */
  silhouettes: string[];
  /** Slot-specific query templates ("{brand}" is the placeholder). */
  templates: string[];
  /** Minimum candidate count before the slot is considered "covered". */
  targetMin: number;
  /** Maximum to collect before stopping that slot's search. */
  targetMax: number;
  /**
   * Retailer depth override for this slot — how many approved retailers
   * to query per brand. Accessory slots need broader coverage because
   * inventory is fragmented across many retailers; swimwear and coverups
   * concentrate inside fewer specialty/department stores.
   */
  retailersPerBrand: number;
};

const YACHT_DAY_SLOT_SPECS: SlotSpec[] = [
  {
    slot: "swim",
    label: "Swimwear",
    required: true,
    brandCategories: ["swimwear"],
    silhouettes: ["one-piece", "bikini"],
    templates: ["{brand} one piece swimsuit", "{brand} bikini", "{brand} maillot"],
    targetMin: 8,
    targetMax: 12,
    retailersPerBrand: 4,
  },
  {
    slot: "coverup",
    label: "Cover-up / linen layer",
    required: true,
    brandCategories: ["coverups", "dresses", "separates"],
    silhouettes: ["kaftan", "pareo", "cover-up", "dress", "shirt", "linen-pant"],
    templates: [
      "{brand} kaftan",
      "{brand} pareo",
      "{brand} linen shirt",
      "{brand} beach dress",
      "{brand} crochet coverup",
    ],
    targetMin: 8,
    targetMax: 12,
    retailersPerBrand: 5,
  },
  {
    slot: "shoes",
    label: "Shoes",
    required: true,
    brandCategories: ["shoes"],
    silhouettes: ["sandal"],
    templates: [
      "{brand} flat leather sandal",
      "{brand} raffia sandal",
      "{brand} espadrille",
      "{brand} slide sandal",
    ],
    targetMin: 8,
    targetMax: 12,
    retailersPerBrand: 7,
  },
  {
    slot: "bag",
    label: "Bag",
    required: true,
    brandCategories: ["bags"],
    silhouettes: ["bag"],
    templates: [
      "{brand} raffia tote",
      "{brand} woven shoulder bag",
      "{brand} straw beach bag",
      "{brand} basket bag",
    ],
    targetMin: 8,
    targetMax: 12,
    retailersPerBrand: 7,
  },
  {
    slot: "sunglasses",
    label: "Sunglasses",
    required: true,
    brandCategories: ["sunglasses"],
    silhouettes: ["sunglasses"],
    templates: [
      "{brand} cat eye sunglasses",
      "{brand} oversized sunglasses",
      "{brand} tortoise sunglasses",
      "{brand} aviator sunglasses",
    ],
    targetMin: 6,
    targetMax: 10,
    retailersPerBrand: 9,
  },
  {
    slot: "jewelry",
    label: "Jewelry",
    required: true,
    brandCategories: ["jewelry"],
    silhouettes: ["jewelry"],
    templates: [
      "{brand} gold hoop earrings",
      "{brand} pendant necklace",
      "{brand} cuff bracelet",
      "{brand} stacking ring",
      "{brand} shell pendant",
    ],
    targetMin: 12,
    targetMax: 20,
    retailersPerBrand: 9,
  },
  {
    slot: "hat",
    label: "Hat",
    required: false,
    brandCategories: ["hats"],
    silhouettes: ["hat"],
    templates: ["{brand} straw hat", "{brand} panama hat", "{brand} sun hat"],
    targetMin: 4,
    targetMax: 8,
    retailersPerBrand: 7,
  },
];

const ACTIVITY_SLOTS: Record<string, SlotSpec[]> = {
  "Yacht Day": YACHT_DAY_SLOT_SPECS,
};

// ──────────────────────────────────────────────────────────────
// v4 — Destination-agnostic slot resolver.
//
// The engine no longer hard-binds to a single activity. Slot specs are
// keyed by `${destination}|${activity}` first, then by activity alone,
// then fall back to a sensible default. Add new (destination, activity)
// entries here without touching the engine core.
// ──────────────────────────────────────────────────────────────

const SLOT_SPECS_BY_KEY: Record<string, SlotSpec[]> = {
  "Portofino|Yacht Day": YACHT_DAY_SLOT_SPECS,
};

export function getSlotSpecs(destination: string, activity: string): SlotSpec[] {
  const key = `${destination}|${activity}`;
  return (
    SLOT_SPECS_BY_KEY[key] ??
    ACTIVITY_SLOTS[activity] ??
    YACHT_DAY_SLOT_SPECS
  );
}

// ──────────────────────────────────────────────────────────────
// v4 — Commerce sources.
//
// Every accepted candidate is stamped with the commerce channel it
// belongs to. Today every approved brand seeds an `affiliate_retailer`
// entry, so resolution is retailer-based. When Brand Direct partnerships
// activate, brands declare `brand_direct` in `commerce_sources` and the
// resolver will prefer it based on `preferred_commerce_source`.
// ──────────────────────────────────────────────────────────────

type CommerceSourceKind = "affiliate_retailer" | "brand_direct" | "hybrid";

type CommerceSourceEntry = {
  kind: CommerceSourceKind;
  retailers?: string[];
  program?: string;
  endpoint?: string | null;
  status?: "active" | "planned" | "paused";
};

export type EngineBrand = {
  name: string;
  slug: string;
  tier: string | null;
  categories: string[];
  commerceSources: CommerceSourceEntry[];
  preferredCommerceSource: CommerceSourceKind;
  /**
   * v5 — context-aware affinity map keyed by "<destination>:<activity>".
   * Replaces static tier as the primary ranking signal.
   */
  editorialAffinity: Record<string, number>;
};

function resolveCommerceSource(
  brand: Pick<EngineBrand, "commerceSources" | "preferredCommerceSource">,
  retailerHost: string,
): { kind: CommerceSourceKind; approved: boolean } {
  const sources = brand.commerceSources ?? [];
  // No structured sources yet → assume affiliate retailer (v3 behavior).
  if (sources.length === 0) {
    return { kind: "affiliate_retailer", approved: true };
  }
  const active = sources.filter((s) => (s.status ?? "active") === "active");
  if (active.length === 0) return { kind: "affiliate_retailer", approved: false };

  const preferred = brand.preferredCommerceSource ?? "affiliate_retailer";
  // Affiliate retailer match: either the brand's retailer list is empty
  // (any APPROVED_RETAILER counts) or the host is in the brand's list.
  const affiliate = active.find((s) => s.kind === "affiliate_retailer" || s.kind === "hybrid");
  if (affiliate) {
    const retailers = (affiliate.retailers ?? []).map((r) => r.toLowerCase());
    if (retailers.length === 0 || retailers.includes(retailerHost.toLowerCase())) {
      return { kind: preferred === "brand_direct" ? "hybrid" : "affiliate_retailer", approved: true };
    }
  }
  // Brand-direct fallback (architectural placeholder — no integrations yet).
  const direct = active.find((s) => s.kind === "brand_direct");
  if (direct) return { kind: "brand_direct", approved: true };
  return { kind: "affiliate_retailer", approved: false };
}

/**
 * v5 — resolve the Editorial Affinity score for a brand in a specific
 * destination + activity context. Falls back to:
 *   1. exact "<destination>:<activity>" key
 *   2. activity-only average across the brand's recorded contexts
 *   3. legacy-tier inferred baseline (luxury=70, mid-luxe=55)
 *   4. 50 (neutral)
 */
export function affinityFor(
  brand: Pick<EngineBrand, "editorialAffinity" | "tier">,
  destination: string,
  activity: string,
): number {
  const map = brand.editorialAffinity ?? {};
  const dKey = destination.trim().toLowerCase().replace(/\s+/g, "-");
  const aKey = activity.trim().toLowerCase().replace(/\s+/g, "-");
  const exact = map[`${dKey}:${aKey}`];
  if (typeof exact === "number") return exact;
  // Activity match across any destination.
  const activityMatches = Object.entries(map)
    .filter(([k]) => k.endsWith(`:${aKey}`))
    .map(([, v]) => v);
  if (activityMatches.length)
    return Math.round(activityMatches.reduce((a, b) => a + b, 0) / activityMatches.length);
  // Destination match across any activity (weaker signal).
  const destMatches = Object.entries(map)
    .filter(([k]) => k.startsWith(`${dKey}:`))
    .map(([, v]) => v);
  if (destMatches.length)
    return Math.round((destMatches.reduce((a, b) => a + b, 0) / destMatches.length) * 0.85);
  // Legacy fallback while affinity data is being seeded.
  if (brand.tier === "luxury") return 70;
  if (brand.tier === "mid-luxe") return 55;
  return 50;
}

export async function loadEngineBrands(
  activity: string,
  destination = "Portofino",
): Promise<EngineBrand[]> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("brands")
    .select(
      "id,name,slug,tier,categories,activities,commerce_sources,preferred_commerce_source,destination_strength,editorial_affinity",
    )
    .eq("status", "approved")
    .contains("activities", [activity])
    .order("name", { ascending: true });
  if (error) throw new Error(error.message);
  const mapped: EngineBrand[] = (data ?? []).map((b) => ({
    name: b.name as string,
    slug: b.slug as string,
    tier: (b.tier as string | null) ?? null,
    categories: ((b as { categories?: string[] }).categories ?? []) as string[],
    commerceSources: (Array.isArray((b as { commerce_sources?: unknown }).commerce_sources)
      ? ((b as { commerce_sources: unknown[] }).commerce_sources as CommerceSourceEntry[])
      : []),
    preferredCommerceSource:
      (((b as { preferred_commerce_source?: string }).preferred_commerce_source as CommerceSourceKind) ??
        "affiliate_retailer"),
    editorialAffinity: ((b as { editorial_affinity?: Record<string, number> | null })
      .editorial_affinity ?? {}) as Record<string, number>,
  }));
  // v5 — sort by editorial affinity for this destination + activity so
  // discovery batches lead with the most context-aligned brands.
  mapped.sort((a, b) => affinityFor(b, destination, activity) - affinityFor(a, destination, activity));
  return mapped;
}

// ──────────────────────────────────────────────────────────────
// Tier-2 controlled accessory expansion.
//
// Curated luxury accessory brands carried by APPROVED_RETAILERS that are
// editorially appropriate for Resort Edit but NOT (yet) in the Brands I
// Love registry. Used ONLY when a Tier-1 accessory slot falls below its
// minimum candidate threshold. Candidates from this pool are marked
// `source: "expansion"` and are NEVER automatically promoted to the
// registry — Founder approval is required.
//
// Strict rules:
// - Only the slots listed in EXPANDABLE_SLOTS may expand.
// - Swimwear, dresses, linen, separates, and cover-ups are NEVER expanded.
// - All other filters (approved retailer, brand match, silhouette,
//   editorial scoring) still apply.
// ──────────────────────────────────────────────────────────────

const EXPANDABLE_SLOTS = new Set(["shoes", "bag", "sunglasses", "jewelry", "hat"]);

const ACCESSORY_EXPANSION_BRANDS: Record<string, string[]> = {
  sunglasses: [
    "Celine",
    "Saint Laurent",
    "Bottega Veneta",
    "Loewe",
    "Prada",
    "Miu Miu",
    "Chloé",
    "Linda Farrow",
    "Jacques Marie Mage",
    "Oliver Peoples",
    "Persol",
    "Tom Ford",
    "Dior",
    "Gucci",
    "Khaite",
  ],
  shoes: [
    "Manolo Blahnik",
    "Aquazzura",
    "Jimmy Choo",
    "Gianvito Rossi",
    "Stuart Weitzman",
    "Khaite",
    "The Row",
    "Hermès",
    "Carrie Forbes",
    "Alohas",
    "Le Monde Béryl",
    "Emme Parsons",
  ],
  bag: [
    "Loewe",
    "Bottega Veneta",
    "Saint Laurent",
    "Jacquemus",
    "Khaite",
    "The Row",
    "Polène",
    "DeMellier",
    "Strathberry",
    "Cult Gaia",
    "Hereu",
    "Mansur Gavriel",
  ],
  jewelry: [
    "Sophie Buhai",
    "Jennifer Fisher",
    "Missoma",
    "Anni Lu",
    "Pamela Card",
    "Foundrae",
    "Spinelli Kilcollin",
    "Brinker & Eliza",
    "Roxanne Assoulin",
    "Laura Lombardi",
    "Éliou",
    "Mejuri",
  ],
  hat: [
    "Janessa Leone",
    "Lack of Color",
    "Maison Michel",
    "Sensi Studio",
    "Eric Javits",
    "Helen Kaminski",
    "Borsalino",
  ],
};

// ──────────────────────────────────────────────────────────────
// Editorial brief — per destination+activity.
// ──────────────────────────────────────────────────────────────

type EditorialBrief = {
  destination: string;
  activity: string;
  mood: string;
  palette: string[];
  styleDna: string[];
  notes: string;
  collectionThemes: string[];
};

const BRIEFS: Record<string, EditorialBrief> = {
  "Portofino|Yacht Day": {
    destination: "Portofino",
    activity: "Yacht Day",
    mood: "Mediterranean glamour, salt-air ease, late-morning espresso on deck",
    palette: ["white", "ivory", "navy", "natural raffia", "sun-bleached print", "coral", "gold"],
    styleDna: ["Riviera Glamour", "Coastal Neutral", "Mediterranean Print", "Tailored Resort"],
    notes:
      "A wealthy traveler boards a wooden Riva at 11, lunches in a cove, returns to the harbor at golden hour. " +
      "Outfits must work for swim, deck, and stepping off in town. No tropical clichés.",
    collectionThemes: [
      "Mediterranean Glam",
      "Riviera Minimalist",
      "Bold Print Escape",
      "Coastal Linen",
      "Harbor Return",
      "Sunset Sail",
    ],
  },
};

function briefFor(destination: string, activity: string): EditorialBrief {
  const key = `${destination}|${activity}`;
  return (
    BRIEFS[key] ?? {
      destination,
      activity,
      mood: `${activity} in ${destination}`,
      palette: ["neutral", "white", "natural"],
      styleDna: ["Coastal Neutral", "Modern Minimal"],
      notes: "",
      collectionThemes: [],
    }
  );
}

// ──────────────────────────────────────────────────────────────
// Per-slot discovery
// ──────────────────────────────────────────────────────────────

export type SlotCandidate = {
  id: string;
  slot: string;
  brand: string;
  brandTier: string | null;
  retailer: string;
  title: string | null;
  description: string | null;
  url: string;
  canonicalKey: string;
  silhouette: string;
  palette: string;
  editorialScore: number;
  /** v5 — Editorial Affinity used at scoring time (0–100). */
  brandAffinity: number;
  matchedQuery: string;
  source: "core" | "expansion";
  /** v4 — resolved commerce channel for this candidate. */
  commerceSource: CommerceSourceKind;
  /** v4.4 — product-family curation verdict. */
  approvalLevel?: ApprovalLevel;
  familyMatched?: string | null;
  constructionScore?: number;
  curationReason?: string;
  /** v4.6 — retailer product image extracted from search metadata. */
  image?: string | null;
};

export type SlotDiscoveryResult = {
  slot: string;
  label: string;
  required: boolean;
  targetMin: number;
  targetMax: number;
  brandsConsidered: string[];
  candidates: SlotCandidate[];
  searchesIssued: number;
  rawResults: number;
  rejections: Record<string, number>;
  shortfall: number; // how many below targetMin (0 if covered)
  /** Effective retailers/brand setting used (slot-specific override). */
  retailersPerBrand: number;
  /** Distinct retailers actually queried across all brands in this slot. */
  retailersQueried: string[];
  /** Distinct retailers present in accepted candidates. */
  retailersRepresented: string[];
  /** Tier-2 controlled accessory expansion telemetry (null when not eligible / not triggered). */
  expansion?: {
    triggered: boolean;
    reason: string;
    brandsConsidered: string[];
    searchesIssued: number;
    rawResults: number;
    accepted: number;
    rejections: Record<string, number>;
    retailersQueried: string[];
    retailersRepresented: string[];
  } | null;
};

async function firecrawlSearch(apiKey: string, query: string, limit: number) {
  const res = await fetch(`${FIRECRAWL_BASE}/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, limit }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const payload = await res.json();
  const root = payload?.data ?? payload;
  const items: any[] =
    (Array.isArray(root) && root) || root?.web || root?.results || root?.data?.web || [];
  return items;
}

export async function discoverForSlot(args: {
  apiKey: string;
  spec: SlotSpec;
  brands: EngineBrand[];
  resultsPerSearch: number;
  retailersPerBrand: number;
  brandOffset: number;
  idCounter: { n: number };
  canonicalSeen: Map<string, string>;
  seenUrls: Set<string>;
  source?: "core" | "expansion";
  startingCount?: number;
  /** v5 — context for affinity-based ranking. */
  destination?: string;
  activity?: string;
}): Promise<SlotDiscoveryResult> {
  const {
    apiKey,
    spec,
    brands,
    resultsPerSearch,
    retailersPerBrand,
    brandOffset,
    idCounter,
    canonicalSeen,
    seenUrls,
  } = args;
  const source: "core" | "expansion" = args.source ?? "core";
  const startingCount = args.startingCount ?? 0;
  const destination = args.destination ?? "Portofino";
  const activity = args.activity ?? spec.slot;

  const candidates: SlotCandidate[] = [];
  const rejections: Record<string, number> = {};
  const bump = (k: string) => (rejections[k] = (rejections[k] ?? 0) + 1);
  const retailersQueried = new Set<string>();

  // Brands relevant to this slot.
  const slotBrands = brands.filter((b) =>
    b.categories.some((c) => spec.brandCategories.includes(c)),
  );

  let searchesIssued = 0;
  let rawResults = 0;

  outer: for (let bi = 0; bi < slotBrands.length; bi++) {
    const brand = slotBrands[bi];
    // Rotate retailers per brand to diversify.
    const retailers: string[] = [];
    const rc = Math.min(retailersPerBrand, APPROVED_RETAILERS.length);
    for (let k = 0; k < rc; k++) {
      retailers.push(APPROVED_RETAILERS[(brandOffset + bi + k) % APPROVED_RETAILERS.length]);
    }
    for (const retailer of retailers) {
      retailersQueried.add(retailer);
      for (const tpl of spec.templates) {
        if (candidates.length >= spec.targetMax) break outer;
        const query = `${tpl.replace("{brand}", brand.name)} site:${retailer}${QUERY_EXCLUSIONS}`;
        searchesIssued++;
        let items: any[] = [];
        try {
          items = await firecrawlSearch(apiKey, query, resultsPerSearch);
        } catch {
          bump("search_failed");
          continue;
        }
        for (const item of items) {
          rawResults++;
          const url: string | undefined = item.url || item.link;
          if (!url) {
            bump("no_url");
            continue;
          }
          if (seenUrls.has(url)) {
            bump("duplicate_url");
            continue;
          }
          seenUrls.add(url);
          const matchedRetailer = retailerOf(url);
          if (!matchedRetailer) {
            bump("retailer_not_approved");
            continue;
          }
          if (isObviousNonPdp(url)) {
            bump("non_pdp_prefiltered");
            continue;
          }
          if (!looksLikePdp(url, matchedRetailer)) {
            bump("not_pdp");
            continue;
          }
          const title = item.title ?? item.metadata?.title ?? null;
          const description =
            item.description ?? item.snippet ?? item.metadata?.description ?? null;
          const image =
            (typeof item.metadata?.ogImage === "string" && item.metadata.ogImage) ||
            (typeof item.metadata?.["og:image"] === "string" && item.metadata["og:image"]) ||
            (typeof item.metadata?.image === "string" && item.metadata.image) ||
            (typeof item.ogImage === "string" && item.ogImage) ||
            (typeof item.image === "string" && item.image) ||
            null;
          const sig = detectBrandSignals(brand.name, url, title, description);
          if (sig.matchedSources.length === 0) {
            bump("brand_mismatch");
            continue;
          }
          if (sig.matchedSources.length === 1 && sig.matchedSources[0] === "description") {
            bump("weak_brand_signal");
            continue;
          }
          const canonicalKey = canonicalProductKey(url, matchedRetailer);
          if (canonicalSeen.has(canonicalKey)) {
            bump("duplicate_product");
            continue;
          }
          canonicalSeen.set(canonicalKey, url);
          const silhouette = inferSilhouette(title, url);
          // Slot-fit gate: only accept silhouettes that match this slot.
          // Optional slots can still accept "other" when no signal — but
          // required slots are strict.
          if (
            spec.required &&
            !spec.silhouettes.includes(silhouette) &&
            silhouette !== "other"
          ) {
            bump("wrong_silhouette");
            continue;
          }
          if (
            spec.required &&
            silhouette === "other" &&
            spec.silhouettes.length > 0 &&
            !spec.silhouettes.some((s) =>
              new RegExp(`\\b${s.replace(/-/g, ".?")}\\b`, "i").test(`${title ?? ""} ${url}`),
            )
          ) {
            bump("wrong_silhouette");
            continue;
          }
          const palette = inferPalette(title);
          const brandAffinity = affinityFor(brand, destination, activity);
          // v4.4 — product family curation gate.
          const verdict = evaluateProductFamily({ brand: brand.name, title, description });
          if (!verdict.approved) {
            bump(`curation:${verdict.reason.slice(0, 60)}`);
            continue;
          }
          const baseScore = scoreEditorial({
            title,
            description,
            silhouette,
            brandTier: brand.tier,
            affinity: brandAffinity,
          });
          const score = Math.round((baseScore + verdict.constructionScore) * 1000) / 1000;
          // v4 — gate on approved commerce source before accepting.
          const cs = resolveCommerceSource(brand, matchedRetailer);
          if (!cs.approved) {
            bump("no_approved_commerce_source");
            continue;
          }
          candidates.push({
            id: `c${(idCounter.n++).toString().padStart(4, "0")}`,
            slot: spec.slot,
            brand: brand.name,
            brandTier: brand.tier,
            retailer: matchedRetailer,
            title,
            description,
            url,
            canonicalKey,
            silhouette,
            palette,
            editorialScore: score,
            brandAffinity,
            matchedQuery: tpl,
            source,
            commerceSource: cs.kind,
            approvalLevel: verdict.level,
            familyMatched: verdict.familyMatched,
            constructionScore: verdict.constructionScore,
            curationReason: verdict.reason,
            image,
          });
        }
      }
    }
  }

  // Sort by editorial score, retain up to targetMax.
  candidates.sort((a, b) => b.editorialScore - a.editorialScore);
  const remaining = Math.max(0, spec.targetMax - startingCount);
  const kept = candidates.slice(0, remaining);
  const retailersRepresented = Array.from(new Set(kept.map((c) => c.retailer)));

  return {
    slot: spec.slot,
    label: spec.label,
    required: spec.required,
    targetMin: spec.targetMin,
    targetMax: spec.targetMax,
    brandsConsidered: slotBrands.map((b) => b.name),
    candidates: kept,
    searchesIssued,
    rawResults,
    rejections,
    shortfall: Math.max(0, spec.targetMin - (kept.length + startingCount)),
    retailersPerBrand,
    retailersQueried: Array.from(retailersQueried),
    retailersRepresented,
  };
}

// ──────────────────────────────────────────────────────────────
// Gemini look assembly
// ──────────────────────────────────────────────────────────────

type AssembledLook = {
  title: string;
  subtitle?: string;
  description: string;
  styleDna: string[];
  palette: string[];
  slots: Array<{ slot: string; candidateId: string; reasoning?: string }>;
  reasoning?: string;
  complete: boolean;
  missing: string[];
  // v4.5 — populated post-assembly by the Editorial Collection Director.
  rhythmRole?: string;
  rhythmRoleLabel?: string;
  isHero?: boolean;
  heroStrength?: number;
};

async function callGeminiJson(system: string, user: string): Promise<unknown> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY missing");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`AI gateway ${res.status}: ${txt.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = json.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function assembleLooks(
  brief: EditorialBrief,
  slotResults: SlotDiscoveryResult[],
  specs: SlotSpec[],
  targetLookCount: number,
  archetypeAssignments: SwimArchetypeId[] = [],
): Promise<AssembledLook[]> {
  const slotLines = specs
    .map(
      (s) =>
        `  - "${s.slot}" (${s.required ? "REQUIRED" : "optional"}): ${s.label}.`,
    )
    .join("\n");

  // Build a slot-indexed candidate listing.
  const candidateBlocks: string[] = [];
  for (const r of slotResults) {
    if (r.candidates.length === 0) continue;
    const lines = r.candidates
      .map(
        (c) =>
          `    ${c.id} :: ${c.brand} — ${c.title ?? "(untitled)"} [${c.silhouette}/${c.palette}] @${c.retailer} score=${c.editorialScore}`,
      )
      .join("\n");
    candidateBlocks.push(`  Slot "${r.slot}" (${r.label}) — ${r.candidates.length} candidates:\n${lines}`);
  }

  const themes = brief.collectionThemes.length
    ? `Suggested editorial themes (use, rename, or invent your own): ${brief.collectionThemes.join(", ")}.`
    : "";

  const requiredSlotNames = specs.filter((s) => s.required).map((s) => s.slot);

  // v4.2 — per-look archetype briefs steer Gemini to compose each look
  // around a distinct swim story and apply the cohesion recipe to the
  // other slots.
  const archetypeBriefs = archetypeAssignments
    .map((id, i) => {
      const a = getArchetype(id);
      return `  Look ${i + 1} — Swim Archetype: "${a.label}"
    Story: ${a.description}
    Preferred swim brands: ${a.preferredBrands.join(", ")}
    Cohesion recipe (style the other slots around the swim piece):
      coverup → ${a.cohesion.coverup.join(", ")}
      bag → ${a.cohesion.bag.join(", ")}
      jewelry → ${a.cohesion.jewelry.join(", ")}
      shoes → ${a.cohesion.shoes.join(", ")}
      sunglasses → ${a.cohesion.sunglasses.join(", ")}
      palette → ${a.cohesion.palette.join(", ")}`;
    })
    .join("\n\n");

  const system = `You are the fashion director at Resort Edit, a luxury destination styling platform.
You compose COMPLETE editorial looks from a slot-indexed candidate pool.
Swim is the editorial anchor of every Yacht Day look. PICK THE SWIM PIECE FIRST,
then style the rest of the outfit around it using the per-look cohesion recipe.
Return strict JSON only. Never invent products or ids not in the pool.`;

  const user = `EDITORIAL BRIEF
Destination: ${brief.destination}
Activity: ${brief.activity}
Mood: ${brief.mood}
Palette: ${brief.palette.join(", ")}
Style DNA: ${brief.styleDna.join(", ")}
Notes: ${brief.notes}
${themes}

SWIM ARCHETYPE PLAN (one distinct archetype per look — do not duplicate)
${archetypeBriefs}

COLLECTION-WIDE SWIM CAPS
- Missoni swim: maximum 1 look per collection.
- Treat reference brands (e.g. "St. Barths") as supporting only — never as the hero look.

OUTFIT SLOTS
${slotLines}

REQUIRED SLOTS: ${requiredSlotNames.join(", ")}

CANDIDATE POOL (grouped by slot)
${candidateBlocks.join("\n\n")}

TASK
Assemble ${targetLookCount} COMPLETE editorial looks. A complete look MUST fill EVERY required slot above by picking one candidateId from that slot's pool. Optional slots may be filled or omitted.

SWIM-FIRST ASSEMBLY
- For each look, choose the swim candidate that best expresses its assigned archetype FIRST.
- Then pick coverup / bag / jewelry / shoes / sunglasses whose titles, palettes, or
  brands match that archetype's cohesion recipe.
- The collection MUST present six distinct swim archetypes — never duplicate.

Optimize for:
- Editorial excellence — each look reads as if PORTER, Moda Operandi, or a private stylist curated it.
- Brand diversity ACROSS each look (avoid same brand twice in one outfit) and across the collection.
- Retailer diversity across looks.
- Silhouette / palette variety across looks.
- Destination authenticity for ${brief.destination}.

Return strict JSON:
{
  "looks": [
    {
      "title": "Editorial look title, 2–5 words",
      "subtitle": "One editorial line",
      "description": "2–3 sentences, editorial voice.",
      "styleDna": ["1–3 values from the brief"],
      "palette": ["1–4 color/print descriptors"],
      "swimArchetype": "<one of the assigned archetype ids for this look index>",
      "slots": [
        { "slot": "swim", "candidateId": "<id>", "reasoning": "<one line>" },
        { "slot": "coverup", "candidateId": "<id>", "reasoning": "<one line>" },
        { "slot": "shoes", "candidateId": "<id>", "reasoning": "<one line>" },
        { "slot": "bag", "candidateId": "<id>", "reasoning": "<one line>" },
        { "slot": "sunglasses", "candidateId": "<id>", "reasoning": "<one line>" },
        { "slot": "jewelry", "candidateId": "<id>", "reasoning": "<one line>" }
      ],
      "reasoning": "1–2 lines on what makes this look distinct."
    }
  ]
}

CRITICAL RULES
- Every candidateId MUST exist in the slot pool above. Never invent ids.
- For every look, fill ALL ${requiredSlotNames.length} required slots: ${requiredSlotNames.join(", ")}. Any look missing a required slot will be DISCARDED.
- A given candidateId may appear in at most one look across the collection.
- Return as many complete looks as the pool supports, up to ${targetLookCount}.`;

  const raw = (await callGeminiJson(system, user)) as { looks?: unknown };
  const looksRaw = Array.isArray(raw.looks) ? raw.looks : [];
  const looks: AssembledLook[] = [];
  const usedIds = new Set<string>();
  const allIds = new Set<string>();
  for (const r of slotResults) r.candidates.forEach((c) => allIds.add(c.id));
  const requiredSet = new Set(requiredSlotNames);

  for (const item of looksRaw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const slotsArr = Array.isArray(o.slots) ? o.slots : [];
    const slotRecs: AssembledLook["slots"] = [];
    const filled = new Set<string>();
    for (const s of slotsArr) {
      if (!s || typeof s !== "object") continue;
      const so = s as Record<string, unknown>;
      const slot = typeof so.slot === "string" ? so.slot : null;
      const candidateId = typeof so.candidateId === "string" ? so.candidateId : null;
      const reasoning = typeof so.reasoning === "string" ? so.reasoning : undefined;
      if (!slot || !candidateId) continue;
      if (!allIds.has(candidateId)) continue;
      if (usedIds.has(candidateId)) continue;
      usedIds.add(candidateId);
      filled.add(slot);
      slotRecs.push({ slot, candidateId, reasoning });
    }
    const missing = [...requiredSet].filter((s) => !filled.has(s));
    looks.push({
      title: typeof o.title === "string" ? o.title : "Untitled Look",
      subtitle: typeof o.subtitle === "string" ? o.subtitle : undefined,
      description: typeof o.description === "string" ? o.description : "",
      styleDna: Array.isArray(o.styleDna)
        ? o.styleDna.filter((x): x is string => typeof x === "string").slice(0, 4)
        : [],
      palette: Array.isArray(o.palette)
        ? o.palette.filter((x): x is string => typeof x === "string").slice(0, 5)
        : [],
      slots: slotRecs,
      reasoning: typeof o.reasoning === "string" ? o.reasoning : undefined,
      complete: missing.length === 0,
      missing,
    });
  }
  return looks;
}

// ──────────────────────────────────────────────────────────────
// Scoring
// ──────────────────────────────────────────────────────────────

function scoreLook(look: AssembledLook, candidatesById: Map<string, SlotCandidate>) {
  const editorialScores = look.slots.map((s) => candidatesById.get(s.candidateId)?.editorialScore ?? 0);
  const editorialAvg =
    editorialScores.length === 0
      ? 0
      : editorialScores.reduce((a, b) => a + b, 0) / editorialScores.length;
  const brandCounts = new Map<string, number>();
  for (const s of look.slots) {
    const b = candidatesById.get(s.candidateId)?.brand;
    if (b) brandCounts.set(b, (brandCounts.get(b) ?? 0) + 1);
  }
  const maxBrandShare =
    brandCounts.size === 0 ? 0 : Math.max(...brandCounts.values()) / look.slots.length;
  const lookBrandDiversity = 1 - (maxBrandShare - 1 / Math.max(brandCounts.size, 1));
  return {
    complete: look.complete,
    completeness: look.complete ? 1 : Math.max(0, 1 - look.missing.length / 6),
    editorial: Math.round((editorialAvg + lookBrandDiversity) * 1000) / 1000,
    missing: look.missing,
  };
}

function scoreCollection(looks: AssembledLook[], candidatesById: Map<string, SlotCandidate>) {
  const brandSet = new Set<string>();
  const retailerSet = new Set<string>();
  const silhouetteSet = new Set<string>();
  const paletteSet = new Set<string>();
  let slotCount = 0;
  const brandCounts = new Map<string, number>();
  const retailerCounts = new Map<string, number>();
  for (const look of looks) {
    if (!look.complete) continue;
    for (const s of look.slots) {
      const c = candidatesById.get(s.candidateId);
      if (!c) continue;
      slotCount++;
      brandSet.add(c.brand);
      retailerSet.add(c.retailer);
      silhouetteSet.add(c.silhouette);
      paletteSet.add(c.palette);
      brandCounts.set(c.brand, (brandCounts.get(c.brand) ?? 0) + 1);
      retailerCounts.set(c.retailer, (retailerCounts.get(c.retailer) ?? 0) + 1);
    }
  }
  const norm = (n: number) => (slotCount === 0 ? 0 : Math.round((n / slotCount) * 1000) / 1000);
  const maxBrandShare =
    brandCounts.size === 0 ? 0 : Math.max(...brandCounts.values()) / Math.max(slotCount, 1);
  const maxRetailerShare =
    retailerCounts.size === 0 ? 0 : Math.max(...retailerCounts.values()) / Math.max(slotCount, 1);
  return {
    looksTotal: looks.length,
    looksComplete: looks.filter((l) => l.complete).length,
    looksIncomplete: looks.filter((l) => !l.complete).length,
    slotCount,
    brandDiversity: norm(brandSet.size),
    retailerDiversity: norm(retailerSet.size),
    silhouetteDiversity: norm(silhouetteSet.size),
    paletteDiversity: norm(paletteSet.size),
    maxBrandShare: Math.round(maxBrandShare * 1000) / 1000,
    maxRetailerShare: Math.round(maxRetailerShare * 1000) / 1000,
    brandDistribution: Object.fromEntries(brandCounts),
    retailerDistribution: Object.fromEntries(retailerCounts),
  };
}

// ──────────────────────────────────────────────────────────────
// Persistence (complete looks only)
// ──────────────────────────────────────────────────────────────

async function persistCollection(args: {
  brief: EditorialBrief;
  looks: AssembledLook[];
  candidatesById: Map<string, SlotCandidate>;
  diagnostics: Record<string, unknown>;
  collectionScore: ReturnType<typeof scoreCollection>;
  notes?: string;
}) {
  const { brief, looks, candidatesById, diagnostics, collectionScore } = args;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: col, error: colErr } = await supabaseAdmin
    .from("editorial_collections")
    .insert({
      destination: brief.destination,
      activity: brief.activity,
      title: `${brief.destination} — ${brief.activity}`,
      brief: brief as unknown as never,
      status: "draft",
      scoring: collectionScore as unknown as never,
      diagnostics: diagnostics as unknown as never,
      notes: args.notes ?? null,
    })
    .select("id")
    .single();
  if (colErr || !col) throw new Error(`persist collection failed: ${colErr?.message ?? "no row"}`);

  // Only persist complete looks.
  const completeLooks = looks.filter((l) => l.complete);
  for (let i = 0; i < completeLooks.length; i++) {
    const look = completeLooks[i];
    const sc = scoreLook(look, candidatesById);
    const { data: lookRow, error: lookErr } = await supabaseAdmin
      .from("editorial_collection_looks")
      .insert({
        collection_id: col.id,
        position: i,
        title: look.title,
        subtitle: look.subtitle ?? null,
        description: look.description,
        style_dna: look.styleDna,
        palette: look.palette,
        editorial_score: sc.editorial,
        completeness_score: sc.completeness,
        missing_slots: sc.missing,
        status: "draft",
        reasoning: { rationale: look.reasoning ?? null },
      })
      .select("id")
      .single();
    if (lookErr || !lookRow) throw new Error(`persist look failed: ${lookErr?.message ?? "no row"}`);

    const slotRows = look.slots
      .map((s, j) => {
        const c = candidatesById.get(s.candidateId);
        if (!c) return null;
        return {
          look_id: lookRow.id,
          slot: s.slot,
          position: j,
          brand: c.brand,
          product_name: c.title,
          retailer: c.retailer,
          source_url: c.url,
          affiliate_url: c.url,
          image_url: null,
          price: null,
          reasoning: s.reasoning ?? null,
          metadata: {
            silhouette: c.silhouette,
            palette: c.palette,
            editorialScore: c.editorialScore,
            brandAffinity: c.brandAffinity,
            source: c.source,
            brandTier: c.brandTier,
            commerceSource: c.commerceSource,
          },
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    if (slotRows.length > 0) {
      const { error: slotErr } = await supabaseAdmin
        .from("editorial_collection_look_slots")
        .insert(slotRows);
      if (slotErr) throw new Error(`persist slots failed: ${slotErr.message}`);
    }
  }
  return col.id;
}

// ──────────────────────────────────────────────────────────────
// Server fn
// ──────────────────────────────────────────────────────────────

export const generateYachtDayCollection = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        targetLooks: z.number().int().min(3).max(12).default(6),
        maxBrandsPerSlot: z.number().int().min(2).max(20).default(8),
        /**
         * Floor for retailers/brand across all slots. Slot-specific
         * overrides in YACHT_DAY_SLOT_SPECS take precedence when higher.
         * Default raised from 3 → 6 because accessory inventory is
         * fragmented across many retailers.
         */
        retailersPerBrand: z.number().int().min(1).max(12).default(6),
        resultsPerSearch: z.number().int().min(1).max(10).default(4),
        persist: z.boolean().default(true),
        includeOptional: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) return { ok: false as const, stage: "config" as const, error: "FIRECRAWL_API_KEY missing" };

    const destination = "Portofino";
    const activity = "Yacht Day";
    const brief = briefFor(destination, activity);
    const specs = getSlotSpecs(destination, activity).filter(
      (s) => s.required || data.includeOptional,
    );

    // v4 — load brands via destination-agnostic helper. Pulls commerce
    // metadata so the engine can stamp + gate by commerce source.
    let brands: EngineBrand[];
    try {
      brands = await loadEngineBrands(activity, destination);
    } catch (e) {
      return {
        ok: false as const,
        stage: "discovery" as const,
        error: String((e as Error)?.message ?? e),
      };
    }
    if (!brands.length) {
      return {
        ok: false as const,
        stage: "discovery" as const,
        error: `No approved brands tagged ${activity} in the registry.`,
      };
    }

    // ── Registry analytics: count Yacht Day brands per category and flag
    // underrepresented accessory categories before discovery runs.
    const registryByCategory: Record<string, number> = {};
    for (const b of brands) {
      for (const c of b.categories) {
        registryByCategory[c] = (registryByCategory[c] ?? 0) + 1;
      }
    }
    const weakCategoryThreshold = 5;
    const accessoryCategoryAliases: Record<string, string[]> = {
      sunglasses: ["sunglasses", "eyewear"],
      shoes: ["shoes", "sandals", "footwear"],
      bag: ["bags", "bag"],
      jewelry: ["jewelry", "jewellery"],
      hat: ["hats", "hat", "millinery"],
    };
    const registryCoverage = Object.entries(accessoryCategoryAliases).map(([slot, aliases]) => {
      const count = aliases.reduce((sum, a) => sum + (registryByCategory[a] ?? 0), 0);
      return {
        slot,
        brandCount: count,
        weak: count < weakCategoryThreshold,
        expansionPoolSize: ACCESSORY_EXPANSION_BRANDS[slot]?.length ?? 0,
      };
    });

    // Per-slot discovery — shared dedup so the same URL doesn't show
    // in two slots.
    const canonicalSeen = new Map<string, string>();
    const seenUrls = new Set<string>();
    const idCounter = { n: 0 };
    const slotResults: SlotDiscoveryResult[] = [];
    let brandOffset = 0;
    for (const spec of specs) {
      // Cap brands per slot for budget.
      const slotBrands = brands
        .filter((b) => b.categories.some((c) => spec.brandCategories.includes(c)))
        .slice(0, data.maxBrandsPerSlot);
      // Effective retailers/brand for THIS slot. The slot's intrinsic
      // accessory-aware override floors the global setting — accessory
      // slots will not run with thin retailer coverage even if the user
      // sets the global knob low.
      const effectiveRetailersPerBrand = Math.max(
        data.retailersPerBrand,
        spec.retailersPerBrand,
      );
      const r = await discoverForSlot({
        apiKey,
        spec,
        brands: slotBrands,
        resultsPerSearch: data.resultsPerSearch,
        retailersPerBrand: effectiveRetailersPerBrand,
        brandOffset,
        idCounter,
        canonicalSeen,
        seenUrls,
        source: "core",
        destination,
        activity,
      });

      // Tier-2 controlled accessory expansion.
      if (
        EXPANDABLE_SLOTS.has(spec.slot) &&
        r.shortfall > 0 &&
        (ACCESSORY_EXPANSION_BRANDS[spec.slot]?.length ?? 0) > 0
      ) {
        const coreBrandNames = new Set(slotBrands.map((b) => b.name.toLowerCase()));
        const expansionBrandNames = (ACCESSORY_EXPANSION_BRANDS[spec.slot] ?? [])
          .filter((n) => !coreBrandNames.has(n.toLowerCase()))
          .slice(0, data.maxBrandsPerSlot);
        const expansionBrands: EngineBrand[] = expansionBrandNames.map((name) => ({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          tier: "expansion",
          categories: spec.brandCategories,
          commerceSources: [],
          preferredCommerceSource: "affiliate_retailer" as const,
          editorialAffinity: {},
        }));
        const exp = await discoverForSlot({
          apiKey,
          spec,
          brands: expansionBrands,
          resultsPerSearch: data.resultsPerSearch,
          retailersPerBrand: effectiveRetailersPerBrand,
          brandOffset: brandOffset + slotBrands.length,
          idCounter,
          canonicalSeen,
          seenUrls,
          source: "expansion",
          startingCount: r.candidates.length,
          destination,
          activity,
        });
        const acceptedExpansion = exp.candidates.length;
        // Merge expansion candidates into the slot.
        r.candidates = [...r.candidates, ...exp.candidates];
        r.searchesIssued += exp.searchesIssued;
        r.rawResults += exp.rawResults;
        for (const [k, v] of Object.entries(exp.rejections)) {
          r.rejections[k] = (r.rejections[k] ?? 0) + v;
        }
        for (const rt of exp.retailersQueried) {
          if (!r.retailersQueried.includes(rt)) r.retailersQueried.push(rt);
        }
        const reprSet = new Set(r.retailersRepresented);
        for (const rt of exp.retailersRepresented) reprSet.add(rt);
        r.retailersRepresented = Array.from(reprSet);
        r.shortfall = Math.max(0, spec.targetMin - r.candidates.length);
        r.expansion = {
          triggered: true,
          reason: `Tier-1 returned ${r.candidates.length - acceptedExpansion} of ${spec.targetMin} required`,
          brandsConsidered: expansionBrandNames,
          searchesIssued: exp.searchesIssued,
          rawResults: exp.rawResults,
          accepted: acceptedExpansion,
          rejections: exp.rejections,
          retailersQueried: exp.retailersQueried,
          retailersRepresented: exp.retailersRepresented,
        };
      } else {
        r.expansion = EXPANDABLE_SLOTS.has(spec.slot)
          ? {
              triggered: false,
              reason: "tier-1 met target",
              brandsConsidered: [],
              searchesIssued: 0,
              rawResults: 0,
              accepted: 0,
              rejections: {},
              retailersQueried: [],
              retailersRepresented: [],
            }
          : null;
      }

      slotResults.push(r);
      brandOffset += slotBrands.length;
    }

    // Slot coverage report.
    const slotCoverage = slotResults.map((r) => ({
      slot: r.slot,
      label: r.label,
      required: r.required,
      target: `${r.targetMin}-${r.targetMax}`,
      found: r.candidates.length,
      coreFound: r.candidates.filter((c) => c.source === "core").length,
      expansionFound: r.candidates.filter((c) => c.source === "expansion").length,
      shortfall: r.shortfall,
      covered: r.candidates.length >= r.targetMin,
      brandsSearched: r.brandsConsidered.length,
      searchesIssued: r.searchesIssued,
      retailersPerBrand: r.retailersPerBrand,
      retailersQueried: r.retailersQueried,
      retailersRepresented: r.retailersRepresented,
      rejections: r.rejections,
      expansion: r.expansion,
      expandable: EXPANDABLE_SLOTS.has(r.slot),
    }));

    const missingRequiredSlots = slotResults
      .filter((r) => r.required && r.candidates.length === 0)
      .map((r) => r.slot);

    const candidatesById = new Map<string, SlotCandidate>();
    for (const r of slotResults) r.candidates.forEach((c) => candidatesById.set(c.id, c));

    // ── v4.5 — Editorial Collection Director.
    //
    // Plan the six-page editorial BEFORE re-scoring candidates. Each
    // LookPlan carries a rhythm role, mood, color direction, silhouette,
    // and the archetype to source against. The first hero is the
    // Statement Arrival; diagnostics may reassign post-assembly.
    const planSeed = `${destination}|${activity}|${new Date().toISOString().slice(0, 10)}`;
    const lookPlans: LookPlan[] = planEditorialCollection(data.targetLooks, planSeed);
    const archetypeAssignments: SwimArchetypeId[] = lookPlans.map((p) => p.archetype);
    // Legacy fallback path (engine elsewhere still calls assignArchetypes
    // via tests). Reference once so the import isn't tree-shaken away.
    void assignArchetypes;
    const swimResult = slotResults.find((r) => r.slot === "swim");
    if (swimResult) {
      for (const c of swimResult.candidates) {
        let bestBoost = 0;
        for (const aid of new Set(archetypeAssignments)) {
          const boost = swimArchetypeBoost({ brand: c.brand, title: c.title, archetype: aid });
          if (boost > bestBoost) bestBoost = boost;
        }
        c.editorialScore = Math.round((c.editorialScore + bestBoost) * 1000) / 1000;
      }
      swimResult.candidates.sort((a, b) => b.editorialScore - a.editorialScore);
    }

    // ── v4.5 — Soft rotation re-rank, per slot.
    //
    // For each slot, when the top-N candidates contain a dominant brand,
    // promote near-tied alternates from other brands (within
    // ROTATION_TIE_THRESHOLD score gap). Truly stronger products keep
    // their position — the rule is "rhythm over repetition" but never
    // weaker products.
    const rotationTradeoffs: Array<{ slot: string; brand: string; gap: number }> = [];
    for (const r of slotResults) {
      if (r.candidates.length < 4) continue;
      const reranked: typeof r.candidates = [];
      const remaining = [...r.candidates];
      const brandUseInTop = new Map<string, number>();
      const topN = Math.min(remaining.length, data.targetLooks);
      while (reranked.length < topN && remaining.length > 0) {
        remaining.sort((a, b) => {
          const penA = rotationPenalty(brandUseInTop.get(a.brand) ?? 0);
          const penB = rotationPenalty(brandUseInTop.get(b.brand) ?? 0);
          return b.editorialScore - penB - (a.editorialScore - penA);
        });
        const chosen = remaining.shift()!;
        // If the natural top was rotated down, record the trade-off.
        const natural = r.candidates[reranked.length];
        if (natural && natural.id !== chosen.id) {
          const gap = natural.editorialScore - chosen.editorialScore;
          if (gap <= ROTATION_TIE_THRESHOLD) {
            rotationTradeoffs.push({ slot: r.slot, brand: natural.brand, gap: Math.round(gap * 1000) / 1000 });
          } else {
            // Strong product wins — undo this swap.
            remaining.unshift(chosen);
            remaining.sort((a, b) => b.editorialScore - a.editorialScore);
            const winner = remaining.shift()!;
            brandUseInTop.set(winner.brand, (brandUseInTop.get(winner.brand) ?? 0) + 1);
            reranked.push(winner);
            continue;
          }
        }
        brandUseInTop.set(chosen.brand, (brandUseInTop.get(chosen.brand) ?? 0) + 1);
        reranked.push(chosen);
      }
      // Append everything else by raw score.
      remaining.sort((a, b) => b.editorialScore - a.editorialScore);
      r.candidates = [...reranked, ...remaining];
    }

    // v4 — commerce source mix across the candidate pool.
    const commerceSourceMix = (() => {
      const counts: Record<string, number> = {};
      for (const c of candidatesById.values()) {
        counts[c.commerceSource] = (counts[c.commerceSource] ?? 0) + 1;
      }
      const total = candidatesById.size || 1;
      return {
        counts,
        shares: Object.fromEntries(
          Object.entries(counts).map(([k, v]) => [k, Math.round((v / total) * 1000) / 1000]),
        ),
      };
    })();

    // PRE-ASSEMBLY GATE: refuse Gemini call if any required slot is empty.
    if (missingRequiredSlots.length > 0) {
      const slotEffectivenessGated = buildSlotEffectiveness(slotResults, [], candidatesById);
      return {
        ok: true as const,
        ranAt: new Date().toISOString(),
        brief,
        slotCoverage,
        registryCoverage,
        slotEffectiveness: slotEffectivenessGated,
        commerceSourceMix,
        candidates: [...candidatesById.values()],
        looks: [],
        assemblyError: `Insufficient candidates for complete look generation. Required slots with zero candidates: ${missingRequiredSlots.join(", ")}.`,
        gated: true as const,
        collectionId: null,
        collectionScore: null,
        lookScores: [],
        discoveryTelemetry: aggregateTelemetry(slotResults, candidatesById.size),
      };
    }

    // Assembly.
    let looks: AssembledLook[] = [];
    let assemblyError: string | null = null;
    try {
      looks = await assembleLooks(brief, slotResults, specs, data.targetLooks, archetypeAssignments);
    } catch (e) {
      assemblyError = String((e as Error)?.message ?? e);
    }

    // ── v4.2 — Enforce collection-wide swim brand caps (Missoni ≤1).
    // Walks complete looks in order. When a cap is breached, attempts
    // to swap the offending look's swim slot for a non-capped candidate
    // matching the look's archetype hint. Records every swap or
    // unresolved breach in decision-deviations.
    const decisionDeviations: Array<{
      reason: string;
      detail: string;
      lookIndex?: number;
    }> = [];
    const swimUsage = new Map<string, number>();
    const usedCandidateIds = new Set<string>();
    for (const l of looks) for (const s of l.slots) usedCandidateIds.add(s.candidateId);
    if (swimResult) {
      for (let i = 0; i < looks.length; i++) {
        const look = looks[i];
        if (!look.complete) continue;
        const swimSlot = look.slots.find((s) => s.slot === "swim");
        if (!swimSlot) continue;
        const cand = candidatesById.get(swimSlot.candidateId);
        if (!cand) continue;
        const cap = SWIM_BRAND_CAPS[cand.brand];
        const used = swimUsage.get(cand.brand) ?? 0;
        if (cap != null && used >= cap) {
          // Find an unused, non-capped, non-same-brand alternative.
          const alt = swimResult.candidates.find((c) => {
            if (usedCandidateIds.has(c.id)) return false;
            const altCap = SWIM_BRAND_CAPS[c.brand];
            const altUsed = swimUsage.get(c.brand) ?? 0;
            if (altCap != null && altUsed >= altCap) return false;
            return c.brand.toLowerCase() !== cand.brand.toLowerCase();
          });
          if (alt) {
            usedCandidateIds.delete(swimSlot.candidateId);
            usedCandidateIds.add(alt.id);
            swimSlot.candidateId = alt.id;
            swimSlot.reasoning = `[v4.2 cap swap] Replaced ${cand.brand} swim — collection cap = ${cap}. Substituted ${alt.brand}.`;
            swimUsage.set(alt.brand, (swimUsage.get(alt.brand) ?? 0) + 1);
            decisionDeviations.push({
              reason: "swim_cap_enforced",
              detail: `Look ${i + 1}: swapped ${cand.brand} → ${alt.brand} (cap ${cap}).`,
              lookIndex: i,
            });
          } else {
            decisionDeviations.push({
              reason: "swim_cap_breach_unresolved",
              detail: `Look ${i + 1}: ${cand.brand} swim cap=${cap} exceeded, no replacement available in pool.`,
              lookIndex: i,
            });
            swimUsage.set(cand.brand, used + 1);
          }
        } else {
          swimUsage.set(cand.brand, used + 1);
        }
      }
    }

    // ── v4.2 — Hero Look guardrail. Demote any look whose swim brand is
    // supporting-only (e.g. St. Barths) to position > 0 if it landed at
    // position 0. Records a deviation note.
    if (looks.length > 1) {
      const heroSwim = looks[0].slots.find((s) => s.slot === "swim");
      const heroCand = heroSwim ? candidatesById.get(heroSwim.candidateId) : null;
      if (heroCand && SUPPORTING_ONLY_BRANDS.has(heroCand.brand)) {
        // Find a non-supporting look to swap with.
        const swapIdx = looks.findIndex((l, i) => {
          if (i === 0) return false;
          const s = l.slots.find((sl) => sl.slot === "swim");
          const c = s ? candidatesById.get(s.candidateId) : null;
          return c ? !SUPPORTING_ONLY_BRANDS.has(c.brand) : false;
        });
        if (swapIdx > 0) {
          const tmp = looks[0];
          looks[0] = looks[swapIdx];
          looks[swapIdx] = tmp;
          decisionDeviations.push({
            reason: "supporting_only_demoted",
            detail: `Demoted ${heroCand.brand} from Hero Look — supporting-only swim brand.`,
          });
        }
      }
    }

    // ── v4.2 — Swim diagnostics + cohesion scoring.
    const swimDiagnostics: SwimDiagnostics = (() => {
      const detected: SwimDiagnostics["archetypesDetected"] = [];
      const cohesionScores: SwimDiagnostics["cohesionScores"] = [];
      const signatureMatched: SwimDiagnostics["signaturePiecesMatched"] = [];
      const silhouetteBalance: Record<string, number> = {};
      let printCount = 0;
      let neutralCount = 0;
      let hardwareUsage = 0;
      let crochetUsage = 0;
      let cutoutUsage = 0;
      const brandCounts = new Map<string, number>();

      looks.forEach((l, i) => {
        if (!l.complete) return;
        const swimSlot = l.slots.find((s) => s.slot === "swim");
        const swim = swimSlot ? candidatesById.get(swimSlot.candidateId) : null;
        const assigned = archetypeAssignments[i] ?? archetypeAssignments[0];
        const det = swim ? detectArchetypeForSwim({ brand: swim.brand, title: swim.title }) : null;
        detected.push({ lookIndex: i, assigned, detected: det, match: det === assigned });
        if (swim) {
          brandCounts.set(swim.brand, (brandCounts.get(swim.brand) ?? 0) + 1);
          silhouetteBalance[swim.silhouette] = (silhouetteBalance[swim.silhouette] ?? 0) + 1;
          const t = (swim.title ?? "").toLowerCase();
          if (/(print|floral|chevron|paisley|tile|majolica)/.test(t)) printCount++; else neutralCount++;
          if (/(hardware|ring|chain|gold|buckle)/.test(t)) hardwareUsage++;
          if (/(crochet|knit|woven|lace)/.test(t)) crochetUsage++;
          if (/(cut[ -]?out|open back)/.test(t)) cutoutUsage++;

          for (const sig of SIGNATURE_SWIM) {
            if (sig.brand.toLowerCase() === swim.brand.toLowerCase()) {
              const toks = sig.name.toLowerCase().split(/\s+/).filter((x) => x.length > 3);
              const overlap = toks.filter((tok) => t.includes(tok)).length;
              if (overlap >= 2) signatureMatched.push({ lookIndex: i, brand: sig.brand, name: sig.name });
            }
          }
        }

        // Cohesion: count cohesive non-swim slots / total non-swim slots.
        const recipe = det ?? assigned;
        const nonSwim = l.slots.filter((s) => s.slot !== "swim");
        let cohesive = 0;
        for (const s of nonSwim) {
          const c = candidatesById.get(s.candidateId);
          if (!c) continue;
          const slotKey = (s.slot === "coverup" || s.slot === "bag" || s.slot === "jewelry" || s.slot === "shoes" || s.slot === "sunglasses") ? s.slot : null;
          if (!slotKey) continue;
          if (cohesionMatch({ slot: slotKey, archetype: recipe, brand: c.brand, title: c.title, palette: c.palette })) cohesive++;
        }
        cohesionScores.push({
          lookIndex: i,
          score: nonSwim.length ? Math.round((cohesive / nonSwim.length) * 1000) / 1000 : 0,
          slotsCohesive: cohesive,
          slotsTotal: nonSwim.length,
        });
      });

      const brandCapBreaches: SwimDiagnostics["brandCapBreaches"] = [];
      for (const [brand, cap] of Object.entries(SWIM_BRAND_CAPS)) {
        const actual = brandCounts.get(brand) ?? 0;
        if (actual > cap) brandCapBreaches.push({ brand, cap, actual });
      }

      const detectedSet = new Set(detected.map((d) => d.detected ?? d.assigned));
      const warnings: string[] = [];
      if (detectedSet.size < detected.length) {
        warnings.push(`Only ${detectedSet.size} distinct archetypes across ${detected.length} looks — duplicate swim stories detected.`);
      }
      brandCapBreaches.forEach((b) =>
        warnings.push(`${b.brand} swim used ${b.actual}× (cap = ${b.cap}).`),
      );
      cohesionScores
        .filter((c) => c.score < 0.75)
        .forEach((c) => warnings.push(`Look ${c.lookIndex + 1} cohesion ${(c.score * 100).toFixed(0)}% (target ≥75%).`));

      // Hero vs discovery share — guideline, not enforcement.
      const filledLooks = looks.filter((l) => l.complete);
      let heroBrand = 0;
      let totalProducts = 0;
      for (const l of filledLooks) {
        for (const s of l.slots) {
          const c = candidatesById.get(s.candidateId);
          if (!c) continue;
          totalProducts++;
          if (c.brandTier === "luxury") heroBrand++;
        }
      }
      const heroShare = totalProducts ? heroBrand / totalProducts : 0;
      const discoveryShare = totalProducts ? 1 - heroShare : 0;
      if (totalProducts > 0 && (heroShare < 0.25 || heroShare > 0.35)) {
        decisionDeviations.push({
          reason: "hero_discovery_ratio_relaxed",
          detail: `Hero brand share ${(heroShare * 100).toFixed(0)}% (target 25–35%). Editorial quality favored over ratio.`,
        });
      }

      return {
        archetypesAssigned: archetypeAssignments,
        archetypesDetected: detected,
        uniqueArchetypeCount: detectedSet.size,
        brandCapBreaches,
        signaturePiecesMatched: signatureMatched,
        cohesionScores,
        averageCohesion:
          cohesionScores.length
            ? Math.round((cohesionScores.reduce((a, b) => a + b.score, 0) / cohesionScores.length) * 1000) / 1000
            : 0,
        warnings,
        silhouetteBalance,
        printVsNeutral: { print: printCount, neutral: neutralCount },
        hardwareUsage,
        crochetUsage,
        cutoutUsage,
        heroBrandShare: Math.round(heroShare * 1000) / 1000,
        discoveryBrandShare: Math.round(discoveryShare * 1000) / 1000,
      };
    })();

    const lookScores = looks.map((l) => ({ title: l.title, ...scoreLook(l, candidatesById) }));
    const collectionScore = scoreCollection(looks, candidatesById);

    // ──────────────────────────────────────────────────────────────
    // v4.5 — Editorial Collection Diagnostics
    //
    // After all assembly + cap-swap + supporting-only demotion has
    // settled, measure the collection as an editorial artifact:
    //   - visual repetition (fingerprint overlap)
    //   - accessory rotation
    //   - brand dominance
    //   - hero strength + possible reassignment
    //   - editorial rhythm (role sequencing)
    //   - luxury perception + memorability
    //
    // Rotation re-rank earlier was "soft" — when the best product
    // repeated a brand, it stayed. We record that decision here.
    // ──────────────────────────────────────────────────────────────
    const editorialDecisions: Array<{
      kind: string;
      lookIndex?: number;
      detail: string;
    }> = rotationTradeoffs.map((t) => ({
      kind: "soft_rotation_swap",
      detail: `Slot ${t.slot}: rotated ${t.brand} → alternate brand (score gap ${t.gap}).`,
    }));

    // Stamp rhythm role + (initial) hero from the LookPlan onto each look.
    looks.forEach((l, i) => {
      const plan = lookPlans[i];
      if (!plan) return;
      l.rhythmRole = plan.role;
      l.rhythmRoleLabel = plan.roleLabel;
      l.isHero = plan.isHero;
    });

    // Per-look fingerprint + hero strength.
    const lookFingerprints = looks.map((l) => {
      const slotsForFp = l.slots
        .map((s) => {
          const c = candidatesById.get(s.candidateId);
          if (!c) return null;
          return {
            slot: s.slot,
            brand: c.brand,
            title: c.title ?? null,
            description: c.description ?? null,
            silhouette: c.silhouette,
            palette: c.palette,
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
      return fingerprintLook(slotsForFp);
    });

    const looksForDiag = looks.map((l) => ({
      slots: l.slots.map((s) => {
        const c = candidatesById.get(s.candidateId);
        return {
          slot: s.slot,
          brand: c?.brand ?? null,
          editorialScore: c?.editorialScore ?? null,
          brandAffinity: c?.brandAffinity ?? null,
        };
      }),
    }));

    const heroStrengths = looks.map((l, i) => {
      const swimCohesion =
        swimDiagnostics.cohesionScores.find((c) => c.lookIndex === i)?.score ?? 0;
      return computeHeroStrength(looksForDiag[i], swimCohesion);
    });
    heroStrengths.forEach((s, i) => {
      looks[i].heroStrength = s;
    });

    // Hero reassignment: the strongest look becomes the hero. If the
    // planned hero is overtaken by another look (margin ≥ 8 points),
    // crown the stronger one and record the reassignment.
    const plannedHeroIndex = looks.findIndex((l) => l.isHero);
    const strongestIndex = heroStrengths.reduce(
      (best, val, i) => (val > heroStrengths[best] ? i : best),
      0,
    );
    let heroReassigned: { from: number; to: number; margin: number } | null = null;
    if (
      plannedHeroIndex >= 0 &&
      strongestIndex !== plannedHeroIndex &&
      heroStrengths[strongestIndex] - heroStrengths[plannedHeroIndex] >= 8
    ) {
      looks[plannedHeroIndex].isHero = false;
      looks[strongestIndex].isHero = true;
      heroReassigned = {
        from: plannedHeroIndex,
        to: strongestIndex,
        margin: heroStrengths[strongestIndex] - heroStrengths[plannedHeroIndex],
      };
      editorialDecisions.push({
        kind: "hero_reassigned",
        lookIndex: strongestIndex,
        detail: `Hero crown moved from Look ${plannedHeroIndex + 1} (${
          looks[plannedHeroIndex].rhythmRoleLabel ?? "?"
        }) to Look ${strongestIndex + 1} (${
          looks[strongestIndex].rhythmRoleLabel ?? "?"
        }) — heroStrength margin ${heroReassigned.margin}.`,
      });
    }

    const visualRepetition = computeVisualRepetitionScore(lookFingerprints);
    const accessoryRotation = computeAccessoryRotationScore(looksForDiag);
    const brandDominance = computeBrandDominanceScore(looksForDiag);
    const rhythmScore = computeEditorialRhythmScore(
      looks.map((l) => l.rhythmRole ?? "unknown"),
    );
    const luxuryPerception = computeLuxuryPerceptionScore(looksForDiag);
    const heroLookStrength = heroStrengths[looks.findIndex((l) => l.isHero)] ?? 0;
    const memorability = computeMemorabilityScore(
      visualRepetition.score,
      luxuryPerception,
      heroLookStrength,
    );

    // Soft trade-off bookkeeping: brand caused dominance but won on quality.
    for (const w of brandDominance.warnings) {
      editorialDecisions.push({ kind: "brand_dominance_allowed", detail: `${w} Strongest editorial choice retained.` });
    }
    for (const w of accessoryRotation.warnings) {
      editorialDecisions.push({ kind: "accessory_rotation_flat", detail: w });
    }
    for (const p of visualRepetition.pairs) {
      editorialDecisions.push({
        kind: "visual_repetition_pair",
        detail: `Look ${p.a + 1} and Look ${p.b + 1} share ${p.overlap} visual signals.`,
      });
    }

    // ── v4.5 — Editorial copy rewrite (one batched Gemini call).
    const copyWarnings: string[] = [];
    try {
      const rewriteInput = looks.map((l, i) => {
        const plan = lookPlans[i];
        const hookProducts = l.slots
          .slice(0, 3)
          .map((s) => {
            const c = candidatesById.get(s.candidateId);
            return c ? `${c.brand} ${c.title ?? ""}`.trim() : "";
          })
          .filter(Boolean);
        return {
          index: i,
          roleLabel: plan?.roleLabel ?? l.rhythmRoleLabel ?? `Look ${i + 1}`,
          archetype: plan?.archetype ?? archetypeAssignments[i] ?? "unknown",
          mood: plan?.mood ?? "",
          personality: plan?.personality ?? "",
          colorDirection: plan?.colorDirection ?? [],
          hero: !!l.isHero,
          hookProducts,
        };
      });
      const rewritten = await rewriteCollectionCopy({
        destination: brief.destination,
        activity: brief.activity,
        looks: rewriteInput,
      });
      for (const r of rewritten) {
        if (r.index < 0 || r.index >= looks.length) continue;
        if (r.title) looks[r.index].title = r.title;
        if (r.subtitle) looks[r.index].subtitle = r.subtitle;
        if (r.description) looks[r.index].description = r.description;
      }
      // Banned-phrase audit (safety net after strip).
      for (let i = 0; i < looks.length; i++) {
        const blob = `${looks[i].title} ${looks[i].subtitle ?? ""} ${looks[i].description}`;
        const hit = containsBannedPhrase(blob);
        if (hit) copyWarnings.push(`Look ${i + 1} copy contains banned phrase "${hit}".`);
      }
    } catch (e) {
      copyWarnings.push(`Editorial copy rewrite failed: ${String((e as Error)?.message ?? e)}`);
    }

    const editorialDiagnostics = {
      rhythmPlan: lookPlans.map((p) => ({
        index: p.index,
        role: p.role,
        roleLabel: p.roleLabel,
        archetype: p.archetype,
        plannedHero: p.isHero,
        colorDirection: p.colorDirection,
        silhouette: p.silhouette,
      })),
      heroStrengths,
      heroLookIndex: looks.findIndex((l) => l.isHero),
      heroReassigned,
      scores: {
        visualRepetition: visualRepetition.score,
        accessoryRotation: accessoryRotation.score,
        brandDominance: brandDominance.score,
        editorialRhythm: rhythmScore,
        luxuryPerception,
        heroLookStrength,
        memorability,
      },
      warnings: [
        ...brandDominance.warnings,
        ...accessoryRotation.warnings,
        ...visualRepetition.pairs.map(
          (p) => `Look ${p.a + 1} ↔ Look ${p.b + 1}: ${p.overlap} visual overlaps.`,
        ),
        ...copyWarnings,
      ],
      brandCounts: brandDominance.brandCounts,
      topBrand: brandDominance.topBrand,
      copyWarnings,
    };

    // ── Slot Effectiveness Report — computed AFTER assembly so it can
    // count how many candidates each slot actually contributed to the
    // final looks (not just discovery yield).
    const slotEffectiveness = buildSlotEffectiveness(slotResults, looks, candidatesById);

    // Persistence (complete looks only).
    let collectionId: string | null = null;
    let persistError: string | null = null;
    if (data.persist && looks.some((l) => l.complete)) {
      try {
        collectionId = await persistCollection({
          brief,
          looks,
          candidatesById,
          diagnostics: {
            slotCoverage,
            assembly: { lookScores, error: assemblyError },
            swimDiagnostics,
            decisionDeviations,
            editorialDiagnostics,
            editorialDecisions,
          },
          collectionScore,
        });
      } catch (e) {
        persistError = String((e as Error)?.message ?? e);
      }
    }

    return {
      ok: true as const,
      ranAt: new Date().toISOString(),
      brief,
      slotCoverage,
      registryCoverage,
      slotEffectiveness,
      commerceSourceMix,
      gated: false as const,
      candidates: [...candidatesById.values()],
      discoveryTelemetry: aggregateTelemetry(slotResults, candidatesById.size),
      assemblyError,
      persistError,
      collectionId,
      collectionScore,
      lookScores,
      swimDiagnostics,
      decisionDeviations,
      editorialDiagnostics,
      editorialDecisions,
      looks: looks.map((l) => ({
        ...l,
        slots: l.slots.map((s) => {
          const c = candidatesById.get(s.candidateId);
          return {
            slot: s.slot,
            candidateId: s.candidateId,
            reasoning: s.reasoning ?? null,
            brand: c?.brand ?? null,
            brandTier: c?.brandTier ?? null,
            source: c?.source ?? null,
            retailer: c?.retailer ?? null,
            title: c?.title ?? null,
            url: c?.url ?? null,
            silhouette: c?.silhouette ?? null,
            palette: c?.palette ?? null,
            editorialScore: c?.editorialScore ?? null,
            commerceSource: c?.commerceSource ?? null,
            approvalLevel: c?.approvalLevel ?? null,
            familyMatched: c?.familyMatched ?? null,
            constructionScore: c?.constructionScore ?? null,
            curationReason: c?.curationReason ?? null,
          };
        }),
      })),
    };
  });

function aggregateTelemetry(results: SlotDiscoveryResult[], totalCandidates: number) {
  let searches = 0;
  let raw = 0;
  const allRej: Record<string, number> = {};
  let expansionSearches = 0;
  let expansionAccepted = 0;
  const expansionSlots: string[] = [];
  for (const r of results) {
    searches += r.searchesIssued;
    raw += r.rawResults;
    for (const [k, v] of Object.entries(r.rejections)) {
      allRej[k] = (allRej[k] ?? 0) + v;
    }
    if (r.expansion?.triggered) {
      expansionSearches += r.expansion.searchesIssued;
      expansionAccepted += r.expansion.accepted;
      expansionSlots.push(r.slot);
    }
  }
  return {
    searchesIssued: searches,
    rawResults: raw,
    totalCandidates,
    rejectionsByReason: allRej,
    approxFirecrawlCredits: searches,
    scrapesPerformed: 0,
    dbWrites: 0,
    expansion: {
      slotsExpanded: expansionSlots,
      searchesIssued: expansionSearches,
      candidatesAccepted: expansionAccepted,
    },
  };
}

// ──────────────────────────────────────────────────────────────
// Slot Effectiveness Report
//
// Per-slot read of HOW WELL discovery served assembly:
//   - core brands searched / expansion activated
//   - retailers searched / represented
//   - candidates found / accepted / rejected
//   - final products used (count of slot fills in complete looks)
//   - brand & retailer diversity
//   - strong / adequate / weak rating
// ──────────────────────────────────────────────────────────────

type Effectiveness = "strong" | "adequate" | "weak";

function rateEffectiveness(args: {
  required: boolean;
  finalUsed: number;
  uniqueBrands: number;
  uniqueRetailers: number;
  shortfall: number;
}): Effectiveness {
  const { required, finalUsed, uniqueBrands, uniqueRetailers, shortfall } = args;
  // A slot is "weak" if discovery fell short OR final looks lean on a
  // single brand / single retailer (no real choice for the stylist).
  if (shortfall > 0) return "weak";
  if (uniqueBrands < 2) return "weak";
  if (required && finalUsed === 0) return "weak";
  if (uniqueBrands >= 4 && uniqueRetailers >= 3) return "strong";
  return "adequate";
}

function buildSlotEffectiveness(
  results: SlotDiscoveryResult[],
  looks: AssembledLook[],
  candidatesById: Map<string, SlotCandidate>,
) {
  // Count how many candidates per slot ended up in a COMPLETE look.
  const finalUsedBySlot = new Map<string, number>();
  const finalBrandsBySlot = new Map<string, Set<string>>();
  const finalRetailersBySlot = new Map<string, Set<string>>();
  for (const look of looks) {
    if (!look.complete) continue;
    for (const s of look.slots) {
      const c = candidatesById.get(s.candidateId);
      if (!c) continue;
      finalUsedBySlot.set(s.slot, (finalUsedBySlot.get(s.slot) ?? 0) + 1);
      if (!finalBrandsBySlot.has(s.slot)) finalBrandsBySlot.set(s.slot, new Set());
      if (!finalRetailersBySlot.has(s.slot)) finalRetailersBySlot.set(s.slot, new Set());
      finalBrandsBySlot.get(s.slot)!.add(c.brand);
      finalRetailersBySlot.get(s.slot)!.add(c.retailer);
    }
  }

  return results.map((r) => {
    const accepted = r.candidates.length;
    const rejected = Object.values(r.rejections).reduce((a, b) => a + b, 0);
    const candidateBrands = new Set(r.candidates.map((c) => c.brand));
    const candidateRetailers = new Set(r.candidates.map((c) => c.retailer));
    const finalUsed = finalUsedBySlot.get(r.slot) ?? 0;
    const finalBrands = finalBrandsBySlot.get(r.slot)?.size ?? 0;
    const finalRetailers = finalRetailersBySlot.get(r.slot)?.size ?? 0;
    const rating = rateEffectiveness({
      required: r.required,
      finalUsed,
      uniqueBrands: candidateBrands.size,
      uniqueRetailers: candidateRetailers.size,
      shortfall: r.shortfall,
    });
    const expansionTriggered = r.expansion?.triggered ?? false;
    const expansionEligible = EXPANDABLE_SLOTS.has(r.slot);
    return {
      slot: r.slot,
      label: r.label,
      required: r.required,
      // Brand pools.
      coreBrandsSearched: r.brandsConsidered.length,
      coreBrands: r.brandsConsidered,
      expansionEligible,
      expansionActivated: expansionTriggered,
      expansionBrandsSearched: r.expansion?.brandsConsidered.length ?? 0,
      // Retailer pools.
      retailersPerBrand: r.retailersPerBrand,
      retailersSearched: r.retailersQueried.length,
      retailersSearchedList: r.retailersQueried,
      retailersRepresentedCount: r.retailersRepresented.length,
      retailersRepresented: r.retailersRepresented,
      // Candidate flow.
      candidatesFound: r.rawResults,
      candidatesAccepted: accepted,
      candidatesRejected: rejected,
      acceptanceRate:
        r.rawResults > 0 ? Math.round((accepted / r.rawResults) * 1000) / 1000 : 0,
      // Final outcome.
      finalProductsUsed: finalUsed,
      brandDiversity: candidateBrands.size,
      retailerDiversity: candidateRetailers.size,
      finalBrandDiversity: finalBrands,
      finalRetailerDiversity: finalRetailers,
      coverage: rating,
    };
  });
}
