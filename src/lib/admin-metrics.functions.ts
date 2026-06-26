import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "./admin-auth.server";

/**
 * Aggregate counts for the founder dashboard at /admin.
 * Admin-password gated; reads internal tables via supabaseAdmin.
 */
export const getAdminMetrics = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const countWhere = async (
      table: "editorial_collection_looks" | "editorial_review_queue" | "vault_products" | "inventory_health_events",
      col: string | null,
      val: string | null,
    ) => {
      let q = supabaseAdmin.from(table).select("*", { count: "exact", head: true });
      if (col && val) q = q.eq(col, val);
      const { count, error } = await q;
      if (error) return 0;
      return count ?? 0;
    };

    const [
      looksDraft,
      looksAwaiting,
      looksApproved,
      looksPublished,
      productsLibrary,
      reviewOpen,
      inventoryOpen,
    ] = await Promise.all([
      countWhere("editorial_collection_looks", "status", "draft"),
      countWhere("editorial_collection_looks", "status", "awaiting_review"),
      countWhere("editorial_collection_looks", "status", "approved"),
      countWhere("editorial_collection_looks", "status", "published"),
      countWhere("vault_products", "approval_status", "approved"),
      countWhere("editorial_review_queue", "status", "open"),
      countWhere("inventory_health_events", "outcome", "broken"),
    ]);

    return {
      ok: true as const,
      metrics: {
        looksDraft,
        looksAwaiting,
        looksApproved,
        looksPublished,
        productsLibrary,
        reviewOpen,
        inventoryIssues: inventoryOpen,
      },
    };
  });
