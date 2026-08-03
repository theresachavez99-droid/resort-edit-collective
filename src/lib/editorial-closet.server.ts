/**
 * EDITORIAL CLOSET — server engine (server-only).
 *
 * Responsibilities here: assemble the FULL editorial context for a moment,
 * hand it to ChatGPT (the styling brain), verify every returned PDP, and
 * persist candidates for owner review. Nothing here styles or invents a
 * product, and nothing is ever exposed publicly without approval + verified
 * live PDP.
 */
import { MOMENT_SHOP_CURATED } from "@/data/momentShopCurated";
import { MOMENT_EXTRA_EDITORIAL_CARDS } from "@/data/momentEditorialCards";
import { PORTOFINO_JOURNEY, getPortofinoMomentDef } from "@/lib/portofino-moment-fallbacks";
import { closetContextLabel, CLOSET_MAX_CANDIDATES } from "@/lib/editorial-closet";
import { isExcludedSlotLabel } from "@/lib/merchandising-exclusions";
import { loadStylingPolicy } from "@/lib/resort-edit-styling-policy.server";
import {
  generateResortEditClosetAlternatives,
  isOpenAiStylistConfigured,
  OpenAiStylistNotConnectedError,
  OPENAI_STYLIST_PROMPT_VERSION,
  openAiStylistModel,
  type OutfitPiece,
} from "@/lib/openai-stylist.server";
import { verifyPdp } from "@/lib/pdp-verification.server";
import { budgetTierForPrice } from "@/lib/resort-edit-styling-rules";

export type ClosetContext = {
  destination: string;
  momentSlug: string;
  momentName: string;
  momentNarrative: string;
  editorialImageUrl: string | null;
  outfit: OutfitPiece[];
  anchor: OutfitPiece | null;
  anchorCategory: string;
  contextLabel: string;
  colorsInLook: string[];
  jewelryBrands: string[];
  priceTier: string | null;
  nearbyLooks: Array<{ lookTitle: string; pieces: string[] }>;
};

/** The hero garment is the anchor the closet offers alternatives for. */
function pickAnchor(outfit: OutfitPiece[]): OutfitPiece | null {
  const hero = outfit.find((p) =>
    /dress|gown|vest|corset|top|shirt|blazer|jacket|trouser|pant|skirt|swim|kaftan|caftan|set/i.test(
      `${p.slot} ${p.slotLabel ?? ""}`,
    ),
  );
  return hero ?? outfit[0] ?? null;
}

/**
 * Package everything the stylist needs: hero outfit, destination + moment,
 * editorial copy, adjacent looks, color story, price positioning, jewelry
 * family. Derived from the published editorial data — never invented.
 */
export function buildClosetContext(momentSlug: string): ClosetContext {
  const def =
    getPortofinoMomentDef(momentSlug) ??
    PORTOFINO_JOURNEY.find((m) => m.moment_slug === momentSlug) ??
    null;

  const curated = (MOMENT_SHOP_CURATED[momentSlug] ?? []).filter(
    (i) =>
      !i.unsourced &&
      !isExcludedSlotLabel(`${i.category ?? ""} ${i.slotLabel} ${i.title}`),
  );

  const outfit: OutfitPiece[] = curated.map((i) => ({
    slot: i.category ?? i.slotLabel,
    slotLabel: i.slotLabel,
    brand: i.brand,
    productName: i.title,
    retailer: null,
    price: i.price ?? null,
    url: i.url,
    color: null,
  }));

  const anchor = pickAnchor(outfit);
  const momentName = def?.moment_name ?? momentSlug.replace(/-/g, " ");
  const anchorCategory = anchor?.slot ?? "Hero garment";

  const nearbyLooks = (MOMENT_EXTRA_EDITORIAL_CARDS[momentSlug] ?? []).map((card) => ({
    lookTitle: card.title,
    pieces: (card.shop?.products ?? [])
      .filter((s) => !isExcludedSlotLabel(`${s.slot} ${s.name}`))
      .map((s) => `${s.brand} ${s.name}`),
  }));

  const jewelryBrands = curated
    .filter((i) => /earring|necklace|bracelet|cuff|jewel/i.test(`${i.category ?? ""} ${i.slotLabel}`))
    .map((i) => i.brand);

  const prices = curated.map((i) => i.price).filter((p): p is string => Boolean(p));
  const priceTier = anchor?.price
    ? budgetTierForPrice(anchor.price)
    : prices.length
      ? budgetTierForPrice(prices[0]!)
      : null;

  return {
    destination: "Portofino",
    momentSlug,
    momentName,
    momentNarrative: def?.narrative ?? "",
    editorialImageUrl: def?.outfit_image ?? def?.hero_banner_image ?? null,
    outfit,
    anchor,
    anchorCategory,
    contextLabel: closetContextLabel({ category: anchorCategory, momentName }),
    colorsInLook: [],
    jewelryBrands,
    priceTier,
    nearbyLooks,
  };
}

