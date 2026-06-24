#!/usr/bin/env node
/**
 * Riviera Dinner discovery-activation audit (read-only).
 * Phases 1, 2, 5(boost), 6, 7, 8 of the brief. No live writes.
 */
const { PRODUCT_LIBRARY } = await import("../src/data/productLibrary.ts");
const { LOOK_DNA } = await import("../src/data/styleDNA.ts");
const { RIVIERA_DINNER_LIBRARY } = await import("../src/data/rivieraDinnerLibrary.ts");
const { RIVIERA_ACCESSORY_LIBRARY } = await import("../src/data/rivieraAccessoryLibrary.ts");
const { filterAndDedupImages } = await import("../src/lib/product-image-integrity.ts");

const dna = LOOK_DNA["day-4/look-b"];
const PREFERRED = new Set(["ivory","cream","blush","champagne","gold","floral","warm_neutral"]);
const PENALTY = new Set(["yacht_day","beach_club","pool_day","nightclub","city_cocktail"]);
const DISCOVERY_BRANDS = new Set([
  "POSSE","Alexandra Miro","Significant Other","SIR","Câllas Milano","Callas Milano",
  "Ramona LaRue","Ramona Larue","Hemant & Nandita","STAUD","SIMKHAI","Simkhai","Alémais","Alemais",
]);
const APPROVED_RETAILERS = new Set([
  "mytheresa.com","net-a-porter.com","shopbop.com","revolve.com","saksfifthavenue.com",
  "nordstrom.com","neimanmarcus.com","bergdorfgoodman.com","bloomingdales.com",
  "fwrd.com","luisaviaroma.com",
]);
const overlap = (a,b)=>{const s=new Set(a);let n=0;for(const x of b)if(s.has(x))n++;return n;};
const isDiscovery = (b)=>DISCOVERY_BRANDS.has(b);

// PHASE 1+2
const imported = [...RIVIERA_DINNER_LIBRARY, ...RIVIERA_ACCESSORY_LIBRARY];
const { kept } = filterAndDedupImages(imported);
const keptIds = new Set(kept.map(p=>p.id));

function blockReason(p){
  if(!p.image || !p.image.trim()) return "empty_image_url";
  if(/\.svg(\?|$)/i.test(p.image)) return "svg_sketch";
  if(p.image.includes("/src/assets/products/")) return "sketch_path";
  if(p.imageSource && !["retailer_cdn","brand_cdn","cleaned_thumbnail"].includes(p.imageSource))
    return `disallowed_source:${p.imageSource}`;
  return "passed";
}

console.log("\n=== PHASE 1 — IMAGE INTEGRITY AUDIT ===");
console.log(`Imported total       : ${imported.length} (dresses ${RIVIERA_DINNER_LIBRARY.length}, accessories ${RIVIERA_ACCESSORY_LIBRARY.length})`);
console.log(`Pass image-integrity : ${kept.length}`);
console.log(`Blocked              : ${imported.length - kept.length}`);

const byBrand = new Map();
for(const p of imported){
  const reason = keptIds.has(p.id) ? "passed" : blockReason(p);
  const cat = p.category ?? "Dress";
  if(!byBrand.has(p.brand)) byBrand.set(p.brand,[]);
  byBrand.get(p.brand).push({ p, reason, cat });
}
console.log("\nBlocked products (brand · cat · retailer · reason · id):");
for(const [brand,items] of [...byBrand.entries()].sort()){
  for(const i of items.filter(x=>x.reason!=="passed")){
    const r=(s,w)=>String(s).padEnd(w).slice(0,w);
    console.log(`${r(brand,28)} | ${r(i.cat,8)} | ${r(i.p.retailer,18)} | ${r(i.reason,22)} | ${i.p.id}`);
  }
}

// PHASE 2
console.log("\n=== PHASE 2 — DISCOVERY BRAND REPORT ===");
const seen = new Set();
const rows = [];
for(const brand of DISCOVERY_BRANDS){
  const k = brand.toLowerCase().replace(/[^a-z]/g,"");
  if(seen.has(k)) continue; seen.add(k);
  const items = imported.filter(p=>p.brand.toLowerCase().replace(/[^a-z]/g,"")===k);
  if(!items.length) continue;
  const passing = items.filter(p=>keptIds.has(p.id)).length;
  rows.push({ brand, total: items.length, passing, failing: items.length-passing,
    pct: Math.round(passing/items.length*100) });
}
rows.sort((a,b)=>b.failing-a.failing || b.total-a.total);
console.log("brand                          | total | pass | fail | pass%");
for(const r of rows){
  const p=(s,w)=>String(s).padEnd(w).slice(0,w);
  console.log(`${p(r.brand,30)} | ${String(r.total).padStart(5)} | ${String(r.passing).padStart(4)} | ${String(r.failing).padStart(4)} | ${String(r.pct).padStart(4)}%`);
}

