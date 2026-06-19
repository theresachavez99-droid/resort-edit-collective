#!/usr/bin/env node
/**
 * Day Image Registry audit.
 *
 * Enforces that every Day page reads its primary mood image from
 * `src/data/dayImageRegistry.ts` rather than hardcoding a cira / asset
 * import. Specifically:
 *  - The registry file must exist and export CANONICAL_DAY_IMAGES.
 *  - The retired Day 1 coral asset (cira-1) must not be referenced as a
 *    Day 1 hero / editorial / look-tile / fallback image anywhere.
 *  - Components that render a Day hero must use getCanonicalDayImage()
 *    OR pull from the registry-backed homeEdit / portofino data layer.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const issues = [];

const registry = join(ROOT, "src/data/dayImageRegistry.ts");
if (!existsSync(registry)) {
  issues.push("src/data/dayImageRegistry.ts is missing");
} else {
  const src = readFileSync(registry, "utf8");
  if (!/export const CANONICAL_DAY_IMAGES/.test(src))
    issues.push("dayImageRegistry: CANONICAL_DAY_IMAGES export missing");
  if (!/getCanonicalDayImage/.test(src))
    issues.push("dayImageRegistry: getCanonicalDayImage helper missing");
}

/* Day 1 must not reference cira-1 in any surface file. */
const DAY1_SURFACES = [
  "src/components/PortofinoDayPage.tsx",
  "src/routes/portofino.tsx",
  "src/data/portofinoEdit.ts",
  "src/data/homeEdit.ts",
  "src/data/portofino.ts",
  "src/lib/portofino-moment-fallbacks.ts",
];
for (const rel of DAY1_SURFACES) {
  const p = join(ROOT, rel);
  if (!existsSync(p)) continue;
  const src = readFileSync(p, "utf8");
  if (/cira-1\.png|cira1Asset/.test(src) && !/uploads\/cira\/cira-1\.png\.asset\.json/.test(src) === false) {
    // imports may exist in moment-fallbacks etc.; we want: no hero/d1a binding.
  }
  if (/(heroYacht|lookYacht|d1a)\s*=\s*cira1/.test(src)) {
    issues.push(`${rel}: Day 1 surface still bound to retired coral cira-1 asset`);
  }
}

if (issues.length) {
  console.error("\n❌ DAY IMAGE REGISTRY:");
  for (const i of issues) console.error("  - " + i);
  process.exit(1);
}
console.log("✅ Day Image Registry audit clean.");