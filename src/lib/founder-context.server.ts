/**
 * Founder Learning retrieval & scoring (server-only).
 *
 * Reads the founder-learning tables and exposes:
 *   - loadFounderContext(destination, activity) — references, approved
 *     brand records, uploaded URL history, and derived category mappings.
 *   - brandEligibility() — additive eligibility (static OR registry OR
 *     founder-approved OR founder-selective constrained to dest/activity).
 *   - evaluateFounderSignal() — per-candidate similarity boost + negative
 *     rule penalties, applied as a HIGH-weight scoring axis.
 *
 * Founder Learning is NOT a write-only silo. Every call into the Stylist
 * Engine should retrieve this context, surface diagnostics, and apply
 * the boost / penalty to candidate scores.
 *
 * Pure server module — only imported dynamically from `.functions.ts`
 * handlers via `await import("./founder-context.server")`.
 */

import {
  activityExplicitlyExcluded,
  activityMatchesHierarchy,
  getCompatibleActivities,
} from "./activity-hierarchy";

export type EligibilitySource =
  | "static"
  | "registry"
  | "compatible_activity"
  | "founder_hero"
  | "founder_approved"
  | "founder_selective"
  | "ineligible";

export type FounderRef = {
  id: string;
  brand: string;
  product_category: string | null;
  destination_tags: string[];
  activity_tags: string[];
  style_tags: string[];
  silhouette: string | null;
  print_language: string | null;
  color_story: string[];
  texture: string | null;
  founder_notes: string | null;
};

export type FounderBrandRecord = {
  brand: string;
  slug: string;
  status: string; // "approved" | "approved_selectively" | other
  suggested_destinations: string[];
  suggested_activities: string[];
  notes: string | null;
};

export type NegativeRule = {
  id: string;
  label: string;
  appliesToSlots?: string[];
  pattern: RegExp;
  penalty: number; // negative
};

/**
 * Editorial negatives — applied as scoring penalties in every generation.
 * Founder rejections expressed as structured tokens. Add new rules here
 * (or load from brand_intelligence.notes "avoid:..." prefix at runtime).
 */
export const FOUNDER_NEGATIVE_RULES: NegativeRule[] = [
  {
    id: "logo-heavy-bag",
    label: "avoid logo-heavy bag",
    appliesToSlots: ["bag"],
    pattern: /\b(monogram|logo[- ]?print|all[- ]?over[- ]?logo|gg ?canvas|lv monogram|gg supreme|jacquard logo)\b/i,
    penalty: -18,
  },
  {
    id: "generic-gold-drops",
    label: "avoid generic gold drops",
    appliesToSlots: ["jewelry"],
    pattern: /\b(basic|simple|everyday|essential)\b.*\b(drop|hoop|stud)\b/i,
    penalty: -10,
  },
  {
    id: "sporty-sunglasses",
    label: "avoid sporty sunglasses",
    appliesToSlots: ["sunglasses"],
    pattern: /\b(sport|wrap|shield|performance|cycling|running|visor)\b/i,
    penalty: -15,
  },
  {
    id: "scandi-minimal",
    label: "avoid minimalist Scandi styling for Portofino glamour",
    pattern: /\b(scandi|scandinavian|nordic|brutalist|utilitarian)\b/i,
    penalty: -8,
  },
  {
    id: "athleisure",
    label: "avoid athleisure",
    pattern: /\b(athleisure|gym|workout|jogger|tracksuit|sneaker)\b/i,
    penalty: -20,
  },
  {
    id: "fast-fashion-cues",
    label: "avoid fast-fashion cues",
    pattern: /\b(zara|shein|h&m|forever 21|fast fashion|cheap chic)\b/i,
    penalty: -25,
  },
];

export type FounderContext = {
  destination: string;
  activity: string;
  compatibleActivities: string[];
  references: FounderRef[];
  brandRecords: Map<string, FounderBrandRecord>;
  /** Categories observed in references per brand (normalized keys). */
  brandCategoriesFromRefs: Map<string, string[]>;
  uploadedUrlsCompleted: Array<{
    id: string;
    url: string;
    products_found: number;
    brands_found: number;
    harvested_at: string | null;
  }>;
  counts: {
    referencesTotal: number;
    referencesMatched: number;
    brandIntelligenceApproved: number;
    brandIntelligenceSelective: number;
    uploadedUrlsTotal: number;
    uploadedUrlsCompleted: number;
  };
  topBrands: Array<{ brand: string; refs: number }>;
  topReferences: Array<{
    id: string;
    brand: string;
    product_category: string | null;
    print_language: string | null;
    silhouette: string | null;
  }>;
};

export function normBrand(b: string): string {
  return b
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
}

