ALTER TABLE public.destination_moment_archetypes
  ADD COLUMN IF NOT EXISTS moment_type text NOT NULL DEFAULT 'core',
  ADD COLUMN IF NOT EXISTS destination_required boolean NOT NULL DEFAULT true;

ALTER TABLE public.destination_moment_archetypes
  DROP CONSTRAINT IF EXISTS destination_moment_archetypes_moment_type_check;
ALTER TABLE public.destination_moment_archetypes
  ADD CONSTRAINT destination_moment_archetypes_moment_type_check
  CHECK (moment_type IN ('core','optional'));

UPDATE public.destination_moment_archetypes
SET moment_type = 'optional', destination_required = false
WHERE archetype_slug IN ('beach-club-lunch','villa-dinner','shopping-afternoon','boat-excursion');

UPDATE public.destination_moment_archetypes
SET moment_type = 'core', destination_required = true
WHERE archetype_slug IN ('arrival','market-morning','yacht-day','harbor-aperitivo','sunset-views','riviera-dinner');