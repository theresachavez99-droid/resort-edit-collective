#!/usr/bin/env bun
/**
 * Launch slot + URL audit gate (read-only).
 *
 *   bun run audit:slots
 *
 * HARD FAILURES (exit 1):
 *   1. Any curated moment publishing a non-product URL (search / category /
 *      homepage / placeholder).
 *   2. Any forbidden slot present for the moment type (e.g. sunglasses on an
 *      evening moment; rings are excluded upstream and never counted).
 *   3. Misleading commerce CTA wiring: the moment route must gate its hero
 *      shop CTA through `@/lib/commerce-cta-policy` so pages with zero
 *      verified product links never render a "Shop The Look"-style CTA.
 *
 * Missing slots and zero-link pages remain WARNINGS — they are editorial
 * decisions, and must never be "fixed" with invented placeholder products.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { runLaunchAudit } from "@/lib/launch-audit";
import { SLOT_DISPLAY } from "@/lib/product-slots";
import { shopCtaAllowed } from "@/lib/commerce-cta-policy";

const here = dirname(fileURLToPath(import.meta.url));
const audit = runLaunchAudit();
let hardFailures = 0;
let forbiddenCount = 0;

for (const m of audit.moments) {
  const flag =
    m.badUrls.length > 0 || m.forbiddenPresent.length > 0 ? "✗" : m.zeroLinkPage ? "!" : "✓";
  console.log(`\n${flag} ${m.name}  (/portofino/${m.slug}, ${m.momentType})`);
  console.log(`    product URLs: ${m.productUrls}`);
  console.log(`    filled:       ${m.filledSlots.map((s) => SLOT_DISPLAY[s]).join(", ") || "—"}`);
  if (m.intentionalOmissions.length)
    console.log(
      `    intentional:  ${m.intentionalOmissions.map((s) => SLOT_DISPLAY[s]).join(", ")}`,
    );
  if (m.missingRequiredSlots.length)
    console.log(
      `    MISSING:      ${m.missingRequiredSlots.map((s) => SLOT_DISPLAY[s]).join(", ")} (warning — editorial decision)`,
    );
  if (m.missingAdvisorySlots.length)
    console.log(
      `    advisory:     ${m.missingAdvisorySlots.map((s) => SLOT_DISPLAY[s]).join(", ")}`,
    );
  if (m.forbiddenPresent.length) {
    forbiddenCount += m.forbiddenPresent.length;
    hardFailures += m.forbiddenPresent.length;
    console.log(
      `    ✗ FORBIDDEN (${m.momentType}): ${m.forbiddenPresent.map((s) => SLOT_DISPLAY[s]).join(", ")}`,
    );
  }
  if (m.unmappedLabels.length) console.log(`    unmapped:     ${m.unmappedLabels.join(", ")}`);
  if (m.zeroLinkPage)
    console.log(`    note:         zero-link page — commerce CTAs are suppressed at runtime`);
  for (const b of m.badUrls) {
    hardFailures++;
    console.log(`    ✗ ${b.displayLabel || "?"} — ${b.urlKind} (${b.urlReason ?? ""}): ${b.url}`);
  }
}

// ── Honest commerce CTA gate ─────────────────────────────────────
// Zero-link pages must never render a shoppable-set CTA. The runtime gate is
// data-driven (DB rows → `shopCtaAllowed`), so CI verifies (a) the policy
// itself and (b) that the moment route actually renders through the policy.
const routeSrc = readFileSync(join(here, "..", "src", "routes", "portofino.$moment.tsx"), "utf8");
const ctaChecks: Array<[string, boolean]> = [
  ["policy suppresses CTA at zero verified links", shopCtaAllowed(0) === false],
  ["policy allows CTA with verified links", shopCtaAllowed(1) === true],
  ["moment route imports commerce-cta-policy", routeSrc.includes("@/lib/commerce-cta-policy")],
  ["moment route computes the gate via shopCtaAllowed(…)", routeSrc.includes("shopCtaAllowed(")],
  ["cinematic hero receives the showShopCta gate", /showShopCta=\{/.test(routeSrc)],
  ["hero shop CTA renders only behind the gate", /\{showShopCta && \(/.test(routeSrc)],
];
console.log("\n=== Honest commerce CTA gate ===");
for (const [label, ok] of ctaChecks) {
  if (!ok) hardFailures++;
  console.log(`  ${ok ? "✓" : "✗"} ${label}`);
}

const t = audit.totals;
console.log("\n=== Launch slot audit ===");
console.log(`  moments:                 ${t.moments}`);
console.log(`  exact product URLs:      ${t.productUrls}`);
console.log(`  non-product URLs:        ${t.badUrls}`);
console.log(`  forbidden slots:         ${forbiddenCount}`);
console.log(`  zero-link pages:         ${t.zeroLinkPages} (warnings — CTA suppressed at runtime)`);
console.log(
  `  moments missing slots:   ${t.momentsMissingRequired} (warnings — never auto-filled)`,
);

if (hardFailures > 0) {
  console.error(`\n❌ ${hardFailures} hard failure(s) — publish blocked.`);
  process.exit(1);
}
console.log("\n✅ No non-product URLs, forbidden slots, or ungated commerce CTAs.");
