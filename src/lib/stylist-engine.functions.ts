/**
 * Resort Edit v3 — Luxury Stylist Engine.
 *
 * This is the single engine that powers every Resort Edit destination
 * activity. It thinks in editorial COLLECTIONS of complete looks, not in
 * isolated product candidates.
 *
 * Pipeline:
 *   Destination + Activity + Brief
 *     → Brands I Love registry (DB)
 *     → Brand relevance filtering
 *     → Candidate discovery (delegates to runYachtDayDryRun for Yacht Day;
 *       the discovery primitives generalize to other activities later)
 *     → Editorial scoring (already on the candidate)
 *     → Complete-look assembly via Gemini (outfits, not products)
 *     → Collection-level scoring (diversity, completeness, editorial)
 *     → Persistence to editorial_collections + child tables
 *
 * Operating modes:
 *   - dry_run: discovery + assembly only, persists as status='draft'.
 *   - founder_review / production: not yet implemented in this slice.
 *
 * No PDP scrapes. No publishing. No live-site writes.
 */

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";
import { runYachtDayDryRun } from "./yacht-day-pilot.functions";

// ──────────────────────────────────────────────────────────────
// Outfit slot ecosystems — required + optional, per activity.
// Yacht Day is the first activity supported end-to-end.
// ──────────────────────────────────────────────────────────────

type OutfitSlot = {
  slot: string;
  required: boolean;
  /** Which candidate silhouettes / categories satisfy this slot. */
  fillers: string[];
  label: string;
};

const YACHT_DAY_SLOTS: OutfitSlot[] = [
  { slot: "swim", required: true, label: "Swimwear", fillers: ["one-piece", "bikini"] },
  { slot: "coverup", required: true, label: "Cover-up or linen layer", fillers: ["kaftan", "pareo", "cover-up", "shirt", "dress"] },
  { slot: "shoes", required: true, label: "Shoes", fillers: ["sandal"] },
  { slot: "bag", required: true, label: "Bag", fillers: ["bag"] },
  { slot: "sunglasses", required: true, label: "Sunglasses", fillers: ["sunglasses"] },
  { slot: "jewelry", required: true, label: "Jewelry", fillers: ["jewelry"] },
  { slot: "hat", required: false, label: "Hat", fillers: ["hat"] },
];

const ACTIVITY_SLOTS: Record<string, OutfitSlot[]> = {
  "Yacht Day": YACHT_DAY_SLOTS,
};

// ──────────────────────────────────────────────────────────────
// Editorial brief — derived deterministically from destination+activity.
// The brief is what the Gemini look assembler sees, plus the candidate pool.
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
    styleDna: [
      "Riviera Glamour",
      "Coastal Neutral",
      "Mediterranean Print",
      "Tailored Resort",
    ],
    notes:
      "A wealthy traveler boards a wooden Riva at 11, lunches in a cove, returns to the harbor at golden hour. " +
      "Outfits must work for swim, deck, and stepping off in town. No beachy tropical clichés.",
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
// Gemini look-assembly — takes brief + candidate pool, returns
// 5–10 complete looks across required outfit slots.
// ──────────────────────────────────────────────────────────────

type AssemblyCandidate = {
  id: string;
  brand: string;
  retailer: string;
  title: string;
  url: string;
  silhouette: string;
  palette: string;
  editorialScore: number;
};