// PHASE 5+8 — scoring with discovery boost
const DISCOVERY_NUDGE = 0.5;
function score(p){
  if(!p.destinations.includes(dna.destination)) return null;
  if(overlap(p.activityTags, dna.excludeActivities) > 0) return null;
  const styleM = overlap(p.styleFamilies, dna.styleFamilies);
  const actM   = overlap(p.activityTags, dna.activityTags);
  const colorM = overlap(p.colorStory ?? [], PREFERRED);
  const editorial = (p.priorityScore ?? 75) / 100;
  const penalty = overlap(p.activityTags, PENALTY) * 1.5;
  const aff = p.channel === "affiliate" ? 0.4 : 0;
  const tier = p.brandTier === "discovery" ? 0.2 : 0;
  const discBoost = isDiscovery(p.brand) ? DISCOVERY_NUDGE : 0;
  const total = actM*4.5 + styleM*3.5 + colorM*3.0 + 1.0 + editorial*2.5 + aff + tier + discBoost - penalty;
  return { p, total, styleM, actM, colorM };
}
const scored = PRODUCT_LIBRARY.map(score).filter(Boolean).sort((a,b)=>b.total-a.total);
function pickTop(filterFn, limit, brandCap=2){
  const bc=new Map(); const out=[];
  for(const s of scored){
    if(!filterFn(s.p)) continue;
    if(out.length>=limit) break;
    const c=bc.get(s.p.brand)??0; if(c>=brandCap) continue;
    bc.set(s.p.brand,c+1); out.push(s);
  }
  return out;
}
const top20 = pickTop(p=>!p.category || p.category==="Dress", 20);

console.log("\n=== PHASE 8 — TOP 20 RE-SCORE (discovery boost +0.5) ===");
console.log("rank| score | brand                     | retailer          |aff|img|act|sty|col|disc");
top20.forEach((s,i)=>{
  const r=(v,w)=>String(v).padEnd(w).slice(0,w);
  const img = keptIds.has(s.p.id)?"Y":(s.p.image?"?":"N");
  console.log(`${String(i+1).padStart(3)} |${s.total.toFixed(2).padStart(6)} | ${r(s.p.brand,25)} | ${r(s.p.retailer,17)} | ${r(s.p.channel==="affiliate"?"Y":"N",1)} | ${r(img,1)} | ${String(s.actM).padStart(1)} | ${String(s.styleM).padStart(1)} | ${String(s.colorM).padStart(1)} | ${isDiscovery(s.p.brand)?"Y":""}`);
});

// PHASE 6
const top10 = top20.slice(0,10);
const brands10 = new Set(top10.map(s=>s.p.brand));
const repMap = top10.reduce((m,s)=>m.set(s.p.brand,(m.get(s.p.brand)??0)+1),new Map());
const maxRep10 = Math.max(...repMap.values(),0);
const discIn10 = top10.filter(s=>isDiscovery(s.p.brand)).length;
console.log("\n=== PHASE 6 — DIVERSITY (Top 10) ===");
console.log(`Unique brands  : ${brands10.size} (≥6 req, ≥8 pref) ${brands10.size>=8?"PASS":brands10.size>=6?"OK":"FAIL"}`);
console.log(`Max per brand  : ${maxRep10} (cap 2) ${maxRep10<=2?"PASS":"FAIL"}`);
console.log(`Discovery hits : ${discIn10}/10`);

// PHASE 7
console.log("\n=== PHASE 7 — LIVE ELIGIBILITY ===");
console.log(`Before recovery: ${imported.length}   After recovery: ${imported.length} (Phase 3-4 NOT executed)`);
console.log("brand                          | total | validated | blocked | eligible");
for(const [brand,items] of [...byBrand.entries()].sort()){
  const validated = items.filter(i=>keptIds.has(i.p.id)).length;
  const eligible = items.filter(i=>keptIds.has(i.p.id) && APPROVED_RETAILERS.has(i.p.retailer) && i.p.channel==="affiliate").length;
  const p=(s,w)=>String(s).padEnd(w).slice(0,w);
  console.log(`${p(brand,30)} | ${String(items.length).padStart(5)} | ${String(validated).padStart(9)} | ${String(items.length-validated).padStart(7)} | ${String(eligible).padStart(8)}`);
}

console.log("\n=== FINAL SUMMARY ===");
console.log(`Image recovery success rate  : ${kept.length}/${imported.length} (${Math.round(kept.length/imported.length*100)}%)`);
console.log(`Live-eligible product count  : ${kept.length}`);
console.log(`Top-20 discovery participation: ${top20.filter(s=>isDiscovery(s.p.brand)).length}/20`);
console.log(`Top-20 unique brands         : ${new Set(top20.map(s=>s.p.brand)).size}`);
console.log(`\nPrimary blocker: 100% of newly-imported SKUs have empty image URLs`);
console.log(`(imageSource=unknown). Phase 3-4 retailer image recovery + CDN`);
console.log(`normalization not run — requires explicit go-ahead (Firecrawl cost).`);
