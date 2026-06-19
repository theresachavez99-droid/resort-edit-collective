
-- 1. founder_reference_products
CREATE TABLE public.founder_reference_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT,
  source_url TEXT,
  brand TEXT NOT NULL,
  retailer TEXT,
  product_name TEXT,
  product_category TEXT,
  destination_tags TEXT[] NOT NULL DEFAULT '{}',
  activity_tags TEXT[] NOT NULL DEFAULT '{}',
  style_tags TEXT[] NOT NULL DEFAULT '{}',
  silhouette TEXT,
  print_language TEXT,
  color_story TEXT[] NOT NULL DEFAULT '{}',
  texture TEXT,
  founder_approved BOOLEAN NOT NULL DEFAULT true,
  approval_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  founder_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.founder_reference_products TO authenticated;
GRANT ALL ON public.founder_reference_products TO service_role;
ALTER TABLE public.founder_reference_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read founder references"
  ON public.founder_reference_products FOR SELECT TO authenticated USING (true);
CREATE TRIGGER trg_frp_updated_at BEFORE UPDATE ON public.founder_reference_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_frp_brand ON public.founder_reference_products (brand);
CREATE INDEX idx_frp_dest ON public.founder_reference_products USING GIN (destination_tags);
CREATE INDEX idx_frp_activity ON public.founder_reference_products USING GIN (activity_tags);
CREATE INDEX idx_frp_style ON public.founder_reference_products USING GIN (style_tags);

-- 2. brand_intelligence
CREATE TABLE public.brand_intelligence (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending_review',
  source TEXT,
  suggested_tier TEXT,
  suggested_activities TEXT[] NOT NULL DEFAULT '{}',
  suggested_destinations TEXT[] NOT NULL DEFAULT '{}',
  associated_destinations TEXT[] NOT NULL DEFAULT '{}',
  times_seen INTEGER NOT NULL DEFAULT 0,
  times_uploaded_by_founder INTEGER NOT NULL DEFAULT 0,
  times_selected_for_looks INTEGER NOT NULL DEFAULT 0,
  times_saved_to_library INTEGER NOT NULL DEFAULT 0,
  founder_reference_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.brand_intelligence TO authenticated;
GRANT ALL ON public.brand_intelligence TO service_role;
ALTER TABLE public.brand_intelligence ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can read brand intelligence"
  ON public.brand_intelligence FOR SELECT TO authenticated USING (true);
CREATE TRIGGER trg_bi_updated_at BEFORE UPDATE ON public.brand_intelligence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_bi_status ON public.brand_intelligence (status);

-- 3. founder_uploaded_urls
CREATE TABLE public.founder_uploaded_urls (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  source_type TEXT,
  destination_hint TEXT,
  activity_hint TEXT,
  notes TEXT,
  harvest_status TEXT NOT NULL DEFAULT 'pending',
  products_found INTEGER NOT NULL DEFAULT 0,
  brands_found INTEGER NOT NULL DEFAULT 0,
  new_brands_count INTEGER NOT NULL DEFAULT 0,
  harvest_payload JSONB,
  harvest_error TEXT,
  harvested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.founder_uploaded_urls TO service_role;
ALTER TABLE public.founder_uploaded_urls ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_fuu_updated_at BEFORE UPDATE ON public.founder_uploaded_urls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_fuu_status ON public.founder_uploaded_urls (harvest_status);

-- 4. brand_review_queue
CREATE TABLE public.brand_review_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  brand TEXT NOT NULL,
  brand_slug TEXT NOT NULL,
  times_seen INTEGER NOT NULL DEFAULT 1,
  source_urls TEXT[] NOT NULL DEFAULT '{}',
  products_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggested_tier TEXT,
  suggested_activities TEXT[] NOT NULL DEFAULT '{}',
  suggested_destinations TEXT[] NOT NULL DEFAULT '{}',
  review_status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewer_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (brand_slug)
);
GRANT ALL ON public.brand_review_queue TO service_role;
ALTER TABLE public.brand_review_queue ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_brq_updated_at BEFORE UPDATE ON public.brand_review_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_brq_status ON public.brand_review_queue (review_status);
