-- 1. Narrow column-level SELECT grants on base tables (public-safe columns only)
GRANT SELECT (id, destination, slug, name, sequence, hero_image, copy, published_at, status)
  ON public.moments TO anon, authenticated;

GRANT SELECT (id, slug, title, destination, moment, style_family, color_palette, hero_urls, editorial_dna, published_at, status)
  ON public.founder_looks TO anon, authenticated;

GRANT SELECT (brand, slug, suggested_tier, suggested_activities, suggested_destinations, channel_type, status)
  ON public.brand_intelligence TO anon, authenticated;

-- 2. Row-level policies limiting public readers to published/approved rows
DROP POLICY IF EXISTS "Public can read published moments" ON public.moments;
CREATE POLICY "Public can read published moments"
  ON public.moments FOR SELECT TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Public can read published looks" ON public.founder_looks;
CREATE POLICY "Public can read published looks"
  ON public.founder_looks FOR SELECT TO anon, authenticated
  USING (published_at IS NOT NULL AND status <> 'draft');

DROP POLICY IF EXISTS "Public can read approved brands" ON public.brand_intelligence;
CREATE POLICY "Public can read approved brands"
  ON public.brand_intelligence FOR SELECT TO anon, authenticated
  USING (status = 'approved');

-- 3. Views now execute with the querying user's permissions and RLS
ALTER VIEW public.moments_public SET (security_invoker = true);
ALTER VIEW public.founder_looks_public SET (security_invoker = true);
ALTER VIEW public.brands_public SET (security_invoker = true);
