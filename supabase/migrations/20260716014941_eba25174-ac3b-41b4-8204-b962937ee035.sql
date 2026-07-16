
-- 1) Narrow anon SELECT policies on the source tables (RLS is already enabled)
CREATE POLICY "Public can read published founder_looks"
  ON public.founder_looks FOR SELECT
  TO anon
  USING (published_at IS NOT NULL AND status <> 'draft');

CREATE POLICY "Public can read approved brands"
  ON public.brand_intelligence FOR SELECT
  TO anon
  USING (status = 'approved');

-- 2) Safe, column-projected public views (security_invoker so anon RLS is honoured)
CREATE OR REPLACE VIEW public.founder_looks_public
WITH (security_invoker = true) AS
SELECT
  id,
  slug,
  title,
  destination,
  moment,
  style_family,
  color_palette,
  hero_urls,
  editorial_dna,
  published_at
FROM public.founder_looks
WHERE published_at IS NOT NULL AND status <> 'draft';

CREATE OR REPLACE VIEW public.brands_public
WITH (security_invoker = true) AS
SELECT
  brand,
  slug,
  status,
  suggested_tier,
  suggested_activities,
  suggested_destinations,
  channel_type
FROM public.brand_intelligence
WHERE status = 'approved';

GRANT SELECT ON public.founder_looks_public TO anon, authenticated;
GRANT SELECT ON public.brands_public TO anon, authenticated;