/** Map a ref's product_category string into Brand-Registry category tokens. */
export function refCategoryToBrandCategories(cat: string | null): string[] {
  if (!cat) return [];
  const k = cat.toLowerCase();
  if (/swim|bikini|one[- ]?piece|maillot/.test(k)) return ["swimwear"];
  if (/bag|tote|clutch|basket/.test(k)) return ["bags"];
  if (/sandal|shoe|mule|espadrille|footwear/.test(k)) return ["shoes"];
  if (/sunglass|eyewear/.test(k)) return ["sunglasses"];
  if (/jewel|earring|necklace|bracelet|ring/.test(k)) return ["jewelry"];
  if (/hat|raffia|straw/.test(k)) return ["hats"];
  if (/coverup|cover[- ]?up|kaftan|caftan|sarong|pareo/.test(k)) return ["coverups"];
  if (/dress|gown/.test(k)) return ["dresses"];
  if (/skirt|top|pant|trouser|set/.test(k)) return ["separates"];
  return [];
}

export async function loadFounderContext(
  destination: string,
  activity: string,
): Promise<FounderContext> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const dKey = destination.toLowerCase();
  const aKey = activity.toLowerCase();
  const compatibleActivities = getCompatibleActivities(destination, activity);

  const [refsRes, biRes, uuRes] = await Promise.all([
    supabaseAdmin
      .from("founder_reference_products")
      .select(
        "id,brand,product_category,destination_tags,activity_tags,style_tags,silhouette,print_language,color_story,texture,founder_notes",
      )
      .eq("founder_approved", true)
      .limit(1000),
    supabaseAdmin
      .from("brand_intelligence")
      .select("brand,slug,status,suggested_destinations,suggested_activities,notes")
      .in("status", ["approved", "approved_selectively"]),
    supabaseAdmin
      .from("founder_uploaded_urls")
      .select("id,url,products_found,brands_found,harvested_at,harvest_status")
      .order("created_at", { ascending: false })
      .limit(200),
  ]);

  const allRefs = (refsRes.data ?? []) as FounderRef[];

  // Tag-scoped references — match by destination OR activity overlap.
  // If neither tag set has overlap, we still keep cross-context references
  // at lower weight (the engine will rely on print/color/silhouette tokens).
  const matched = allRefs.filter((r) => {
    const dt = (r.destination_tags ?? []).map((x) => x.toLowerCase());
    const at = (r.activity_tags ?? []).map((x) => x.toLowerCase());
    const dHit = dt.some((t) => t.includes(dKey) || dKey.includes(t));
    const aHit =
      at.some((t) => t.includes(aKey) || aKey.includes(t)) ||
      activityMatchesHierarchy({
        destination,
        requestedActivity: activity,
        candidateActivities: r.activity_tags,
      });
    return dHit || aHit || (dt.length === 0 && at.length === 0);
  });

  const brandRecords = new Map<string, FounderBrandRecord>();
  let biApproved = 0;
  let biSelective = 0;
  for (const row of (biRes.data ?? []) as FounderBrandRecord[]) {
    brandRecords.set(normBrand(row.brand), row);
    if (row.status === "approved") biApproved++;
    else if (row.status === "approved_selectively") biSelective++;
  }

  const uploaded = (uuRes.data ?? []) as Array<{
    id: string;
    url: string;
    products_found: number;
    brands_found: number;
    harvested_at: string | null;
    harvest_status: string;
  }>;
  const uploadedUrlsCompleted = uploaded
    .filter((u) => u.harvest_status === "completed")
    .map((u) => ({
      id: u.id,
      url: u.url,
      products_found: u.products_found,
      brands_found: u.brands_found,
      harvested_at: u.harvested_at,
    }));

  const brandCategoriesFromRefs = new Map<string, string[]>();
  for (const r of matched) {
    const cats = refCategoryToBrandCategories(r.product_category);
    if (!cats.length) continue;
    const k = normBrand(r.brand);
    const arr = brandCategoriesFromRefs.get(k) ?? [];
    for (const c of cats) if (!arr.includes(c)) arr.push(c);
    brandCategoriesFromRefs.set(k, arr);
  }

  const counts = new Map<string, number>();
  for (const r of matched) counts.set(r.brand, (counts.get(r.brand) ?? 0) + 1);
  const topBrands = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([brand, refs]) => ({ brand, refs }));

  const topReferences = matched.slice(0, 5).map((r) => ({
    id: r.id,
    brand: r.brand,
    product_category: r.product_category,
    print_language: r.print_language,
    silhouette: r.silhouette,
  }));

  return {
    destination,
    activity,
    compatibleActivities,
    references: matched,
    brandRecords,
    brandCategoriesFromRefs,
    uploadedUrlsCompleted,
    counts: {
      referencesTotal: allRefs.length,
      referencesMatched: matched.length,
      brandIntelligenceApproved: biApproved,
      brandIntelligenceSelective: biSelective,
      uploadedUrlsTotal: uploaded.length,
      uploadedUrlsCompleted: uploadedUrlsCompleted.length,
    },
    topBrands,
    topReferences,
  };
}

