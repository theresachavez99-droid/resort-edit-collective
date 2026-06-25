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

// ──────────────────────────────────────────────────────────────
// Slot specs — every required slot has its own brand categories,
// templates, target candidate count, and silhouette fillers.
// ──────────────────────────────────────────────────────────────

type SlotSpec = {
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
  },
];

const ACTIVITY_SLOTS: Record<string, SlotSpec[]> = {
  "Yacht Day": YACHT_DAY_SLOT_SPECS,
};

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

type SlotCandidate = {
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
  matchedQuery: string;
  source: "core" | "expansion";
};

type SlotDiscoveryResult = {
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
  /** Tier-2 controlled accessory expansion telemetry (null when not eligible / not triggered). */
  expansion?: {
    triggered: boolean;
    reason: string;
    brandsConsidered: string[];
    searchesIssued: number;
    rawResults: number;
    accepted: number;
    rejections: Record<string, number>;
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

async function discoverForSlot(args: {
  apiKey: string;
  spec: SlotSpec;
  brands: Array<{ name: string; slug: string; tier: string | null; categories: string[] }>;
  resultsPerSearch: number;
  retailersPerBrand: number;
  brandOffset: number;
  idCounter: { n: number };
  canonicalSeen: Map<string, string>;
  seenUrls: Set<string>;
  source?: "core" | "expansion";
  startingCount?: number;
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

  const candidates: SlotCandidate[] = [];
  const rejections: Record<string, number> = {};
  const bump = (k: string) => (rejections[k] = (rejections[k] ?? 0) + 1);

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
          const score = scoreEditorial({
            title,
            description,
            silhouette,
            brandTier: brand.tier,
          });
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
            matchedQuery: tpl,
            source,
          });
        }
      }
    }
  }

  // Sort by editorial score, retain up to targetMax.
  candidates.sort((a, b) => b.editorialScore - a.editorialScore);
  const remaining = Math.max(0, spec.targetMax - startingCount);
  const kept = candidates.slice(0, remaining);

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

  const system = `You are the fashion director at Resort Edit, a luxury destination styling platform.
You compose COMPLETE editorial looks from a slot-indexed candidate pool.
Return strict JSON only. Never invent products or ids not in the pool.`;

  const user = `EDITORIAL BRIEF
Destination: ${brief.destination}
Activity: ${brief.activity}
Mood: ${brief.mood}
Palette: ${brief.palette.join(", ")}
Style DNA: ${brief.styleDna.join(", ")}
Notes: ${brief.notes}
${themes}

OUTFIT SLOTS
${slotLines}

REQUIRED SLOTS: ${requiredSlotNames.join(", ")}

CANDIDATE POOL (grouped by slot)
${candidateBlocks.join("\n\n")}

TASK
Assemble ${targetLookCount} COMPLETE editorial looks. A complete look MUST fill EVERY required slot above by picking one candidateId from that slot's pool. Optional slots may be filled or omitted.

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
            source: c.source,
            brandTier: c.brandTier,
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
        retailersPerBrand: z.number().int().min(1).max(8).default(3),
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

    const brief = briefFor("Portofino", "Yacht Day");
    const specs = ACTIVITY_SLOTS["Yacht Day"]!.filter((s) => s.required || data.includeOptional);

    // Load all Yacht Day brands once.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: allBrands, error: brandErr } = await supabaseAdmin
      .from("brands")
      .select("id,name,slug,tier,categories,activities")
      .eq("status", "approved")
      .contains("activities", ["Yacht Day"])
      .order("name", { ascending: true });
    if (brandErr) return { ok: false as const, stage: "discovery" as const, error: brandErr.message };
    if (!allBrands?.length) {
      return {
        ok: false as const,
        stage: "discovery" as const,
        error: "No approved brands tagged Yacht Day in the registry.",
      };
    }
    const brands = allBrands.map((b) => ({
      name: b.name as string,
      slug: b.slug as string,
      tier: (b.tier as string | null) ?? null,
      categories: (b.categories ?? []) as string[],
    }));

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
      const r = await discoverForSlot({
        apiKey,
        spec,
        brands: slotBrands,
        resultsPerSearch: data.resultsPerSearch,
        retailersPerBrand: data.retailersPerBrand,
        brandOffset,
        idCounter,
        canonicalSeen,
        seenUrls,
        source: "core",
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
        const expansionBrands = expansionBrandNames.map((name) => ({
          name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          tier: "expansion",
          categories: spec.brandCategories,
        }));
        const exp = await discoverForSlot({
          apiKey,
          spec,
          brands: expansionBrands,
          resultsPerSearch: data.resultsPerSearch,
          retailersPerBrand: data.retailersPerBrand,
          brandOffset: brandOffset + slotBrands.length,
          idCounter,
          canonicalSeen,
          seenUrls,
          source: "expansion",
          startingCount: r.candidates.length,
        });
        const acceptedExpansion = exp.candidates.length;
        // Merge expansion candidates into the slot.
        r.candidates = [...r.candidates, ...exp.candidates];
        r.searchesIssued += exp.searchesIssued;
        r.rawResults += exp.rawResults;
        for (const [k, v] of Object.entries(exp.rejections)) {
          r.rejections[k] = (r.rejections[k] ?? 0) + v;
        }
        r.shortfall = Math.max(0, spec.targetMin - r.candidates.length);
        r.expansion = {
          triggered: true,
          reason: `Tier-1 returned ${r.candidates.length - acceptedExpansion} of ${spec.targetMin} required`,
          brandsConsidered: expansionBrandNames,
          searchesIssued: exp.searchesIssued,
          rawResults: exp.rawResults,
          accepted: acceptedExpansion,
          rejections: exp.rejections,
        };
      } else {
        r.expansion = EXPANDABLE_SLOTS.has(spec.slot)
          ? { triggered: false, reason: "tier-1 met target", brandsConsidered: [], searchesIssued: 0, rawResults: 0, accepted: 0, rejections: {} }
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
      rejections: r.rejections,
      expansion: r.expansion,
      expandable: EXPANDABLE_SLOTS.has(r.slot),
    }));

    const missingRequiredSlots = slotResults
      .filter((r) => r.required && r.candidates.length === 0)
      .map((r) => r.slot);

    const candidatesById = new Map<string, SlotCandidate>();
    for (const r of slotResults) r.candidates.forEach((c) => candidatesById.set(c.id, c));

    // PRE-ASSEMBLY GATE: refuse Gemini call if any required slot is empty.
    if (missingRequiredSlots.length > 0) {
      return {
        ok: true as const,
        ranAt: new Date().toISOString(),
        brief,
        slotCoverage,
        registryCoverage,
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
      looks = await assembleLooks(brief, slotResults, specs, data.targetLooks);
    } catch (e) {
      assemblyError = String((e as Error)?.message ?? e);
    }

    const lookScores = looks.map((l) => ({ title: l.title, ...scoreLook(l, candidatesById) }));
    const collectionScore = scoreCollection(looks, candidatesById);

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
      gated: false as const,
      candidates: [...candidatesById.values()],
      discoveryTelemetry: aggregateTelemetry(slotResults, candidatesById.size),
      assemblyError,
      persistError,
      collectionId,
      collectionScore,
      lookScores,
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
          };
        }),
      })),
    };
  });

function aggregateTelemetry(results: SlotDiscoveryResult[], totalCandidates: number) {
  let searches = 0;
  let raw = 0;
  const allRej: Record<string, number> = {};
  for (const r of results) {
    searches += r.searchesIssued;
    raw += r.rawResults;
    for (const [k, v] of Object.entries(r.rejections)) {
      allRej[k] = (allRej[k] ?? 0) + v;
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
  };
}
