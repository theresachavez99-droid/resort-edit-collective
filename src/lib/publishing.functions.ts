import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireAdmin } from "./admin-auth.server";
import { PORTOFINO_JOURNEY } from "./portofino-moment-fallbacks";

export type PublishingStatus = "empty" | "draft" | "review" | "live";

export type PublishingRow = {
  destination_slug: string;
  destination_name: string;
  moment_slug: string;
  moment_name: string;
  editorial_order: number;
  status: PublishingStatus;
  looks_count: number;
  approved_count: number;
  review_count: number;
  draft_count: number;
  banner_ok: boolean;
  last_updated: string | null;
  public_path: string;
  legacy_day_slug: string;
  look_slug: string;
};

function client() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

/**
 * Admin — publishing mission-control table.
 * Read-only aggregate of candidates per moment. Never mutates anything.
 */
export const listPublishingRows = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);

    let candidates: Array<{
      moment_slug: string | null;
      status: string;
      updated_at: string;
    }> = [];
    try {
      const supabase = client();
      const { data: rows } = await supabase
        .from("look_candidates")
        .select("moment_slug,status,updated_at")
        .eq("destination", "portofino");
      candidates = rows ?? [];
    } catch {
      candidates = [];
    }

    const rows: PublishingRow[] = PORTOFINO_JOURNEY.map((def) => {
      const mine = candidates.filter((c) => c.moment_slug === def.moment_slug);
      const approved = mine.filter((c) => c.status === "approved").length;
      const review = mine.filter(
        (c) => c.status === "review" || c.status === "pending",
      ).length;
      const draft = mine.filter(
        (c) =>
          c.status !== "approved" &&
          c.status !== "review" &&
          c.status !== "pending" &&
          c.status !== "rejected",
      ).length;
      const status: PublishingStatus =
        approved > 0
          ? "live"
          : review > 0
            ? "review"
            : draft > 0
              ? "draft"
              : "empty";
      const lastUpdated =
        mine
          .map((c) => c.updated_at)
          .filter(Boolean)
          .sort()
          .reverse()[0] ?? null;

      return {
        destination_slug: "portofino",
        destination_name: "Portofino",
        moment_slug: def.moment_slug,
        moment_name: def.moment_name,
        editorial_order: def.editorial_order,
        status,
        looks_count: mine.length,
        approved_count: approved,
        review_count: review,
        draft_count: draft,
        banner_ok: Boolean(def.hero_banner_image),
        last_updated: lastUpdated,
        public_path: `/portofino/${def.moment_slug}`,
        legacy_day_slug: def.legacy_day_slug,
        look_slug: def.look_slug,
      };
    }).sort((a, b) => a.editorial_order - b.editorial_order);

    return { ok: true as const, rows };
  });