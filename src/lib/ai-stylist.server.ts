/**
 * AI Stylist service (server-only).
 *
 * The owner's rule: AI does the styling work. When a product dies, the stylist
 * re-styles that ONE slot inside the full editorial context of the look —
 * destination, moment narrative, look title and copy, editorial image alt text,
 * every other piece in the outfit, the failed piece's Style DNA, the colour
 * story, the jewellery designer/metal already in play, retailer priority,
 * budget tier, season, the no-ring rule and every other Resort Edit rule.
 *
 * The provider is behind a narrow interface. If no provider credential is
 * configured, `isAiStylistConfigured()` returns false and the admin UI shows a
 * clearly labelled setup-needed state — nothing is faked and nothing is
 * auto-published. AI-proposed URLs are NEVER trusted: the caller verifies each
 * PDP with the URL policy and a live probe before it can be approved.
 */
import {
  AI_STYLIST_PROMPT_VERSION,
  APPROVED_RETAILER_PRIORITY,
  RESORT_EDIT_STYLING_RULES,
  budgetTierForPrice,
  currentSeason,
  slotRole,
} from "./resort-edit-styling-rules";

export const AI_STYLIST_PROVIDER = "lovable-ai-gateway";
export const AI_STYLIST_MODEL = "google/gemini-3-flash-preview";
const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

export type OutfitPiece = {
  slot: string;
  slotLabel?: string | null;
  brand: string;
  productName: string;
  retailer?: string | null;
  price?: string | null;
  url?: string | null;
  status?: string;
};

export type StylistLookContext = {
  destination: string;
  moment: string;
  momentNarrative?: string | null;
  stylingCues?: string[];
  lookKey: string;
  lookKind: "hero" | "editorial";
  lookTitle: string;
  editorialCopy?: string | null;
  imageAlt?: string | null;
  /** The complete existing outfit, failed slot included. */
  outfit: OutfitPiece[];
  failedSlot: string;
  failedProduct: OutfitPiece;
  failedStyleDna?: Record<string, unknown>;
  colorsInLook?: string[];
  jewelryBrandsInLook?: string[];
  brandRestrictions?: string[];
};

export type RawAiCandidate = {
  brand: string;
  productName: string;
  retailer: string;
  pdpUrl: string;
  price?: string;
  color?: string;
  matchingScore?: number;
  rationale?: string;
  lookImpact?: string;
  styleDna?: Record<string, unknown>;
};

export type StylistRunMeta = {
  provider: string;
  model: string;
  promptVersion: string;
  generatedAt: string;
};

export function isAiStylistConfigured(): boolean {
  return Boolean(process.env["LOVABLE_API_KEY"]);
}

/** Thrown when no provider credential is configured — surfaced as a setup-needed state. */
export class AiStylistNotConfiguredError extends Error {
  constructor() {
    super(
      "AI stylist provider is not configured. Add an AI provider credential to enable replacement generation.",
    );
    this.name = "AiStylistNotConfiguredError";
  }
}

function rulesBlock(): string {
  return RESORT_EDIT_STYLING_RULES.map((r, i) => `${i + 1}. ${r}`).join("\n");
}

function outfitBlock(ctx: StylistLookContext): string {
  return ctx.outfit
    .map(
      (p) =>
        `- ${p.slotLabel ?? p.slot} [${p.slot}]: ${p.brand} — ${p.productName}${
          p.price ? ` (${p.price})` : ""
        }${p.retailer ? ` · ${p.retailer}` : ""}${
          p.slot.toLowerCase() === ctx.failedSlot.toLowerCase()
            ? "  ← FAILED SLOT, replace this only"
            : ""
        }`,
    )
    .join("\n");
}

/** Full prompt payload — exported so the admin UI can show exactly what the model receives. */
export function buildReplacementPrompt(ctx: StylistLookContext): {
  system: string;
  user: string;
} {
  const system = `You are the Fashion Director of Resort Edit, a luxury destination-styling publication. You restyle a single failed slot inside an existing published look without disturbing the rest of the outfit or the editorial concept. You only propose real, currently purchasable products from approved luxury retailers, and you only give exact product-detail-page URLs. If you are not confident a specific product page exists, choose a different product you are confident about rather than inventing a URL.

RESORT EDIT STYLING RULES (non-negotiable):
${rulesBlock()}

Return ONLY valid JSON, no prose, in this exact shape:
{"candidates":[{"brand":"","product_name":"","retailer":"","pdp_url":"","price":"","color":"","matching_score":0,"rationale":"","look_impact":"","style_dna":{"category":"","color":"","silhouette":"","fabric":"","neckline":"","fit":"","occasion":"","luxury_level":""}}]}
Exactly 3 candidates. matching_score is 0-100. rationale and look_impact are one or two concise stylist sentences each.`;

  const user = `LOOK CONTEXT
Destination: ${ctx.destination}
Moment / activity: ${ctx.moment}
Moment narrative: ${ctx.momentNarrative ?? "—"}
Styling cues: ${(ctx.stylingCues ?? []).join("; ") || "—"}
Look: ${ctx.lookTitle} (${ctx.lookKind} look, key ${ctx.lookKey})
Editorial copy: ${ctx.editorialCopy ?? "—"}
Editorial image description: ${ctx.imageAlt ?? "—"}
Season: ${currentSeason()}

COMPLETE EXISTING OUTFIT (keep every piece except the failed slot)
${outfitBlock(ctx)}

FAILED SLOT: ${ctx.failedSlot} (${slotRole(ctx.failedSlot)} piece)
Failed product: ${ctx.failedProduct.brand} — ${ctx.failedProduct.productName}${
    ctx.failedProduct.price ? ` (${ctx.failedProduct.price})` : ""
  }
Failed product Style DNA: ${JSON.stringify(ctx.failedStyleDna ?? {})}
Budget tier to match: ${budgetTierForPrice(ctx.failedProduct.price)}
Colours already in the look: ${(ctx.colorsInLook ?? []).join(", ") || "—"}
Jewellery designer / metal family in the look: ${(ctx.jewelryBrandsInLook ?? []).join(", ") || "—"}
Approved retailer priority: ${APPROVED_RETAILER_PRIORITY.join(" → ")}
Brand restrictions: ${(ctx.brandRestrictions ?? []).join(", ") || "none beyond the rules above"}

Propose 3 complete, real replacement candidates for the failed slot only. Each must preserve or improve the look as a whole.`;

  return { system, user };
}

