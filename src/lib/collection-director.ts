/**
 * Stylist Engine v4.5 — Editorial Collection Director.
 *
 * Before discovery runs, the Director writes a six-page editorial plan.
 * Each LookPlan carries a distinct rhythm role, mood, color direction,
 * silhouette, personality, and an assigned swim archetype. The Director
 * also nominates a hero look up front; post-assembly diagnostics may
 * reassign the hero crown based on measured editorial strength.
 *
 * Pure data + helpers. No I/O.
 */

import { SWIM_ARCHETYPES, type SwimArchetypeId } from "./swim-archetypes";

export type RhythmRole =
  | "statement_arrival"
  | "relaxed_sophistication"
  | "print_moment"
  | "modern_architectural"
  | "classic_riviera_glamour"
  | "quiet_luxury_finish";

export const RHYTHM_SEQUENCE: RhythmRole[] = [
  "statement_arrival",
  "relaxed_sophistication",
  "print_moment",
  "modern_architectural",
  "classic_riviera_glamour",
  "quiet_luxury_finish",
];

export const RHYTHM_LABELS: Record<RhythmRole, string> = {
  statement_arrival: "Statement Arrival",
  relaxed_sophistication: "Relaxed Sophistication",
  print_moment: "Print Moment",
  modern_architectural: "Modern Architectural",
  classic_riviera_glamour: "Classic Riviera Glamour",
  quiet_luxury_finish: "Quiet Luxury Finish",
};

export const RHYTHM_DESCRIPTIONS: Record<RhythmRole, string> = {
  statement_arrival:
    "She steps off the tender — the look that opens the day with confident editorial impact.",
  relaxed_sophistication:
    "Late-morning ease on deck — fluid, undone, expensive without trying.",
  print_moment:
    "The destination print piece that pulls the entire collection toward Portofino.",
  modern_architectural:
    "Sculptural cut, restrained palette, the look a modern Riviera editor would shoot.",
  classic_riviera_glamour:
    "Vintage Aarons composure — golden hour, gold jewelry, eternal Italian glamour.",
  quiet_luxury_finish:
    "The close — neutral, considered, the kind of luxury you only notice up close.",
};

/** Map each rhythm role to its strongest archetype matches (ordered). */
const ROLE_ARCHETYPES: Record<RhythmRole, SwimArchetypeId[]> = {
  statement_arrival: ["hardware_statement", "asymmetric_statement", "sculptural_modern"],
  relaxed_sophistication: ["high_neck", "architectural_minimal", "crochet_texture"],
  print_moment: ["mediterranean_print", "crochet_texture", "retro_riviera"],
  modern_architectural: ["architectural_minimal", "modern_cutout", "sculptural_modern"],
  classic_riviera_glamour: ["retro_riviera", "hardware_statement", "high_neck"],
  quiet_luxury_finish: ["architectural_minimal", "high_neck", "modern_cutout"],
};

const ROLE_COLOR_DIRECTION: Record<RhythmRole, string[]> = {
  statement_arrival: ["ivory", "cream", "polished gold"],
  relaxed_sophistication: ["sand", "natural raffia", "soft white"],
  print_moment: ["majolica blue", "ivory", "coral"],
  modern_architectural: ["black", "ivory", "navy"],
  classic_riviera_glamour: ["cream", "antique gold", "tortoise warm"],
  quiet_luxury_finish: ["bone", "stone", "pale gold"],
};

const ROLE_SILHOUETTE: Record<RhythmRole, string> = {
  statement_arrival: "Sculpted swim with crisp linen layer — strong vertical line",
  relaxed_sophistication: "Soft kaftan over fluid swim — undone draping",
  print_moment: "Printed swim + neutral cover — let the pattern speak",
  modern_architectural: "Clean one-piece + minimal layer — geometric proportion",
  classic_riviera_glamour: "Retro balconette / square neck + silk wrap — vintage line",
  quiet_luxury_finish: "Tonal swim + tonal layer — monochrome restraint",
};

const ROLE_PERSONALITY: Record<RhythmRole, string> = {
  statement_arrival: "She arrives. The harbor notices.",
  relaxed_sophistication: "Second espresso, no rush — composure.",
  print_moment: "The piece her friends will text her about.",
  modern_architectural: "Quiet confidence — modernist eye.",
  classic_riviera_glamour: "Old-money composure with present-day cut.",
  quiet_luxury_finish: "The final look — bone, stone, fine gold.",
};

export type LookPlan = {
  index: number;
  role: RhythmRole;
  roleLabel: string;
  archetype: SwimArchetypeId;
  mood: string;
  personality: string;
  colorDirection: string[];
  silhouette: string;
  isHero: boolean;
};

/**
 * Build a six-page editorial plan. Deterministic for a given seed so
 * dry-runs are reproducible. The plan precedes discovery and tells the
 * engine WHAT to look for, slot by slot.
 */
export function planEditorialCollection(
  count: number,
  seed: string,
): LookPlan[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const offset = Math.abs(h) % RHYTHM_SEQUENCE.length;
  const usedArchetypes = new Set<SwimArchetypeId>();
  const plans: LookPlan[] = [];
  for (let i = 0; i < count; i++) {
    const role = RHYTHM_SEQUENCE[(offset + i) % RHYTHM_SEQUENCE.length];
    // Pick the first preferred archetype for this role that hasn't been
    // used yet; fall back to any unused archetype, then to the first
    // preferred (rare — only when count exceeds the catalog).
    const preferred = ROLE_ARCHETYPES[role];
    let chosen = preferred.find((a) => !usedArchetypes.has(a));
    if (!chosen) {
      chosen = SWIM_ARCHETYPES.map((a) => a.id).find((a) => !usedArchetypes.has(a));
    }
    if (!chosen) chosen = preferred[0];
    usedArchetypes.add(chosen);
    plans.push({
      index: i,
      role,
      roleLabel: RHYTHM_LABELS[role],
      archetype: chosen,
      mood: RHYTHM_DESCRIPTIONS[role],
      personality: ROLE_PERSONALITY[role],
      colorDirection: ROLE_COLOR_DIRECTION[role],
      silhouette: ROLE_SILHOUETTE[role],
      // Statement Arrival is the planned hero; diagnostics may reassign.
      isHero: role === "statement_arrival",
    });
  }
  // Guarantee exactly one hero (in case Statement Arrival wasn't in the
  // first `count` slots when count < 6).
  if (!plans.some((p) => p.isHero) && plans.length > 0) plans[0].isHero = true;
  return plans;
}

/** Brand rotation curve — soft penalties (in editorial-score units). */
export const BRAND_ROTATION_CURVE = [0, 0.05, 0.15, 0.4, 0.7];
export function rotationPenalty(priorUseCount: number): number {
  if (priorUseCount <= 0) return 0;
  const idx = Math.min(priorUseCount, BRAND_ROTATION_CURVE.length - 1);
  return BRAND_ROTATION_CURVE[idx];
}

/** Score-gap threshold below which rotation re-ranks may swap candidate order. */
export const ROTATION_TIE_THRESHOLD = 0.3;
