import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireAdmin } from "./admin-auth.server";
import type { Json } from "@/integrations/supabase/types";

import refMorningPortofino from "@/assets/editorial-refs/ref-morning-in-portofino.jpeg.asset.json";
import refItalianSummer from "@/assets/editorial-refs/ref-italian-summer-escape.jpeg.asset.json";
import refCoastalItaly from "@/assets/editorial-refs/ref-coastal-italy-summer.jpeg.asset.json";
import refTuscanyCapsule from "@/assets/editorial-refs/ref-tuscany-capsule.jpeg.asset.json";
import refArrivalRosewood from "@/assets/editorial-refs/ref-arrival-at-rosewood.jpeg.asset.json";
import refCaboState from "@/assets/editorial-refs/ref-cabo-state-of-mind.jpeg.asset.json";

// Julianne Hope Styling v2 — 10 Instagram screenshot references
import jhsMediterraneanEscape from "@/assets/editorial-refs/jhs-v2/jhs-mediterranean-escape.jpeg.asset.json";
import jhsBlackRaffiaVacation from "@/assets/editorial-refs/jhs-v2/jhs-black-raffia-vacation.jpeg.asset.json";
import jhsOutfitInspirationYsl from "@/assets/editorial-refs/jhs-v2/jhs-outfit-inspiration-ysl.jpeg.asset.json";
import jhsVacationCabo from "@/assets/editorial-refs/jhs-v2/jhs-vacation-cabo.jpeg.asset.json";
import jhsEverythingRaffia from "@/assets/editorial-refs/jhs-v2/jhs-everything-raffia.jpeg.asset.json";
import jhsCoastalMuse from "@/assets/editorial-refs/jhs-v2/jhs-coastal-muse.jpeg.asset.json";
import jhsWeddingGuest from "@/assets/editorial-refs/jhs-v2/jhs-wedding-guest.jpeg.asset.json";
import jhsSunsetCapri from "@/assets/editorial-refs/jhs-v2/jhs-sunset-in-capri.jpeg.asset.json";
import jhsTravelArrivalCroatia from "@/assets/editorial-refs/jhs-v2/jhs-travel-arrival-look-croatia.jpeg.asset.json";
import jhsSomethingBlueGarden from "@/assets/editorial-refs/jhs-v2/jhs-something-blue-garden.jpeg.asset.json";

/**
 * The Resort Edit Editorial Reference Library — training substrate for the
 * future story-first generation pipeline. Stylist references are seeded as
 * `pending`, then enriched by AI vision (Instagram screenshots) or Firecrawl
 * (Nordstrom curations). Library reads are public; writes are admin-only.
 */

const pw = z.string().min(1).max(200);

/** The canonical absolute base for Lovable Asset URLs (CDN-served). */
const ASSET_BASE = "https://resort-edit-collective.lovable.app";

function absoluteAssetUrl(relUrl: string): string {
  if (relUrl.startsWith("http")) return relUrl;
  return `${ASSET_BASE}${relUrl}`;
}

type SeedRef = {
  title: string;
  source_type: "instagram" | "nordstrom_curation" | "framework" | "stylelinks_landing";
  reference_image: string | null;
  reference_url: string | null;
  destination_hint?: string;
  collection?: string;
  reference_type?: string;
  editorial_priority?: "high" | "standard";
  engagement_unlock_keyword?: string | null;
  /** Optional pre-filled fields for taxonomy / framework records that don't need AI extraction. */
  prefilled?: {
    editorial_story?: string;
    learned_patterns?: string;
    editorial_tags?: string[];
  };
};

/**
 * The 13 seed references the user explicitly provided. These rows are
 * inserted once with status=`pending`; extraction populates the rest of the
 * fields. NEVER hand-author the editorial fields here — extraction must do it
 * so that the system actually learns from the references rather than being
 * spoon-fed our interpretation.
 */
