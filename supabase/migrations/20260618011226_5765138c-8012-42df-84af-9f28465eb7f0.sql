
CREATE POLICY "archetypes no client writes" ON public.destination_moment_archetypes
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "archetypes no client updates" ON public.destination_moment_archetypes
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "archetypes no client deletes" ON public.destination_moment_archetypes
  FOR DELETE TO anon, authenticated USING (false);

CREATE POLICY "moments no client writes" ON public.destination_moments
  FOR INSERT TO anon, authenticated WITH CHECK (false);
CREATE POLICY "moments no client updates" ON public.destination_moments
  FOR UPDATE TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY "moments no client deletes" ON public.destination_moments
  FOR DELETE TO anon, authenticated USING (false);
