/**
 * Founder Hero targets per Portofino moment.
 *
 * Source of truth for the Founder Buying Office moment dropdown, the
 * collection roadmap, brief/look templates, planning board, collection
 * health, moment progress counts and "Suggested Next Hero" logic.
 *
 * Aligned with the public `/portofino` destination page — every moment
 * card shown publicly MUST have a target here.
 */
import { PORTOFINO_JOURNEY } from "./portofino-moment-fallbacks";

/** Targets — Founder Heroes across the canonical 12 Portofino moments. */
export const PORTOFINO_HERO_TARGETS: Record<string, number> = {
  "arrival": 3,
  "espresso-morning": 3,
  "exploring-the-harbor": 2,
  "yacht-day": 3,
  "beach-club": 2,
  "pool-lounging": 2,
  "shopping": 2,
  "long-lunch": 2,
  "harbor-aperitivo": 3,
  "sunset-views": 2,
  "riviera-dinner": 2,
  "nightcap": 2,
};

export const PORTOFINO_HERO_TARGET_TOTAL = Object.values(
  PORTOFINO_HERO_TARGETS,
).reduce((a, b) => a + b, 0);

/** Hard product cap; surfaces warning when violated. */
export const FOUNDER_HERO_HARD_CAP = 30;

export interface PortofinoMomentTarget {
  moment_slug: string;
  moment_name: string;
  editorial_order: number;
  hero_target: number;
}

/** Roadmap entries in editorial order, joined with hero targets. */
export function getPortofinoRoadmap(): PortofinoMomentTarget[] {
  return PORTOFINO_JOURNEY.map((m) => ({
    moment_slug: m.moment_slug,
    moment_name: m.moment_name,
    editorial_order: m.editorial_order,
    hero_target: PORTOFINO_HERO_TARGETS[m.moment_slug] ?? 2,
  }));
}

export interface RoadmapAlignmentWarning {
  kind:
    | "missing_in_roadmap"
    | "missing_on_public"
    | "over_hard_cap"
    | "legacy_moment_detected";
  moment_slug?: string;
  moment_name?: string;
  message: string;
}

/** Legacy combined-moment slugs/names that must not appear anywhere. */
export const LEGACY_PORTOFINO_MOMENT_SLUGS = [
  "beach-club-long-lunch",
  "pool-lounging-shopping",
] as const;
export const LEGACY_PORTOFINO_MOMENT_NAMES = [
  "Beach Club & Long Lunch",
  "Pool Lounging & Shopping",
] as const;

/** True when any haystack string contains a legacy combined-moment reference. */
export function detectLegacyMomentReferences(
  haystacks: Array<string | null | undefined>,
): string[] {
  const hits: string[] = [];
  for (const s of haystacks) {
    if (!s) continue;
    for (const slug of LEGACY_PORTOFINO_MOMENT_SLUGS) {
      if (s.includes(slug)) hits.push(slug);
    }
    for (const name of LEGACY_PORTOFINO_MOMENT_NAMES) {
      if (s.includes(name)) hits.push(name);
    }
  }
  return Array.from(new Set(hits));
}

/**
 * Validates that the Founder Buying Office roadmap and the public
 * destination page expose the same moments, and that the total target
 * respects the 20-hero hard cap.
 */
export function validatePortofinoRoadmap(): RoadmapAlignmentWarning[] {
  const warnings: RoadmapAlignmentWarning[] = [];
  const publicSlugs = new Set(PORTOFINO_JOURNEY.map((m) => m.moment_slug));
  const roadmapSlugs = new Set(Object.keys(PORTOFINO_HERO_TARGETS));

  for (const m of PORTOFINO_JOURNEY) {
    if (!roadmapSlugs.has(m.moment_slug)) {
      warnings.push({
        kind: "missing_in_roadmap",
        moment_slug: m.moment_slug,
        moment_name: m.moment_name,
        message:
          "Moment mismatch: public destination page and Founder Buying Office are not aligned.",
      });
    }
  }
  for (const slug of roadmapSlugs) {
    if (!publicSlugs.has(slug)) {
      warnings.push({
        kind: "missing_on_public",
        moment_slug: slug,
        message:
          "Moment mismatch: public destination page and Founder Buying Office are not aligned.",
      });
    }
  }
  if (PORTOFINO_HERO_TARGET_TOTAL > FOUNDER_HERO_HARD_CAP) {
    warnings.push({
      kind: "over_hard_cap",
      message: `Founder Hero target total is ${PORTOFINO_HERO_TARGET_TOTAL}, above the ${FOUNDER_HERO_HARD_CAP}-hero cap. Decide which moments get 2 versus 3.`,
    });
  }

  // Legacy combined moments must never re-enter the roadmap or public surfaces.
  const legacySlugs = new Set<string>(LEGACY_PORTOFINO_MOMENT_SLUGS);
  for (const slug of roadmapSlugs) {
    if (legacySlugs.has(slug)) {
      warnings.push({
        kind: "legacy_moment_detected",
        moment_slug: slug,
        message: `Legacy Portofino moment structure detected: ${slug}`,
      });
    }
  }
  for (const slug of publicSlugs) {
    if (legacySlugs.has(slug)) {
      warnings.push({
        kind: "legacy_moment_detected",
        moment_slug: slug,
        message: `Legacy Portofino moment structure detected: ${slug}`,
      });
    }
  }

  return warnings;
}