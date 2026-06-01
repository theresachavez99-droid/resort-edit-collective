
CREATE TABLE public.sourced_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text NOT NULL,
  retailer_domain text,
  day integer,
  look integer,
  slot_category text,
  brand text,
  product_name text,
  price numeric,
  currency text,
  image_url text,
  affiliate_url text,
  raw_extraction jsonb,
  status text NOT NULL DEFAULT 'queued',
  notes text,
  scraped_at timestamptz,
  promoted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sourced_products_status_check CHECK (status IN ('queued','scraped','approved','promoted','failed','rejected'))
);

CREATE INDEX idx_sourced_products_status ON public.sourced_products(status);
CREATE INDEX idx_sourced_products_day_look ON public.sourced_products(day, look);
CREATE INDEX idx_sourced_products_source_url ON public.sourced_products(source_url);

-- Admin-only table: only service_role (server functions) can access it.
GRANT ALL ON public.sourced_products TO service_role;

ALTER TABLE public.sourced_products ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated => no public access. Service role bypasses RLS.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sourced_products_updated_at
BEFORE UPDATE ON public.sourced_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
