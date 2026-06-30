#!/usr/bin/env node
/**
 * Static security regression checks.
 *
 * Fails the build when any of the launch-blocking rules regress:
 *
 *  - Every `createServerFn` handler that imports `supabaseAdmin` against
 *    an internal-only table must call `requireAdmin` first. A small,
 *    auditable allowlist exists for public projection functions
 *    (currently `getFounderProducts`) — anything else is rejected.
 *    The internal table list explicitly includes `moments`, `moment_runs`,
 *    `founder_reference_products`, and `editorial_reference_library` so
 *    that Step 3's Moment Run workspace cannot regress the founder/
 *    reference gate by silently swapping handlers.
 *  - Product / source URL Zod schemas must use the http(s)-only refinement
 *    (`httpUrl` / `isHttpUrl`) rather than bare `z.string().url()` (which
 *    accepts `javascript:` etc.).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

/** Server fns that intentionally read internal tables with a safe public
 *  projection. Must be auditable: explicit list, not a pattern. */
const PUBLIC_PROJECTION_ALLOWLIST = new Set([
  "getFounderProducts",
]);

/** Internal tables whose rows must never be returned raw to public callers. */
const INTERNAL_TABLES = [
  "founder_reference_products",
  "brand_intelligence",
  "founder_uploaded_urls",
  "brand_review_queue",
  "products",
  "product_sources",
  "destination_muses",
  "vault_products",
  "editorial_reference_library",
  "sourced_products",
  "look_candidates",
  "look_candidate_slots",
  // Consolidation Order Step 2: Moment Definitions + Run artefacts.
  // `moments.brief` aggregates founder/editorial references; never raw-public.
  "moments",
  "moment_runs",
];

const issues = [];
function fail(msg) { issues.push(msg); }

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const fnFiles = files.filter((f) => f.endsWith(".functions.ts"));

/* 1. Founder/Reference gate (data-anchored, Step 2).
 *    Any handler that reads or writes founder_reference_products,
 *    editorial_reference_library, moments, or moment_runs via supabaseAdmin
 *    must call requireAdmin() — enforced by rule #2 below via the
 *    INTERNAL_TABLES list. Phrased against tables (not handler names) so
 *    Step 3's Run-workspace handler cannot silently orphan the gate. */

/* 2. Every supabaseAdmin handler against an internal table must call
 *    requireAdmin, unless it is an allowlisted public projection. */
for (const file of fnFiles) {
  const src = readFileSync(file, "utf8");
  if (!/supabaseAdmin/.test(src)) continue;

  const handlerRegex =
    /export const (\w+)\s*=\s*createServerFn[\s\S]*?\.handler\(\s*async\s*\(\{[^}]*\}\)\s*=>\s*\{([\s\S]*?)\n\s*\}\s*\)\s*;?/g;
  let m;
  while ((m = handlerRegex.exec(src))) {
    const [, name, body] = m;
    if (!/supabaseAdmin/.test(body)) continue;
    if (!INTERNAL_TABLES.some((t) => body.includes(`"${t}"`))) continue;
    if (PUBLIC_PROJECTION_ALLOWLIST.has(name)) continue;
    if (!/requireAdmin\s*\(/.test(body)) {
      fail(
        `${file.replace(ROOT, "")}: server fn '${name}' reads/writes an internal table via supabaseAdmin without requireAdmin()`,
      );
    }
  }
}

/* 3. No bare z.string().url() on product / source / image / href fields. */
for (const file of fnFiles) {
  const src = readFileSync(file, "utf8");
  const lines = src.split("\n");
  lines.forEach((line, i) => {
    if (!/z\.string\(\)\.url\(\)/.test(line)) return;
    if (/\.refine\(\s*isHttpUrl/.test(line)) return;
    if (!/(image_url|source_url|product_url|affiliate_url|backup_link|href|^\s*url\s*:)/i.test(line)) return;
    fail(
      `${file.replace(ROOT, "")}:${i + 1}: bare z.string().url() on a URL field — must be the httpUrl / isHttpUrl-refined schema`,
    );
  });
}

if (issues.length) {
  console.error("\n❌ SECURITY REGRESSION:");
  for (const i of issues) console.error("  - " + i);
  console.error(`\n${issues.length} issue(s).\n`);
  process.exit(1);
}
console.log("✅ Static security audit clean.");