/**
 * Product Identity helpers.
 *
 * Architecture: Product = identity (brand + name + image + tags).
 * Retailer URL = source attached to the identity. One product can have
 * many sources; approving a look points at the identity (`product_id`), not
 * the source URL, so approved Resort Edit looks survive future affiliate
 * onboarding from MyTheresa, Net-a-Porter, FWRD, etc.
 */

export type SourcedProductLike = {
  id: string;
  brand: string | null;
  brand_id?: string | null;
  product_name: string | null;
  retailer_domain: string | null;
  source_url: string;
  affiliate_url: string | null;
  image_url: string | null;
  price: number | null;
  currency: string | null;
  slot_category: string | null;
  category?: string | null;
  subcategory?: string | null;
  silhouette?: string | null;
  fabric?: string | null;
  texture?: string | null;
  print_family?: string | null;
  color_family?: string | null;
  destination_tags?: string[] | null;
  activity_tags?: string[] | null;
};

function identityKey(brand: string, name: string): string {
  return `${brand.toLowerCase().trim()}::${name.toLowerCase().trim()}`;
}

/**
 * Upsert the product identity for a sourced row and append a retail source.
 * Idempotent: re-running for the same brand+name returns the same product_id;
 * re-running for the same retailer updates price/availability instead of
 * duplicating.
 */
export async function promoteSourcedToProduct(
  sp: SourcedProductLike,
  dna: { destination?: string; activity?: string; palette?: string[] } | null,
): Promise<{ product_id: string; source_id: string } | null> {
  if (!sp.brand || !sp.product_name) return null;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = supabaseAdmin;

  const key = identityKey(sp.brand, sp.product_name);

  // Upsert identity
  const productPayload = {
    identity_key: key,
    brand_id: sp.brand_id ?? null,
    brand: sp.brand,
    product_name: sp.product_name,
    category: sp.category ?? sp.slot_category ?? null,
    subcategory: sp.subcategory ?? null,
    color_family: sp.color_family ?? null,
    silhouette: sp.silhouette ?? null,
    fabric: sp.fabric ?? null,
    texture: sp.texture ?? null,
    print_family: sp.print_family ?? null,
    image_url: sp.image_url ?? null,
    destination_tags: Array.from(new Set([...(sp.destination_tags ?? []), ...(dna?.destination ? [dna.destination] : [])])),
    activity_tags: Array.from(new Set([...(sp.activity_tags ?? []), ...(dna?.activity ? [dna.activity] : [])])),
    approval_status: "approved",
  };

  const { data: prod, error: prodErr } = await sb
    .from("products")
    .upsert(productPayload, { onConflict: "identity_key" })
    .select("id")
    .single();
  if (prodErr || !prod?.id) throw new Error(`product upsert failed: ${prodErr?.message ?? "no id"}`);

  // Upsert source
  const retailer = sp.retailer_domain ?? "unknown";
  const sourcePayload = {
    product_id: prod.id,
    retailer,
    retailer_domain: sp.retailer_domain ?? null,
    source_url: sp.source_url,
    affiliate_url: sp.affiliate_url ?? sp.source_url,
    price: sp.price,
    currency: sp.currency ?? "USD",
    availability: "unknown",
    is_primary: true,
    last_checked_at: new Date().toISOString(),
  };

  const { data: src, error: srcErr } = await sb
    .from("product_sources")
    .upsert(sourcePayload, { onConflict: "product_id,retailer" })
    .select("id")
    .single();
  if (srcErr || !src?.id) throw new Error(`source upsert failed: ${srcErr?.message ?? "no id"}`);

  return { product_id: prod.id, source_id: src.id };
}