DROP POLICY IF EXISTS "Authenticated can read brand intelligence" ON public.brand_intelligence;
DROP POLICY IF EXISTS "Authenticated can read founder references" ON public.founder_reference_products;

REVOKE SELECT ON public.brand_intelligence FROM authenticated;
REVOKE SELECT ON public.founder_reference_products FROM authenticated;