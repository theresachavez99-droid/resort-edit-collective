import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

/**
 * Aggregate counts for the Studio dashboard at /admin.
 * Admin-password gated; reads internal tables via supabaseAdmin.
 *
 * These counts intentionally track the pipeline that actually feeds the public
 * site: `founder_looks` (authored heroes) + `look_candidates` (Look Studio) +
 * open `inventory_health_events`. The `editorial_collection_*` tables are on
 * the deprecation path — nothing public reads them, so they are no longer
 * counted here.
 */
export const getAdminMetrics = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const countWhere = async (
      table:
        | "founder_looks"
        | "look_candidates"
        | "products"
        | "vault_products"
        | "inventory_health_events",
      col: string | null,
      val: string | null,
    ) => {
      let q = supabaseAdmin.from(table).select("*", { count: "exact", head: true });
      if (col && val) q = q.eq(col, val);
      const { count, error } = await q;
      if (error) return 0;
      return count ?? 0;
    };

    const countPublished = async (table: "founder_looks" | "look_candidates") => {
      const { count, error } = await supabaseAdmin
        .from(table)
        .select("*", { count: "exact", head: true })
        .not("published_at", "is", null);
      if (error) return 0;
      return count ?? 0;
    };

    const [
      looksDraft,
      looksAwaiting,
      looksApproved,
      looksPublished,
      candidatesTotal,
      candidatesPublished,
      productsApproved,
      vaultApproved,
      inventoryOpen,
    ] = await Promise.all([
      countWhere("founder_looks", "status", "draft"),
      countWhere("founder_looks", "status", "awaiting_review"),
      countWhere("founder_looks", "status", "approved"),
      countPublished("founder_looks"),
      countWhere("look_candidates", null, null),
      countPublished("look_candidates"),
      countWhere("products", "approval_status", "approved"),
      countWhere("vault_products", "approval_status", "approved"),
      countWhere("inventory_health_events", "outcome", "broken"),
    ]);

    return {
      ok: true as const,
      metrics: {
        looksDraft,
        looksAwaiting,
        looksApproved,
        looksPublished,
        candidatesTotal,
        candidatesPublished,
        productsLibrary: productsApproved + vaultApproved,
        inventoryIssues: inventoryOpen,
      },
    };
  });
