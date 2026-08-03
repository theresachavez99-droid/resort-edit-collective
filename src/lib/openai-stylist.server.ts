/**
 * OpenAI / ChatGPT IS the Resort Edit styling engine (server-only).
 *
 * Permanent architecture:
 *  - OpenAI = fashion judgment, curation, product choice.
 *  - This app = registry, health checks, context assembly, API calls, PDP
 *    verification, admin review, approval, promotion, publishing.
 *
 * Nothing in this app invents, chooses or substitutes a replacement product.
 * The model is given the complete editorial context of the look and must return
 * strict structured output. Every URL it returns is verified independently
 * (`pdp-verification.server.ts`) before it may be approved or published.
 *
 * The key is read only from the server env var OPENAI_API_KEY.
 */
import { budgetTierForPrice, currentSeason, slotRole } from "./resort-edit-styling-rules";
import type { ResortEditPolicy } from "./resort-edit-styling-policy.server";

export const OPENAI_STYLIST_PROVIDER = "openai";
export const OPENAI_STYLIST_PROMPT_VERSION = "resort-edit-openai-stylist-v1";
const RESPONSES_URL = "https://api.openai.com/v1/responses";

export function openAiStylistModel(): string {
  return process.env["OPENAI_STYLIST_MODEL"]?.trim() || "gpt-5";
}

export function isOpenAiStylistConfigured(): boolean {
  return Boolean(process.env["OPENAI_API_KEY"]);
}

/** Thrown when OPENAI_API_KEY is absent — surfaced as "ChatGPT styling is not connected". */
export class OpenAiStylistNotConnectedError extends Error {
  constructor() {
    super("ChatGPT styling is not connected. Add OPENAI_API_KEY to enable the styling engine.");
    this.name = "OpenAiStylistNotConnectedError";
  }
}

export type OutfitPiece = {
  slot: string;
  slotLabel?: string | null;
  brand: string;
  productName: string;
  retailer?: string | null;
  price?: string | null;
  url?: string | null;
  status?: string;
  color?: string | null;
};

/** The complete context sent to the OpenAI stylist. */
export type StylistInput = {
  destination: string;
  moment: string;
  momentNarrative?: string | null;
  stylingCues?: string[];
  lookKey: string;
  lookKind: "hero" | "supporting";
  lookTitle: string;
  editorialCopy?: string | null;
  editorialImageUrl?: string | null;
  imageAlt?: string | null;
  outfit: OutfitPiece[];
  failedSlot: string;
  failedProduct: OutfitPiece;
  failedStyleDna?: Record<string, unknown>;
  colorsInLook?: string[];
  colorStory?: string | null;
  jewelryBrandsInLook?: string[];
  jewelryMetalFamily?: string | null;
  nearbyLooks?: Array<{ lookTitle: string; pieces: string[] }>;
  priceTier?: string | null;
  policy: ResortEditPolicy;
  adminFeedback?: string[];
  /** Fresh feedback for this run ("too conservative", "avoid this brand"...). */
  regenerationFeedback?: string | null;
  mode?: "slot" | "full_look";
};

export type StylistCandidate = {
  product_name: string;
  brand: string;
  retailer: string;
  exact_pdp_url: string;
  price: string | null;
  color: string | null;
  category: string | null;
  silhouette: string | null;
  material: string | null;
  matching_score: number;
  stylist_rationale: string;
  full_look_impact: string;
  retailer_priority_rank: number | null;
  possible_duplicate_warning: string | null;
  verification_status: "unverified";
  verified_at: null;
  approval_status: "proposed";
  /** Present in full-restyle mode only. */
  slot?: string | null;
};

export type StylistResult = {
  failed_slot_summary: string;
  nonnegotiable_style_constraints: string[];
  candidates: StylistCandidate[];
  insufficient_candidates_reason: string | null;
};

export type StylistRunMeta = {
  provider: string;
  model: string;
  promptVersion: string;
  generatedAt: string;
  usedWebSearch: boolean;
};

// ── Prompt ────────────────────────────────────────────────────────

