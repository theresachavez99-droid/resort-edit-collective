import { orderedProducts, type ResortEditLook, type ResortEditProduct } from "@/data/resortEditLooks";
import { ResortEditProductCard } from "./ResortEditProductCard";

/**
 * Editorial slot label per hero/accessory position for a given look. Uses
 * the ordered product list so grid ordering and labels stay in sync.
 */
function slotLabelFor(look: ResortEditLook, product: ResortEditProduct, index: number): string {
  const p = look.products;
  if (p.hero.includes(product)) {
    return look.founderFavorite && index === 0 ? "The Look" : "The Look";
  }
  if (product === p.shoes) return "Shoes";
  if (product === p.bag) return "Bag";
  if (product === p.earrings) return "Earrings";
  if (product === p.bracelet) return "Bracelet";
  if (product === p.necklace) return "Necklace";
  if (product === p.ring) return "Ring";
  if (product === p.sunglasses) return "Sunglasses";
  if (product === p.hairDetail) return "Hair Detail";
  if (product === p.layer) return "Layer";
  return "";
}

export function ResortEditProductGrid({ look }: { look: ResortEditLook }) {
  const items = orderedProducts(look);
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
      {items.map((product, i) => (
        <ResortEditProductCard
          key={product.url}
          product={product}
          slotLabel={slotLabelFor(look, product, i)}
        />
      ))}
    </div>
  );
}
