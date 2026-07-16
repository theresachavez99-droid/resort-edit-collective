
-- Recreate public views as SECURITY DEFINER so anon can read curated columns
-- without direct anon SELECT on the base tables.
DROP VIEW IF EXISTS public.founder_looks_public;
DROP VIEW IF EXISTS public.brands_public;

CREATE VIEW public.founder_looks_public
WITH (security_invoker = false) AS
SELECT id, slug, title, destination, moment, style_family, color_palette,
       hero_urls, editorial_dna, published_at
FROM public.founder_looks
WHERE published_at IS NOT NULL AND status <> 'draft';

CREATE VIEW public.brands_public
WITH (security_invoker = false) AS
SELECT brand, slug, suggested_tier, suggested_activities,
       suggested_destinations, channel_type
FROM public.brand_intelligence
WHERE status = 'approved';

GRANT SELECT ON public.founder_looks_public TO anon, authenticated;
GRANT SELECT ON public.brands_public TO anon, authenticated;

-- Remove direct anon SELECT policies on the base tables.
DROP POLICY IF EXISTS "Public can read approved brands" ON public.brand_intelligence;
DROP POLICY IF EXISTS "Public can read published founder_looks" ON public.founder_looks;

-- Revoke any residual anon table grants; views serve public reads now.
REVOKE SELECT ON public.brand_intelligence FROM anon;
REVOKE SELECT ON public.founder_looks FROM anon;