const SEEDS: SeedRef[] = [
  {
    title: "Morning in Portofino",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(refMorningPortofino.url),
    reference_url: null,
    destination_hint: "Portofino",
  },
  {
    title: "Italian Summer Escape",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(refItalianSummer.url),
    reference_url: null,
    destination_hint: "Italy / Riviera",
  },
  {
    title: "Coastal Italy Summer",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(refCoastalItaly.url),
    reference_url: null,
    destination_hint: "Coastal Italy",
  },
  {
    title: "Tuscany Luxury Capsule",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(refTuscanyCapsule.url),
    reference_url: null,
    destination_hint: "Tuscany",
  },
  {
    title: "Arrival at Rosewood",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(refArrivalRosewood.url),
    reference_url: null,
    destination_hint: "Tuscany / Rosewood Castiglion del Bosco",
  },
  {
    title: "Cabo State of Mind",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(refCaboState.url),
    reference_url: null,
    destination_hint: "Cabo",
  },
  // Nordstrom curations
  { title: "Nordstrom Curation 2475530", source_type: "nordstrom_curation", reference_image: null, reference_url: "https://www.nordstrom.com/curation/2475530" },
  { title: "Nordstrom Curation 2493370", source_type: "nordstrom_curation", reference_image: null, reference_url: "https://www.nordstrom.com/curation/2493370" },
  { title: "Nordstrom Curation 2486691", source_type: "nordstrom_curation", reference_image: null, reference_url: "https://www.nordstrom.com/curation/2486691" },
  { title: "Nordstrom Curation 2477681", source_type: "nordstrom_curation", reference_image: null, reference_url: "https://www.nordstrom.com/curation/2477681" },
  { title: "Nordstrom Curation 2472058", source_type: "nordstrom_curation", reference_image: null, reference_url: "https://www.nordstrom.com/curation/2472058" },
  { title: "Nordstrom Curation 2462054", source_type: "nordstrom_curation", reference_image: null, reference_url: "https://www.nordstrom.com/curation/2462054" },
  { title: "Nordstrom Curation 2412585", source_type: "nordstrom_curation", reference_image: null, reference_url: "https://www.nordstrom.com/curation/2412585" },
];

/**
 * Julianne Hope Styling v2 — a second major reference collection.
 * Stored alongside the core stylist references but tagged so the admin UI
 * and downstream story-first pipeline can filter, prioritise, and study
 * these specifically as a stylist case-study. We do NOT copy her layouts —
 * we codify content architecture, merchandising presentation, capsule
 * logic, and engagement mechanics.
 *
 * Priority `high` is reserved for the six references the user identified
 * as most aligned with Resort Edit's destination-first philosophy:
 * Travel Arrival Look, Mediterranean Escape, Sunset in Capri,
 * Coastal Muse, Everything Raffia, Travel Capsule (Vacation / Cabo).
 */
const JHS_V2_COLLECTION = "julianne-hope-styling";
const JHS_V2_REFERENCE_TYPE = "Julianne Hope Styling";

