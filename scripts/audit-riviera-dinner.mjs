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
const { PRODUCT_LIBRARY } = await import("../src/data/productLibrary.ts");
const { LOOK_DNA } = await import("../src/data/styleDNA.ts");
const { RIVIERA_DINNER_LIBRARY } = await import("../src/data/rivieraDinnerLibrary.ts");
const { RIVIERA_ACCESSORY_LIBRARY } = await import("../src/data/rivieraAccessoryLibrary.ts");

const dna = LOOK_DNA["day-4/look-b"];
const PREFERRED_COLORS = new Set(["ivory","cream","blush","champagne","gold","floral","warm_neutral"]);
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

function pickTop(filterFn, limit, brandCap = 2) {
  const brandCount = new Map();
  const out = [];
  for (const s of scored) {
    if (!filterFn(s.p)) continue;
    if (out.length >= limit) break;
    const c = brandCount.get(s.p.brand) ?? 0;
    if (c >= brandCap) continue;
    brandCount.set(s.p.brand, c + 1);
    out.push(s);
  }
  return { out, brandCount };
}

// Dresses = everything that is NOT explicitly Shoes / Bag (covers the
// existing seeded dress products that have no category).
const isDress = (p) => !p.category || p.category === "Dress";
const isShoe  = (p) => p.category === "Shoes";
const isBag   = (p) => p.category === "Bag";

const dresses = pickTop(isDress, 20);
const shoes   = pickTop(isShoe, 10);
const bags    = pickTop(isBag, 10);

const beforeImport = PRODUCT_LIBRARY.length - RIVIERA_DINNER_LIBRARY.length;
const beforeAll = PRODUCT_LIBRARY.length - RIVIERA_DINNER_LIBRARY.length - RIVIERA_ACCESSORY_LIBRARY.length;
console.log(`\n=== Riviera Dinner Audit ===`);
console.log(`Library before all imports: ${beforeAll}`);
console.log(`Library after  all imports: ${PRODUCT_LIBRARY.length}`);
console.log(`Imported dresses     : ${RIVIERA_DINNER_LIBRARY.length}`);
console.log(`Imported accessories : ${RIVIERA_ACCESSORY_LIBRARY.length} (shoes ${RIVIERA_ACCESSORY_LIBRARY.filter(p=>p.category==="Shoes").length}, bags ${RIVIERA_ACCESSORY_LIBRARY.filter(p=>p.category==="Bag").length})`);
console.log(`Scored (above 0, after exclude): ${scored.filter(s=>s.total>0).length}`);

function render(label, picked, limit) {
  console.log(`\n${label} (top ${limit}, brand cap ≤ 2):`);
  console.log("rank | score  | brand                       | retailer            | aff | style | act | color");
  picked.out.forEach((s,i)=>{
    const r=(n,w)=>String(n).padEnd(w).slice(0,w);
    console.log(`${String(i+1).padStart(3)}  | ${s.total.toFixed(2).padStart(5)} | ${r(s.p.brand,27)} | ${r(s.p.retailer,19)} | ${r(s.p.channel==="affiliate"?"Y":"N",3)} | ${r(s.styleM,5)} | ${r(s.actM,3)} | ${r(s.colorM,5)}`);
  });
  console.log(`Unique brands: ${new Set(picked.out.map(s=>s.p.brand)).size}`);
}

render("Top 20 dresses", dresses, 20);
render("Top 10 shoes",  shoes,  10);
render("Top 10 bags",   bags,   10);

// Flagged records (brand-direct or needs affiliate validation)
const flagged = [...RIVIERA_DINNER_LIBRARY, ...RIVIERA_ACCESSORY_LIBRARY].filter(p =>
  p.channel !== "affiliate" || !p.href || p.styleFamilies.length === 0
);
console.log(`\nFlagged during import (brand-direct / needs affiliate validation): ${flagged.length}`);
flagged.forEach(p => console.log(`  - [${p.category ?? "Dress"}] ${p.brand} · ${p.name} (${p.retailer})`));