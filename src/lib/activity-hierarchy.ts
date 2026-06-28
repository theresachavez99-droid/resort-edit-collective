/**
 * Editorial activity hierarchy.
 *
 * New destination moments should be able to inherit from adjacent resort
 * activities instead of requiring duplicate brand tagging for every label.
 */

export function normalizeActivity(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function uniqueActivities(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const label = value.trim();
    if (!label) continue;
    const key = normalizeActivity(label);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(label);
  }
  return out;
}

const DESTINATION_ACTIVITY_HIERARCHY: Record<string, string[]> = {
  "portofino|pool lounging and shopping": [
    "Pool Lounging",
    "Beach Club",
    "Resort Day",
    "Luxury Resort",
    "Yacht Day",
  ],
  "portofino|pool lounging": ["Beach Club", "Resort Day", "Luxury Resort", "Yacht Day"],
  "portofino|beach club": ["Pool Lounging", "Resort Day", "Luxury Resort", "Yacht Day"],
};

export function getCompatibleActivities(destination: string, activity: string): string[] {
  const requested = activity.trim();
  const key = `${normalizeActivity(destination)}|${normalizeActivity(activity)}`;
  const compatible = [requested, ...(DESTINATION_ACTIVITY_HIERARCHY[key] ?? [])];
  const a = normalizeActivity(activity);

  if (a.includes("pool") || a.includes("beach club")) {
    compatible.push("Pool Lounging", "Beach Club", "Resort Day", "Luxury Resort");
  }
  if (a.includes("yacht") || a.includes("boat") || a.includes("sail")) {
    compatible.push("Yacht Day", "Resort Day", "Luxury Resort");
  }
  if (a.includes("resort")) compatible.push("Resort Day", "Luxury Resort");

  return uniqueActivities(compatible);
}

function splitActivityDirective(value: string): { excluded: boolean; activity: string } {
  const trimmed = value.trim();
  const excluded = /^(?:!|not:|exclude:|excluded:)\s*/i.test(trimmed);
  return {
    excluded,
    activity: trimmed.replace(/^(?:!|not:|exclude:|excluded:)\s*/i, ""),
  };
}

export function activityMatchesHierarchy(args: {
  destination: string;
  requestedActivity: string;
  candidateActivities: string[] | null | undefined;
}): boolean {
  const candidateActivities = args.candidateActivities ?? [];
  if (candidateActivities.length === 0) return false;
  const compatible = new Set(
    getCompatibleActivities(args.destination, args.requestedActivity).map(normalizeActivity),
  );
  return candidateActivities.some((raw) => {
    const { excluded, activity } = splitActivityDirective(raw);
    if (excluded) return false;
    const normalized = normalizeActivity(activity);
    return compatible.has(normalized) || [...compatible].some((c) => c.includes(normalized) || normalized.includes(c));
  });
}

export function activityExplicitlyExcluded(args: {
  destination: string;
  requestedActivity: string;
  candidateActivities: string[] | null | undefined;
}): boolean {
  const candidateActivities = args.candidateActivities ?? [];
  const compatible = new Set(
    getCompatibleActivities(args.destination, args.requestedActivity).map(normalizeActivity),
  );
  return candidateActivities.some((raw) => {
    const { excluded, activity } = splitActivityDirective(raw);
    if (!excluded) return false;
    const normalized = normalizeActivity(activity);
    return compatible.has(normalized) || [...compatible].some((c) => c.includes(normalized) || normalized.includes(c));
  });
}

export function activityCompatibilityRank(args: {
  destination: string;
  requestedActivity: string;
  candidateActivities: string[] | null | undefined;
}): number {
  const candidateActivities = (args.candidateActivities ?? [])
    .map(splitActivityDirective)
    .filter((a) => !a.excluded)
    .map((a) => normalizeActivity(a.activity));
  if (candidateActivities.length === 0) return 90;

  const requested = normalizeActivity(args.requestedActivity);
  if (candidateActivities.includes(requested)) return 0;

  const compatible = getCompatibleActivities(args.destination, args.requestedActivity).map(normalizeActivity);
  for (let i = 1; i < compatible.length; i++) {
    const c = compatible[i];
    if (candidateActivities.some((a) => a === c || a.includes(c) || c.includes(a))) return i;
  }
  return 100;
}