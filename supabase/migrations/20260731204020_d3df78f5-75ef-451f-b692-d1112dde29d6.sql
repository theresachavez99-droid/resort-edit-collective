DROP POLICY IF EXISTS "moment archetypes are public read" ON public.destination_moment_archetypes;
DROP POLICY IF EXISTS "destination moments are public read" ON public.destination_moments;

CREATE POLICY "moment archetypes authenticated read"
ON public.destination_moment_archetypes
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "destination moments authenticated read"
ON public.destination_moments
FOR SELECT TO authenticated
USING (active = true);

REVOKE SELECT ON public.destination_moment_archetypes FROM anon;
REVOKE SELECT ON public.destination_moments FROM anon;
GRANT SELECT ON public.destination_moment_archetypes TO authenticated;
GRANT SELECT ON public.destination_moments TO authenticated;
GRANT ALL ON public.destination_moment_archetypes TO service_role;
GRANT ALL ON public.destination_moments TO service_role;