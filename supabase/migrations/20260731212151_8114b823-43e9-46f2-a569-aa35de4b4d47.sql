DROP VIEW IF EXISTS public.moments_public;
CREATE VIEW public.moments_public
WITH (security_invoker = false) AS
  SELECT id, destination, slug, name, sequence, hero_image, copy, published_at
  FROM public.moments
  WHERE status = 'published';

DROP VIEW IF EXISTS public.founder_looks_public;
CREATE VIEW public.founder_looks_public
WITH (security_invoker = false) AS
  SELECT id, slug, title, destination, moment, style_family, color_palette,
         hero_urls, editorial_dna, published_at
  FROM public.founder_looks
  WHERE published_at IS NOT NULL AND status <> 'draft';

DROP VIEW IF EXISTS public.brands_public;
CREATE VIEW public.brands_public
WITH (security_invoker = false) AS
  SELECT brand, slug, suggested_tier, suggested_activities,
         suggested_destinations, channel_type
  FROM public.brand_intelligence
  WHERE status = 'approved';

ALTER VIEW public.moments_public OWNER TO postgres;
ALTER VIEW public.founder_looks_public OWNER TO postgres;
ALTER VIEW public.brands_public OWNER TO postgres;

GRANT SELECT ON public.moments_public TO anon, authenticated;
GRANT SELECT ON public.founder_looks_public TO anon, authenticated;
GRANT SELECT ON public.brands_public TO anon, authenticated;