DROP POLICY IF EXISTS "Editorial references are publicly readable" ON public.editorial_reference_library;
REVOKE SELECT ON public.editorial_reference_library FROM anon;
REVOKE SELECT ON public.editorial_reference_library FROM authenticated;