const JHS_V2_SEEDS: SeedRef[] = [
  {
    title: "JHS — Travel / Arrival Look (Croatia)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsTravelArrivalCroatia.url),
    reference_url: null,
    destination_hint: "Croatia / European Summer",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: "SHOP",
  },
  {
    title: "JHS — Mediterranean Escape (Matching Sets)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsMediterraneanEscape.url),
    reference_url: null,
    destination_hint: "Capri / Italian Riviera",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: "SETS",
  },
  {
    title: "JHS — Sunset in Capri (Swimwear Edit)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsSunsetCapri.url),
    reference_url: null,
    destination_hint: "Capri",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: "SWIM",
  },
  {
    title: "JHS — Coastal Muse (Top 5 Swimsuits)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsCoastalMuse.url),
    reference_url: null,
    destination_hint: "Coastal / Amalfi",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: "SWIM",
  },
  {
    title: "JHS — Everything Raffia (Pt. 2)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsEverythingRaffia.url),
    reference_url: null,
    destination_hint: "Vacation / Resort",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: "RAFFIA",
  },
  {
    title: "JHS — Travel Capsule (Vacation / Cabo)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsVacationCabo.url),
    reference_url: null,
    destination_hint: "Cabo / Vacation",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: "VACA",
  },
  {
    title: "JHS — Black Raffia Edit (The Go-Go's Vacation)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsBlackRaffiaVacation.url),
    reference_url: null,
    destination_hint: "Vacation / Resort",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "standard",
    engagement_unlock_keyword: "SHOP",
  },
  {
    title: "JHS — Outfit Inspiration (YSL + Loewe)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsOutfitInspirationYsl.url),
    reference_url: null,
    destination_hint: "Spring / Designer Edit",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "standard",
    engagement_unlock_keyword: "OUTFIT",
  },
  {
    title: "JHS — Wedding Guest (Elevated Black)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsWeddingGuest.url),
    reference_url: null,
    destination_hint: "Wedding / Evening",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "standard",
    engagement_unlock_keyword: "LINKS",
  },
  {
    title: "JHS — Something Blue (Garden Ceremony)",
    source_type: "instagram",
    reference_image: absoluteAssetUrl(jhsSomethingBlueGarden.url),
    reference_url: null,
    destination_hint: "Wedding / Garden",
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "standard",
    engagement_unlock_keyword: "WEDDING",
  },
  // 13 Nordstrom curation URLs — JHS-curated stylist shops
  ...[
    "2508738", "2506568", "2465069", "2420249", "2416259", "2408348",
    "2409005", "2407003", "2398889", "2397205", "2329068", "2357666",
    "2366784",
  ].map<SeedRef>((id) => ({
    title: `JHS — Nordstrom Curation ${id}`,
    source_type: "nordstrom_curation",
    reference_image: null,
    reference_url: `https://www.nordstrom.com/curation/${id}`,
    collection: JHS_V2_COLLECTION,
    reference_type: JHS_V2_REFERENCE_TYPE,
    editorial_priority: "standard",
    engagement_unlock_keyword: null,
  })),
];

const ALL_SEEDS: SeedRef[] = [...SEEDS, ...JHS_V2_SEEDS];

// -----------------------------------------------------------------------------
// Julianne Hope StyleLinks — the parent editorial source feed
// -----------------------------------------------------------------------------
// The StyleLinks landing page is a *living* editorial reference feed. Unlike a
// single Nordstrom curation, it reveals the recurring content frameworks,
// naming conventions, and visual merchandising systems Julianne Hope reuses.
// We seed the landing source PLUS the 13 recurring content frameworks the
// user identified, so the story-first pipeline can later reference them as
// editorial packaging archetypes (saveability / merchandising / capsule logic
// only — never layouts, wording, branding, typography, or destination concepts).
// -----------------------------------------------------------------------------

const STYLELINKS_COLLECTION = "julianne-hope-stylelinks";
const STYLELINKS_REFERENCE_TYPE = "Julianne Hope StyleLinks";
const STYLELINKS_URL = "https://www.instagram.com/juliannehopestyling/";

