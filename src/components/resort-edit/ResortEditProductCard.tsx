import type { ResortEditProduct } from "@/data/resortEditLooks";
import { trackOutbound } from "@/lib/utils";

/**
 * Luxury product card for a Resort Edit Look. Renders:
 *   image · brand · name · retailer · optional price · View Product CTA
 *
 * No badges, no ratings, no reviews, no sale/discount language, no
 * availability claims. Prices only render when explicitly supplied.
 * Missing product imagery is shown as an editorial "Image pending
 * founder approval" tile — never a hotlinked retailer image.
 */
export function ResortEditProductCard({
  product,
  slotLabel,
}: {
  product: ResortEditProduct;
  /** Optional editorial category label, e.g. "Shoes", "Bag". */
  slotLabel?: string;
}) {
  const hasImage = !!product.image;
  return (
    <a
      href={product.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() =>
        trackOutbound({ brand: product.brand, item: product.name, href: product.url })
      }
      className="group flex flex-col bg-ivory border border-border/60 hover:border-gold transition-colors duration-300 h-full"
    >
      <div className="relative aspect-square overflow-hidden bg-cream flex items-center justify-center">
        {hasImage ? (
          <img
            src={product.image!}
            alt={`${product.brand} ${product.name}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
            <span className="eyebrow text-[0.55rem] tracking-[0.32em] text-ink/45">
              Image pending
            </span>
            <span className="font-serif italic text-[0.82rem] text-ink/55 mt-2 leading-snug">
              {product.brand}
            </span>
          </div>
        )}
        {slotLabel && (
          <span className="absolute top-3 left-3 eyebrow text-[0.5rem] tracking-[0.32em] text-gold bg-ivory/90 px-2 py-1">
            {slotLabel}
          </span>
        )}
      </div>
      <div className="flex flex-col flex-1 p-5">
        <div className="eyebrow text-ink text-[0.6rem] tracking-[0.34em]">
          {product.brand}
        </div>
        <div className="font-serif italic text-ink/90 text-[0.95rem] leading-snug mt-2 line-clamp-2">
          {product.name}
        </div>
        <div className="flex items-baseline justify-between mt-3 gap-3">
          <span className="text-[0.7rem] tracking-[0.2em] uppercase text-ink/55">
            {product.retailer}
          </span>
          {product.price && (
            <span className="font-serif text-gold text-[0.9rem]">{product.price}</span>
          )}
        </div>
        <div className="mt-auto pt-4">
          <span className="eyebrow text-[0.6rem] tracking-[0.36em] text-ink group-hover:text-gold transition-colors">
            VIEW PRODUCT →
          </span>
        </div>
      </div>
    </a>
  );
}
