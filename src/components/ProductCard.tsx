import { type ShopItem, resolveProductLink } from "@/data/portofino";
import { trackOutbound } from "@/lib/utils";

type Variant = "compact" | "editorial";

/**
 * Editorial product card used in every "Shop the Look" surface.
 * Renders a uniformly-sized thumbnail (image or a refined brand-monogram
 * fallback), brand, product name, price, and an outbound Shop link.
 * Opens all affiliate links in a new tab.
 */
export function ProductCard({ item, variant = "compact" }: { item: ShopItem; variant?: Variant }) {
  const href = resolveProductLink(item);
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer sponsored"
      onClick={() => trackOutbound({ brand: item.brand, item: item.item, href })}
      className="group flex flex-col text-center transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gold/60"
    >
      <div className="relative aspect-square overflow-hidden bg-ivory border border-border/60">
        {item.image ? (
          <img
            src={item.image}
            alt={`${item.brand} ${item.item}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-cream via-ivory to-cream px-4 text-center">
            <span className="eyebrow text-[0.55rem] tracking-[0.3em] text-gold/80 mb-2">
              {item.brand}
            </span>
            <span className="font-serif italic text-ink/60 text-[0.78rem] leading-snug">
              {item.item}
            </span>
          </div>
        )}
        {item.replaced && (
          <span className="absolute top-1.5 left-1.5 eyebrow text-[0.5rem] tracking-[0.2em] text-gold bg-ivory/90 border border-gold/50 px-1 py-px">
            Updated
          </span>
        )}
      </div>
      <div className={`mt-3 ${variant === "editorial" ? "space-y-1" : "space-y-0.5"}`}>
        <div
          className={`eyebrow text-ink group-hover:text-gold transition-colors ${
            variant === "editorial" ? "text-[0.65rem]" : "text-[0.55rem]"
          }`}
        >
          {item.brand}
        </div>
        <div
          className={`font-serif text-ink/85 leading-snug ${
            variant === "editorial" ? "text-[0.95rem]" : "text-[0.82rem]"
          }`}
        >
          {item.item}
        </div>
        <div
          className={`font-serif text-gold ${
            variant === "editorial" ? "text-[0.9rem]" : "text-[0.78rem]"
          }`}
        >
          {item.price}
        </div>
        <div
          className={`eyebrow text-gold group-hover:text-ink transition-colors pt-1 ${
            variant === "editorial" ? "text-[0.6rem]" : "text-[0.55rem]"
          }`}
        >
          Shop →
        </div>
      </div>
    </a>
  );
}