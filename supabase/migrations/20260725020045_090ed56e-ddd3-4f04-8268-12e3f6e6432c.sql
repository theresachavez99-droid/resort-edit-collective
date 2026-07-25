DROP POLICY IF EXISTS "Anon read published founder_looks" ON public.founder_looks;
DROP POLICY IF EXISTS "Public can read published moments via view" ON public.moments;
REVOKE SELECT ON public.founder_looks FROM anon, authenticated;
REVOKE SELECT ON public.moments FROM anon, authenticated;