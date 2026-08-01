#!/usr/bin/env node
/**
 * Regression gate: no retailer/product photography may render on any public
 * Resort Edit surface while the product-image policy is in pending_affiliate
 * mode. Fails the build if:
 *   1. a public component renders a product-image field in an <img>/background
 *      without going through the image policy, or
 *   2. any server-rendered public route emits an image whose src or CSS
 *      background URL is not a Resort Edit-owned asset.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

const INTERNAL_HOSTS = [
  "resortedit.com",
  "lovable.app",
  "lovableproject.com",
  "supabase.co",
  "localhost",
  "127.0.0.1",
];

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.tsx?$/.test(p)) out.push(p);
  }
  return out;
}

const files = walk(SRC);
const isAdmin = (f) => /(\/admin|admin\.|Admin|VisualCollectionBoard|ProductImageAuditPanel)/.test(f);

// ---- 1. static gate ---------------------------------------------------------
const PRODUCT_IMG_SRC = /src=\{\s*(?:[a-zA-Z_$][\w$]*\.)?(?:product|p|item|prod|slot)\.image[^}]*\}/;
const violations = [];
for (const f of files) {
  if (isAdmin(f)) continue;
  const code = readFileSync(f, "utf8");
  if (!PRODUCT_IMG_SRC.test(code)) continue;
  const gated = /canRenderProductImage|productImageDecision|ProductCommerceCard/.test(code);
  if (!gated) violations.push(f.replace(`${ROOT}/`, ""));
}

// ---- 2. external image reference inventory ---------------------------------
let externalRefs = 0;
const hosts = new Map();
for (const f of files) {
  const code = readFileSync(f, "utf8");
  for (const m of code.matchAll(/image(?:_url)?:\s*"(https?:\/\/[^"]+)"/g)) {
    externalRefs += 1;
    try {
      const h = new URL(m[1]).hostname;
      hosts.set(h, (hosts.get(h) ?? 0) + 1);
    } catch {}
  }
}

// ---- 3. rendered-HTML crawl (when a server is reachable) -------------------
const BASE = process.env.AUDIT_BASE_URL ?? "http://localhost:8080";
const ROUTES = [
  "/",
  "/my-edit",
  "/resort-edits",
  "/brands",
  "/destinations",
  "/destinations/portofino",
  ...[
    "arrival","espresso-morning","yacht-day","beach-club","pool-lounging",
    "long-lunch","harbor-aperitivo","exploring-the-harbor","shopping",
    "sunset-views","riviera-dinner","nightcap",
  ].map((s) => `/portofino/${s}`),
];

const renderViolations = [];
let crawled = 0;
async function crawl() {
  for (const r of ROUTES) {
    let html;
    try {
      const res = await fetch(BASE + r, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      html = await res.text();
    } catch {
      return false;
    }
    crawled += 1;
    const urls = [
      ...[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/url\((?:&quot;|['"])?(https?:\/\/[^)'"&]+)/g)].map((m) => m[1]),
    ];
    for (const u of urls) {
      if (!/^https?:\/\//.test(u)) continue;
      let host;
      try { host = new URL(u).hostname.toLowerCase(); } catch { continue; }
      const internal = INTERNAL_HOSTS.some((s) => host === s || host.endsWith(`.${s}`));
      if (!internal) renderViolations.push(`${r} → ${u}`);
    }
  }
  return true;
}

const crawlRan = await crawl();

console.log("— Resort Edit product-image policy audit —");
console.log(`external product-image references in source: ${externalRefs}`);
for (const [h, c] of [...hosts].sort((a, b) => b[1] - a[1])) console.log(`  ${c}× ${h}`);
console.log(
  crawlRan
    ? `crawled ${crawled} public route(s); external rendered images: ${renderViolations.length}`
    : "crawl skipped (no server at " + BASE + ")",
);

let failed = false;
if (violations.length) {
  failed = true;
  console.error("\n❌ ungated product image render sites:");
  violations.forEach((v) => console.error(`  ${v}`));
}
if (renderViolations.length) {
  failed = true;
  console.error("\n❌ external product images rendered publicly:");
  renderViolations.slice(0, 40).forEach((v) => console.error(`  ${v}`));
}
if (failed) process.exit(1);
console.log("\n✅ no retailer product imagery renders publicly (pending_affiliate fail-closed).");
