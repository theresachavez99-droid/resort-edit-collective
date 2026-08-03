/**
 * Sitewide product audit — admin server functions.
 *
 * All password-gated. Generation and promotion policy lives in the audit engine;
 * this file only exposes it to the Studio and reads the audit log back.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

const pw = z.object({ password: z.string().min(1).max(200) });

const scopeSchema = pw.extend({
  destination: z.string().max(80).optional(),
  moment: z.string().max(80).optional(),
  lookKey: z.string().max(200).optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  autoGenerate: z.boolean().optional(),
});

/** Run the audit: sitewide by default, or scoped to a destination/moment/look. */
export const runSiteAudit = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => scopeSchema.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { runSiteProductAudit } = await import("./product-audit.server");
    return runSiteProductAudit({
      ...(data.destination ? { destination: data.destination } : {}),
      ...(data.moment ? { moment: data.moment } : {}),
      ...(data.lookKey ? { lookKey: data.lookKey } : {}),
      ...(data.limit ? { limit: data.limit } : {}),
      ...(data.autoGenerate !== undefined ? { autoGenerate: data.autoGenerate } : {}),
      triggeredBy: "admin",
    });
  });

/** Product index with every usage location — powers the dashboard tables. */
export const getProductIndex = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => scopeSchema.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { indexSiteProducts } = await import("./product-audit.server");
    const { rows, byUrl, unsourcedRegistrySlots } = await indexSiteProducts({
      ...(data.destination ? { destination: data.destination } : {}),
      ...(data.moment ? { moment: data.moment } : {}),
      ...(data.lookKey ? { lookKey: data.lookKey } : {}),
      ...(data.limit ? { limit: data.limit } : {}),
    });
    const counts: Record<string, number> = {};
    for (const r of rows) counts[r.status] = (counts[r.status] ?? 0) + 1;
    return {
      totals: { products: rows.length, uniqueUrls: byUrl.size, unsourced: unsourcedRegistrySlots.length },
      counts,
      unsourcedRegistrySlots,
      products: [...byUrl.entries()].map(([url, entry]) => ({
        url,
        brand: entry.row.brand,
        productName: entry.row.product_name,
        retailer: entry.row.retailer,
        status: entry.row.status,
        usages: entry.usages,
      })),
    };
  });

/** Recent audit runs with their stored reports. */
export const listAuditRuns = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) => pw.parse(i))
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: runs, error } = await supabaseAdmin
      .from("product_audit_runs")
      .select(
        "id,scope,destination,moment,look_key,triggered_by,urls_audited,unique_urls,counts,auto_promoted,awaiting_styling,report,started_at,finished_at",
      )
      .order("started_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return { runs: runs ?? [] };
  });

/** Audit log: every automated promotion, suppression and manual approval. */
export const listAuditEvents = createServerFn({ method: "POST" })
  .inputValidator((i: unknown) =>
    pw.extend({ lookKey: z.string().max(200).optional(), limit: z.number().int().min(1).max(200).optional() }).parse(i),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let q = supabaseAdmin
      .from("product_audit_events")
      .select("id,look_key,slot,event_type,actor,from_status,to_status,from_url,to_url,detail,created_at")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 100);
    if (data.lookKey) q = q.eq("look_key", data.lookKey);
    const { data: events, error } = await q;
    if (error) throw new Error(error.message);
    return { events: events ?? [] };
  });
