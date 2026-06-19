#!/usr/bin/env node
/**
 * Launch Readiness Audit — single command that runs every pre-deploy gate
 * in sequence and exits non-zero if any critical issue is found.
 *
 *   bun run audit:launch
 *
 * Gates (in order):
 *   1. Static security regression  (audit-security-static.mjs)
 *   2. URL safety                  (audit-url-safety.mjs)
 *   3. Commerce image integrity    (audit-image-integrity.mjs)
 *   4. Day Image Registry          (audit-day-images.mjs)
 *   5. Outbound link hygiene       (audit-links.mjs)
 *
 * Critical failures block deploy. Treat this command as the build gate;
 * wire it into the deploy pipeline as the last step before publish.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));

const GATES = [
  ["Static security regression", "audit-security-static.mjs"],
  ["URL safety", "audit-url-safety.mjs"],
  ["Commerce image integrity", "audit-image-integrity.mjs"],
  ["Day Image Registry", "audit-day-images.mjs"],
  ["Outbound link hygiene", "audit-links.mjs"],
];

const results = [];
for (const [label, file] of GATES) {
  console.log(`\n▶ ${label}`);
  const r = spawnSync(process.execPath, [join(here, file)], { stdio: "inherit" });
  results.push({ label, code: r.status ?? 1 });
}

console.log("\n=== Launch Readiness Summary ===");
let failed = 0;
for (const { label, code } of results) {
  const tag = code === 0 ? "PASS" : "FAIL";
  if (code !== 0) failed++;
  console.log(`  ${tag.padEnd(4)}  ${label}`);
}

if (failed > 0) {
  console.error(`\n❌ ${failed} gate(s) failed — deploy blocked.`);
  process.exit(1);
}
console.log("\n✅ All launch readiness gates passed.");