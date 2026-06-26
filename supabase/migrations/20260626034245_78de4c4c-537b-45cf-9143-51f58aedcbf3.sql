-- =========================================================
-- v4.7 — Product Cache
-- =========================================================
CREATE TABLE IF NOT EXISTS public.product_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_url text NOT NULL UNIQUE,
  retailer text,
  brand text NOT NULL,
  brand_id uuid NULL REFERENCES public.brands(id) ON DELETE SET NULL,
  slot_category text NOT NULL,
  product_name text,
  image_url text,
  price numeric,
  currency text,
  destination_tags text[] NOT NULL DEFAULT '{}',
  activity_tags text[] NOT NULL DEFAULT '{}',
  editorial_score numeric NOT NULL DEFAULT 0,
  quality_source text NOT NULL DEFAULT 'discovered',
    -- 'founder_approved' | 'published' | 'quality_threshold' | 'discovered'
  discovered_at timestamptz NOT NULL DEFAULT now(),
  last_verified_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz,
  times_used integer NOT NULL DEFAULT 0,
  inventory_health text NOT NULL DEFAULT 'healthy',
    -- 'healthy' | 'stale' | 'cold' | 'broken'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.product_cache TO service_role;

ALTER TABLE public.product_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "product_cache service role only"
  ON public.product_cache FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS product_cache_slot_brand_idx
  ON public.product_cache (slot_category, brand);
CREATE INDEX IF NOT EXISTS product_cache_dest_gin_idx
  ON public.product_cache USING GIN (destination_tags);
CREATE INDEX IF NOT EXISTS product_cache_activity_gin_idx
  ON public.product_cache USING GIN (activity_tags);
CREATE INDEX IF NOT EXISTS product_cache_health_verified_idx
  ON public.product_cache (inventory_health, last_verified_at);

CREATE TRIGGER product_cache_set_updated_at
  BEFORE UPDATE ON public.product_cache
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- v4.7 — Brand Promotion Signals
--   Log each time an "expansion" (non-core) brand is accepted
--   into a generated collection. Used to surface "Promote to
--   Brands I Love" recommendations only when a brand recurs.
-- =========================================================
CREATE TABLE IF NOT EXISTS public.brand_promotion_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  brand_id uuid NULL REFERENCES public.brands(id) ON DELETE SET NULL,
  slot_category text NOT NULL,
  destination text,
  activity text,
  collection_id uuid NULL,
  signal_type text NOT NULL DEFAULT 'expansion_accepted',
    -- 'expansion_accepted' | 'expansion_rejected'
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.brand_promotion_signals TO service_role;

ALTER TABLE public.brand_promotion_signals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brand_promotion_signals service role only"
  ON public.brand_promotion_signals FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS brand_promotion_signals_brand_slot_idx
  ON public.brand_promotion_signals (brand, slot_category);

-- =========================================================
-- v4.8 — Accessory Specialist registry fields on brands
-- =========================================================
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS accessory_specialist boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS approved_accessory_slots text[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS brands_accessory_slots_gin_idx
  ON public.brands USING GIN (approved_accessory_slots);

-- =========================================================
-- v4.8 — Seed initial Accessory Specialist roster
--   (Khaite, Jacques Marie Mage, DITA intentionally held back.)
-- =========================================================
DO $$
DECLARE
  spec record;
  existing_id uuid;
BEGIN
  FOR spec IN
    SELECT * FROM (VALUES
      ('Janessa Leone',  ARRAY['hat']::text[],        'core',      NULL::text[]),
      ('Lack of Color',  ARRAY['hat']::text[],        'core',      NULL::text[]),
      ('Maison Michel',  ARRAY['hat']::text[],        'core',      NULL::text[]),
      ('Eric Javits',    ARRAY['hat']::text[],        'selective', NULL::text[]),
      ('Rag & Bone',     ARRAY['hat']::text[],        'selective',
        ARRAY['raffia hats','straw hats','woven sun hats','wide-brim sun hats','packable luxury hats']::text[]),
      ('Krewe',          ARRAY['sunglasses']::text[], 'core',      NULL::text[]),
      ('Oliver Peoples', ARRAY['sunglasses']::text[], 'core',      NULL::text[]),
      ('Tom Ford',       ARRAY['sunglasses']::text[], 'core',      NULL::text[])
    ) AS t(name, slots, approval_level, families)
  LOOP
    SELECT id INTO existing_id FROM public.brands WHERE lower(name) = lower(spec.name) LIMIT 1;

    IF existing_id IS NULL THEN
      INSERT INTO public.brands (
        name, slug, status, accessory_specialist, approved_accessory_slots,
        approval_level, approved_product_families, categories
      )
      VALUES (
        spec.name,
        regexp_replace(lower(spec.name), '[^a-z0-9]+', '-', 'g'),
        'approved',
        true,
        spec.slots,
        spec.approval_level,
        COALESCE(spec.families, '{}'::text[]),
        spec.slots
      );
    ELSE
      UPDATE public.brands
      SET accessory_specialist = true,
          approved_accessory_slots =
            (SELECT array_agg(DISTINCT s) FROM unnest(
              COALESCE(approved_accessory_slots, '{}') || spec.slots
            ) s),
          approval_level = COALESCE(approval_level, spec.approval_level),
          approved_product_families = CASE
            WHEN spec.families IS NULL THEN approved_product_families
            ELSE (SELECT array_agg(DISTINCT f) FROM unnest(
              COALESCE(approved_product_families, '{}') || spec.families
            ) f)
          END,
          status = COALESCE(status, 'approved')
      WHERE id = existing_id;
    END IF;
  END LOOP;
END $$;