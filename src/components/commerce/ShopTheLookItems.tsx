import { Link } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getLookItems } from "@/lib/look-items.functions";
import { ProductCommerceCard, ProductCommerceGrid } from "@/components/commerce/ProductCommerceCard";

export const lookItemsQuery = (lookKey: string) =>
  queryOptions({
    queryKey: ["look-items", lookKey],
    queryFn: () => getLookItems({ data: { lookKey } }),
  });

/**
 * "Shop The Look" — renders the look's `look_items_public` rows through the
 * standard commerce card. Renders nothing at all when a look has no items:
 * no placeholder, no empty state, no "coming soon".
 */
export function ShopTheLookItems({ lookKey }: { lookKey: string }) {
  const { data } = useQuery(lookItemsQuery(lookKey));
  const items = data?.items ?? [];
  if (items.length === 0) return null;

  return (
    <div className="mt-12 md:mt-14 border-t border-border/40 pt-10 md:pt-12">
      <div className="max-w-2xl mb-7 md:mb-9">
        <span className="eyebrow text-[0.62rem] tracking-[0.36em] text-gold">SHOP THE LOOK</span>
        <h3 className="font-display text-3xl md:text-4xl tracking-[0.04em] text-ink mt-3 leading-[1.1]">
          Shop The Look
        </h3>
      </div>
      <ProductCommerceGrid>
        {items.map((it) => (
          <ProductCommerceCard
            key={`${it.look_key}-${it.sort_order}-${it.item_name}`}
            brand={it.brand_name ?? "Resort Edit"}
            name={it.item_name}
            {...(it.price_display ? { price: it.price_display } : {})}
            {...(it.retailer_name ? { retailer: it.retailer_name } : {})}
            url={it.affiliate_url}
            image={it.image_url}
            variant="editorial"
          />
        ))}
      </ProductCommerceGrid>
      <p className="mt-5 md:mt-6 text-xs text-ink/55 tracking-wide font-sans leading-relaxed">
        Resort Edit may earn a commission on items purchased through these links, at no additional cost to you.{" "}
        <Link to="/about" hash="affiliate-disclosure" className="underline decoration-ink/30 hover:decoration-ink/60 hover:text-ink/75 transition-colors">
          Affiliate Disclosure
        </Link>
      </p>
    </div>
  );
}
