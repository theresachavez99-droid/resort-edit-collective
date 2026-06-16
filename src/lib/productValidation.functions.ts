import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  evaluateScore,
  isCollectionOrHomepage,
  isPlaceholderImage,
  type ProductScore,
  type BrandTier,
  type BrandStatus,
  type PenaltyFlag,
} from "./productScoring";
import { requireAdmin } from "./admin-auth.server";

const FIRECRAWL_BASE = "https://api.firecrawl.dev/v2";

/**
 * Single-call validator for a candidate product before it enters
 * lookFallbacks.ts / lookAlternatives.ts / the sourced_products table.
 *
 * Pipeline:
 *   1. URL structural check (no homepage / collection / search page)
 *   2. Firecrawl scrape (verifies URL is reachable + extracts og:image)
 *   3. Image-asset check (reject SVG drawings, renderings, placeholders)
 *   4. Optional manual score (if provided, run scoring threshold)
 *
 * Returns a single verdict + reasons. Frontend never sees a product that
 * has not cleared this pipeline.
 */
export const validateCandidateProduct = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        password: z.string().min(1).max(200),
        url: z.string().url(),
        score: z.record(z.string(), z.number().min(1).max(5)).optional(),
        brand: z
          .object({
            brandSlug: z.string().optional(),
            tier: z.enum(["hero", "discovery"]).optional(),
            status: z.enum(["approved", "selective", "pending", "rejected"]).optional(),
            heroShareSoFar: z.number().min(0).max(1).optional(),
          })
          .optional(),
        penalties: z
          .array(
            z.enum([
              "genericAnywhere",
              "influencerAesthetic",
              "fastFashionEnergy",
              "trendDriven",
              "repetitiveSilhouette",
              "repetitivePrint",
              "repetitiveColor",
            ]),
          )
          .optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    requireAdmin(data.password);
    const reasons: string[] = [];

    if (isCollectionOrHomepage(data.url)) {
      reasons.push("URL is a homepage / collection / search page");
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { ok: false as const, passes: false, reasons: ["FIRECRAWL_API_KEY missing"] };
    }

    let imageUrl: string | null = null;
    let title: string | null = null;
    let httpStatus: number | null = null;

    try {
      const res = await fetch(`${FIRECRAWL_BASE}/scrape`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: data.url,
          onlyMainContent: true,
          formats: ["markdown"],
        }),
      });
      httpStatus = res.status;
      if (!res.ok) {
        reasons.push(`Firecrawl HTTP ${res.status}`);
      } else {
        const payload = await res.json();
        const root = payload?.data ?? payload;
        const meta = root?.metadata ?? {};
        imageUrl = meta.ogImage ?? meta["og:image"] ?? null;
        title = meta.title ?? null;
        if (meta.statusCode && meta.statusCode >= 400) {
          reasons.push(`Page returned status ${meta.statusCode}`);
        }
      }
    } catch (e: any) {
      reasons.push(`Firecrawl error: ${String(e?.message ?? e).slice(0, 200)}`);
    }

    if (isPlaceholderImage(imageUrl)) {
      reasons.push("Image is a placeholder / SVG drawing / rendering");
    }

    if (data.score) {
      const verdict = evaluateScore(data.score as ProductScore, {
        brand: data.brand as
          | { brandSlug?: string; tier?: BrandTier; status?: BrandStatus; heroShareSoFar?: number }
          | undefined,
        penalties: data.penalties as PenaltyFlag[] | undefined,
      });
      if (!verdict.passes) reasons.push(...verdict.reasons);
    }

    return {
      ok: true as const,
      passes: reasons.length === 0,
      reasons,
      imageUrl,
      title,
      httpStatus,
    };
  });