const STYLELINKS_FRAMEWORKS: Array<{ name: string; note: string; tags: string[] }> = [
  { name: "Travel Arrival Look", note: "First-impression airport-to-villa outfit; one statement piece + elevated basics + tonal accessories.", tags: ["arrival", "travel", "capsule"] },
  { name: "Travel Capsule", note: "Mix-and-match destination wardrobe built around 2-3 hero pieces and shared color story.", tags: ["capsule", "packing", "travel"] },
  { name: "Mediterranean Escape", note: "Matching-set centric edit anchored in linen, white, raffia, gold; mood over product.", tags: ["mediterranean", "sets", "destination"] },
  { name: "Sunset in Capri", note: "Swim + cover-up + sandal trio framed as a moment, not a product list.", tags: ["capri", "swim", "moment"] },
  { name: "Coastal Muse", note: "Top-N edit format (e.g. Top 5 Swimsuits) with one stylist POV per item.", tags: ["coastal", "edit", "topN"] },
  { name: "Wedding Guest", note: "Occasion edit packaged as a 'what I would wear' rather than category browse.", tags: ["wedding", "occasion", "evening"] },
  { name: "Garden Ceremony", note: "Soft palette, fluid silhouettes, refined sandals; venue-specific occasion styling.", tags: ["wedding", "garden", "daytime"] },
  { name: "Everything Raffia", note: "Texture-led merchandising — one material as the narrative spine across categories.", tags: ["raffia", "texture", "merch"] },
  { name: "Designer Sandals", note: "Single-category authority edit; brands curated as a stylist short-list.", tags: ["sandals", "designer", "category"] },
  { name: "Vacation Dressing", note: "Pre-trip 'what to pack' framing with destination implied, not stated.", tags: ["vacation", "packing"] },
  { name: "Matching Sets", note: "Sets as the easy-yes hero; promises a polished look with one decision.", tags: ["sets", "easy", "merch"] },
  { name: "Summer Essentials", note: "Seasonal capsule positioned as the 5-10 pieces a luxury traveler returns to.", tags: ["summer", "essentials", "capsule"] },
  { name: "Swimwear Edit", note: "Curated swim shortlist with body-type and destination cues woven in.", tags: ["swim", "edit"] },
];

const STYLELINKS_SEEDS: SeedRef[] = [
  {
    title: "Julianne Hope StyleLinks — Source Feed",
    source_type: "stylelinks_landing",
    reference_image: null,
    reference_url: STYLELINKS_URL,
    collection: STYLELINKS_COLLECTION,
    reference_type: STYLELINKS_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: null,
    prefilled: {
      editorial_story: "Living editorial reference feed — monitor for new content patterns.",
      learned_patterns:
        "Packages shopping into highly saveable editorial concepts (e.g. 'Travel Arrival Look', 'Everything Raffia', 'Sunset in Capri', 'Coastal Muse'). Resort Edit borrows the saveable packaging, visual hierarchy, content packaging, and merchandising structure — never layouts, wording, branding, typography, or destination concepts. Influence cap: 40% Julianne Hope packaging / 60% Resort Edit original system.",
      editorial_tags: ["stylelinks", "living-feed", "editorial-packaging", "saveability", "merchandising"],
    },
  },
  ...STYLELINKS_FRAMEWORKS.map<SeedRef>((f) => ({
    title: `StyleLinks Framework — ${f.name}`,
    source_type: "framework",
    reference_image: null,
    reference_url: STYLELINKS_URL,
    collection: STYLELINKS_COLLECTION,
    reference_type: STYLELINKS_REFERENCE_TYPE,
    editorial_priority: "high",
    engagement_unlock_keyword: null,
    prefilled: {
      editorial_story: f.name,
      learned_patterns: f.note,
      editorial_tags: f.tags,
    },
  })),
];

const ALL_SEEDS_WITH_STYLELINKS: SeedRef[] = [...ALL_SEEDS, ...STYLELINKS_SEEDS];

export type EditorialReferenceRow = {
  id: string;
  title: string;
  source_type: string;
  reference_image: string | null;
  reference_url: string | null;
  collection: string;
  reference_type: string | null;
  editorial_priority: string;
  engagement_unlock_keyword: string | null;
  destination: string | null;
  activity: string | null;
  mood: string | null;
  occasion: string | null;
  editorial_story: string | null;
  color_story: string | null;
  hero_piece: string | null;
  hero_piece_category: string | null;
  supporting_pieces: Json;
  accessory_strategy: string | null;
  silhouette_strategy: string | null;
  texture_strategy: string | null;
  destination_signals: Json;
  luxury_signals: Json;
  saveability_drivers: Json;
  learned_patterns: string | null;
  editorial_tags: Json;
  brands_detected: Json;
  price_tier_mix: Json;
  category_mix: Json;
  raw_extraction: Json;
  extraction_status: string;
  extraction_error: string | null;
  extracted_at: string | null;
  created_at: string;
  updated_at: string;
};

