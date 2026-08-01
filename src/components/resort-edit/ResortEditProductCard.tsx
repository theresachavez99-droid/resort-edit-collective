import type { ResortEditProduct } from "@/data/resortEditLooks";
import { ProductCommerceCard } from "@/components/commerce/ProductCommerceCard";

/**
 * Thin adapter: maps a {@link ResortEditProduct} onto the standardized
 * {@link ProductCommerceCard}. Product imagery is gated centrally by
 * `product-image-policy` — retailer photography is never hotlinked.
 */
export function ResortEditProductCard({
  product,
  slotLabel,
}: {
  product: ResortEditProduct;
  /** Optional editorial category label, e.g. "Shoes", "Bag". */
  slotLabel?: string;
}) {
  return (
    <ProductCommerceCard
      brand={product.brand}
      name={product.name}
      {...(slotLabel ? { category: slotLabel } : {})}
      {...(product.price ? { price: product.price } : {})}
      retailer={product.retailer}
      url={product.url}
      image={product.image}
      variant="editorial"
      ctaLabel="VIEW PRODUCT →"
      {...(product.liveAvailable === false ? { stockNote: "Checking availability" } : {})}
    />
  );
}
