
CREATE TABLE public.vault_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  brand text NOT NULL,
  retailer text,
  affiliate_url text NOT NULL,
  brand_url text,
  image_url text,
  thumbnail_url text,
  price numeric,
  currency text DEFAULT 'USD',
  inventory_status text NOT NULL DEFAULT 'unknown'
    CHECK (inventory_status IN ('in_stock','low_stock','out_of_stock','unknown')),
  category text NOT NULL,
  subcategory text,
  destination_tags text[] NOT NULL DEFAULT '{}',
  activity_tags text[] NOT NULL DEFAULT '{}',
  color_tags text[] NOT NULL DEFAULT '{}',
  print_tags text[] NOT NULL DEFAULT '{}',
  material_tags text[] NOT NULL DEFAULT '{}',
  silhouette_tags text[] NOT NULL DEFAULT '{}',
  luxury_score numeric CHECK (luxury_score IS NULL OR (luxury_score >= 0 AND luxury_score <= 10)),
  resort_edit_score numeric CHECK (resort_edit_score IS NULL OR (resort_edit_score >= 0 AND resort_edit_score <= 10)),
  approval_status text NOT NULL DEFAULT 'pending'
    CHECK (approval_status IN ('pending','approved','rejected','archived')),
  source_sourced_product_id uuid REFERENCES public.sourced_products(id) ON DELETE SET NULL,
  notes text,
  last_verified_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT vault_products_affiliate_url_unique UNIQUE (affiliate_url)
);

GRANT ALL ON public.vault_products TO service_role;

ALTER TABLE public.vault_products ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_vault_products_status ON public.vault_products (approval_status);
CREATE INDEX idx_vault_products_category ON public.vault_products (category);
CREATE INDEX idx_vault_products_inventory ON public.vault_products (inventory_status);
CREATE INDEX idx_vault_products_destination_tags ON public.vault_products USING GIN (destination_tags);
CREATE INDEX idx_vault_products_activity_tags ON public.vault_products USING GIN (activity_tags);

CREATE TRIGGER update_vault_products_updated_at
  BEFORE UPDATE ON public.vault_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
