#!/usr/bin/env node
/**
 * Riviera Dinner audit (read-only).
 *
 * Scores the merged product library against the Riviera Dinner DNA with
 * weights tuned per the inventory-import brief:
 *   - +activity match  · +destination match  · +style-family match
 *   - +color-story match  · +editorial similarity (priorityScore)
 *   - -brand-popularity  · -inventory frequency (greedy brand cap ≤ 2)
 *
 * Bypasses the image-integrity gate so newly-imported products (no photos
 * yet) participate in the audit. Does NOT write or publish.
 */
import { register } from "node:module";
import { pathToFileURL } from "node:url";
register("ts-node/esm", pathToFileURL("./"));

const { PRODUCT_LIBRARY } = await import("../src/data/productLibrary.ts");
const { LOOK_DNA } = await import("../src/data/styleDNA.ts");
const { RIVIERA_DINNER_LIBRARY } = await import("../src/data/rivieraDinnerLibrary.ts");

const dna = LOOK_DNA["day-4/look-b"];
const PREFERRED_COLORS = new Set(["ivory","cream","blush","champagne","floral","warm_neutral"]);
const PENALTY_ACTIVITIES = new Set(["yacht_day","beach_club","pool_day","nightclub","city_cocktail"]);

const overlap = (a,b)=>{const s=new Set(a);let n=0;for(const x of b)if(s.has(x))n++;return n;};

function score(p){
  if(!p.destinations.includes(dna.destination)) return null;
  // hard exclude
  if(overlap(p.activityTags, dna.excludeActivities) > 0) return null;
  const styleM = overlap(p.styleFamilies, dna.styleFamilies);
  const actM   = overlap(p.activityTags, dna.activityTags);
  const colorM = overlap(p.colorStory ?? [], PREFERRED_COLORS);
  const destM  = 1; // gated above
  const editorial = (p.priorityScore ?? 75) / 100; // 0..1
  const penalty = overlap(p.activityTags, PENALTY_ACTIVITIES) * 1.5;
  const affiliateBoost = p.channel === "affiliate" ? 0.4 : 0;
  // Re-weighted per brief: activity 4.5, style 3.5, color 3.0, dest 1.0,
  // editorial 2.5; brand-tier nudge small (discovery +0.2).
  const discovery = p.brandTier === "discovery" ? 0.2 : 0;
  const total = actM*4.5 + styleM*3.5 + colorM*3.0 + destM*1.0 + editorial*2.5 + affiliateBoost + discovery - penalty;
  return { p, total, styleM, actM, colorM, destM };
}

const scored = PRODUCT_LIBRARY.map(score).filter(Boolean).sort((a,b)=>b.total-a.total);

// Brand cap ≤ 2 per brand for the top-N selection
const brandCount = new Map();
const top = [];
for (const s of scored) {
  if (top.length >= 20) break;
  const c = brandCount.get(s.p.brand) ?? 0;
  if (c >= 2) continue;
  brandCount.set(s.p.brand, c+1);
  top.push(s);
}

const beforeImport = PRODUCT_LIBRARY.length - RIVIERA_DINNER_LIBRARY.length;
console.log(`\n=== Riviera Dinner Audit ===`);
console.log(`Library before import: ${beforeImport}`);
console.log(`Library after  import: ${PRODUCT_LIBRARY.length}`);
console.log(`Imported: ${RIVIERA_DINNER_LIBRARY.length}`);
console.log(`Scored (above 0, after exclude): ${scored.filter(s=>s.total>0).length}\n`);

console.log(`Top 20 Riviera Dinner candidates (brand cap ≤ 2):`);
console.log(
  "rank | score  | brand                       | retailer            | aff | style | act | color | dest"
);
top.forEach((s,i)=>{
  const r = (n,w)=>String(n).padEnd(w).slice(0,w);
  console.log(
    `${String(i+1).padStart(3)}  | ${s.total.toFixed(2).padStart(5)} | ${r(s.p.brand,27)} | ${r(s.p.retailer,19)} | ${r(s.p.channel==="affiliate"?"Y":"N",3)} | ${r(s.styleM,5)} | ${r(s.actM,3)} | ${r(s.colorM,5)} | ${r(s.destM,4)}`
  );
});

const uniqueBrands = new Set(top.map(s=>s.p.brand));
console.log(`\nUnique brands in Top 20: ${uniqueBrands.size}`);
console.log(`Brand distribution:`, Object.fromEntries(brandCount));

// Rejected during import
const rejected = RIVIERA_DINNER_LIBRARY.filter(p =>
  p.channel !== "affiliate" || !p.href || p.styleFamilies.length === 0
);
console.log(`\nFlagged during import (brand-direct or needs validation): ${rejected.length}`);
rejected.forEach(p => console.log(`  - ${p.brand} · ${p.name} (${p.retailer})`));