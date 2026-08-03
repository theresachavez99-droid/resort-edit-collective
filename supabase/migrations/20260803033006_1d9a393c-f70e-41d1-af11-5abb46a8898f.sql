ALTER TABLE public.shop_slot_products
  ADD COLUMN IF NOT EXISTS look_kind text NOT NULL DEFAULT 'hero',
  ADD COLUMN IF NOT EXISTS look_title text,
  ADD COLUMN IF NOT EXISTS slot_order integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS registry_source text NOT NULL DEFAULT 'manual';

DO $$ BEGIN
  ALTER TABLE public.shop_slot_products
    ADD CONSTRAINT shop_slot_products_look_kind_check
    CHECK (look_kind IN ('hero','editorial'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.product_replacement_candidates
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS look_impact text,
  ADD COLUMN IF NOT EXISTS availability_verdict text,
  ADD COLUMN IF NOT EXISTS availability_http_status integer,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS prompt_version text,
  ADD COLUMN IF NOT EXISTS generated_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS generation_batch uuid,
  ADD COLUMN IF NOT EXISTS approval_history jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS shop_slot_products_destination_idx
  ON public.shop_slot_products (destination, moment, look_key, slot);
CREATE INDEX IF NOT EXISTS product_replacement_candidates_batch_idx
  ON public.product_replacement_candidates (generation_batch);
CREATE INDEX IF NOT EXISTS product_replacement_candidates_slot_idx
  ON public.product_replacement_candidates (look_key, slot, approval_status);