const DEVELOPER_ROLE = `You are Resort Edit's luxury Editorial Director and destination stylist. Preserve the narrative, activity, silhouette, color story, luxury tier, and full-outfit coherence. Recommend only fashion-editorial products worthy of a Vogue resort story. Never choose merely because a product shares a category or color.

You are the styling authority: the surrounding software does not style, choose or invent products. It only assembles context, verifies your URLs, and presents your proposals for the owner's approval.

Hard requirements:
- Style the FAILED SLOT in the context of the complete existing outfit. Do not redesign the whole look unless the request explicitly says RESTYLE COMPLETE LOOK.
- Only real, currently purchasable products with EXACT product-detail-page URLs. Never a search page, category page, collection page, homepage or guessed URL.
- If you cannot find three legitimate, editorially worthy products, return fewer and explain why in insufficient_candidates_reason. NEVER fabricate a product or a URL to fill the count.
- Every candidate must be justified as a stylist: how it preserves or improves the whole look, not merely that it matches the category.`;

function policyBlock(p: ResortEditPolicy): string {
  const lines = [
    `Approved retailer priority: ${p.retailerPriority.join(" → ")}.`,
    p.brandDirectPolicy,
    p.noRings
      ? "RINGS ARE NEVER MERCHANDISED ON RESORT EDIT. Never propose a ring in any slot."
      : "",
    p.singleJewelryFamily
      ? "Jewelry within a single look should stay within one designer and one metal family wherever possible."
      : "",
    p.heroThresholdNote,
    p.approvedBrands.length ? `Owner-approved brands (favour these): ${p.approvedBrands.join(", ")}.` : "",
    p.restrictedBrands.length
      ? `Owner-restricted brands (never propose these): ${p.restrictedBrands.join(", ")}.`
      : "",
    ...p.extraRules,
    p.notes ? `Owner notes: ${p.notes}` : "",
  ].filter(Boolean);
  return lines.map((l, i) => `${i + 1}. ${l}`).join("\n");
}

function outfitBlock(input: StylistInput): string {
  return input.outfit
    .map(
      (p) =>
        `- ${p.slotLabel ?? p.slot} [${p.slot}]: ${p.brand} — ${p.productName}${
          p.color ? `, ${p.color}` : ""
        }${p.price ? ` (${p.price})` : ""}${p.retailer ? ` · ${p.retailer}` : ""}${
          p.slot.toLowerCase() === input.failedSlot.toLowerCase()
            ? "   ← FAILED SLOT: replace this piece only"
            : ""
        }`,
    )
    .join("\n");
}

export function buildStylistPrompt(input: StylistInput): { developer: string; user: string } {
  const p = input.policy;
  const destNote = p.destinationNotes[input.destination];
  const full = input.mode === "full_look";

  const user = `${full ? "RESTYLE COMPLETE LOOK (explicit owner request)" : "REPLACE ONE FAILED SLOT"}

DESTINATION & MOMENT
Destination: ${input.destination}${destNote ? `\nDestination personality: ${destNote}` : ""}
Moment / activity: ${input.moment}
Moment narrative: ${input.momentNarrative ?? "—"}
Styling cues: ${(input.stylingCues ?? []).join("; ") || "—"}
Season: ${currentSeason()}

LOOK
Type: ${input.lookKind} look
Title: ${input.lookTitle}
Editorial caption / copy: ${input.editorialCopy ?? "—"}
Editorial image description / alt text: ${input.imageAlt ?? "—"}
Colour story: ${input.colorStory ?? (input.colorsInLook ?? []).join(", ") || "—"}
Colours already in the look: ${(input.colorsInLook ?? []).join(", ") || "—"}
Jewellery designer(s) in the look: ${(input.jewelryBrandsInLook ?? []).join(", ") || "—"}
Jewellery metal family: ${input.jewelryMetalFamily ?? "—"}

COMPLETE EXISTING OUTFIT
${outfitBlock(input)}

FAILED ${full ? "SLOT (anchor)" : "SLOT"}: ${input.failedSlot} (${slotRole(input.failedSlot)} piece)
Failed product: ${input.failedProduct.brand} — ${input.failedProduct.productName}${
    input.failedProduct.price ? ` (${input.failedProduct.price})` : ""
  }${input.failedProduct.retailer ? ` · ${input.failedProduct.retailer}` : ""}
Failed product Style DNA: ${JSON.stringify(input.failedStyleDna ?? {})}
Price tier to match: ${input.priceTier ?? budgetTierForPrice(input.failedProduct.price)}

NEARBY LOOKS (avoid duplicating these pieces or leaning on the same designer)
${
  (input.nearbyLooks ?? [])
    .map((l) => `- ${l.lookTitle}: ${l.pieces.join("; ")}`)
    .join("\n") || "—"
}

RESORT EDIT STYLING POLICY (non-negotiable)
${policyBlock(p)}

OWNER STYLING FEEDBACK FROM PREVIOUS REVIEWS
${(input.adminFeedback ?? []).map((f) => `- ${f}`).join("\n") || "—"}
${input.regenerationFeedback ? `\nFEEDBACK FOR THIS REGENERATION: ${input.regenerationFeedback}` : ""}

${
  full
    ? "Propose one replacement for EVERY slot listed above (use the same slot keys), as a single coherent outfit that still matches the editorial image and narrative."
    : "Propose exactly 3 real replacement candidates for the failed slot only, each preserving or improving the complete look. Return fewer with a reason rather than inventing anything."
}`;

  return { developer: DEVELOPER_ROLE, user };
}

