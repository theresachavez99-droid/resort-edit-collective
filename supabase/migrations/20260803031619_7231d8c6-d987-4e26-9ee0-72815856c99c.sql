CREATE TABLE public.shop_slot_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination text NOT NULL,
  moment text NOT NULL,
  look_key text NOT NULL,
  slot text NOT NULL,
  slot_label text,
  brand text NOT NULL,
  product_name text NOT NULL,
  retailer text,
  url text,
  price text,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','sold_out','unavailable','404','needs_review')),
  last_checked_at timestamptz,
  last_http_status integer,
  last_seen_available_at timestamptz,
  is_primary boolean NOT NULL DEFAULT false,
  replacement_priority integer NOT NULL DEFAULT 0,
  style_dna jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX shop_slot_products_one_primary
  ON public.shop_slot_products (look_key, slot) WHERE is_primary;
CREATE INDEX shop_slot_products_moment_slot
  ON public.shop_slot_products (moment, slot, replacement_priority);
CREATE UNIQUE INDEX shop_slot_products_unique_url
  ON public.shop_slot_products (look_key, slot, url) WHERE url IS NOT NULL;

GRANT ALL ON public.shop_slot_products TO service_role;
ALTER TABLE public.shop_slot_products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.product_replacement_candidates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_product_id uuid REFERENCES public.shop_slot_products(id) ON DELETE CASCADE,
  destination text NOT NULL,
  moment text NOT NULL,
  look_key text NOT NULL,
  slot text NOT NULL,
  brand text NOT NULL,
  product_name text NOT NULL,
  retailer text,
  pdp_url text NOT NULL,
  price text,
  matching_score numeric,
  rationale text,
  style_dna jsonb NOT NULL DEFAULT '{}'::jsonb,
  verified_at timestamptz,
  approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending','approved','rejected')),
  promoted_product_id uuid REFERENCES public.shop_slot_products(id) ON DELETE SET NULL,
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_replacement_candidates_slot
  ON public.product_replacement_candidates (look_key, slot, approval_status);

GRANT ALL ON public.product_replacement_candidates TO service_role;
ALTER TABLE public.product_replacement_candidates ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER shop_slot_products_updated_at
  BEFORE UPDATE ON public.shop_slot_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER product_replacement_candidates_updated_at
  BEFORE UPDATE ON public.product_replacement_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public display surface: only the columns the website renders.
CREATE VIEW public.public_shop_slot_display AS
SELECT
  destination,
  moment,
  look_key,
  slot,
  slot_label,
  brand,
  product_name,
  retailer,
  url,
  price,
  status,
  is_primary,
  replacement_priority
FROM public.shop_slot_products;

GRANT SELECT ON public.public_shop_slot_display TO anon, authenticated;

-- Nightcap pilot: the Darya corset PDP is dead; no approved backup exists yet.
INSERT INTO public.shop_slot_products
  (destination, moment, look_key, slot, slot_label, brand, product_name, retailer,
   url, price, status, last_checked_at, last_http_status, is_primary,
   replacement_priority, style_dna, notes)
VALUES
  ('portofino', 'nightcap', 'portofino/nightcap', 'corset', 'The Look',
   'Citizens of Humanity', 'Darya Corset Top', 'Citizens of Humanity',
   'https://www.citizensofhumanity.com/products/darya-corset-top-in-black',
   '$228', '404', now(), 404, true, 0,
   '{"category":"Corset","color":"Black","silhouette":"Fitted corset bodice","fabric":"Structured cotton blend","neckline":"Straight strapless","fit":"Body-skimming","occasion":"Evening / Nightcap","luxury_level":"contemporary-premium","editorial_notes":"Structured black corset anchoring the Nightcap evening look; replacement must keep the strapless straight neckline and clean black surface."}'::jsonb,
   'Primary PDP returns 404 (sold out / retired). Awaiting approved replacement candidate.');