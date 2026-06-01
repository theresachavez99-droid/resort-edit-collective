/**
 * Look data model — single source of truth for every "View Full Look"
 * shopping experience. Each Look is a strictly nested object:
 *
 *   look = {
 *     id, destination, day, lookSlug, title, subtitle, heroImage,
 *     products: { outfit, shoes, bag, jewelry, sunglasses, hairDetail, layer }
 *   }
 *
 * Every category is REQUIRED and never blank. If a category has no
 * verified affiliate product, the slot is filled by a non-clickable
 * "Resort Edit styling note" card carrying the literal copy
 * "Not available through approved affiliate partners" — never a
 * placeholder or broken URL.
 *
 * VALIDATION (applied at module load):
 *   ✗ no exact product URL  → replace with styling-note placeholder
 *   ✗ missing image         → replace with styling-note placeholder
 *   ✗ homepage / "#" URL    → replace with styling-note placeholder
 *   ✗ inventory=unavailable → replace with styling-note placeholder
 *
 * Tiers (Luxury / Mid-Luxe / Riviera Finds) each carry their own
 * `products` block so users can switch price tier without leaving the page.
 */
import { portofinoLooks, type ShopItem } from "./portofino";
import {
  portofinoEdit,
  type EditItem,
  type LookEdit,
  type Tier,
} from "./portofinoEdit";
import {
  LOOK_KEY_TO_SLUG,
  LOOK_SLUG_LABEL,
  TIER_LABEL,
  TIER_SLUG_TO_ID,
  TIER_SLUGS,
  type LookSlug,
  type TierSlug,
} from "@/lib/portofino-spec";
import { fallbackFor } from "./lookFallbacks";

export type LookCategory =
  | "outfit"
  | "shoes"
  | "bag"
  | "jewelry"
  | "sunglasses"
  | "hairDetail"
  | "layer";

export const LOOK_CATEGORY_ORDER: LookCategory[] = [
  "outfit",
  "shoes",
  "bag",
  "jewelry",
  "sunglasses",
  "hairDetail",
  "layer",
];

export const LOOK_CATEGORY_LABEL: Record<LookCategory, string> = {
  outfit: "Outfit",
  shoes: "Shoes",
  bag: "Bag",
  jewelry: "Jewelry",
  sunglasses: "Sunglasses",
  hairDetail: "Hair Detail",
  layer: "Optional Layer",
};

export type LookProduct = {
  /** Always present; never blank for an unverified slot. */
  brand: string;
  title: string;
  price: string;
  /** Verified exact affiliate URL — or null when no product was sourced. */
  url: string | null;
  /** Product thumbnail — or null when no product was sourced. */
  image: string | null;
  /** True when shown product was swapped from the original pick. */
  replaced?: boolean;
  /**
   * True when no verified affiliate product could be sourced for this slot
   * — the renderer shows the literal copy
   * "Not available through approved affiliate partners".
   */
  isPlaceholder?: boolean;
};

export type LookProducts = Record<LookCategory, LookProduct>;

export type LookTier = {
  slug: TierSlug;
  label: string;
  products: LookProducts;
};

export type Look = {
  /** Stable composite id, e.g. "portofino-day-1-look-a". */
  id: string;
  destination: string;
  day: string;
  daySlug: "day-1" | "day-2" | "day-3" | "day-4" | "day-5";
  lookSlug: LookSlug;
  lookLabel: string;
  title: string;
  subtitle: string;
  caption: string;
  heroImage: string;
  tiers: Record<TierSlug, LookTier>;
};

// ──────────────────────────────────────────────────────────────
// Validation
// ──────────────────────────────────────────────────────────────
const BAD_URL_RE = /^#|^\s*$|javascript:/i;

function isUsableUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  if (BAD_URL_RE.test(url)) return false;
  try {
    const u = new URL(url);
    // Reject homepage-only URLs (path "/" or empty path).
    if (u.pathname === "/" || u.pathname === "") return false;
    return true;
  } catch {
    return false;
  }
}