/** Admin-only read — surfaces internal extraction payloads + unlock keywords. */
export const listEditorialReferences = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(
    async ({ data }): Promise<{ ok: true; references: EditorialReferenceRow[] }> => {
      requireAdmin(data.password);
      const { data: rows, error } = await supabaseAdmin
        .from("editorial_reference_library")
        .select("*")
        .order("source_type", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw new Error(error.message);
      return { ok: true, references: (rows ?? []) as EditorialReferenceRow[] };
    },
  );

/**
 * Insert any of the 13 seed references that aren't already present (matched
 * by title). Idempotent — safe to run repeatedly. Does NOT run extraction.
 */
export const seedEditorialReferences = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);

    const { data: existing } = await supabaseAdmin
      .from("editorial_reference_library")
      .select("title");
    const existingTitles = new Set((existing ?? []).map((r) => r.title));

    const toInsert = ALL_SEEDS_WITH_STYLELINKS
      .filter((s) => !existingTitles.has(s.title))
      .map((s) => {
        // Framework / landing rows are taxonomy — they don't need AI extraction.
        const isTaxonomy = s.source_type === "framework" || s.source_type === "stylelinks_landing";
        return {
          title: s.title,
          source_type: s.source_type,
          reference_image: s.reference_image,
          reference_url: s.reference_url,
          destination: s.destination_hint ?? null,
          collection: s.collection ?? "core-stylist-references",
          reference_type: s.reference_type ?? null,
          editorial_priority: s.editorial_priority ?? "standard",
          engagement_unlock_keyword: s.engagement_unlock_keyword ?? null,
          extraction_status: isTaxonomy ? "ready" : "pending",
          editorial_story: s.prefilled?.editorial_story ?? null,
          learned_patterns: s.prefilled?.learned_patterns ?? null,
          editorial_tags: s.prefilled?.editorial_tags ?? [],
          extracted_at: isTaxonomy ? new Date().toISOString() : null,
        };
      });

    if (toInsert.length === 0) {
      return { ok: true as const, inserted: 0, skipped: ALL_SEEDS_WITH_STYLELINKS.length };
    }

    const { error } = await supabaseAdmin
      .from("editorial_reference_library")
      .insert(toInsert);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const, inserted: toInsert.length, skipped: ALL_SEEDS_WITH_STYLELINKS.length - toInsert.length };
  });

// -----------------------------------------------------------------------------
// Extraction — Instagram screenshots via Gemini vision; Nordstrom via Firecrawl
// -----------------------------------------------------------------------------

/**
 * Single extraction schema returned by Gemini for screenshot analysis AND
 * by the LLM pass over Firecrawl curation markdown. Keeping the shape
 * uniform means the admin UI doesn't care which path produced the data.
 */
type ExtractionPayload = {
  destination: string;
  activity: string;
  mood: string;
  occasion: string;
  editorial_story: string;
  color_story: string;
  hero_piece: string;
  hero_piece_category: string;
  supporting_pieces: string[];
  accessory_strategy: string;
  silhouette_strategy: string;
  texture_strategy: string;
  destination_signals: string[];
  luxury_signals: string[];
  saveability_drivers: string[];
  learned_patterns: string;
  editorial_tags: string[];
  brands_detected: string[];
  price_tier_mix: Record<string, number>;
  category_mix: Record<string, number>;
};

