/**
 * Editorial completeness rules — client-safe, shared.
 *
 * A look may only render as a PUBLISHED card when it carries a complete,
 * verified shopping set for its moment. Incomplete looks are never dressed up
 * with placeholder or "Coming Soon" affordances: they simply do not render,
 * and the Studio queue is the internal record of what still needs styling.
 *
 * Required slots (per Resort Edit editorial law):
 *   main outfit / coordinated separates · shoes · bag ·
 *   earrings · necklace · bracelet (a single consolidated "Jewelry" slot
 *   satisfies the jewelry group) · sunglasses for DAYTIME moments only.
 * Optional: layer, hair detail. Rings are never merchandised.
 */

/** Moments that read as evening — sunglasses are NOT required for these. */
export const EVENING_MOMENT_SLUGS = new Set([
  "harbor-aperitivo",
  "sunset-views",
  "riviera-dinner",
  "nightcap",
]);

export function isDaytimeMoment(momentSlug: string): boolean {
  return !EVENING_MOMENT_SLUGS.has(momentSlug);
}

/** Maximum supporting looks rendered under "More Resort Edit Looks". */
export const MAX_SUPPORTING_LOOKS = 2;

export type CanonicalSlot =
  | "outfit"
  | "shoes"
  | "bag"
  | "earrings"
  | "necklace"
  | "bracelet"
  | "jewelry"
  | "sunglasses"
  | "layer"
  | "hair"
  | "other";

/** Map any human slot label onto a canonical slot token. */
export function canonicalSlot(label: string | null | undefined): CanonicalSlot {
  const l = (label ?? "").toLowerCase();
  if (!l) return "other";
  if (/earring/.test(l)) return "earrings";
  if (/necklace|pendant|chain/.test(l)) return "necklace";
  if (/bracelet|cuff|bangle/.test(l)) return "bracelet";
  if (/jewel/.test(l)) return "jewelry";
  if (/sunglass|eyewear/.test(l)) return "sunglasses";
  if (/shoe|sandal|heel|espadrille|slide|flat|mule|loafer/.test(l)) return "shoes";
  if (/bag|clutch|tote|basket|purse/.test(l)) return "bag";
  if (/hair|scarf|headband|clip/.test(l)) return "hair";
  if (/layer|kaftan|caftan|cover|blazer|jacket|cardigan|wrap|pareo/.test(l)) return "layer";
  if (/look|outfit|dress|top|bottom|pant|skirt|vest|swim|separates|set/.test(l)) return "outfit";
  return "other";
}

const REQUIRED_BASE: CanonicalSlot[] = ["outfit", "shoes", "bag"];

/**
 * True when the set of live slot labels forms a complete, publishable look.
 * `jewelry` counts as satisfying earrings + necklace + bracelet, since some
 * curated looks group fine jewelry into a single editorial slot.
 */
export function isCompleteLook(
  liveSlotLabels: readonly (string | null | undefined)[],
  opts: { daytime: boolean },
): boolean {
  const slots = new Set(liveSlotLabels.map(canonicalSlot));
  for (const req of REQUIRED_BASE) if (!slots.has(req)) return false;
  const jewelryOk =
    slots.has("jewelry") ||
    (slots.has("earrings") && slots.has("necklace") && slots.has("bracelet"));
  if (!jewelryOk) return false;
  if (opts.daytime && !slots.has("sunglasses")) return false;
  return true;
}

/** Slots that are missing from an otherwise-published look (for the queue). */
export function missingSlots(
  liveSlotLabels: readonly (string | null | undefined)[],
  opts: { daytime: boolean },
): CanonicalSlot[] {
  const slots = new Set(liveSlotLabels.map(canonicalSlot));
  const out: CanonicalSlot[] = [];
  for (const req of REQUIRED_BASE) if (!slots.has(req)) out.push(req);
  if (
    !slots.has("jewelry") &&
    !(slots.has("earrings") && slots.has("necklace") && slots.has("bracelet"))
  ) {
    for (const j of ["earrings", "necklace", "bracelet"] as CanonicalSlot[]) {
      if (!slots.has(j)) out.push(j);
    }
  }
  if (opts.daytime && !slots.has("sunglasses")) out.push("sunglasses");
  return out;
}
