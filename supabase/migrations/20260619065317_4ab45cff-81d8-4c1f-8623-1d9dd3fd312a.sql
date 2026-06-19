DROP POLICY IF EXISTS "Public read approved products" ON public.products;
DROP POLICY IF EXISTS "Public read sources" ON public.product_sources;
DROP POLICY IF EXISTS "Public read muses" ON public.destination_muses;
REVOKE SELECT ON public.products FROM anon, authenticated;
REVOKE SELECT ON public.product_sources FROM anon, authenticated;
REVOKE SELECT ON public.destination_muses FROM anon, authenticated;