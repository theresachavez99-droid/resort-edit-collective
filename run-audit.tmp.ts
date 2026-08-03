import { enumerateRegistryLooks, } from "@/lib/look-registry";
import { slotKey } from "@/lib/product-health";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { runSiteProductAudit } from "@/lib/product-audit.server";

const looks = enumerateRegistryLooks();
const { data: existingRows } = await supabaseAdmin.from("shop_slot_products").select("look_key,slot,is_primary");
const existing = new Set((existingRows ?? []).filter(r => r.is_primary).map(r => `${r.look_key}::${slotKey(r.slot)}`));
const inserts: any[] = [];
for (const look of looks) for (const s of look.slots) {
  const key = `${look.lookKey}::${slotKey(s.slot)}`;
  if (existing.has(key)) continue;
  existing.add(key);
  inserts.push({ destination: look.destination, moment: look.moment, look_key: look.lookKey, look_kind: look.lookKind,
    look_title: look.lookTitle, slot: slotKey(s.slot), slot_label: s.slotLabel, slot_order: s.order, brand: s.brand,
    product_name: s.productName, retailer: s.retailer, url: s.publishable ? s.url : null, price: s.price,
    status: s.publishable ? "active" : "needs_review", is_primary: true, replacement_priority: 0,
    registry_source: look.source, notes: `Imported from ${look.source}.` });
}
if (inserts.length) {
  for (let i = 0; i < inserts.length; i += 200) {
    const { error } = await supabaseAdmin.from("shop_slot_products").insert(inserts.slice(i, i + 200));
    if (error) throw new Error(error.message);
  }
}
console.log("looks", looks.length, "imported", inserts.length);
const report = await runSiteProductAudit({ autoGenerate: false, triggeredBy: "initial-audit", limit: 1000 });
console.log(JSON.stringify({
  urlsAudited: report.urlsAudited, uniqueUrls: report.uniqueUrls, counts: report.counts,
  autoPromoted: report.autoPromoted, inReview: report.inReview.length, inconclusive: report.inconclusiveDomains,
  routesAffected: report.routesAffected.slice(0, 12),
  failures: report.failures.map(f => ({ status: f.status, verdict: f.verdict, http: f.httpStatus, brand: f.brand, name: f.productName, url: f.url, at: f.usages.map(u => `${u.route}|${u.lookKey}|${u.slot}`) })),
}, null, 2));
