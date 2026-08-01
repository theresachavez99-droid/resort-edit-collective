/**
 * Product-image display policy — the single place that decides whether a
 * product thumbnail may render on a live commerce surface.
 *
 * Launch blocker (P1): until affiliate approval and retailer image-rights
 * permissions are verified, Resort Edit must not hotlink retailer product
 * photography. In `pending_affiliate` mode every external image is withheld
 * and the shopping surfaces fall back to the text-first Resort Edit product
 * card. Editorial hero / reference photography is NOT governed here — this
 * module concerns product thumbnails and commerce cards only.
 *
 * Flip the mode in ONE place: `VITE_PRODUCT_IMAGE_MODE=approved_affiliate`
 * (or edit {@link DEFAULT_PRODUCT_IMAGE_MODE}). Even in approved mode an
 * external image renders only when its host is on the permitted list AND the
 * call site passes `verified: true` (source, rights, URL and product match
 * checked).
 */

export type ProductImageMode = "pending_affiliate" | "approved_affiliate";

/** Production default. Do not change without written affiliate approval. */
export const DEFAULT_PRODUCT_IMAGE_MODE: ProductImageMode = "pending_affiliate";

function readMode(): ProductImageMode {
  const raw =
    (typeof import.meta !== "undefined"
      ? (import.meta as { env?: Record<string, string | undefined> }).env?.[
          "VITE_PRODUCT_IMAGE_MODE"
        ]
      : undefined) ?? undefined;
  return raw === "approved_affiliate" ? "approved_affiliate" : DEFAULT_PRODUCT_IMAGE_MODE;
}

export const PRODUCT_IMAGE_MODE: ProductImageMode = readMode();

/**
 * Hosts whose imagery Resort Edit owns or is licensed to serve: our own
 * domains, the Lovable preview/publish hosts, and project-owned storage.
 * Everything else is treated as third-party retailer photography.
 */
const INTERNAL_HOST_SUFFIXES = [
  "resortedit.com",
  "lovable.app",
  "lovableproject.com",
  "supabase.co",
];

/**
 * External hosts explicitly cleared for product photography by a signed
 * affiliate / media agreement. Intentionally EMPTY until legal sign-off.
 */
export const PERMITTED_EXTERNAL_IMAGE_HOSTS = new Set<string>([]);

export type ProductImageKind = "none" | "internal" | "external";

export type ProductImageClassification = {
  kind: ProductImageKind;
  /** Hostname for external/absolute URLs, `null` for bundled assets. */
  host: string | null;
  /** True when the host is ours or an explicitly permitted partner host. */
  permittedHost: boolean;
};

export function classifyProductImage(
  src: string | null | undefined,
): ProductImageClassification {
  const raw = (src ?? "").trim();
  if (!raw) return { kind: "none", host: null, permittedHost: false };

  // Bundled / project-relative assets ("/assets/...", "/lovable-uploads/...").
  if (raw.startsWith("/") || raw.startsWith("./")) {
    return { kind: "internal", host: null, permittedHost: true };
  }

  let host: string;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { kind: "external", host: null, permittedHost: false };
    }
    host = u.hostname.toLowerCase();
  } catch {
    return { kind: "external", host: null, permittedHost: false };
  }

  const internal = INTERNAL_HOST_SUFFIXES.some(
    (s) => host === s || host.endsWith(`.${s}`),
  );
  if (internal) return { kind: "internal", host, permittedHost: true };

  return {
    kind: "external",
    host,
    permittedHost: PERMITTED_EXTERNAL_IMAGE_HOSTS.has(host),
  };
}

export type ProductImageDecision = {
  /** True only when the image may be rendered right now. */
  render: boolean;
  /** Machine-readable reason, surfaced in the admin audit. */
  reason:
    | "no_image"
    | "internal_asset"
    | "blocked_pending_affiliate"
    | "blocked_unpermitted_host"
    | "blocked_unverified"
    | "approved_external";
  classification: ProductImageClassification;
  mode: ProductImageMode;
};

/**
 * Decide whether a single product image may render.
 *
 * @param verified Set true only when source, rights/permission, URL and
 *                 product match have all been verified for THIS image.
 */
export function productImageDecision(
  src: string | null | undefined,
  opts: { verified?: boolean; mode?: ProductImageMode } = {},
): ProductImageDecision {
  const mode = opts.mode ?? PRODUCT_IMAGE_MODE;
  const classification = classifyProductImage(src);

  if (classification.kind === "none")
    return { render: false, reason: "no_image", classification, mode };
  if (classification.kind === "internal")
    return { render: true, reason: "internal_asset", classification, mode };
  if (mode === "pending_affiliate")
    return { render: false, reason: "blocked_pending_affiliate", classification, mode };
  if (!classification.permittedHost)
    return { render: false, reason: "blocked_unpermitted_host", classification, mode };
  if (!opts.verified)
    return { render: false, reason: "blocked_unverified", classification, mode };
  return { render: true, reason: "approved_external", classification, mode };
}

/** Convenience boolean for render-time gating. */
export function canRenderProductImage(
  src: string | null | undefined,
  opts: { verified?: boolean; mode?: ProductImageMode } = {},
): boolean {
  return productImageDecision(src, opts).render;
}

export const PRODUCT_IMAGE_MODE_NOTE =
  PRODUCT_IMAGE_MODE === "pending_affiliate"
    ? "Product imagery withheld pending affiliate and image-rights approval."
    : "Product imagery renders only for verified, permitted sources.";