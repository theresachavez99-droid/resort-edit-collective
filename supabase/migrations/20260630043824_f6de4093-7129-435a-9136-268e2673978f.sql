-- Allow the public read path through moments_public.
-- Views run RLS as the invoker (anon), so we need a policy on the
-- underlying `moments` table. anon has NO table-level GRANT on
-- `moments`, so direct reads still fail; this policy only takes effect
-- when reached through the safe `moments_public` view (which is owned
-- by postgres and projects 8 non-sensitive columns).
CREATE POLICY "Public can read published moments via view"
  ON public.moments
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');