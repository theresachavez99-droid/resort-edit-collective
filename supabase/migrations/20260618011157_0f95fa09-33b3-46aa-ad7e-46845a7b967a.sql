
-- Reusable archetype library (cross-destination)
CREATE TABLE public.destination_moment_archetypes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_slug text NOT NULL UNIQUE,
  archetype_name text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.destination_moment_archetypes TO anon;
GRANT SELECT ON public.destination_moment_archetypes TO authenticated;
GRANT ALL ON public.destination_moment_archetypes TO service_role;
ALTER TABLE public.destination_moment_archetypes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moment archetypes are public read"
  ON public.destination_moment_archetypes FOR SELECT
  USING (true);
CREATE TRIGGER destination_moment_archetypes_updated_at
  BEFORE UPDATE ON public.destination_moment_archetypes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Per-destination moments
CREATE TABLE public.destination_moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_slug text NOT NULL,
  moment_slug text NOT NULL,
  moment_name text NOT NULL,
  archetype_slug text REFERENCES public.destination_moment_archetypes(archetype_slug) ON DELETE SET NULL,
  time_of_day text,
  narrative text,
  styling_cues jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (destination_slug, moment_slug)
);
CREATE INDEX destination_moments_destination_idx
  ON public.destination_moments (destination_slug, sort_order);
GRANT SELECT ON public.destination_moments TO anon;
GRANT SELECT ON public.destination_moments TO authenticated;
GRANT ALL ON public.destination_moments TO service_role;
ALTER TABLE public.destination_moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "destination moments are public read"
  ON public.destination_moments FOR SELECT
  USING (active = true);
CREATE TRIGGER destination_moments_updated_at
  BEFORE UPDATE ON public.destination_moments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Tag look candidates with the moment they represent
ALTER TABLE public.look_candidates
  ADD COLUMN moment_slug text;
CREATE INDEX look_candidates_moment_idx
  ON public.look_candidates (moment_slug)
  WHERE moment_slug IS NOT NULL;
