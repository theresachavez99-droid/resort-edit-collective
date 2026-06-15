ALTER TABLE public.vault_products
  ADD COLUMN IF NOT EXISTS direct_product_url text,
  ADD COLUMN IF NOT EXISTS image_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS source_method text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS vault_products_brand_id_idx ON public.vault_products(brand_id);
CREATE INDEX IF NOT EXISTS vault_products_image_status_idx ON public.vault_products(image_status);
CREATE INDEX IF NOT EXISTS vault_products_source_method_idx ON public.vault_products(source_method);