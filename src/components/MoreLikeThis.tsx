import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { trackOutbound } from "@/lib/utils";
import { mergeLibraries, moreLikeThisFor } from "@/lib/moreLikeThis";
import { savedKey, useSaved } from "@/lib/saved";
import { PRODUCT_LIBRARY, resolvePurchaseUrl, type ProductDNA } from "@/data/productLibrary";
import { getFounderProducts } from "@/lib/founder-products.functions";

export const founderProductsQuery = (destination = "portofino") => ({
  queryKey: ["founder-products", destination] as const,
  queryFn: () => getFounderProducts({ data: { destination } }),
  staleTime: 5 * 60_000,
});

/**
 * "More Like This" — destination-DNA discovery carousel.
 *
 * Renders 6+ products that share the look's destination + activity + style
 * family signal, with a 2-per-brand cap. See src/lib/moreLikeThis.ts.
 */
export function MoreLikeThis({ daySlug, lookSlug }: { daySlug: string; lookSlug: string }) {
  // Founder reference library is the primary source of truth. The static
  // PRODUCT_LIBRARY is fallback only — merged in for any brand+name not
  // already represented in the founder DB.
  const { data: founder } = useQuery({
    ...founderProductsQuery("portofino"),
    initialData: [] as ProductDNA[],
    // Treat the initial empty array as stale so the query fetches the live
    // founder library on mount (otherwise React Query considers initialData
    // fresh and never calls the server fn).
    initialDataUpdatedAt: 0,
  });
  const pool = useMemo(() => mergeLibraries(founder, PRODUCT_LIBRARY), [founder]);
  const { dna, products } = useMemo(
    () => moreLikeThisFor(daySlug, lookSlug, pool),
    [daySlug, lookSlug, pool],
  );
  if (!dna || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1480px] px-4 sm:px-8 lg:px-10 mt-24 md:mt-32">
      <div className="border-t border-ink/15 pt-12">
        <p className="eyebrow tracking-[0.34em] text-[0.6rem] text-gold">
          DISCOVERY · {dna.editorialLabel.toUpperCase()}
        </p>
        <h2 className="font-display text-[1.7rem] md:text-[2.4rem] tracking-[0.12em] text-ink uppercase mt-3">
          More Like This
        </h2>
        <p className="font-serif italic text-[1rem] text-ink/65 mt-3 max-w-2xl leading-relaxed">
          Explore similar pieces with the same destination energy.
        </p>
      </div>

      <div
        className="mt-10 -mx-4 sm:-mx-8 lg:-mx-10 px-4 sm:px-8 lg:px-10 overflow-x-auto snap-x snap-mandatory pb-4 [scrollbar-width:thin]"
        aria-label="More like this products"
      >
        <ul className="flex gap-5">
          {products.map((p) => (
            <li key={p.id} className="snap-start shrink-0 w-[240px] sm:w-[260px]">
              <ProductTile product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ProductTile({ product }: { product: ProductDNA }) {
  const { has, toggle } = useSaved();
  const id = savedKey(product.brand, product.name);
  const saved = has(id);
  // Resolve the purchase URL via the inventory-health fallback chain.
  // The scorer also requires this, so href should always be non-null here.
  const href = resolvePurchaseUrl(product);
  if (!href) return null;

  return (
    <article className="group flex flex-col bg-ivory border border-ink/10 hover:border-gold/60 transition-colors">
      <div className="relative aspect-[3/4] bg-cream/40 overflow-hidden">
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        {product.editorialLabel && (
          <span className="absolute left-2.5 top-2.5 bg-ivory/90 text-ink eyebrow tracking-[0.22em] text-[0.55rem] px-2 py-1 backdrop-blur-sm border border-ink/10">
            {product.editorialLabel}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            toggle(id);
          }}
          aria-label={saved ? "Remove from saved" : "Save piece"}
          className="absolute right-2.5 top-2.5 h-8 w-8 grid place-items-center bg-ivory/90 hover:bg-ivory border border-ink/10 transition-colors"
        >
          <Heart
            className={saved ? "w-4 h-4 text-gold" : "w-4 h-4 text-ink/55"}
            strokeWidth={1.5}
            fill={saved ? "currentColor" : "none"}
          />
        </button>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="eyebrow tracking-[0.28em] text-[0.6rem] text-gold">{product.brand.toUpperCase()}</p>
        <h3 className="font-serif text-[0.98rem] text-ink leading-snug mt-1.5 line-clamp-2">
          {product.name}
        </h3>
        <p className="font-serif text-[0.92rem] text-ink/70 mt-2">{product.price}</p>
        <p className="eyebrow tracking-[0.22em] text-[0.55rem] text-ink/45 mt-1">
          {product.channel === "affiliate" ? `AT ${product.retailer.replace(/\.com$/, "").toUpperCase()}` : "DIRECT FROM BRAND"}
        </p>
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener sponsored"
          onClick={() =>
            trackOutbound({ brand: product.brand, item: product.name, href })
          }
          className="mt-4 eyebrow tracking-[0.26em] text-[0.6rem] text-ink border-b border-gold pb-0.5 self-start hover:text-gold transition-colors"
        >
          SHOP →
        </a>
      </div>
    </article>
  );
}