DROP POLICY IF EXISTS "Public can read approved brands" ON public.brand_intelligence;
REVOKE SELECT ON public.brand_intelligence FROM anon, authenticated;
GRANT ALL ON public.brand_intelligence TO service_role;