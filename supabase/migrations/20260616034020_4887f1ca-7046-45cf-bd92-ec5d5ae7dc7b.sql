
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  brand text NOT NULL,
  product_name text NOT NULL,
  category text,
  subcategory text,
  color text,
  color_family text,
  silhouette text,
  fabric text,
  texture text,
  print_family text,
  image_url text,
  destination_tags text[] NOT NULL DEFAULT '{}',
  activity_tags text[] NOT NULL DEFAULT '{}',
  luxury_score numeric,
  resort_edit_score numeric,
  approval_status text NOT NULL DEFAULT 'approved'
    CHECK (approval_status IN ('pending','approved','rejected','archived')),
  identity_key text NOT NULL UNIQUE,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX products_brand_id_idx ON public.products(brand_id);
CREATE INDEX products_category_idx ON public.products(category);
CREATE INDEX products_destination_tags_idx ON public.products USING gin(destination_tags);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved products" ON public.products FOR SELECT USING (approval_status = 'approved');
CREATE POLICY "Service role full products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.product_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  retailer text NOT NULL,
  retailer_domain text,
  source_url text NOT NULL,
  affiliate_url text,
  price numeric,
  currency text DEFAULT 'USD',
  availability text NOT NULL DEFAULT 'unknown'
    CHECK (availability IN ('in_stock','low_stock','out_of_stock','unknown')),
  is_primary boolean NOT NULL DEFAULT false,
  last_checked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, retailer)
);
CREATE INDEX product_sources_product_id_idx ON public.product_sources(product_id);
CREATE INDEX product_sources_primary_idx ON public.product_sources(product_id) WHERE is_primary = true;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_sources TO authenticated;
GRANT SELECT ON public.product_sources TO anon;
GRANT ALL ON public.product_sources TO service_role;
ALTER TABLE public.product_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read sources" ON public.product_sources FOR SELECT USING (true);
CREATE POLICY "Service role full sources" ON public.product_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_product_sources_updated_at BEFORE UPDATE ON public.product_sources
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.destination_muses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL UNIQUE,
  muse_name text NOT NULL,
  reference_url text NOT NULL,
  face_description text NOT NULL,
  style_guardrails text NOT NULL DEFAULT '',
  allowed_variation text NOT NULL DEFAULT 'outfit, accessories, hairstyle, expression, pose, environment',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.destination_muses TO authenticated;
GRANT SELECT ON public.destination_muses TO anon;
GRANT ALL ON public.destination_muses TO service_role;
ALTER TABLE public.destination_muses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read muses" ON public.destination_muses FOR SELECT USING (true);
CREATE POLICY "Service role full muses" ON public.destination_muses FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_destination_muses_updated_at BEFORE UPDATE ON public.destination_muses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.destination_muses (destination_slug, muse_name, reference_url, face_description, style_guardrails)
VALUES (
  'portofino',
  'Lilla',
  'https://resort-edit-collective.lovable.app/__l5e/assets-v1/0809887d-2002-462e-96a4-ac33d45ada2e/cira-1.png',
  'Mediterranean luxury muse Lilla. Mid-20s to early 30s, warm olive-tan skin, soft oval face with high cheekbones, almond-shaped hazel eyes, naturally arched brows, full lips with subtle natural matte finish, fine straight nose, slender neck. Long dark chestnut-brown hair, glossy and slightly tousled. Slim athletic body, approximately 5 feet 9 inches, long limbs. Quiet, composed expression — never overtly posed.',
  'CRITICAL: preserve facial structure, skin tone, age range, body proportions, and overall identity across every Portofino look. Vary ONLY outfit, accessories, hairstyle styling, expression, pose, and environment. No different model. No round face. No blonde hair. No different ethnicity. Editorial Net-a-Porter / Moda Operandi quality. No text overlays.'
);

ALTER TABLE public.look_candidate_slots
  ADD COLUMN IF NOT EXISTS product_id uuid REFERENCES public.products(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS look_candidate_slots_product_id_idx ON public.look_candidate_slots(product_id);

ALTER TABLE public.look_candidates
  ADD COLUMN IF NOT EXISTS failure_reason text;

-- Backfill
INSERT INTO public.products (
  brand_id, brand, product_name, category, subcategory, color_family,
  silhouette, fabric, texture, print_family, image_url,
  destination_tags, activity_tags, luxury_score, resort_edit_score,
  approval_status, identity_key, created_at, updated_at
)
SELECT
  v.brand_id, v.brand, v.product_name, v.category, v.subcategory, v.color_family,
  v.silhouette, v.fabric, v.texture, v.print_family, v.image_url,
  v.destination_tags, v.activity_tags, v.luxury_score, v.resort_edit_score,
  CASE WHEN v.approval_status IN ('approved','pending','rejected','archived') THEN v.approval_status ELSE 'approved' END,
  lower(trim(v.brand)) || '::' || lower(trim(v.product_name)),
  v.created_at, v.updated_at
FROM public.vault_products v
WHERE v.brand IS NOT NULL AND v.product_name IS NOT NULL
ON CONFLICT (identity_key) DO NOTHING;

INSERT INTO public.product_sources (
  product_id, retailer, retailer_domain, source_url, affiliate_url,
  price, currency, availability, is_primary, last_checked_at, created_at, updated_at
)
SELECT
  p.id,
  COALESCE(v.retailer, 'unknown'),
  v.retailer,
  COALESCE(v.direct_product_url, v.affiliate_url),
  v.affiliate_url,
  v.price,
  COALESCE(v.currency, 'USD'),
  CASE WHEN v.inventory_status IN ('in_stock','low_stock','out_of_stock','unknown') THEN v.inventory_status ELSE 'unknown' END,
  true,
  v.last_verified_at,
  v.created_at,
  v.updated_at
FROM public.vault_products v
JOIN public.products p ON p.identity_key = lower(trim(v.brand)) || '::' || lower(trim(v.product_name))
ON CONFLICT (product_id, retailer) DO NOTHING;

-- Link slots through vault_product_id
UPDATE public.look_candidate_slots s
SET product_id = p.id
FROM public.vault_products v
JOIN public.products p ON p.identity_key = lower(trim(v.brand)) || '::' || lower(trim(v.product_name))
WHERE s.vault_product_id = v.id
  AND s.product_id IS NULL;

-- Link slots through sourced_product → vault_product
UPDATE public.look_candidate_slots s
SET product_id = p.id
FROM public.vault_products v
JOIN public.products p ON p.identity_key = lower(trim(v.brand)) || '::' || lower(trim(v.product_name))
WHERE v.source_sourced_product_id = s.sourced_product_id
  AND s.product_id IS NULL;
