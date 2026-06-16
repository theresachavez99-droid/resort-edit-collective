
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS destinations text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS retailer_hints jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_hero boolean NOT NULL DEFAULT false;

ALTER TABLE public.sourced_products
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS destination_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS activity_tags text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS silhouette text,
  ADD COLUMN IF NOT EXISTS fabric text,
  ADD COLUMN IF NOT EXISTS texture text,
  ADD COLUMN IF NOT EXISTS print_family text,
  ADD COLUMN IF NOT EXISTS color_family text;

CREATE INDEX IF NOT EXISTS sourced_products_brand_id_idx ON public.sourced_products(brand_id);
CREATE INDEX IF NOT EXISTS sourced_products_category_idx ON public.sourced_products(category);
CREATE INDEX IF NOT EXISTS sourced_products_destination_tags_idx ON public.sourced_products USING gin(destination_tags);
CREATE INDEX IF NOT EXISTS sourced_products_activity_tags_idx ON public.sourced_products USING gin(activity_tags);

ALTER TABLE public.vault_products
  ADD COLUMN IF NOT EXISTS silhouette text,
  ADD COLUMN IF NOT EXISTS fabric text,
  ADD COLUMN IF NOT EXISTS texture text,
  ADD COLUMN IF NOT EXISTS print_family text,
  ADD COLUMN IF NOT EXISTS color_family text;

CREATE TABLE IF NOT EXISTS public.brand_crawl_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id uuid NOT NULL REFERENCES public.brands(id) ON DELETE CASCADE,
  retailer_domain text NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'queued',
  requested_count int NOT NULL DEFAULT 0,
  scraped_count int NOT NULL DEFAULT 0,
  skipped_count int NOT NULL DEFAULT 0,
  failed_count int NOT NULL DEFAULT 0,
  listing_url text,
  cursor text,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.brand_crawl_jobs TO service_role;
ALTER TABLE public.brand_crawl_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin service role only" ON public.brand_crawl_jobs FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TRIGGER update_brand_crawl_jobs_updated_at
  BEFORE UPDATE ON public.brand_crawl_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
