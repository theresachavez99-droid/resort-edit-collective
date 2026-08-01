import { type ShopItem, resolveProductLink } from "@/data/portofino";
import { ProductCommerceCard } from "@/components/commerce/ProductCommerceCard";

type Variant = "compact" | "editorial";

/**
 * Thin adapter: maps a legacy {@link ShopItem} onto the standardized
 * {@link ProductCommerceCard}. All rendering, image gating and PDP-link
 * enforcement live in that one component.
 */
export function ProductCard({ item, variant = "compact" }: { item: ShopItem; variant?: Variant }) {
  return (
    <ProductCommerceCard
      brand={item.brand}
      name={item.item}
      price={item.price}
      url={resolveProductLink(item)}
      image={item.image ?? null}
      variant={variant}
      {...(item.replaced ? { flag: "Updated" } : {})}
    />
  );
}