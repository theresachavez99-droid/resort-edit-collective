CREATE TABLE public.look_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  look_key text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  item_name text NOT NULL,
  brand_name text NOT NULL,
  brand_slug text,
  price_display text,
  currency text NOT NULL DEFAULT 'USD',
  image_url text,
  affiliate_url text,
  retailer_name text,
  network text NOT NULL DEFAULT 'direct',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT look_items_network_check CHECK (network IN ('shopmy','ltk','sovrn','direct'))
);

CREATE INDEX look_items_look_key_idx ON public.look_items (look_key, sort_order);

ALTER TABLE public.look_items ENABLE ROW LEVEL SECURITY;

GRANT ALL ON public.look_items TO service_role;

CREATE OR REPLACE VIEW public.look_items_public
WITH (security_invoker = true) AS
SELECT
  look_key,
  sort_order,
  item_name,
  brand_name,
  brand_slug,
  price_display,
  currency,
  image_url,
  affiliate_url,
  retailer_name
FROM public.look_items
WHERE is_active = true;

CREATE POLICY "Public read of active look items"
  ON public.look_items
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

GRANT SELECT (
  look_key, sort_order, item_name, brand_name, brand_slug,
  price_display, currency, image_url, affiliate_url, retailer_name
) ON public.look_items TO anon, authenticated;

GRANT SELECT ON public.look_items_public TO anon, authenticated;

CREATE TRIGGER look_items_updated_at
  BEFORE UPDATE ON public.look_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();