type AssembledLook = {
  title: string;
  subtitle?: string;
  description: string;
  styleDna: string[];
  palette: string[];
  slots: Array<{ slot: string; candidateId: string; reasoning?: string }>;
  reasoning?: string;
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
  candidates: AssemblyCandidate[],
  slots: OutfitSlot[],
  targetLookCount: number,
): Promise<AssembledLook[]> {
  if (candidates.length === 0) return [];

  const system = `You are the fashion director at Resort Edit, a luxury destination styling platform.
You think like an experienced personal shopper for wealthy travelers — not like a product feed.
Your job: assemble a curated collection of complete editorial looks for one destination activity.
Return strict JSON only. Never invent products that are not in the candidate pool.`;

  const slotLines = slots
    .map(
      (s) =>
        `  - "${s.slot}" (${s.required ? "required" : "optional"}): ${s.label}. Filled by candidates with silhouette in [${s.fillers.join(", ")}].`,
    )
    .join("\n");

  const candidateLines = candidates
    .slice(0, 80)
    .map(
      (c) =>
        `  ${c.id} :: ${c.brand} — ${c.title ?? "(untitled)"} [${c.silhouette}/${c.palette}] @${c.retailer} score=${c.editorialScore}`,
    )
    .join("\n");

  const themes = brief.collectionThemes.length
    ? `Suggested editorial themes (you may use, rename, or invent your own): ${brief.collectionThemes.join(", ")}.`
    : "";

  const user = `EDITORIAL BRIEF
Destination: ${brief.destination}
Activity: ${brief.activity}
Mood: ${brief.mood}
Palette: ${brief.palette.join(", ")}
Style DNA in play: ${brief.styleDna.join(", ")}
Notes: ${brief.notes}
${themes}

OUTFIT SLOTS
${slotLines}

CANDIDATE POOL (id :: brand — title [silhouette/palette] @retailer score=N)
${candidateLines}

TASK
Assemble ${targetLookCount} complete editorial looks. Every look MUST fill every REQUIRED slot using a candidate id from the pool. Optional slots may be filled or omitted.

Optimize the collection for:
- Editorial excellence — each look reads as if Net-a-Porter PORTER, Moda Operandi, or a private stylist curated it.
- Brand diversity — avoid repeating the same brand across multiple slots in one look; spread brands across the collection.
- Retailer diversity — vary affiliate retailers across looks.
- Silhouette / palette diversity across the collection — one-piece vs bikini, print vs neutral, etc.
- Destination authenticity for ${brief.destination} — no tropical / Caribbean / desert clichés.
- Mood variety across the themes above — minimal, print-forward, linen, sunset, etc.

Return strict JSON:
{
  "looks": [
    {
      "title": "Editorial look title, 2–5 words, e.g. 'Riviera Minimalist'",
      "subtitle": "One short editorial line, e.g. 'For 11am espresso on the foredeck'",
      "description": "2–3 sentences. Editorial voice. Reference destination, mood, and why this combination works for ${brief.activity} in ${brief.destination}.",
      "styleDna": ["1–3 of the brief's Style DNA values"],
      "palette": ["1–4 color/print descriptors"],
      "slots": [
        { "slot": "swim", "candidateId": "<id from pool>", "reasoning": "<one short line why>" }
      ],
      "reasoning": "1–2 lines on what makes this look different from the others in the collection."
    }
  ]
}

CRITICAL RULES
- Every candidateId MUST exist in the pool above. Never invent ids.
- A given candidateId may appear in at most one look across the collection (no product repeats).
- Each look must fill ALL required slots; if a required slot has no good candidate, SKIP the look entirely rather than ship it incomplete.
- Return as many complete looks as the pool supports, up to ${targetLookCount}. It is fine to return fewer if the pool can't sustain editorial quality.`;

  const raw = (await callGeminiJson(system, user)) as { looks?: unknown };
  const looksRaw = Array.isArray(raw.looks) ? raw.looks : [];
  const looks: AssembledLook[] = [];
  const usedIds = new Set<string>();
  const candidateIds = new Set(candidates.map((c) => c.id));
  for (const item of looksRaw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const slotsArr = Array.isArray(o.slots) ? o.slots : [];
    const slotRecs: AssembledLook["slots"] = [];
    for (const s of slotsArr) {
      if (!s || typeof s !== "object") continue;
      const so = s as Record<string, unknown>;
      const slot = typeof so.slot === "string" ? so.slot : null;
      const candidateId = typeof so.candidateId === "string" ? so.candidateId : null;
      const reasoning = typeof so.reasoning === "string" ? so.reasoning : undefined;
      if (!slot || !candidateId) continue;
      if (!candidateIds.has(candidateId)) continue;
      if (usedIds.has(candidateId)) continue;
      usedIds.add(candidateId);
      slotRecs.push({ slot, candidateId, reasoning });
    }
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
    });
  }
  return looks;
}

// ──────────────────────────────────────────────────────────────
// Scoring — per-look completeness + collection-level diversity
// ──────────────────────────────────────────────────────────────

function scoreLook(
  look: AssembledLook,
  slots: OutfitSlot[],
  candidatesById: Map<string, AssemblyCandidate>,
) {
  const filledSlots = new Set(look.slots.map((s) => s.slot));
  const requiredSlots = slots.filter((s) => s.required).map((s) => s.slot);
  const missing = requiredSlots.filter((s) => !filledSlots.has(s));
  const completeness = requiredSlots.length === 0 ? 1 : (requiredSlots.length - missing.length) / requiredSlots.length;

  const editorialScores = look.slots
    .map((s) => candidatesById.get(s.candidateId)?.editorialScore ?? 0);
  const editorialAvg =
    editorialScores.length === 0
      ? 0
      : editorialScores.reduce((a, b) => a + b, 0) / editorialScores.length;

  // Look brands — penalize one brand dominating a single look.
  const brandCounts = new Map<string, number>();
  for (const s of look.slots) {
    const b = candidatesById.get(s.candidateId)?.brand;
    if (b) brandCounts.set(b, (brandCounts.get(b) ?? 0) + 1);
  }
  const maxBrandShare = brandCounts.size === 0 ? 0 : Math.max(...brandCounts.values()) / look.slots.length;
  const lookBrandDiversity = 1 - (maxBrandShare - 1 / Math.max(brandCounts.size, 1));

  return {
    completeness: Math.round(completeness * 1000) / 1000,
    editorial: Math.round((editorialAvg + lookBrandDiversity) * 1000) / 1000,
    missing,
  };
}