/** Prompt for a deliberate full restyle (admin-initiated only). */
export function buildRestylePrompt(ctx: StylistLookContext): {
  system: string;
  user: string;
} {
  const system = `You are the Fashion Director of Resort Edit. You are restyling a COMPLETE look from scratch while preserving the editorial concept, image and narrative it was photographed for. Only real, currently purchasable products with exact PDP URLs.

RESORT EDIT STYLING RULES (non-negotiable):
${rulesBlock()}

Return ONLY valid JSON:
{"candidates":[{"slot":"","brand":"","product_name":"","retailer":"","pdp_url":"","price":"","color":"","matching_score":0,"rationale":"","look_impact":"","style_dna":{}}]}
One candidate per slot, using the same slot keys as the existing outfit.`;

  const user = `${buildReplacementPrompt(ctx).user}

RESTYLE MODE: propose one replacement for EVERY slot listed above (same slot keys), as a single coherent outfit that still matches the editorial image description and narrative.`;
  return { system, user };
}

type GatewayChoice = { message?: { content?: string } };

async function callGateway(system: string, user: string): Promise<string> {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new AiStylistNotConfiguredError();
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: AI_STYLIST_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (res.status === 429) throw new Error("AI gateway rate limit — try again in a moment.");
  if (res.status === 402)
    throw new Error("AI credits exhausted — top up credits to generate replacements.");
  if (!res.ok) throw new Error(`AI gateway ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = (await res.json()) as { choices?: GatewayChoice[] };
  return json.choices?.[0]?.message?.content ?? "";
}

function parseCandidates(raw: string): Array<RawAiCandidate & { slot?: string }> {
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return [];
  }
  const list = (parsed as { candidates?: unknown }).candidates;
  if (!Array.isArray(list)) return [];
  return list.flatMap((item) => {
    const c = item as Record<string, unknown>;
    const brand = typeof c["brand"] === "string" ? c["brand"].trim() : "";
    const name = typeof c["product_name"] === "string" ? c["product_name"].trim() : "";
    const url = typeof c["pdp_url"] === "string" ? c["pdp_url"].trim() : "";
    if (!brand || !name || !url) return [];
    const score = Number(c["matching_score"]);
    return [
      {
        brand,
        productName: name,
        retailer: typeof c["retailer"] === "string" ? c["retailer"] : "",
        pdpUrl: url,
        price: typeof c["price"] === "string" ? c["price"] : undefined,
        color: typeof c["color"] === "string" ? c["color"] : undefined,
        matchingScore: Number.isFinite(score) ? Math.max(0, Math.min(100, score)) : undefined,
        rationale: typeof c["rationale"] === "string" ? c["rationale"] : undefined,
        lookImpact: typeof c["look_impact"] === "string" ? c["look_impact"] : undefined,
        styleDna:
          c["style_dna"] && typeof c["style_dna"] === "object"
            ? (c["style_dna"] as Record<string, unknown>)
            : undefined,
        slot: typeof c["slot"] === "string" ? c["slot"] : undefined,
      },
    ];
  });
}

function meta(): StylistRunMeta {
  return {
    provider: AI_STYLIST_PROVIDER,
    model: AI_STYLIST_MODEL,
    promptVersion: AI_STYLIST_PROMPT_VERSION,
    generatedAt: new Date().toISOString(),
  };
}

/** Restyle one failed slot inside the full look. Returns unverified candidates. */
export async function generateSlotReplacements(
  ctx: StylistLookContext,
): Promise<{ meta: StylistRunMeta; candidates: RawAiCandidate[] }> {
  const { system, user } = buildReplacementPrompt(ctx);
  const content = await callGateway(system, user);
  return { meta: meta(), candidates: parseCandidates(content).slice(0, 3) };
}

/** Restyle every slot in the look (explicit admin action only). Returns unverified candidates. */
export async function generateCompleteRestyle(
  ctx: StylistLookContext,
): Promise<{ meta: StylistRunMeta; candidates: Array<RawAiCandidate & { slot?: string }> }> {
  const { system, user } = buildRestylePrompt(ctx);
  const content = await callGateway(system, user);
  return { meta: meta(), candidates: parseCandidates(content) };
}