function placeholder(category: LookCategory, hint?: string): LookProduct {
  return {
    brand: "Resort Edit Styling Note",
    title:
      hint ??
      defaultStylingNote(category),
    price: "Styling",
    url: null,
    image: null,
    isPlaceholder: true,
  };
}

function defaultStylingNote(category: LookCategory): string {
  switch (category) {
    case "outfit":
    case "shoes":
    case "bag":
    case "jewelry":
    case "sunglasses":
    case "hairDetail":
    case "layer":
      return "Not available through approved affiliate partners";
  }
}

function validateOrPlaceholder(
  candidate: { brand: string; title: string; price: string; url?: string | null; image?: string | null; replaced?: boolean },
  category: LookCategory,
): LookProduct {
  if (!isUsableUrl(candidate.url) || !candidate.image) {
    return placeholder(category);
  }
  return {
    brand: candidate.brand,
    title: candidate.title,
    price: candidate.price,
    url: candidate.url!,
    image: candidate.image!,
    replaced: candidate.replaced,
  };
}

// ──────────────────────────────────────────────────────────────
// Migration helpers: map legacy data → new structured products{}
// ──────────────────────────────────────────────────────────────
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const CATEGORY_TOKENS: Record<LookCategory, string[]> = {
  shoes: ["sandal", "heel", "mule", "espadrille", "loafer", "slide", "wedge", "pump"],
  bag: ["bag", "tote", "clutch", "minaudi", "pouch", "shoulder", "bucket", "basket"],
  jewelry: ["earring", "hoop", "drop", "stud", "bracelet", "cuff", "bangle", "necklace", "pendant", "lariat", "ring", "chain"],
  sunglasses: ["sunglass", "shades"],
  outfit: ["dress", "top", "skirt", "pants", "trousers", "polo", "blouse", "shirt", "set", "swimsuit", "bikini", "maillot", "shorts", "jumpsuit", "romper"],
  layer: ["caftan", "kaftan", "kimono", "jacket", "coverup", "cover-up", "cardigan", "robe", "shawl", "wrap", "sarong", "pareo"],
  hairDetail: ["scarf", "hat", "headband", "barrette", "clip", "hair"],
};

function inferCategory(brand: string, title: string, legacyCategory?: string): LookCategory {
  const hay = (brand + " " + title).toLowerCase();
  // honour explicit legacy mapping when meaningful
  switch (legacyCategory) {
    case "clothing": return "outfit";
    case "shoes": return "shoes";
    case "bag": return "bag";
    case "jewelry": return "jewelry";
    case "sunglasses": return "sunglasses";
    case "layer": return "layer";
    case "finishing":
      if (/hat|scarf|headband|hair/i.test(hay)) return "hairDetail";
      return "layer";
  }
  for (const cat of LOOK_CATEGORY_ORDER) {
    if (CATEGORY_TOKENS[cat]?.some((t) => hay.includes(t))) return cat;
  }
  return "outfit";
}

/** Map ShopItem (from portofinoLooks[].shop) → candidate by category. */
function shopItemCandidate(item: ShopItem) {
  // Prefer href, fall back to backup links.
  const url = [item.href, item.backup_link_1, item.backup_link_2].find(isUsableUrl) ?? null;
  return {
    brand: item.brand,
    title: item.item,
    price: item.price,
    url,
    image: item.image ?? null,
    replaced: item.replaced,
    category: inferCategory(item.brand, item.item, item.category),
    lookIndex: item.lookIndex,
  };
}

/** Map EditItem (from portofinoEdit) → candidate. */
function editItemCandidate(item: EditItem) {
  return {
    brand: item.brand,
    title: item.item,
    price: item.price,
    url: isUsableUrl(item.href) ? item.href : null,
    image: item.image ?? null,
    replaced: item.replaced,
    category: inferCategory(item.brand, item.item, item.category),
  };
}

