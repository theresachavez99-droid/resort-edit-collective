import { useState } from "react";
import { safeHref } from "@/lib/safe-url";
import { classifyShopUrl } from "@/lib/shop-url-policy";
import { trackOutbound } from "@/lib/utils";
import { productImageDecision } from "@/lib/product-image-policy";

/**
 * THE Resort Edit commerce card — the single product card used by every
 * shoppable surface (moment shop grids, complete-look grids, look pages,
 * "More Resort Edit Looks" drawers).
 *
 * Doctrine:
 *  - Text-first. Retailer photography is never hotlinked; product imagery
 *    renders only when `product-image-policy` allows it (see that module).
 *  - No retailer logos, no random aspect ratios, no broken-image icons: a
 *    blocked / failed / missing image degrades to the text-first layout.
 *  - Only exact PDP links are clickable. Homepage, collection, category,
 *    search and placeholder URLs render as an unlinked sourcing note.
 */
export type ProductCommerceCardProps = {
  brand: string;
  name: string;
  /** Editorial slot / category label, e.g. "Shoes", "The Look". */
  category?: string;
  /** Retained for data plumbing only — never rendered publicly. */
  price?: string;
  /** Short availability line, e.g. "Limited availability". Never invented. */
  stockNote?: string;
  /** Retailer name as plain text (never a logo). */
  retailer?: string;
  url?: string | null;
  /** Candidate product thumbnail; gated by the image policy. */
  image?: string | null;
  /** True only when source, rights, URL and product match are verified. */
  imageVerified?: boolean;
  ctaLabel?: string;
  /**
   * Optional override for the CTA typography. Used by "Shop The Look" so its
   * VIEW PRODUCT link matches the Complete Look sections letter-for-letter.
   */
  ctaClassName?: string;
  /** Copy shown when there is no publishable PDP link. */
  unavailableLabel?: string;
  /** Small corner note, e.g. "Updated". */
  flag?: string;
  variant?: "compact" | "editorial";
};

export function ProductCommerceCard({
  brand,
  name,
  category,
  stockNote,
  retailer,
  url,
  image,
  imageVerified,
  ctaLabel,
  ctaClassName,
  unavailableLabel = "STILL SOURCING",
  flag,
  variant = "compact",
}: ProductCommerceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const cta = ctaLabel ?? (retailer ? `SHOP AT ${retailer.toUpperCase()} →` : "SHOP →");
  const decision = productImageDecision(image, { verified: imageVerified });
  const showImage = decision.render && !imageFailed;

  const verdict = classifyShopUrl(url);
  const href = verdict.publishable ? safeHref(url) : undefined;

  const pad = variant === "editorial" ? "p-5" : "p-4";

  const body = (
    <>
      {showImage ? (
        <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
          <img
            src={image!}
            alt={`${brand} ${name}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {category && (
            <span className="absolute top-2 left-2 eyebrow text-[0.5rem] tracking-[0.3em] text-gold bg-ivory/90 px-1.5 py-0.5">
              {category}
            </span>
          )}
        </div>
      ) : null}
      <div className={`flex flex-col flex-1 ${pad}`}>
        {!showImage && category && (
          <div className="eyebrow text-[0.55rem] tracking-[0.32em] text-gold/85">
            {category}
          </div>
        )}
        <div
          className={`eyebrow text-ink tracking-[0.32em] ${
            variant === "editorial" ? "text-[0.62rem]" : "text-[0.6rem]"
          } ${!showImage && category ? "mt-2" : ""}`}
        >
          {brand}
        </div>
        <div
          className={`font-serif italic text-ink/90 leading-snug mt-1.5 line-clamp-2 ${
            variant === "editorial" ? "text-[0.95rem]" : "text-[0.92rem]"
          }`}
        >
          {name}
        </div>
        {stockNote && (
          <div className="eyebrow text-[0.52rem] tracking-[0.28em] text-ink/45 mt-3">
            {stockNote}
          </div>
        )}
        <div className="mt-auto pt-3">
          <span
            className={
              href && ctaClassName
                ? ctaClassName
                : `eyebrow text-[0.6rem] tracking-[0.35em] ${
                    href ? "text-ink group-hover:text-gold transition-colors" : "text-ink/45"
                  }`
            }
          >
            {href ? cta : unavailableLabel}
          </span>
        </div>
      </div>
      {flag && (
        <span className="absolute top-2 right-2 eyebrow text-[0.5rem] tracking-[0.2em] text-gold bg-ivory/90 border border-gold/50 px-1 py-px">
          {flag}
        </span>
      )}
    </>
  );

  const shell =
    "relative group flex flex-col bg-ivory border border-border/60 h-full min-h-[168px] transition-colors";

  if (!href) {
    return (
      <div className={shell} aria-disabled="true">
        {body}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackOutbound({ brand, item: name, href, category })}
      className={`${shell} hover:border-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60`}
    >
      {body}
    </a>
  );
}

/** Standard shopping-grid layout for commerce cards. */
export function ProductCommerceGrid({
  children,
  density = "standard",
}: {
  children: React.ReactNode;
  density?: "standard" | "compact";
}) {
  return (
    <div
      className={`grid gap-4 md:gap-5 ${
        density === "compact"
          ? "grid-cols-2 md:grid-cols-3"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }`}
    >
      {children}
    </div>
  );
}