import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database, Json } from "@/integrations/supabase/types";
import {
  PORTOFINO_MOMENT_DEFS,
  PORTOFINO_MOMENT_SLUGS,
  PORTOFINO_JOURNEY,
  getPortofinoMomentDef,
  type PortofinoMomentDef,
} from "./portofino-moment-fallbacks";
import { requireAdmin } from "./admin-auth.server";

/**
 * Public reads for the rebuilt /portofino editorial index and
 * /portofino/$moment pages. Sourcing is hybrid:
 *
 *   1. tagged   — a `look_candidates` row with matching moment_slug + status='approved'
 *   2. fallback — the legacy day's hero look (defined in portofino-moment-fallbacks.ts)
 *
 * Every moment ALWAYS resolves, so no card on /portofino is ever empty.
 */

type CandidateRow = {
  id: string;
  slug: string | null;
  moment_slug: string | null;
  lookboard_image_url: string | null;
  why_it_works: string | null;
  best_for: string[];
  composite_score: number | null;
  brief: Json;
  whats_in_her_bag: Json;
};

export type ResolvedMomentLook = {
  source: "founder_look" | "tagged" | "fallback";
  /** Display title for the look. */
  title: string;
  /** Hero image to render. */
  image: string;
  /** Optional editorial copy (only present when tagged). */
  why_it_works?: string;
  /** Optional "best for" tags (tagged only). */
  best_for?: string[];
  /** Tagged-only: deep link to the candidate's slug. */
  candidate_slug?: string;
  /** Legacy-only: deep link to the day page that owns this look. */
  legacy_day_path?: string;
  /** Founder-look only: id + product list for editorial render. */
  founder_look_id?: string;
  founder_look_slug?: string;
  founder_published_at?: string | null;
  founder_hero_products?: Array<{
    brand: string;
    product_name: string;
    url: string;
    image_url: string | null;
    role: string;
    category: string;
  }>;
};

export type PortofinoMomentCard = PortofinoMomentDef & {
  resolved: ResolvedMomentLook;
};

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function resolveOne(def: PortofinoMomentDef): Promise<PortofinoMomentCard> {
  // 1. Founder Look (Hero Outfit Studio publish flow) wins.
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: fl } = await supabaseAdmin
      .from("founder_looks")
      .select("id, slug, title, hero_urls, published_at, status, founder_notes")
      .eq("destination", "portofino")
      .eq("moment", def.moment_slug)
      .in("status", ["approved", "published"])
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .limit(1);
    const flRow = fl?.[0];
    if (flRow) {
      const heroes = Array.isArray(flRow.hero_urls)
        ? (flRow.hero_urls as Array<Record<string, unknown>>)
        : [];
      const products = heroes
        .map((h) => ({
          brand: String(h.brand ?? ""),
          product_name: String(h.product_name ?? ""),
          url: String(h.url ?? ""),
          image_url: (h.image_url as string | null) ?? null,
          role: String(h.role ?? "Accessory"),
          category: String(h.category ?? "other"),
        }))
        .filter((p) => p.url);
      const heroImage =
        products.find((p) => p.role === "Hero Garment" && p.image_url)?.image_url ??
        products.find((p) => p.image_url)?.image_url ??
        def.outfit_image;
      return {
        ...def,
        resolved: {
          source: "founder_look",
          title: (flRow.title as string) || def.moment_name,
          image: heroImage,
          founder_look_id: flRow.id as string,
          founder_look_slug: (flRow.slug as string) ?? undefined,
          founder_published_at: (flRow.published_at as string | null) ?? null,
          founder_hero_products: products,
        },
      };
    }
  } catch {
    // fall through to tagged / fallback
  }

  let row: CandidateRow | null = null;
  try {
    const supabase = publicClient();
    const { data } = await supabase
      .from("look_candidates")
      .select("id,slug,moment_slug,lookboard_image_url,why_it_works,best_for,composite_score,brief,whats_in_her_bag")
      .eq("destination", "portofino")
      .eq("moment_slug", def.moment_slug)
      .eq("status", "approved")
      .order("composite_score", { ascending: false, nullsFirst: false })
      .limit(1);
    row = (data?.[0] as CandidateRow | undefined) ?? null;
  } catch {
    row = null;
  }

  if (row && row.lookboard_image_url) {
    return {
      ...def,
      resolved: {
        source: "tagged",
        title: def.moment_name,
        image: row.lookboard_image_url,
        why_it_works: row.why_it_works ?? undefined,
        best_for: row.best_for?.length ? row.best_for : undefined,
        candidate_slug: row.slug ?? undefined,
      },
    };
  }

  return {
    ...def,
    resolved: {
      source: "fallback",
      title: def.legacy_look_title,
      image: def.outfit_image,
      legacy_day_path: def.legacy_day,
    },
  };
}

/** Public — landing page (all nine editorial-journey moments, in order). */
export const listPortofinoMomentsForLanding = createServerFn({ method: "GET" }).handler(
  async () => {
    const cards = await Promise.all(PORTOFINO_JOURNEY.map(resolveOne));
    return { ok: true as const, moments: cards };
  },
);

/** Public — single moment page. Returns null when slug isn't one of the canonical six. */
export const getPortofinoMoment = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ moment_slug: z.string().min(1) }).parse(input))
  .handler(async ({ data }) => {
    const def = getPortofinoMomentDef(data.moment_slug);
    if (!def) return { ok: true as const, moment: null };
    const card = await resolveOne(def);
    return { ok: true as const, moment: card };
  });

/** Admin — verdicts for the moments library chip ("tagged" vs "fallback"). */
export const getPortofinoMomentVerdicts = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ password: z.string().min(1).max(200) }).parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const cards = await Promise.all(PORTOFINO_JOURNEY.map(resolveOne));
    const verdicts = cards.map((c) => ({
      moment_slug: c.moment_slug,
      source: c.resolved.source,
      candidate_slug: c.resolved.candidate_slug ?? null,
    }));
    return { ok: true as const, verdicts };
  });

export { PORTOFINO_MOMENT_SLUGS };