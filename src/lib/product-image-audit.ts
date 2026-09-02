/**
 * Product-image hotlink audit (read-only, static).
 *
 * Enumerates every product thumbnail referenced by curated commerce data and
 * reports: the image URL, its source domain, whether that source is
 * permitted/verified, whether it renders under the current display mode, and
 * which surfaces are affected. Pure computation — no network, no writes.
 *
 * Editorial hero / reference photography is deliberately out of scope.
 */
import { MOMENT_SHOP_CURATED } from "@/data/momentShopCurated";
import { LOOK_ALTERNATIVES } from "@/data/lookAlternatives";
import { RESORT_EDIT_LOOKS, orderedProducts } from "@/data/resortEditLooks";
import { PRODUCT_LIBRARY } from "@/data/productLibrary";
import {
  PRODUCT_IMAGE_MODE,
  productImageDecision,
  type ProductImageDecision,
} from "./product-image-policy";

export type ProductImageRow = {
  surface: string;
  page: string;
  brand: string;
  name: string;
  image: string;
  host: string;
  kind: ProductImageDecision["classification"]["kind"];
  permitted: boolean;
  rendered: boolean;
  reason: ProductImageDecision["reason"];
};

export type ProductImageAudit = {
  mode: typeof PRODUCT_IMAGE_MODE;
  rows: ProductImageRow[];
  external: ProductImageRow[];
  blocked: ProductImageRow[];
  byHost: { host: string; count: number; permitted: boolean }[];
  pagesAffected: string[];
  totals: {
    imagesReferenced: number;
    internalAssets: number;
    externalHotlinks: number;
    blockedFromRendering: number;
  };
};

function row(
  surface: string,
  page: string,
  brand: string,
  name: string,
  image: string | null | undefined,
): ProductImageRow | null {
  if (!image) return null;
  const d = productImageDecision(image);
  return {
    surface,
    page,
    brand,
    name,
    image,
    host: d.classification.host ?? "(project asset)",
    kind: d.classification.kind,
    permitted: d.classification.permittedHost,
    rendered: d.render,
    reason: d.reason,
  };
}

export function runProductImageAudit(): ProductImageAudit {
  const rows: ProductImageRow[] = [];
  const push = (r: ProductImageRow | null) => {
    if (r) rows.push(r);
  };

  // Curated moment shop rows (ShopLookPanel / complete-look grids)
  for (const [slug, items] of Object.entries(MOMENT_SHOP_CURATED)) {
    for (const it of items) {
      push(row("Curated moment shop", `/portofino/${slug}`, it.brand, it.title, it.image));
    }
  }

  // "Show me another look" alternative grids
  for (const [key, groups] of Object.entries(LOOK_ALTERNATIVES)) {
    for (const g of groups) {
      for (const it of g.items) {
        push(row("Look alternatives", `/portofino/${key}`, it.brand, it.title, it.image));
      }
    }
  }

  // Resort Edit complete looks
  for (const look of RESORT_EDIT_LOOKS) {
    for (const p of orderedProducts(look)) {
      push(
        row(
          "Resort Edit look",
          `/portofino/${look.moment}/${look.slug}`,
          p.brand,
          p.name,
          p.image,
        ),
      );
    }
  }

  // More Like This rail
  for (const p of PRODUCT_LIBRARY) {
    push(row("More Like This rail", "look pages · My Edit rails", p.brand, p.name, p.image));
  }

  const external = rows.filter((r) => r.kind === "external");
  const blocked = rows.filter((r) => !r.rendered);

  const hostMap = new Map<string, { count: number; permitted: boolean }>();
  for (const r of external) {
    const prev = hostMap.get(r.host) ?? { count: 0, permitted: r.permitted };
    hostMap.set(r.host, { count: prev.count + 1, permitted: r.permitted });
  }

  return {
    mode: PRODUCT_IMAGE_MODE,
    rows,
    external,
    blocked,
    byHost: [...hostMap.entries()]
      .map(([host, v]) => ({ host, count: v.count, permitted: v.permitted }))
      .sort((a, b) => b.count - a.count),
    pagesAffected: [...new Set(external.map((r) => r.page))].sort(),
    totals: {
      imagesReferenced: rows.length,
      internalAssets: rows.filter((r) => r.kind === "internal").length,
      externalHotlinks: external.length,
      blockedFromRendering: blocked.length,
    },
  };
}