-- Switch public views to SECURITY INVOKER and add narrow anon RLS on underlying tables

ALTER VIEW public.founder_looks_public SET (security_invoker = true);
ALTER VIEW public.brands_public SET (security_invoker = true);

-- Underlying table grants (RLS still filters)
GRANT SELECT (id, slug, title, destination, moment, style_family, color_palette, hero_urls, editorial_dna, published_at, status)
  ON public.founder_looks TO anon;
GRANT SELECT (brand, slug, suggested_tier, suggested_activities, suggested_destinations, channel_type, status)
  ON public.brand_intelligence TO anon;

-- Narrow anon SELECT policies limited to published/approved rows
DROP POLICY IF EXISTS "Anon read published founder_looks" ON public.founder_looks;
CREATE POLICY "Anon read published founder_looks"
  ON public.founder_looks
  FOR SELECT
  TO anon
  USING (published_at IS NOT NULL AND status <> 'draft');

DROP POLICY IF EXISTS "Anon read approved brand_intelligence" ON public.brand_intelligence;
CREATE POLICY "Anon read approved brand_intelligence"
  ON public.brand_intelligence
  FOR SELECT
  TO anon
  USING (status = 'approved');

-- Ensure anon can read from the views themselves
GRANT SELECT ON public.founder_looks_public TO anon, authenticated;
GRANT SELECT ON public.brands_public TO anon, authenticated;