DROP POLICY IF EXISTS "Public read of canonical day images" ON public.canonical_day_images;
REVOKE SELECT ON public.canonical_day_images FROM anon, authenticated;
GRANT ALL ON public.canonical_day_images TO service_role;