/**
 * Build the validated products{} block for one Day × Look × Tier.
 * Strategy:
 *  1. Start from portofinoEdit (provides editorial structure for every slot).
 *  2. Enrich each edit item with the matching live URL/thumbnail from
 *     portofinoLooks[].shop when brand+title align (real affiliate data).
 *  3. Fill any still-empty category with a real ShopItem from this day
 *     that hasn't been used yet (so we never waste a verified link).
 *  4. Any remaining empty slot becomes a styling-note placeholder.
 */
function buildProducts(
  dayIdx: number,
  lookEdit: LookEdit,
  tier: Tier,
  liveItems: ReturnType<typeof shopItemCandidate>[],
  consumed: Set<string>,
): LookProducts {
  const slots: Partial<LookProducts> = {};
  const editItems = lookEdit.tiers[tier] ?? [];

  for (const ed of editItems) {
    const candidate = editItemCandidate(ed);
    // Try to enrich with a live match by brand+title fuzzy similarity.
    const match = liveItems.find((live) => {
      if (consumed.has(keyOf(live))) return false;
      if (norm(live.brand) !== norm(candidate.brand)) return false;
      const a = norm(live.title);
      const b = norm(candidate.title);
      return a === b || a.includes(b.slice(0, 8)) || b.includes(a.slice(0, 8));
    });
    const enriched = match
      ? {
          brand: candidate.brand,
          title: candidate.title,
          price: match.price || candidate.price,
          url: match.url ?? candidate.url,
          image: match.image ?? candidate.image,
          replaced: match.replaced || candidate.replaced,
        }
      : candidate;
    if (match) consumed.add(keyOf(match));

    const cat = candidate.category;
    if (!slots[cat] && isUsableUrl(enriched.url) && enriched.image) {
      slots[cat] = validateOrPlaceholder(enriched, cat);
    }
  }

  // Backfill empty categories with any unconsumed live item from this day
  // whose inferred category matches — never waste a verified affiliate URL.
  for (const cat of LOOK_CATEGORY_ORDER) {
    if (slots[cat]) continue;
    const live = liveItems.find(
      (l) => !consumed.has(keyOf(l)) && l.category === cat && isUsableUrl(l.url) && l.image,
    );
    if (live) {
      consumed.add(keyOf(live));
      slots[cat] = validateOrPlaceholder(
        { brand: live.brand, title: live.title, price: live.price, url: live.url, image: live.image, replaced: true },
        cat,
      );
    } else {
      slots[cat] = placeholder(cat);
    }
  }

  return slots as LookProducts;
}

function keyOf(c: { brand: string; title: string }) {
  return norm(c.brand) + "::" + norm(c.title);
}

// ──────────────────────────────────────────────────────────────
// Build all 15 looks (5 days × 3 looks) for Portofino
// ──────────────────────────────────────────────────────────────
const DAY_SLUGS: Look["daySlug"][] = ["day-1", "day-2", "day-3", "day-4", "day-5"];