// ── Strict structured output schema ───────────────────────────────

function candidateSchema(includeSlot: boolean) {
  const properties: Record<string, unknown> = {
    product_name: { type: "string" },
    brand: { type: "string" },
    retailer: { type: "string" },
    exact_pdp_url: { type: "string" },
    price: { type: ["string", "null"] },
    color: { type: ["string", "null"] },
    category: { type: ["string", "null"] },
    silhouette: { type: ["string", "null"] },
    material: { type: ["string", "null"] },
    matching_score: { type: "number" },
    stylist_rationale: { type: "string" },
    full_look_impact: { type: "string" },
    retailer_priority_rank: { type: ["integer", "null"] },
    possible_duplicate_warning: { type: ["string", "null"] },
    verification_status: { type: "string", enum: ["unverified"] },
    verified_at: { type: "null" },
    approval_status: { type: "string", enum: ["proposed"] },
  };
  if (includeSlot) properties["slot"] = { type: "string" };
  return {
    type: "object",
    additionalProperties: false,
    properties,
    required: Object.keys(properties),
  };
}

function responseSchema(includeSlot: boolean) {
  return {
    type: "object",
    additionalProperties: false,
    properties: {
      failed_slot_summary: { type: "string" },
      nonnegotiable_style_constraints: { type: "array", items: { type: "string" } },
      candidates: { type: "array", items: candidateSchema(includeSlot) },
      insufficient_candidates_reason: { type: ["string", "null"] },
    },
    required: [
      "failed_slot_summary",
      "nonnegotiable_style_constraints",
      "candidates",
      "insufficient_candidates_reason",
    ],
  };
}

// ── Responses API call ────────────────────────────────────────────

type ResponsesPayload = {
  output_text?: string;
  output?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  error?: { message?: string };
};

function extractText(payload: ResponsesPayload): string {
  if (typeof payload.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text;
  }
  for (const item of payload.output ?? []) {
    for (const part of item.content ?? []) {
      if (typeof part.text === "string" && part.text.trim()) return part.text;
    }
  }
  return "";
}

async function callResponses(args: {
  developer: string;
  user: string;
  imageUrl?: string | null;
  schemaName: string;
  includeSlot: boolean;
  webSearch: boolean;
}): Promise<{ text: string; usedWebSearch: boolean }> {
  const key = process.env["OPENAI_API_KEY"];
  if (!key) throw new OpenAiStylistNotConnectedError();

  const userContent: Array<Record<string, unknown>> = [{ type: "input_text", text: args.user }];
  if (args.imageUrl && /^https:\/\//i.test(args.imageUrl)) {
    userContent.push({ type: "input_image", image_url: args.imageUrl, detail: "auto" });
  }

  const body: Record<string, unknown> = {
    model: openAiStylistModel(),
    input: [
      { role: "developer", content: [{ type: "input_text", text: args.developer }] },
      { role: "user", content: userContent },
    ],
    text: {
      format: {
        type: "json_schema",
        name: args.schemaName,
        strict: true,
        schema: responseSchema(args.includeSlot),
      },
    },
  };
  if (args.webSearch) body["tools"] = [{ type: "web_search" }];

  const res = await fetch(RESPONSES_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 400);
    // Retry once without web search if the tool is unavailable for this account/model.
    if (args.webSearch && /web_search|tool/i.test(detail)) {
      return callResponses({ ...args, webSearch: false });
    }
    if (res.status === 401) throw new Error("OpenAI rejected the API key (401).");
    if (res.status === 429) throw new Error("OpenAI rate limit or quota reached — try again shortly.");
    throw new Error(`OpenAI Responses API ${res.status}: ${detail}`);
  }

  const payload = (await res.json()) as ResponsesPayload;
  if (payload.error?.message) throw new Error(`OpenAI error: ${payload.error.message}`);
  return { text: extractText(payload), usedWebSearch: args.webSearch };
}

