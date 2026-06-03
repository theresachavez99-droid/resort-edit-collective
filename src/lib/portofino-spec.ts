import type { LookKey, EditItem, Tier } from "@/data/portofinoEdit";

export type LookSlug = "look-a" | "look-b" | "look-c";
export type TierSlug = "luxury" | "mid-luxe" | "riviera-finds";

export const LOOK_SLUGS: LookSlug[] = ["look-a", "look-b", "look-c"];

export const LOOK_SLUG_TO_KEY: Record<LookSlug, LookKey> = {
  "look-a": "print",
  "look-b": "neutral",
  "look-c": "texture",
};

export const LOOK_KEY_TO_SLUG: Record<LookKey, LookSlug> = {
  print: "look-a",
  neutral: "look-b",
  texture: "look-c",
};

export const LOOK_SLUG_LABEL: Record<LookSlug, string> = {
  "look-a": "Look A",
  "look-b": "Look B",
  "look-c": "Look C",
};

export const LOOK_INDEX_OF: Record<LookSlug, 0 | 1 | 2> = {
  "look-a": 0,
  "look-b": 1,
  "look-c": 2,
};

export const TIER_SLUG_TO_ID: Record<TierSlug, Tier> = {
  luxury: "designer",
  "mid-luxe": "mid",
  "riviera-finds": "riviera",
};

export const TIER_LABEL: Record<TierSlug, string> = {
  luxury: "Luxury",
  "mid-luxe": "Mid-Luxe",
  "riviera-finds": "Destination Finds",
};

export const TIER_RANGE: Record<TierSlug, string> = {
  luxury: "$300+",
  "mid-luxe": "$100–$400",
  "riviera-finds": "Under $150",
};

export const TIER_TAGLINE: Record<TierSlug, string> = {
  luxury: "Investment luxury pieces.",
  "mid-luxe": "Elevated resort style at modern prices.",
  "riviera-finds": "Curated accessible alternatives.",
};

export const TIER_SLUGS: TierSlug[] = ["luxury", "mid-luxe", "riviera-finds"];

export function isTierSlug(v: unknown): v is TierSlug {
  return v === "luxury" || v === "mid-luxe" || v === "riviera-finds";
}

export function isLookSlug(v: unknown): v is LookSlug {
  return v === "look-a" || v === "look-b" || v === "look-c";
}

/**
 * Maps an EditItem's storage category + item name into the spec's
 * fine-grained product category labels (Outfit, Shoes, Bag, Earrings,
 * Necklace, Bracelet, Ring, Sunglasses, Hair Detail, Optional Layer).
 */
export function inferSpecCategory(item: EditItem): string {
  const n = item.item.toLowerCase();
  switch (item.category) {
    case "clothing":
      return "Outfit";
    case "shoes":
      return "Shoes";
    case "bag":
      return "Bag";
    case "sunglasses":
      return "Sunglasses";
    case "layer":
      return "Optional Layer";
    case "finishing":
      if (n.includes("hat") || n.includes("scarf") || n.includes("headband") || n.includes("hair"))
        return "Hair Detail";
      return "Finishing Touch";
    case "jewelry":
      if (n.includes("earring") || n.includes("hoop") || n.includes("drop") || n.includes("stud"))
        return "Earrings";
      if (n.includes("necklace") || n.includes("pendant") || n.includes("lariat") || n.includes("bean"))
        return "Necklace";
      if (n.includes("bracelet") || n.includes("cuff") || n.includes("bangle"))
        return "Bracelet";
      if (n.includes("ring")) return "Ring";
      return "Jewelry";
  }
}

const STORAGE_KEY = "resort-edit:portofino-tier";

export function readStoredTier(): TierSlug | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    return isTierSlug(v) ? v : null;
  } catch {
    return null;
  }
}

export function persistTier(tier: TierSlug) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, tier);
  } catch {
    /* no-op */
  }
}