function buildPortofinoLookbook(): Look[] {
  const out: Look[] = [];
  for (let dayIdx = 0; dayIdx < portofinoEdit.length; dayIdx++) {
    const dayEdit = portofinoEdit[dayIdx];
    const daySlug = DAY_SLUGS[dayIdx];
    const daySource = portofinoLooks[dayIdx];
    const liveItems = (daySource?.shop ?? []).map(shopItemCandidate);

    for (const lookEdit of dayEdit.looks) {
      const lookSlug = LOOK_KEY_TO_SLUG[lookEdit.id];
      // Tier-local consumed set — each tier should be free to use the same
      // live items independently (a luxury slot consuming an item should not
      // block mid-luxe from using it as backfill).
      const tiers = {} as Record<TierSlug, LookTier>;
      for (const tierSlug of TIER_SLUGS) {
        const tierId = TIER_SLUG_TO_ID[tierSlug];
        const consumed = new Set<string>();
        // Only feed products mapped to this exact look. Legacy untagged Day
        // products belong to Look A; they must not leak into Look B/C.
        const lookTagged = liveItems.filter((l) => {
          if (!l.lookIndex) return false;
          const idxToSlug: Record<number, LookSlug> = { 1: "look-a", 2: "look-b", 3: "look-c" };
          return idxToSlug[l.lookIndex] === lookSlug;
        });
        const untagged = lookSlug === "look-a" ? liveItems.filter((l) => !l.lookIndex) : [];
        const pool = [...lookTagged, ...untagged];
        tiers[tierSlug] = {
          slug: tierSlug,
          label: TIER_LABEL[tierSlug],
          products: buildProducts(dayIdx, lookEdit, tierId, pool, consumed),
        };
      }

      out.push({
        id: `portofino-${daySlug}-${lookSlug}`,
        destination: "Portofino",
        day: dayEdit.day,
        daySlug,
        lookSlug,
        lookLabel: LOOK_SLUG_LABEL[lookSlug],
        title: lookEdit.name,
        subtitle: lookEdit.category,
        caption: lookEdit.description,
        heroImage: lookEdit.image ?? dayEdit.image,
        tiers,
      });
    }
  }
  // ── Safety net pass ──────────────────────────────────────────
  // Per sourcing rules: no View Full Look page may ship with 0
  // sourced pieces or a placeholder where a real product is
  // available elsewhere. Apply, in order:
  //   1. Curated fallback library (Day × Look × Tier × Category).
  //   2. Cross-tier borrow — pull a sibling tier's real product
  //      into the empty slot so the grid is never empty.
  for (const look of out) {
    for (const tierSlug of TIER_SLUGS) {
      const tier = look.tiers[tierSlug];
      for (const cat of LOOK_CATEGORY_ORDER) {
        if (!tier.products[cat].isPlaceholder) continue;
        const fb = fallbackFor(look.daySlug, look.lookSlug, tierSlug, cat);
        if (fb && !fb.isPlaceholder && fb.url && fb.image) {
          tier.products[cat] = { ...fb, replaced: true };
        }
      }
    }
    // Cross-tier borrow — runs after every tier had a chance at curated.
    for (const tierSlug of TIER_SLUGS) {
      const tier = look.tiers[tierSlug];
      for (const cat of LOOK_CATEGORY_ORDER) {
        if (!tier.products[cat].isPlaceholder) continue;
        for (const other of TIER_SLUGS) {
          if (other === tierSlug) continue;
          const sibling = look.tiers[other].products[cat];
          if (!sibling.isPlaceholder && sibling.url && sibling.image) {
            tier.products[cat] = { ...sibling, replaced: true };
            break;
          }
        }
      }
    }
  }
  // ── Publish guard ────────────────────────────────────────────
  // Refuse to ship a look that has zero sourced pieces in any tier.
  // Throws at module load so the build fails before publish.
  const empty: string[] = [];
  for (const look of out) {
    for (const tierSlug of TIER_SLUGS) {
      const sourced = LOOK_CATEGORY_ORDER.filter(
        (c) => !look.tiers[tierSlug].products[c].isPlaceholder,
      ).length;
      if (sourced === 0) {
        empty.push(`${look.daySlug}/${look.lookSlug} · ${tierSlug}`);
      }
    }
  }
  if (empty.length > 0) {
    const msg =
      "Lookbook publish blocked — 0 sourced pieces for: " + empty.join(", ");
    if (import.meta.env.DEV) {
      console.error("[lookbook]", msg);
    } else {
      throw new Error(msg);
    }
  }
  return out;
}

export const lookbook: Look[] = buildPortofinoLookbook();

export function findLook(daySlug: Look["daySlug"], lookSlug: LookSlug): Look | undefined {
  return lookbook.find((l) => l.daySlug === daySlug && l.lookSlug === lookSlug);
}

export function priceTotalFor(products: LookProducts): number {
  let n = 0;
  for (const cat of LOOK_CATEGORY_ORDER) {
    const p = products[cat];
    if (p.isPlaceholder) continue;
    const v = parseFloat(p.price.replace(/[^0-9.]/g, ""));
    if (!isNaN(v)) n += v;
  }
  return n;
}

export function formatUsd(n: number): string {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}