function coerceResult(raw: string, includeSlot: boolean): StylistResult {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    return {
      failed_slot_summary: "",
      nonnegotiable_style_constraints: [],
      candidates: [],
      insufficient_candidates_reason: "The styling engine returned no parseable structured output.",
    };
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return {
      failed_slot_summary: "",
      nonnegotiable_style_constraints: [],
      candidates: [],
      insufficient_candidates_reason: "The styling engine returned invalid JSON.",
    };
  }
  const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v.trim() : null);
  const list = Array.isArray(parsed["candidates"]) ? (parsed["candidates"] as unknown[]) : [];
  const candidates: StylistCandidate[] = list.flatMap((item) => {
    const c = item as Record<string, unknown>;
    const name = str(c["product_name"]);
    const brand = str(c["brand"]);
    const url = str(c["exact_pdp_url"]);
    if (!name || !brand || !url) return [];
    const score = Number(c["matching_score"]);
    const rank = Number(c["retailer_priority_rank"]);
    return [
      {
        product_name: name,
        brand,
        retailer: str(c["retailer"]) ?? "",
        exact_pdp_url: url,
        price: str(c["price"]),
        color: str(c["color"]),
        category: str(c["category"]),
        silhouette: str(c["silhouette"]),
        material: str(c["material"]),
        matching_score: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : 0,
        stylist_rationale: str(c["stylist_rationale"]) ?? "",
        full_look_impact: str(c["full_look_impact"]) ?? "",
        retailer_priority_rank: Number.isFinite(rank) ? rank : null,
        possible_duplicate_warning: str(c["possible_duplicate_warning"]),
        verification_status: "unverified" as const,
        verified_at: null,
        approval_status: "proposed" as const,
        ...(includeSlot ? { slot: str(c["slot"]) } : {}),
      },
    ];
  });

  return {
    failed_slot_summary: str(parsed["failed_slot_summary"]) ?? "",
    nonnegotiable_style_constraints: Array.isArray(parsed["nonnegotiable_style_constraints"])
      ? (parsed["nonnegotiable_style_constraints"] as unknown[]).map((s) => String(s))
      : [],
    candidates,
    insufficient_candidates_reason: str(parsed["insufficient_candidates_reason"]),
  };
}

function meta(usedWebSearch: boolean): StylistRunMeta {
  return {
    provider: OPENAI_STYLIST_PROVIDER,
    model: openAiStylistModel(),
    promptVersion: OPENAI_STYLIST_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
    usedWebSearch,
  };
}

/**
 * Ask ChatGPT to style the failed slot inside the complete look. Returns
 * UNVERIFIED candidates — the caller must verify every PDP before review.
 */
export async function generateResortEditReplacementCandidates(
  input: StylistInput,
): Promise<{ meta: StylistRunMeta; result: StylistResult }> {
  const { developer, user } = buildStylistPrompt({ ...input, mode: "slot" });
  const { text, usedWebSearch } = await callResponses({
    developer,
    user,
    imageUrl: input.editorialImageUrl ?? null,
    schemaName: "resort_edit_replacement_candidates",
    includeSlot: false,
    webSearch: true,
  });
  const result = coerceResult(text, false);
  return { meta: meta(usedWebSearch), result: { ...result, candidates: result.candidates.slice(0, 3) } };
}

/** Explicit owner action only: ask ChatGPT to restyle the complete look. */
export async function generateResortEditFullRestyle(
  input: StylistInput,
): Promise<{ meta: StylistRunMeta; result: StylistResult }> {
  const { developer, user } = buildStylistPrompt({ ...input, mode: "full_look" });
  const { text, usedWebSearch } = await callResponses({
    developer,
    user,
    imageUrl: input.editorialImageUrl ?? null,
    schemaName: "resort_edit_full_restyle",
    includeSlot: true,
    webSearch: true,
  });
  return { meta: meta(usedWebSearch), result: coerceResult(text, true) };
}
