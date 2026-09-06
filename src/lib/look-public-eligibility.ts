/**
 * ONE PUBLIC ELIGIBILITY RULE FOR EVERY SHOPPABLE LOOK
 *
 * Every public render path — DB-driven moment heroes (`public_shop_slot_display`),
 * `look_items_public`, hardcoded supporting editorial cards, preview-staged
 * looks — must ask THIS function whether a look may appear. If it answers no,
 * the whole shoppable unit is withheld: image, itemization, Save control and
 * CTA. Nothing partial renders, and no sourcing placeholder is ever shown.
 *
 * Rules encoded (project knowledge):
 *  - required: garment (a one-piece, or a top AND a bottom for separates),
 *    shoes, bag, plus every declared visible accessory,
 *  - daytime looks that visibly wear sunglasses must link them; evening
 *    moments must not show sunglasses at all,
 *  - matching jewellery: declared jewellery slots each need their own link,
 *  - each row needs an active status and a valid canonical exact-product URL,
 *  - anything unknown, sold out, in review, unsourced or malformed makes the
 *    WHOLE look ineligible.
 *
 * Stored data is never deleted by this gate — it only decides visibility, and
 * the `missing` list is the durable repair instruction.
 */
import {
  BASE_REQUIRED_SLOTS,
  canonicalVisibleSlot,
  evaluateAtomicLook,
  isLiveAtomicRow,
  type AtomicRow,
  type VisibleProductSlot,
} from "./look-atomic-completeness";
import { LILLA_VISIBLE_SLOTS } from "@/data/lillaVisibleSlots";
import { momentBrief, sunglassesAllowed } from "./portofino-moment-briefs";

const ONE_PIECE =
  /\b(dress|gown|jumpsuit|romper|caftan|kaftan|maillot|one-?piece|swimsuit|playsuit|midi|maxi|slip|set)\b/i;
const TOP_ONLY = /\b(top|blouse|shirt|cami|bralette|corset|bodysuit|knit|sweater|tee|vest)\b/i;
const BOTTOM_ONLY = /\b(trouser|pant|short|skirt|culotte|brief|bottom)\b/i;

export type EligibilityRow = AtomicRow & {
  brand?: string | null;
  productName?: string | null;
};

export type PublicLookEligibility = {
  eligible: boolean;
  /** Visible categories with no live linked product — the repair instruction. */
  missing: VisibleProductSlot[];
  /** Human-readable reasons, durable for audits and repair jobs. */
  reasons: string[];
};

const INELIGIBLE = (reasons: string[], missing: VisibleProductSlot[] = []) => ({
  eligible: false,
  missing,
  reasons,
});

/**
 * Garment coverage: a linked "outfit" row is not enough on its own when the
 * pieces are separates — a top without a bottom is an incomplete outfit.
 */
export function garmentCoverageOk(rows: readonly EligibilityRow[]): boolean {
  const labels = rows
    .filter(isLiveAtomicRow)
    .filter((r) => canonicalVisibleSlot(r.slot ?? r.slotLabel ?? r.category) === "outfit")
    .map((r) => `${r.brand ?? ""} ${r.productName ?? ""} ${r.slot ?? r.slotLabel ?? ""}`);
  if (labels.length === 0) return false;
  if (labels.some((l) => ONE_PIECE.test(l))) return true;
  return labels.some((l) => TOP_ONLY.test(l)) && labels.some((l) => BOTTOM_ONLY.test(l));
}

export function evaluatePublicLook(input: {
  /** `portofino/<moment>` or `portofino/<moment>/<card>`. */
  lookKey: string;
  /** Moment slug, for the evening/sunglasses rule. */
  momentSlug?: string;
  /** Declared visible categories; falls back to the shipped registry. */
  visibleProductSlots?: readonly VisibleProductSlot[];
  rows: readonly EligibilityRow[];
}): PublicLookEligibility {
  const declared =
    input.visibleProductSlots ?? LILLA_VISIBLE_SLOTS[input.lookKey] ?? BASE_REQUIRED_SLOTS;
  const rows = input.rows ?? [];
  if (rows.length === 0) return INELIGIBLE(["no linked products"], [...declared]);

  const { complete, missing } = evaluateAtomicLook({
    visibleProductSlots: declared,
    rows,
  });
  const reasons: string[] = [];
  if (!complete) reasons.push(`missing active linked products: ${missing.join(", ")}`);
  if (!garmentCoverageOk(rows)) {
    reasons.push("garment does not read as a complete outfit (separates need a top and a bottom)");
  }

  const momentSlug = input.momentSlug ?? input.lookKey.split("/")[1] ?? "";
  const brief = momentBrief(momentSlug);
  const liveSlots = new Set(
    rows
      .filter(isLiveAtomicRow)
      .map((r) => canonicalVisibleSlot(r.slot ?? r.slotLabel ?? r.category))
      .filter((s): s is VisibleProductSlot => Boolean(s)),
  );
  if (brief && !sunglassesAllowed(brief) && liveSlots.has("sunglasses")) {
    reasons.push(`${brief.momentName} is an evening moment — sunglasses must not appear`);
  }

  return { eligible: reasons.length === 0, missing, reasons };
}
