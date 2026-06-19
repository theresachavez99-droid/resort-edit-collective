/**
 * Founder Reference Library — server function bridge.
 *
 * Reads `founder_reference_products` and projects each row into the
 * `ProductDNA` shape consumed by the More Like This recommender,
 * the Resort Edit modules, and any other product discovery surface.
 *
 * This is the primary source of truth for the live site. The static
 * `PRODUCT_LIBRARY` in `src/data/productLibrary.ts` is fallback only,
 * merged in for any brand+name not already represented in the DB.
 */

import { createServerFn } from "@tanstack/react-start";
import {
  AFFILIATE_PARTNERS,
  channelFor,
  type RetailerChannel,
  type ProductDNA,
} from "@/data/productLibrary";
import type { ActivityTag, StyleFamily } from "@/data/styleDNA";

const FAMILIAR_BRANDS = new Set(
  [
    "Dolce & Gabbana",
    "Etro",
    "Loewe",
    "Pucci",
    "Zimmermann",
    "Gianvito Rossi",
    "Aquazzura",
    "Manolo Blahnik",
    "Alice + Olivia",
    "Eres",
    "Loro Piana",
    "Celine",
    "Dior",
    "Saint Laurent",
    "Valentino",
    "Prada",
    "Gucci",
    "Hermes",
    "Bottega Veneta",
    "David Yurman",
    "Van Cleef & Arpels",
    "Missoni",
    "Retrofete",
  ].map((b) => b.toLowerCase()),
);

const KNOWN_STYLE: ReadonlySet<StyleFamily> = new Set<StyleFamily>([
  "mediterranean_embroidery",
  "blue_white_porcelain",
  "riviera_floral",
  "coastal_knit",
  "crochet_resort",
  "raffia_luxury",
  "yacht_swim",
  "harbor_aperitivo",
  "sunset_glamour",
  "destination_print",
  "riviera_glamour",
  "coastal_neutral",
  "destination_glamour",
  "mediterranean_tailoring",
  "sequin_glamour",
]);

const KNOWN_ACTIVITY: ReadonlySet<ActivityTag> = new Set<ActivityTag>([
  "yacht_day",
  "beach_club_lunch",
  "harbor_aperitivo",
  "market_morning",
  "sunset_views",
  "riviera_dinner",
  "pool_day",
  "arrival_day",
  "shopping_afternoon",
]);

function hostnameOf(url: string | null | undefined): string {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

function resolveRetailer(retailerCol: string | null, sourceUrl: string | null): string {
  const raw = (retailerCol ?? "").toLowerCase().trim();
  if (raw && raw !== "brand_direct" && AFFILIATE_PARTNERS.has(raw)) return raw;
  const host = hostnameOf(sourceUrl);
  if (host && AFFILIATE_PARTNERS.has(host)) return host;
  return host || (raw || "brand_direct");
}

/**
 * Persisted channel_type → recommender channel.
 * Both affiliate_retailer and affiliate_direct_brand are eligible for
 * More Like This; brand_direct is not. Falls back to retailer-string
 * inference for any row without a persisted classification.
 */
function channelFromPersisted(
  persisted: string | null | undefined,
  retailer: string,
): RetailerChannel {
  if (persisted === "affiliate_retailer" || persisted === "affiliate_direct_brand") {
    return "affiliate";
  }
  if (persisted === "brand_direct") return "brand_direct";
  return channelFor(retailer);
}

function editorialLabelFor(style: StyleFamily | undefined): string | undefined {
  if (!style) return undefined;
  return style
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Server-only fetch + projection. Returns ProductDNA-shaped rows for the
 * requested destination. Only rows with a usable image + source_url survive.
 */
export const getFounderProducts = createServerFn({ method: "GET" })
  .inputValidator((input: { destination?: string } | undefined) => ({
    destination: input?.destination ?? "portofino",
  }))
  .handler(async ({ data }): Promise<ProductDNA[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("founder_reference_products")
      .select(
        "id,brand,product_name,product_category,image_url,source_url,retailer,channel_type,destination_tags,activity_tags,style_tags,silhouette,texture,color_story",
      )
      .contains("destination_tags", [data.destination])
      .eq("founder_approved", true);

    if (error) {
      console.error("[founder-products] query failed", error.message);
      return [];
    }

    const products: ProductDNA[] = [];
    for (const row of rows ?? []) {
      const image = row.image_url ?? "";
      const href = row.source_url ?? "";
      if (!image || !href) continue;

      const styleFamilies = (row.style_tags ?? [])
        .filter((t): t is StyleFamily => KNOWN_STYLE.has(t as StyleFamily));
      const activityTags = (row.activity_tags ?? [])
        .filter((t): t is ActivityTag => KNOWN_ACTIVITY.has(t as ActivityTag));

      const retailer = resolveRetailer(row.retailer, row.source_url);
      const channel = channelFromPersisted(
        (row as { channel_type?: string | null }).channel_type,
        retailer,
      );
      const brandTier = FAMILIAR_BRANDS.has(row.brand.toLowerCase()) ? "familiar" : "discovery";

      products.push({
        id: row.id,
        brand: row.brand,
        name: row.product_name ?? row.brand,
        price: "",
        image,
        href,
        retailer,
        channel,
        destinations: row.destination_tags ?? [],
        styleFamilies,
        activityTags,
        brandTier,
        editorialLabel: editorialLabelFor(styleFamilies[0]),
      });
    }
    return products;
  });