export type ClosetGeneratedCandidate = {
  brand: string;
  productName: string;
  retailer: string;
  productUrl: string;
  price: string | null;
  color: string | null;
  category: string;
  silhouette: string | null;
  material: string | null;
  matchScore: number;
  editorialRationale: string;
  rationaleTag: string | null;
  fullLookPairing: string | null;
  retailerPriorityRank: number | null;
  verificationStatus: "verified" | "rejected" | "unverified";
  verificationVerdict: string;
  httpStatus: number | null;
  availability: string;
  verifiedAt: string | null;
  imageUrl: string | null;
};

/** Derive the short reader-facing tag from the stylist's rationale sentence. */
function deriveTag(rationale: string, price: string | null): string | null {
  const r = rationale.toLowerCase();
  const numeric = Number((price ?? "").replace(/[^0-9.]/g, ""));
  if (Number.isFinite(numeric) && numeric > 0 && numeric < 500) return "Under $500";
  if (/relaxed|easy|softer/.test(r)) return "More relaxed";
  if (/polished|sharper|tailored/.test(r)) return "More polished";
  if (/colour|color|print|floral/.test(r)) return "More color";
  if (/evening|dinner|night/.test(r)) return "Evening-leaning";
  if (/quiet|understated|minimal/.test(r)) return "Quieter";
  if (/investment|heirloom|forever/.test(r)) return "Investment piece";
  return null;
}

/**
 * Ask ChatGPT for alternatives, then verify each PDP independently.
 * Rejected or unverifiable URLs are returned too, but flagged so the admin UI
 * shows them as "Needs verification" / rejected and never publishes them.
 */
export async function generateClosetCandidates(args: {
  momentSlug: string;
  requestCount?: number;
  feedback?: string | null;
}): Promise<{
  context: ClosetContext;
  candidates: ClosetGeneratedCandidate[];
  insufficientReason: string | null;
  model: string;
  promptVersion: string;
}> {
  if (!isOpenAiStylistConfigured()) throw new OpenAiStylistNotConnectedError();

  const context = buildClosetContext(args.momentSlug);
  if (!context.anchor) {
    return {
      context,
      candidates: [],
      insufficientReason: "This moment has no published hero product to build alternatives around.",
      model: openAiStylistModel(),
      promptVersion: OPENAI_STYLIST_PROMPT_VERSION,
    };
  }

  const policy = await loadStylingPolicy();

  const { result } = await generateResortEditClosetAlternatives({
    destination: context.destination,
    moment: context.momentName,
    momentNarrative: context.momentNarrative,
    lookKey: `${context.momentSlug}:hero`,
    lookKind: "hero",
    lookTitle: `${context.momentName} — hero look`,
    editorialCopy: context.momentNarrative,
    editorialImageUrl: context.editorialImageUrl,
    outfit: context.outfit,
    failedSlot: context.anchorCategory,
    failedProduct: context.anchor,
    jewelryBrandsInLook: context.jewelryBrands,
    nearbyLooks: context.nearbyLooks,
    priceTier: context.priceTier,
    policy,
    regenerationFeedback: args.feedback ?? null,
    alternativesFor: context.anchorCategory,
    contextLabel: context.contextLabel,
    requestCount: Math.min(args.requestCount ?? CLOSET_MAX_CANDIDATES, CLOSET_MAX_CANDIDATES),
  });

  const candidates: ClosetGeneratedCandidate[] = [];
  for (const c of result.candidates) {
    if (isExcludedSlotLabel(`${c.category ?? ""} ${c.product_name}`)) continue;

    let verification: Awaited<ReturnType<typeof verifyPdp>> | null = null;
    try {
      verification = await verifyPdp({
        url: c.exact_pdp_url,
        brand: c.brand,
        productName: c.product_name,
        color: c.color,
      });
    } catch {
      verification = null;
    }

    candidates.push({
      brand: c.brand,
      productName: c.product_name,
      retailer: c.retailer,
      productUrl: c.exact_pdp_url,
      price: verification?.priceFound ?? c.price,
      color: c.color,
      category: c.category ?? context.anchorCategory,
      silhouette: c.silhouette,
      material: c.material,
      matchScore: c.matching_score,
      editorialRationale: c.stylist_rationale,
      rationaleTag: deriveTag(c.stylist_rationale, c.price),
      fullLookPairing: c.full_look_impact || null,
      retailerPriorityRank: c.retailer_priority_rank,
      verificationStatus: verification?.status ?? "unverified",
      verificationVerdict: verification?.verdict ?? "verification_unavailable",
      httpStatus: verification?.httpStatus ?? null,
      availability: verification?.availability ?? "unknown",
      verifiedAt: verification?.status === "verified" ? verification.verifiedAt : null,
      imageUrl: null,
    });
  }

  return {
    context,
    candidates,
    insufficientReason: result.insufficient_candidates_reason,
    model: openAiStylistModel(),
    promptVersion: OPENAI_STYLIST_PROMPT_VERSION,
  };
}