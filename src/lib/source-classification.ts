/**
 * Classify the source of an admin-side product card so the Founder can
 * instantly tell whether a piece is coming from a trusted channel.
 *
 * UI-only helper. Pure functions; no DB calls. Reuses the static
 * AFFILIATE_DIRECT_BRANDS + APPROVED_RETAILER_DOMAINS lists from
 * `affiliate-channel.ts` as the canonical "approved" set.
 */

import { isAffiliateDirectBrand, isApprovedRetailerHref } from "./affiliate-channel";

export type ProductSourceBadge =
  | "brand_direct_approved"
  | "approved_retailer"
  | "brand_direct"
  | "unapproved"
  | "unknown";

export type SourceBadgeMeta = {
  badge: ProductSourceBadge;
  label: string;
  cls: string;
  detail: string;
};

function hostFromHref(href: string | null | undefined): string | null {
  if (!href) return null;
  try {
    return new URL(href, "https://placeholder.local")
      .hostname.replace(/^www\./, "")
      .toLowerCase();
  } catch {
    return null;
  }
}

function brandSlugMatchesHost(brand: string | null | undefined, host: string | null): boolean {
  if (!brand || !host) return false;
  const slug = brand
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "");
  if (!slug) return false;
  const hostStripped = host.replace(/[^a-z0-9]/g, "");
  return hostStripped.includes(slug);
}

/**
 * Determine the product source badge for a Founder Look Builder card.
 *
 *   - brand_direct_approved → URL on the brand's own domain AND brand is
 *     on the affiliate-direct-brand list (approved).
 *   - approved_retailer    → URL on an approved retailer domain.
 *   - brand_direct         → URL on the brand's own domain but brand not
 *     yet on the approved list (useful for discovery).
 *   - unapproved           → some other retailer/marketplace.
 *   - unknown              → no parseable URL.
 */
export function classifyProductSource(
  brand: string | null | undefined,
  url: string | null | undefined,
  retailer?: string | null,
): SourceBadgeMeta {
  if (!url) {
    return {
      badge: "unknown",
      label: "Unknown Source",
      cls: "bg-neutral-200 text-neutral-600",
      detail: "Product URL unavailable",
    };
  }
  const host = hostFromHref(url);
  if (!host) {
    return {
      badge: "unknown",
      label: "Unknown Source",
      cls: "bg-neutral-200 text-neutral-600",
      detail: "URL could not be parsed",
    };
  }
  if (isApprovedRetailerHref(url)) {
    return {
      badge: "approved_retailer",
      label: "Approved Retailer",
      cls: "bg-emerald-50 text-emerald-800 border border-emerald-300",
      detail: retailer ? `${retailer} · ${host}` : host,
    };
  }
  const onBrandSite = brandSlugMatchesHost(brand, host);
  if (onBrandSite && brand && isAffiliateDirectBrand(brand)) {
    return {
      badge: "brand_direct_approved",
      label: "Brand Direct · Approved",
      cls: "bg-black text-white",
      detail: host,
    };
  }
  if (onBrandSite) {
    return {
      badge: "brand_direct",
      label: "Brand Direct",
      cls: "bg-amber-50 text-amber-800 border border-amber-300",
      detail: host,
    };
  }
  return {
    badge: "unapproved",
    label: "Unapproved Source",
    cls: "bg-red-50 text-red-700 border border-red-300",
    detail: retailer ? `${retailer} · ${host}` : host,
  };
}

/**
 * Infer a finer jewelry sub-slot (earrings/necklace/bracelet/ring) from a
 * product title when the engine emits a single "jewelry" slot. UI-only —
 * does not change scoring. Returns null when no clear signal.
 */
export function inferJewelrySubSlot(
  slot: string | null | undefined,
  title: string | null | undefined,
): "earrings" | "necklace" | "bracelet" | "ring" | null {
  if ((slot ?? "").toLowerCase() !== "jewelry") return null;
  const t = (title ?? "").toLowerCase();
  if (!t) return null;
  if (/\b(earring|hoop|stud|drop)\b/.test(t)) return "earrings";
  if (/\b(necklace|pendant|chain|choker|lariat)\b/.test(t)) return "necklace";
  if (/\b(bracelet|cuff|bangle)\b/.test(t)) return "bracelet";
  if (/\b(ring|signet)\b/.test(t)) return "ring";
  return null;
}