function scoreCollection(
  looks: AssembledLook[],
  candidatesById: Map<string, AssemblyCandidate>,
) {
  const brandSet = new Set<string>();
  const retailerSet = new Set<string>();
  const silhouetteSet = new Set<string>();
  const paletteSet = new Set<string>();
  let slotCount = 0;
  const brandCounts = new Map<string, number>();
  const retailerCounts = new Map<string, number>();
  for (const look of looks) {
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
  const maxBrandShare = brandCounts.size === 0 ? 0 : Math.max(...brandCounts.values()) / Math.max(slotCount, 1);
  const maxRetailerShare = retailerCounts.size === 0 ? 0 : Math.max(...retailerCounts.values()) / Math.max(slotCount, 1);
  return {
    looksCount: looks.length,
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
// Persistence — write collection + looks + slots in one batch.
// ──────────────────────────────────────────────────────────────

async function persistCollection(args: {
  brief: EditorialBrief;
  looks: AssembledLook[];
  candidatesById: Map<string, AssemblyCandidate>;
  slots: OutfitSlot[];
  diagnostics: Record<string, unknown>;
  collectionScore: ReturnType<typeof scoreCollection>;
  notes?: string;
}) {
  const { brief, looks, candidatesById, slots, diagnostics, collectionScore } = args;

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

  for (let i = 0; i < looks.length; i++) {
    const look = looks[i];
    const looksScore = scoreLook(look, slots, candidatesById);
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
        editorial_score: looksScore.editorial,
        completeness_score: looksScore.completeness,
        missing_slots: looksScore.missing,
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
          metadata: { silhouette: c.silhouette, palette: c.palette, editorialScore: c.editorialScore },
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
// Public server fn — Yacht Day end-to-end Dry Run.
// ──────────────────────────────────────────────────────────────

export const generateYachtDayCollection = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        targetLooks: z.number().int().min(3).max(12).default(6),
        maxBrands: z.number().int().min(1).max(30).default(14),
        retailersPerBrand: z.number().int().min(1).max(8).default(3),
        resultsPerSearch: z.number().int().min(1).max(10).default(4),
        maxCandidates: z.number().int().min(10).max(80).default(40),
        maxPerBrand: z.number().int().min(1).max(10).default(3),
        persist: z.boolean().default(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const brief = briefFor("Portofino", "Yacht Day");
    const slots = ACTIVITY_SLOTS["Yacht Day"]!;

    // 1. Discovery (reuses the hardened Yacht Day pilot).
    const dryRun = await runYachtDayDryRun({
      data: {
        password: data.password,
        maxBrands: data.maxBrands,
        retailersPerBrand: data.retailersPerBrand,
        resultsPerSearch: data.resultsPerSearch,
        maxCandidates: data.maxCandidates,
        maxPerBrand: data.maxPerBrand,
      },
    });
    if (!dryRun.ok) return { ok: false as const, stage: "discovery" as const, error: dryRun.error };

    const candidates: AssemblyCandidate[] = dryRun.candidates.map((c, i) => ({
      id: `c${i.toString().padStart(3, "0")}`,
      brand: c.brand,
      retailer: c.retailer,
      title: c.title ?? `${c.brand} ${c.silhouette}`,
      url: c.url,
      silhouette: c.silhouette,
      palette: c.palette,
      editorialScore: c.editorialScore,
    }));
    const candidatesById = new Map(candidates.map((c) => [c.id, c]));

    // 2. Look assembly (Gemini).
    let looks: AssembledLook[] = [];
    let assemblyError: string | null = null;
    try {
      looks = await assembleLooks(brief, candidates, slots, data.targetLooks);
    } catch (e) {
      assemblyError = String((e as Error)?.message ?? e);
    }

    // 3. Collection-level scoring.
    const collectionScore = scoreCollection(looks, candidatesById);
    const lookScores = looks.map((l) => ({
      title: l.title,
      ...scoreLook(l, slots, candidatesById),
    }));

    // 4. Persistence.
    let collectionId: string | null = null;
    let persistError: string | null = null;
    if (data.persist && looks.length > 0) {
      try {
        collectionId = await persistCollection({
          brief,
          looks,
          candidatesById,
          slots,
          diagnostics: {
            discovery: dryRun.telemetry,
            assembly: { lookScores, error: assemblyError },
            requestedBrands: dryRun.requestedBrands,
            acceptedBrands: dryRun.acceptedBrands,
            rejectedBrands: dryRun.rejectedBrands,
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
      slots,
      discovery: {
        telemetry: dryRun.telemetry,
        candidatesCount: candidates.length,
        acceptedBrands: dryRun.acceptedBrands,
        rejectedBrands: dryRun.rejectedBrands,
      },
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