/**
 * Coordinated-set detection — Buying Office V2.
 *
 * Groups a batch of imported Founder URLs into one or more candidate
 * Hero Outfits. Two garments join the same outfit when they share:
 *   - same normalized brand, AND
 *   - same retailer domain, AND
 *   - at least one shared color OR fabric token
 *
 * Single URLs (dress, jumpsuit) become their own solo Hero Outfit
 * — keeps downstream code uniform.
 *
 * Founder control: this is a suggestion only. The Buying Office UI
 * exposes Group / Split / Add to / Remove from actions and persists
 * the Founder's final grouping. Detection runs once at import time.
 */

export type GarmentLike = {
  id: string;
  brand: string | null;
  retailer: string | null;
  product_name: string | null;
  color: string | null;
  description: string | null;
  category: string | null;
};

function norm(s: string | null | undefined): string {
  return (s ?? "").toLowerCase().trim();
}

const FABRIC_TOKENS = [
  "linen", "cotton", "silk", "satin", "crochet", "knit", "raffia",
  "terry", "poplin", "jersey", "cashmere", "wool", "velvet", "lace",
];

const COLOR_TOKENS = [
  "natural", "ivory", "cream", "white", "ecru", "bone", "sand",
  "black", "navy", "blue", "indigo", "denim",
  "red", "burgundy", "wine", "coral", "pink", "rose",
  "green", "olive", "sage", "emerald", "mint",
  "yellow", "butter", "gold", "beige", "tan", "brown", "chocolate",
  "lemon", "lime", "orange", "lilac", "lavender", "purple",
];

function tokensFrom(g: GarmentLike): { fabric: Set<string>; color: Set<string> } {
  const haystack = [g.product_name, g.description, g.color, g.category]
    .map(norm)
    .join(" ");
  const fabric = new Set<string>();
  const color = new Set<string>();
  for (const t of FABRIC_TOKENS) if (haystack.includes(t)) fabric.add(t);
  for (const t of COLOR_TOKENS) if (haystack.includes(t)) color.add(t);
  return { fabric, color };
}

function shareAny<T>(a: Set<T>, b: Set<T>): boolean {
  for (const v of a) if (b.has(v)) return true;
  return false;
}

export type DetectedOutfit = {
  garmentIds: string[];
  primaryBrand: string | null;
  retailers: string[];
  sharedColors: string[];
  sharedFabric: string[];
};

/**
 * Group an unordered list of garments into one or more outfit clusters.
 * Stable: garment input order is preserved within each cluster.
 */
export function detectCoordinatedOutfits(garments: GarmentLike[]): DetectedOutfit[] {
  const enriched = garments.map((g) => ({ g, ...tokensFrom(g) }));
  // Build a parent map via simple union-find.
  const parent = new Map<string, string>();
  enriched.forEach((e) => parent.set(e.g.id, e.g.id));
  const find = (x: string): string => {
    let p = parent.get(x)!;
    while (p !== parent.get(p)!) p = parent.get(p)!;
    parent.set(x, p);
    return p;
  };
  const union = (a: string, b: string) => {
    const ra = find(a), rb = find(b);
    if (ra !== rb) parent.set(ra, rb);
  };

  for (let i = 0; i < enriched.length; i++) {
    for (let j = i + 1; j < enriched.length; j++) {
      const A = enriched[i], B = enriched[j];
      const sameBrand = norm(A.g.brand) && norm(A.g.brand) === norm(B.g.brand);
      const sameRetailer = norm(A.g.retailer) && norm(A.g.retailer) === norm(B.g.retailer);
      if (!sameBrand || !sameRetailer) continue;
      if (shareAny(A.color, B.color) || shareAny(A.fabric, B.fabric)) {
        union(A.g.id, B.g.id);
      }
    }
  }

  const clusters = new Map<string, DetectedOutfit>();
  for (const e of enriched) {
    const root = find(e.g.id);
    let cluster = clusters.get(root);
    if (!cluster) {
      cluster = {
        garmentIds: [],
        primaryBrand: e.g.brand ?? null,
        retailers: [],
        sharedColors: [],
        sharedFabric: [],
      };
      clusters.set(root, cluster);
    }
    cluster.garmentIds.push(e.g.id);
    if (e.g.retailer && !cluster.retailers.includes(e.g.retailer)) {
      cluster.retailers.push(e.g.retailer);
    }
  }

  // Hydrate shared tokens per cluster (intersect across members).
  for (const cluster of clusters.values()) {
    const members = enriched.filter((e) => cluster.garmentIds.includes(e.g.id));
    if (members.length === 0) continue;
    const intersectColor = new Set(members[0].color);
    const intersectFabric = new Set(members[0].fabric);
    for (let i = 1; i < members.length; i++) {
      for (const c of Array.from(intersectColor))
        if (!members[i].color.has(c)) intersectColor.delete(c);
      for (const f of Array.from(intersectFabric))
        if (!members[i].fabric.has(f)) intersectFabric.delete(f);
    }
    cluster.sharedColors = Array.from(intersectColor);
    cluster.sharedFabric = Array.from(intersectFabric);
  }

  return Array.from(clusters.values());
}