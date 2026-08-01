#!/usr/bin/env bun
/**
 * Launch slot + URL audit gate (read-only).
 *
 *   bun run audit:slots
 *
 * Fails (exit 1) when any curated moment publishes a non-product URL
 * (search / category / homepage / placeholder). Missing slots and zero-link
 * pages are reported as warnings — they are editorial decisions, not code bugs.
 */
import { runLaunchAudit } from "@/lib/launch-audit";
import { SLOT_DISPLAY } from "@/lib/product-slots";

const audit = runLaunchAudit();
let hardFailures = 0;

for (const m of audit.moments) {
  const flag = m.badUrls.length > 0 ? "✗" : m.zeroLinkPage ? "!" : "✓";
  console.log(`\n${flag} ${m.name}  (/portofino/${m.slug}, ${m.momentType})`);
  console.log(`    product URLs: ${m.productUrls}`);
  console.log(`    filled:       ${m.filledSlots.map((s) => SLOT_DISPLAY[s]).join(", ") || "—"}`);
  if (m.intentionalOmissions.length)
    console.log(`    intentional:  ${m.intentionalOmissions.map((s) => SLOT_DISPLAY[s]).join(", ")}`);
  if (m.missingRequiredSlots.length)
    console.log(`    MISSING:      ${m.missingRequiredSlots.map((s) => SLOT_DISPLAY[s]).join(", ")}`);
  if (m.missingAdvisorySlots.length)
    console.log(`    advisory:     ${m.missingAdvisorySlots.map((s) => SLOT_DISPLAY[s]).join(", ")}`);
  if (m.forbiddenPresent.length)
    console.log(`    NOT ALLOWED:  ${m.forbiddenPresent.map((s) => SLOT_DISPLAY[s]).join(", ")}`);
  if (m.unmappedLabels.length)
    console.log(`    unmapped:     ${m.unmappedLabels.join(", ")}`);
  for (const b of m.badUrls) {
    hardFailures++;
    console.log(`    ✗ ${b.displayLabel || "?"} — ${b.urlKind} (${b.urlReason ?? ""}): ${b.url}`);
  }
}

const t = audit.totals;
console.log("\n=== Launch slot audit ===");
console.log(`  moments:                 ${t.moments}`);
console.log(`  exact product URLs:      ${t.productUrls}`);
console.log(`  non-product URLs:        ${t.badUrls}`);
console.log(`  zero-link pages:         ${t.zeroLinkPages}`);
console.log(`  moments missing slots:   ${t.momentsMissingRequired}`);

if (hardFailures > 0) {
  console.error(`\n❌ ${hardFailures} non-product URL(s) in curated data — publish blocked.`);
  process.exit(1);
}
console.log("\n✅ No non-product URLs in curated data.");
