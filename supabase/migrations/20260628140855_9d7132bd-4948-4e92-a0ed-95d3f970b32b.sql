
-- Phase 3 — Editorial Memory & Diversity registry

CREATE TABLE IF NOT EXISTS public.editorial_memory_products (
  product_url text PRIMARY KEY,
  brand text NOT NULL,
  retailer text,
  product_name text,
  image_url text,
  category text,
  color_family text,
  material text,
  silhouette text,
  style_family text[] NOT NULL DEFAULT '{}',
  destinations text[] NOT NULL DEFAULT '{}',
  moments text[] NOT NULL DEFAULT '{}',
  usage_count integer NOT NULL DEFAULT 0,
  signature_piece boolean NOT NULL DEFAULT false,
  signature_reason text,
  founder_override_reason text,
  first_used_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_memory_products TO authenticated;
GRANT ALL ON public.editorial_memory_products TO service_role;
ALTER TABLE public.editorial_memory_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memory_products_admin_only_read"
  ON public.editorial_memory_products FOR SELECT TO authenticated USING (false);

CREATE INDEX IF NOT EXISTS idx_memory_products_brand ON public.editorial_memory_products(brand);
CREATE INDEX IF NOT EXISTS idx_memory_products_category ON public.editorial_memory_products(category);
CREATE INDEX IF NOT EXISTS idx_memory_products_signature ON public.editorial_memory_products(signature_piece);
CREATE INDEX IF NOT EXISTS idx_memory_products_destinations ON public.editorial_memory_products USING gin(destinations);
CREATE INDEX IF NOT EXISTS idx_memory_products_moments ON public.editorial_memory_products USING gin(moments);

CREATE TRIGGER trg_memory_products_updated
  BEFORE UPDATE ON public.editorial_memory_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.editorial_memory_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_url text NOT NULL REFERENCES public.editorial_memory_products(product_url) ON DELETE CASCADE,
  founder_look_id uuid,
  destination text NOT NULL,
  moment text NOT NULL,
  slot text,
  role text,
  used_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_memory_usages TO authenticated;
GRANT ALL ON public.editorial_memory_usages TO service_role;
ALTER TABLE public.editorial_memory_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "memory_usages_admin_only_read"
  ON public.editorial_memory_usages FOR SELECT TO authenticated USING (false);

CREATE INDEX IF NOT EXISTS idx_memory_usages_product ON public.editorial_memory_usages(product_url);
CREATE INDEX IF NOT EXISTS idx_memory_usages_destination ON public.editorial_memory_usages(destination);
CREATE INDEX IF NOT EXISTS idx_memory_usages_moment ON public.editorial_memory_usages(moment);
CREATE INDEX IF NOT EXISTS idx_memory_usages_look ON public.editorial_memory_usages(founder_look_id);

-- Upsert helper: records a single product usage. SECURITY DEFINER so server
-- functions can call via supabaseAdmin without per-row RLS noise.
CREATE OR REPLACE FUNCTION public.record_editorial_memory_usage(
  p_product_url text,
  p_brand text,
  p_retailer text,
  p_product_name text,
  p_image_url text,
  p_category text,
  p_color_family text,
  p_material text,
  p_silhouette text,
  p_style_family text[],
  p_destination text,
  p_moment text,
  p_slot text,
  p_role text,
  p_founder_look_id uuid
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_count integer;
BEGIN
  INSERT INTO public.editorial_memory_products (
    product_url, brand, retailer, product_name, image_url,
    category, color_family, material, silhouette, style_family,
    destinations, moments, usage_count, first_used_at, last_used_at
  ) VALUES (
    p_product_url, p_brand, p_retailer, p_product_name, p_image_url,
    p_category, p_color_family, p_material, p_silhouette, COALESCE(p_style_family, '{}'),
    ARRAY[p_destination], ARRAY[p_moment], 1, now(), now()
  )
  ON CONFLICT (product_url) DO UPDATE SET
    brand = COALESCE(EXCLUDED.brand, public.editorial_memory_products.brand),
    retailer = COALESCE(EXCLUDED.retailer, public.editorial_memory_products.retailer),
    product_name = COALESCE(EXCLUDED.product_name, public.editorial_memory_products.product_name),
    image_url = COALESCE(EXCLUDED.image_url, public.editorial_memory_products.image_url),
    category = COALESCE(EXCLUDED.category, public.editorial_memory_products.category),
    color_family = COALESCE(EXCLUDED.color_family, public.editorial_memory_products.color_family),
    material = COALESCE(EXCLUDED.material, public.editorial_memory_products.material),
    silhouette = COALESCE(EXCLUDED.silhouette, public.editorial_memory_products.silhouette),
    style_family = (
      SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.editorial_memory_products.style_family, '{}') || COALESCE(EXCLUDED.style_family, '{}')))
    ),
    destinations = (
      SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.editorial_memory_products.destinations, '{}') || ARRAY[p_destination]))
    ),
    moments = (
      SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.editorial_memory_products.moments, '{}') || ARRAY[p_moment]))
    ),
    usage_count = public.editorial_memory_products.usage_count + 1,
    last_used_at = now(),
    updated_at = now();

  INSERT INTO public.editorial_memory_usages (
    product_url, founder_look_id, destination, moment, slot, role
  ) VALUES (
    p_product_url, p_founder_look_id, p_destination, p_moment, p_slot, p_role
  );

  SELECT usage_count INTO v_new_count FROM public.editorial_memory_products WHERE product_url = p_product_url;
  RETURN v_new_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_editorial_memory_usage(
  text, text, text, text, text, text, text, text, text, text[], text, text, text, text, uuid
) TO service_role;