export function brandEligibility(args: {
  brand: string;
  staticEligible: boolean;
  inRegistry: boolean;
  heroBrand?: boolean;
  context: FounderContext;
}): { eligible: boolean; source: EligibilitySource } {
  if (args.heroBrand) return { eligible: true, source: "founder_hero" };
  if (args.inRegistry) return { eligible: true, source: "registry" };
  if (args.staticEligible) return { eligible: true, source: "static" };
  const rec = args.context.brandRecords.get(normBrand(args.brand));
  if (!rec) return { eligible: false, source: "ineligible" };
  if (rec.status === "approved") {
    if (
      activityExplicitlyExcluded({
        destination: args.context.destination,
        requestedActivity: args.context.activity,
        candidateActivities: rec.suggested_activities,
      })
    ) {
      return { eligible: false, source: "ineligible" };
    }
    return { eligible: true, source: "founder_approved" };
  }
  if (rec.status === "approved_selectively") {
    const dKey = args.context.destination.toLowerCase();
    const sd = (rec.suggested_destinations ?? []).map((s) => s.toLowerCase());
    const dOk = sd.length === 0 || sd.some((t) => t.includes(dKey) || dKey.includes(t));
    const aOk =
      rec.suggested_activities.length === 0 ||
      (!activityExplicitlyExcluded({
        destination: args.context.destination,
        requestedActivity: args.context.activity,
        candidateActivities: rec.suggested_activities,
      }) &&
        activityMatchesHierarchy({
          destination: args.context.destination,
          requestedActivity: args.context.activity,
          candidateActivities: rec.suggested_activities,
        }));
    return { eligible: dOk && aOk, source: "founder_selective" };
  }
  return { eligible: false, source: "ineligible" };
}

export type FounderSignal = {
  /** Positive similarity boost (0..30). */
  boost: number;
  /** Negative-rule penalty (≤ 0). */
  penalty: number;
  matchedRefIds: string[];
  reasons: string[];
  penaltiesApplied: Array<{ id: string; label: string; delta: number }>;
};

export function evaluateFounderSignal(args: {
  slot: string;
  brand: string;
  title: string | null;
  description: string | null;
  palette: string;
  silhouette: string;
  context: FounderContext;
}): FounderSignal {
  const { context } = args;
  const text = `${args.title ?? ""} ${args.description ?? ""}`.toLowerCase();
  const brandKey = normBrand(args.brand);
  let boost = 0;
  const reasons: string[] = [];
  const matchedRefIds: string[] = [];

  const rec = context.brandRecords.get(brandKey);
  if (rec?.status === "approved") {
    boost += 12;
    reasons.push("founder-approved brand");
  } else if (rec?.status === "approved_selectively") {
    boost += 6;
    reasons.push("founder selective brand");
  }

  for (const ref of context.references) {
    if (normBrand(ref.brand) !== brandKey) continue;
    boost += 5;
    matchedRefIds.push(ref.id);
    reasons.push(`brand-ref:${ref.id.slice(0, 6)}`);
    if (ref.print_language && text.includes(ref.print_language.toLowerCase())) {
      boost += 3;
      reasons.push(`print:${ref.print_language}`);
    }
    for (const c of ref.color_story) {
      if (c && args.palette.toLowerCase().includes(c.toLowerCase())) {
        boost += 2;
        reasons.push(`color:${c}`);
        break;
      }
    }
    if (
      ref.silhouette &&
      args.silhouette.toLowerCase().includes(ref.silhouette.toLowerCase())
    ) {
      boost += 2;
      reasons.push(`silhouette:${ref.silhouette}`);
    }
    if (ref.texture && text.includes(ref.texture.toLowerCase())) {
      boost += 2;
      reasons.push(`texture:${ref.texture}`);
    }
    if (matchedRefIds.length >= 4) break;
  }

  // Cross-brand print/material cues (small bonus once).
  let crossCueApplied = false;
  for (const ref of context.references) {
    if (normBrand(ref.brand) === brandKey) continue;
    if (ref.print_language && text.includes(ref.print_language.toLowerCase())) {
      boost += 1;
      reasons.push(`print-cue:${ref.print_language}`);
      crossCueApplied = true;
      break;
    }
  }
  void crossCueApplied;

  boost = Math.min(boost, 30);

  const penaltiesApplied: FounderSignal["penaltiesApplied"] = [];
  for (const rule of FOUNDER_NEGATIVE_RULES) {
    if (rule.appliesToSlots && !rule.appliesToSlots.includes(args.slot)) continue;
    if (rule.pattern.test(text)) {
      penaltiesApplied.push({ id: rule.id, label: rule.label, delta: rule.penalty });
    }
  }
  const penalty = penaltiesApplied.reduce((s, p) => s + p.delta, 0);

  return { boost, penalty, matchedRefIds, reasons, penaltiesApplied };
}