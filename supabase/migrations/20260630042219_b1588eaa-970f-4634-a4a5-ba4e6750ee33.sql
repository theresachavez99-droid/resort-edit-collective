
ALTER TABLE public.moments
  ADD COLUMN IF NOT EXISTS legacy_day_slug TEXT,
  ADD COLUMN IF NOT EXISTS legacy_look_slug TEXT;

COMMENT ON COLUMN public.moments.legacy_day_slug IS
  'Internal: legacy day key (day-1..day-5) used server-side to join the static lookbook for sibling looks. Excluded from moments_public.';
COMMENT ON COLUMN public.moments.legacy_look_slug IS
  'Internal: legacy look key (look-a/look-b/look-c) used server-side to find the featured look entry. Excluded from moments_public.';
