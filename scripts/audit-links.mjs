#!/usr/bin/env node
/**
 * Sitewide outbound-link audit.
 *
 * Scans every .ts/.tsx file under src/ for `<a ... href="...">` tags and
 * flags any link that points to an external/affiliate destination but is
 * missing `target="_blank"` or a `rel` containing both `noopener` and
 * `noreferrer`. Applies equally to plain text links and to anchors that
 * wrap product images/titles.
 *
 * Exits non-zero when violations are found so it can run in CI.
 *
 * Run locally:  node scripts/audit-links.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SRC = join(ROOT, "src");

// Hosts that count as "outbound affiliate" even when written as relative or
// templated values. Add new partners here as the network grows.
const AFFILIATE_HINTS = [
  "shopmy",
  "shopstyle",
  "rstyle",
  "ltk",
  "shareasale",
  "rakuten",
  "awin",
  "cj.com",
  "impact.com",
  "amzn.to",
  "amazon.",
  "booking.com",
  "viator.com",
  "expedia.",
  "agoda.",
  "hotels.com",
  "net-a-porter",
  "mytheresa",
  "matchesfashion",
  "ssense",
  "farfetch",
  "revolve",
];

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    if (name === "node_modules") continue;
    const full = join(dir, name);
    const s = statSync(full);
    if (s.isDirectory()) walk(full, out);
    else if (/\.(tsx?|jsx?)$/.test(name) && !name.endsWith(".gen.ts")) out.push(full);
  }
  return out;
}

// Greedy enough to capture multi-line <a ...> tags with attributes/children
// up to the opening tag's `>`. We only need attributes inside the tag.
const ANCHOR_RE = /<a\b([^>]*?)>/gms;

function getAttr(tag, name) {
  const re = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|\\{([^}]*)\\})`, "i");
  const m = tag.match(re);
  if (!m) return null;
  return m[1] ?? m[2] ?? m[3] ?? "";
}

function isExternalHref(href) {
  if (!href) return false;
  const trimmed = href.trim();
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^\/\//.test(trimmed)) return true;
  if (AFFILIATE_HINTS.some((h) => trimmed.toLowerCase().includes(h))) return true;
  // Dynamic affiliate hrefs frequently come from helpers/fields whose names
  // signal an outbound link. Flag those so reviewers can confirm.
  if (/affiliate|outbound|product[_-]?link|shop[_-]?link|booking[_-]?link|buy[_-]?url/i.test(trimmed))
    return true;
  return false;
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

const files = walk(SRC);
const violations = [];

for (const file of files) {
  const src = readFileSync(file, "utf8");
  for (const match of src.matchAll(ANCHOR_RE)) {
    const tag = match[0];
    const href = getAttr(tag, "href");
    if (href === null) continue;

    const looksExternal =
      isExternalHref(href) ||
      // dynamic href bound to a variable/expression that hints at outbound
      /^\{[^}]*(href|url|link|affiliate|product|book|buy|shop)/i.test(href);

    if (!looksExternal) continue;

    const target = getAttr(tag, "target") ?? "";
    const rel = (getAttr(tag, "rel") ?? "").toLowerCase();

    const problems = [];
    if (!/_blank/.test(target)) problems.push('target="_blank"');
    if (!/\bnoopener\b/.test(rel)) problems.push('rel "noopener"');
    if (!/\bnoreferrer\b/.test(rel)) problems.push('rel "noreferrer"');

    if (problems.length === 0) continue;

    violations.push({
      file: relative(ROOT, file),
      line: lineOf(src, match.index ?? 0),
      href,
      missing: problems,
    });
  }
}

const scanned = files.length;
if (violations.length === 0) {
  console.log(`✓ Link audit passed — scanned ${scanned} files, no outbound links missing target/rel.`);
  process.exit(0);
}

console.error(`✗ Link audit failed — ${violations.length} outbound link(s) missing required attributes:\n`);
for (const v of violations) {
  console.error(`  ${v.file}:${v.line}`);
  console.error(`    href: ${v.href}`);
  console.error(`    missing: ${v.missing.join(", ")}\n`);
}
console.error(
  `Every outbound affiliate link and every product image/title anchor must include\n` +
    `target="_blank" and rel="noopener noreferrer" (sponsored is optional but recommended for affiliates).`
);
process.exit(1);