const EXTRACTION_INSTRUCTIONS = `
You are training Resort Edit — a luxury destination personal-stylist engine —
by analyzing a single reference from a top stylist (Julianne Hope Styling).

You are NOT cataloguing products. You are reverse-engineering the editorial
logic a luxury stylist used to construct this look so the system can learn
the styling patterns behind highly-saveable destination content.

For each reference, identify:
- destination (e.g. Portofino, Tuscany, Cabo, Italian Riviera)
- activity (e.g. Morning Coffee, Harbor Aperitivo, Arrival, Long Lunch)
- mood (1 short phrase, e.g. "salty sunlit ease")
- occasion (e.g. "villa check-in", "yacht day")
- editorial_story (the narrative title — e.g. "Morning in Portofino")
- color_story (concise: "White + Raffia + Gold", "Terracotta + Sand")
- hero_piece (single sentence — the one garment the look revolves around)
- hero_piece_category (e.g. "Eyelet Set", "Printed Mini Dress", "Pleated Halter Maxi")
- supporting_pieces (array of every other visible item, short labels)
- accessory_strategy (one paragraph — how accessories relate to the hero)
- silhouette_strategy (one paragraph — proportions, lines, volume choices)
- texture_strategy (one paragraph — raffia, eyelet, linen, gold, etc.)
- destination_signals (array — concrete cues that make this feel LIKE THAT destination)
- luxury_signals (array — what marks this as wealthy/luxe rather than fast-fashion)
- saveability_drivers (array — WHY a woman would save this post)
- learned_patterns (paragraph — the reusable styling rule a stylist would extract)
- editorial_tags (5-12 short tags)
- brands_detected (array of brand names visible; [] if none readable)
- price_tier_mix (object: keys "luxury" / "contemporary" / "accessible"; values 0-1)
- category_mix (object: category name -> share 0-1, e.g. {"dress":0.4,"bag":0.2,"shoes":0.2,"jewelry":0.2})

Return ONLY a single JSON object matching this exact shape. No prose.
`.trim();

function extractionTool() {
  return {
    name: "store_editorial_extraction",
    description: "Persist the editorial extraction for a Resort Edit reference.",
    parameters: {
      type: "object",
      properties: {
        destination: { type: "string" },
        activity: { type: "string" },
        mood: { type: "string" },
        occasion: { type: "string" },
        editorial_story: { type: "string" },
        color_story: { type: "string" },
        hero_piece: { type: "string" },
        hero_piece_category: { type: "string" },
        supporting_pieces: { type: "array", items: { type: "string" } },
        accessory_strategy: { type: "string" },
        silhouette_strategy: { type: "string" },
        texture_strategy: { type: "string" },
        destination_signals: { type: "array", items: { type: "string" } },
        luxury_signals: { type: "array", items: { type: "string" } },
        saveability_drivers: { type: "array", items: { type: "string" } },
        learned_patterns: { type: "string" },
        editorial_tags: { type: "array", items: { type: "string" } },
        brands_detected: { type: "array", items: { type: "string" } },
        price_tier_mix: { type: "object", additionalProperties: { type: "number" } },
        category_mix: { type: "object", additionalProperties: { type: "number" } },
      },
      required: [
        "destination",
        "activity",
        "editorial_story",
        "color_story",
        "hero_piece",
        "hero_piece_category",
        "supporting_pieces",
        "accessory_strategy",
        "destination_signals",
        "luxury_signals",
        "saveability_drivers",
        "learned_patterns",
        "editorial_tags",
      ],
    },
  } as const;
}

async function callGatewayChat(body: unknown): Promise<{
  ok: boolean;
  raw: unknown;
  tool_args?: ExtractionPayload;
  text?: string;
  error?: string;
}> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) return { ok: false, raw: null, error: "LOVABLE_API_KEY missing" };
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let raw: unknown = null;
  try {
    raw = JSON.parse(text);
  } catch {
    raw = { non_json: text.slice(0, 2000) };
  }
  if (!res.ok) {
    return { ok: false, raw, error: `Gateway ${res.status}: ${text.slice(0, 300)}` };
  }
  // Try tool-call args first, then fall back to message content
  const choice = (raw as { choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: string } }>; content?: string } }> })
    ?.choices?.[0]?.message;
  const toolArgsStr = choice?.tool_calls?.[0]?.function?.arguments;
  if (toolArgsStr) {
    try {
      const parsed = JSON.parse(toolArgsStr) as ExtractionPayload;
      return { ok: true, raw, tool_args: parsed };
    } catch (err) {
      return { ok: false, raw, error: `tool_args JSON parse: ${(err as Error).message}` };
    }
  }
  const content = choice?.content;
  if (content) {
    // sometimes the model returns a fenced code block; strip it
    const cleaned = content.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
    try {
      return { ok: true, raw, tool_args: JSON.parse(cleaned) as ExtractionPayload };
    } catch {
      return { ok: true, raw, text: content };
    }
  }
  return { ok: false, raw, error: "no choice content" };
}

