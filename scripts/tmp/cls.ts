import { classifyShopUrl } from "@/lib/shop-url-policy";
import { MOMENT_SHOP_CURATED } from "@/data/momentShopCurated";
import { MOMENT_EXTRA_EDITORIAL_CARDS, NIGHTCAP_EDITORIAL_CARDS } from "@/data/momentEditorialCards";
const bad: string[] = [];
for (const [m, rows] of Object.entries(MOMENT_SHOP_CURATED)) for (const r of rows) { const v = classifyShopUrl(r.url); if (!v.publishable) bad.push(`curated ${m} | ${r.slotLabel} | ${v.kind}: ${v.reason} | ${r.url}`); }
for (const [m, cards] of Object.entries(MOMENT_EXTRA_EDITORIAL_CARDS)) for (const c of cards) { for (const u of [c.reference.url, ...(c.shop?.products.map(p=>p.url) ?? [])]) { const v = classifyShopUrl(u); if (!v.publishable) bad.push(`extra ${m}/${c.key} | ${v.kind}: ${v.reason} | ${u}`);} }
for (const c of NIGHTCAP_EDITORIAL_CARDS) for (const u of [c.reference?.url, ...(c.shop?.products.map((p:any)=>p.url) ?? [])]) { if (!u) continue; const v = classifyShopUrl(u); if (!v.publishable) bad.push(`nightcap ${c.key} | ${v.kind}: ${v.reason} | ${u}`); }
console.log(bad.join("\n") || "none"); console.log("total flagged", bad.length);
