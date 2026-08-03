/**
 * EDITORIAL CLOSET — shared, client-safe model.
 *
 * The Editorial Closet is Resort Edit's secondary conversion layer: a compact,
 * quiet set of alternative hero-product options that sits beneath the complete
 * look and ABOVE the two "More Resort Edit Looks" cards.
 *
 * Architecture rules (permanent):
 *  1. The fixed public editorial content is 1 Hero Look + at most 2 More
 *     Resort Edit Looks. Closet candidates are dynamic and secondary: they
 *     never count toward the two supporting looks and are never published as
 *     editorial looks.
 *  2. ChatGPT/OpenAI is the styling brain. This app assembles context,
 *     verifies URLs, records approvals and renders. It never invents,
 *     substitutes or "improves" a product itself.
 *  3. Nothing reaches the public module without an approved status AND a
 *     verified live PDP. Unverified candidates are labelled
 *     "Needs verification" and stay internal.
 *  4. Rings are never merchandised (see `merchandising-exclusions`).
 */

/** Lifecycle of one AI-proposed alternative. */
export const CLOSET_STATUSES = [
  "generating",
  "ready_for_review",
  "verified",
  "rejected",
  "approved",
  "expired",
] as const;
export type ClosetStatus = (typeof CLOSET_STATUSES)[number];

export const CLOSET_STATUS_LABELS: Record<ClosetStatus, string> = {
  generating: "Generating",
  ready_for_review: "Ready for review",
  verified: "Verified",
  rejected: "Rejected",
  approved: "Approved for dynamic use",
  expired: "Expired",
};

/** Only this status + a verified PDP may surface publicly. */
export function isPubliclyUsable(status: string, verificationStatus: string): boolean {
  return status === "approved" && verificationStatus === "verified";
}

/** Label shown internally when live verification could not be completed. */
export const NEEDS_VERIFICATION_LABEL = "Needs verification";

/** Visible alternatives in the inline module. The drawer holds the rest. */
export const CLOSET_VISIBLE_COUNT = 3;
/** Hard cap on dynamic alternatives per moment. */
export const CLOSET_MAX_CANDIDATES = 12;

/** Public CTA copy — restrained, never "AI". */
export const CLOSET_CTA_LABEL = "See More Resort Edit–Approved Options";

/** Analytics event names recorded for the closet layer. */
export const CLOSET_EVENTS = {
  drawerOpen: "closet_drawer_open",
  cardClick: "closet_card_click",
  retailerClick: "closet_retailer_click",
  conversionIntent: "closet_conversion_intent",
} as const;
export type ClosetEventType = (typeof CLOSET_EVENTS)[keyof typeof CLOSET_EVENTS];

/** A candidate as rendered publicly (limited columns from the public view). */
export type ClosetPublicCandidate = {
  id: string;
  destination: string;
  momentSlug: string;
  category: string;
  contextLabel: string | null;
  brand: string;
  productName: string;
  retailer: string;
  productUrl: string;
  imageUrl: string | null;
  price: string | null;
  color: string | null;
  availability: string;
  editorialRationale: string;
  rationaleTag: string | null;
  matchScore: number | null;
  position: number | null;
};

/** Availability copy for the card — never "Sold out". */
export function availabilityLabel(availability: string): string {
  if (availability === "in_stock") return "Available now";
  if (availability === "out_of_stock") return "Limited availability";
  return "Availability confirmed at retailer";
}

/**
 * Contextual module label derived from the hero product's category and the
 * moment name — e.g. "More Dresses for Arrival Day", "Alternative Sandals",
 * "More Polished Arrival Separates", "More Options for This Moment".
 */
export function closetContextLabel(args: {
  category?: string | null;
  momentName?: string | null;
  polished?: boolean;
}): string {
  const c = (args.category ?? "").toLowerCase().trim();
  const moment = (args.momentName ?? "").trim();
  const forMoment = moment ? ` for ${moment}` : "";

  if (/dress|gown|kaftan|caftan/.test(c)) return `More Dresses${forMoment}`;
  if (/skirt/.test(c)) return `More Skirts${forMoment}`;
  if (/sandal/.test(c)) return "Alternative Sandals";
  if (/heel|pump|slingback/.test(c)) return "Alternative Heels";
  if (/espadrille|flat|mule|loafer|shoe/.test(c)) return "Alternative Shoes";
  if (/bag|tote|clutch|basket|pouch/.test(c)) return "Alternative Bags";
  if (/sunglass|eyewear/.test(c)) return "Alternative Sunglasses";
  if (/earring|necklace|bracelet|cuff|jewel/.test(c)) return "Alternative Jewelry";
  if (/swim|bikini|one.?piece/.test(c)) return `More Swim${forMoment}`;
  if (/vest|trouser|pant|top|shirt|blazer|separates|set|corset|jacket/.test(c)) {
    return moment ? `More Polished ${moment} Separates` : "More Polished Separates";
  }
  return "More Options for This Moment";
}

/** Short editorial rationale tags the stylist may use. */
export const CLOSET_RATIONALE_TAGS = [
  "More relaxed",
  "More polished",
  "More color",
  "Quieter",
  "Evening-leaning",
  "Under $500",
  "Investment piece",
  "Cooler fabric",
  "Easier to travel",
] as const;
