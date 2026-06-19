#!/usr/bin/env node
/**
 * URL safety audit.
 *
 * Scans every product data file in src/data/ for href / source_url /
 * image_url string literals and fails the build when any of them is not a
 * plain http(s) URL. Blocks javascript:, data:, blob:, vbscript:, file:
 * and any other non-http(s) scheme from shipping in static product data.
 *
 * Pairs with the runtime sanitiser in src/lib/safe-url.ts.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = join(ROOT, "src/data");

const URL_FIELD_REGEX =
  /\b(href|source_url|product_url|image_url|affiliate_url|backup_link)\s*:\s*("([^"]*)"|'([^']*)')/g;

const issues = [];
function isSafe(value) {
  if (!value) return true; // empty handled elsewhere
  if (value.startsWith("#")) return true;
  if (value.startsWith("/")) return true; // local asset
  // Asset URLs from the CDN pointer system
  if (value.startsWith("/__l5e/")) return true;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    // Not an absolute URL — let other audits judge relative paths.
    return true;
  }
}

function* walk(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(name.name)) yield p;
  }
}

for (const file of walk(DATA)) {
  const src = readFileSync(file, "utf8");
  let m;
  while ((m = URL_FIELD_REGEX.exec(src))) {
    const value = m[3] ?? m[4] ?? "";
    if (!isSafe(value)) {
      const idx = src.slice(0, m.index).split("\n").length;
      issues.push(`${file.replace(ROOT, "")}:${idx}: unsafe URL scheme on ${m[1]} → ${value.slice(0, 80)}`);
    }
  }
}

if (issues.length) {
  console.error("\n❌ URL SAFETY:");
  for (const i of issues) console.error("  - " + i);
  process.exit(1);
}
console.log("✅ URL safety audit clean.");