async function extractInstagramScreenshot(
  ref: { title: string; reference_image: string | null; destination_hint?: string | null },
): Promise<{ ok: boolean; payload?: ExtractionPayload; raw: unknown; error?: string }> {
  if (!ref.reference_image) return { ok: false, raw: null, error: "reference_image missing" };
  const body = {
    model: "google/gemini-2.5-pro",
    messages: [
      { role: "system", content: EXTRACTION_INSTRUCTIONS },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Reference title: ${ref.title}\nDestination hint (may be wrong, override if needed): ${ref.destination_hint ?? "unknown"}\n\nAnalyze the editorial reference image below and call store_editorial_extraction with your structured analysis.`,
          },
          { type: "image_url", image_url: { url: ref.reference_image } },
        ],
      },
    ],
    tools: [{ type: "function", function: extractionTool() }],
    tool_choice: { type: "function", function: { name: "store_editorial_extraction" } },
  };
  const result = await callGatewayChat(body);
  return { ok: result.ok && !!result.tool_args, payload: result.tool_args, raw: result.raw, error: result.error };
}

async function fetchNordstromMarkdown(url: string): Promise<{ ok: boolean; markdown?: string; raw: unknown; error?: string }> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return { ok: false, raw: null, error: "FIRECRAWL_API_KEY missing" };
  const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      url,
      onlyMainContent: true,
      formats: ["markdown", "links"],
    }),
  });
  const text = await res.text();
  let raw: unknown = null;
  try { raw = JSON.parse(text); } catch { raw = { non_json: text.slice(0, 2000) }; }
  if (!res.ok) return { ok: false, raw, error: `Firecrawl ${res.status}` };
  const root = (raw as { data?: { markdown?: string }; markdown?: string });
  const md = root?.data?.markdown ?? root?.markdown;
  if (!md) return { ok: false, raw, error: "no markdown returned" };
  return { ok: true, markdown: md, raw };
}

async function extractNordstromCuration(
  ref: { title: string; reference_url: string | null },
): Promise<{ ok: boolean; payload?: ExtractionPayload; raw: unknown; error?: string }> {
  if (!ref.reference_url) return { ok: false, raw: null, error: "reference_url missing" };
  const fc = await fetchNordstromMarkdown(ref.reference_url);
  if (!fc.ok || !fc.markdown) {
    return { ok: false, raw: { firecrawl: fc.raw }, error: fc.error ?? "firecrawl failed" };
  }
  // Trim to keep prompt sane
  const trimmed = fc.markdown.slice(0, 18000);
  const body = {
    model: "google/gemini-2.5-pro",
    messages: [
      { role: "system", content: EXTRACTION_INSTRUCTIONS },
      {
        role: "user",
        content: `Reference title: ${ref.title}\nReference URL: ${ref.reference_url}\n\nThis is a Nordstrom curation page (a stylist-built shop). Analyze the product mix, recurring brands, category ratios, accessory patterns, and the implicit destination/occasion narrative. Call store_editorial_extraction with your structured analysis.\n\n--- CURATION MARKDOWN ---\n${trimmed}`,
      },
    ],
    tools: [{ type: "function", function: extractionTool() }],
    tool_choice: { type: "function", function: { name: "store_editorial_extraction" } },
  };
  const result = await callGatewayChat(body);
  return {
    ok: result.ok && !!result.tool_args,
    payload: result.tool_args,
    raw: { firecrawl: fc.raw, llm: result.raw },
    error: result.error,
  };
}

async function runExtractionForRow(row: {
  id: string;
  title: string;
  source_type: string;
  reference_image: string | null;
  reference_url: string | null;
  destination: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  await supabaseAdmin
    .from("editorial_reference_library")
    .update({ extraction_status: "extracting", extraction_error: null })
    .eq("id", row.id);

  const result =
    row.source_type === "nordstrom_curation"
      ? await extractNordstromCuration({ title: row.title, reference_url: row.reference_url })
      : await extractInstagramScreenshot({ title: row.title, reference_image: row.reference_image, destination_hint: row.destination });

  if (!result.ok || !result.payload) {
    await supabaseAdmin
      .from("editorial_reference_library")
      .update({
        extraction_status: "failed",
        extraction_error: result.error ?? "unknown extraction error",
        raw_extraction: JSON.parse(JSON.stringify(result.raw ?? {})) as Json,
      })
      .eq("id", row.id);
    return { ok: false, error: result.error };
  }

  const p = result.payload;
  const { error: updErr } = await supabaseAdmin
    .from("editorial_reference_library")
    .update({
      destination: p.destination ?? null,
      activity: p.activity ?? null,
      mood: p.mood ?? null,
      occasion: p.occasion ?? null,
      editorial_story: p.editorial_story ?? null,
      color_story: p.color_story ?? null,
      hero_piece: p.hero_piece ?? null,
      hero_piece_category: p.hero_piece_category ?? null,
      supporting_pieces: p.supporting_pieces ?? [],
      accessory_strategy: p.accessory_strategy ?? null,
      silhouette_strategy: p.silhouette_strategy ?? null,
      texture_strategy: p.texture_strategy ?? null,
      destination_signals: p.destination_signals ?? [],
      luxury_signals: p.luxury_signals ?? [],
      saveability_drivers: p.saveability_drivers ?? [],
      learned_patterns: p.learned_patterns ?? null,
      editorial_tags: p.editorial_tags ?? [],
      brands_detected: p.brands_detected ?? [],
      price_tier_mix: p.price_tier_mix ?? {},
      category_mix: p.category_mix ?? {},
      raw_extraction: JSON.parse(JSON.stringify(result.raw ?? {})) as Json,
      extraction_status: "ready",
      extraction_error: null,
      extracted_at: new Date().toISOString(),
    })
    .eq("id", row.id);
  if (updErr) return { ok: false, error: updErr.message };
  return { ok: true };
}

/** Extract a single reference by id. */
export const extractEditorialReference = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: row, error } = await supabaseAdmin
      .from("editorial_reference_library")
      .select("id,title,source_type,reference_image,reference_url,destination")
      .eq("id", data.id)
      .maybeSingle();
    if (error || !row) return { ok: false as const, error: error?.message ?? "not found" };
    const r = await runExtractionForRow(row);
    return r.ok ? ({ ok: true as const } as const) : ({ ok: false as const, error: r.error } as const);
  });

/**
 * Extract every reference that is currently `pending` or `failed`. Processed
 * sequentially with a small delay to keep gateway pressure reasonable.
 */
export const extractAllPendingEditorialReferences = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { data: rows, error } = await supabaseAdmin
      .from("editorial_reference_library")
      .select("id,title,source_type,reference_image,reference_url,destination")
      .in("extraction_status", ["pending", "failed"])
      .order("created_at", { ascending: true });
    if (error) return { ok: false as const, error: error.message };
    const summary: Array<{ id: string; title: string; ok: boolean; error?: string }> = [];
    for (const row of rows ?? []) {
      const r = await runExtractionForRow(row);
      summary.push({ id: row.id, title: row.title, ok: r.ok, error: r.error });
      // small spacing between calls
      await new Promise((res) => setTimeout(res, 800));
    }
    return { ok: true as const, processed: summary.length, summary };
  });

/** Delete a single reference (admin only — used for resets). */
export const deleteEditorialReference = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ password: pw, id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { error } = await supabaseAdmin
      .from("editorial_reference_library")
      .delete()
      .eq("id", data.id);
    if (error) return { ok: false as const, error: error.message };
    return { ok: true as const };
  });