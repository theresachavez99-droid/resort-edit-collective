
-- Phase 1: Brands Registry expansion for Stylist Engine v4 (additive only)

ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS destination_strength text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS commerce_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_commerce_source text NOT NULL DEFAULT 'affiliate_retailer';

-- Constrain preferred_commerce_source values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brands_preferred_commerce_source_chk'
  ) THEN
    ALTER TABLE public.brands
      ADD CONSTRAINT brands_preferred_commerce_source_chk
      CHECK (preferred_commerce_source IN ('affiliate_retailer','brand_direct','hybrid'));
  END IF;
END$$;

COMMENT ON COLUMN public.brands.destination_strength IS
  'Editorial destination tags a brand is strong in (Mediterranean, Tropical, Coastal, Yacht, etc.). Distinct from physical destinations.';
COMMENT ON COLUMN public.brands.commerce_sources IS
  'Approved commerce channels for this brand. Array of { kind: affiliate_retailer|brand_direct|hybrid, retailers?: text[], program?: text, endpoint?: text, status: active|planned }.';
COMMENT ON COLUMN public.brands.preferred_commerce_source IS
  'Which commerce channel the Stylist Engine prefers when multiple exist.';

-- Seed: every brand without commerce_sources gets an affiliate_retailer entry
-- so v3 behavior is preserved (engine falls back to existing retailer logic).
UPDATE public.brands
SET commerce_sources = jsonb_build_array(
  jsonb_build_object(
    'kind', 'affiliate_retailer',
    'retailers', '[]'::jsonb,
    'status', 'active'
  )
)
WHERE commerce_sources = '[]'::jsonb OR commerce_sources IS NULL;
