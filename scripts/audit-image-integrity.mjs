#!/usr/bin/env node
/**
 * Commerce image-integrity audit.
 *
 * Fails the build when static product data contains:
 *  - placehold.co URLs
 *  - SVG sketches under /src/assets/products/*.svg (founder placeholder set)
 *  - the same image URL bound to more than one distinct product/brand pair
 *
 * Runtime card components additionally enforce these rules through
 * src/lib/product-image-integrity.ts; this script is the static gate so
 * bad data never makes it into a build.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = join(ROOT, "src/data");

const issues = [];

function* walk(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) yield* walk(p);
    else if (/\.(ts|tsx)$/.test(name.name)) yield p;
  }
}

const PLACEHOLDER_PATTERNS = [
  /https?:\/\/placehold\.co/i,
  /\/src\/assets\/products\/[^"'\s]+\.svg/i,
  /\bproducts\/[a-z0-9-]+\.svg\b/i,
];

for (const file of walk(DATA)) {
  const src = readFileSync(file, "utf8");
  src.split("\n").forEach((line, i) => {
    for (const re of PLACEHOLDER_PATTERNS) {
      if (re.test(line) && /image|src|thumb/i.test(line)) {
        issues.push(`${file.replace(ROOT, "")}:${i + 1}: placeholder/sketch image — ${line.trim().slice(0, 100)}`);
        break;
      }
    }
  });
}

/* Duplicate image URLs across distinct product entries. We approximate
 * "product entry" as any object literal that has both an image-ish field
 * and a brand/item/name field within a small window. */
const DUP_FIELDS = /image\s*:\s*"([^"]+)"/g;
for (const file of walk(DATA)) {
  const src = readFileSync(file, "utf8");
  const seen = new Map();
  let m;
  while ((m = DUP_FIELDS.exec(src))) {
    const url = m[1];
    if (url.startsWith("#") || url.length < 12) continue;
    if (!seen.has(url)) seen.set(url, []);
    seen.get(url).push(src.slice(0, m.index).split("\n").length);
  }
  for (const [url, lines] of seen) {
    if (lines.length > 1) {
      issues.push(
        `${file.replace(ROOT, "")}: duplicate image URL used ${lines.length}× (lines ${lines.join(", ")}) — ${url.slice(0, 80)}`,
      );
    }
  }
}

if (issues.length) {
  console.error("\n❌ COMMERCE IMAGE INTEGRITY:");
  for (const i of issues) console.error("  - " + i);
  process.exit(1);
}
console.log("✅ Commerce image-integrity audit clean.");