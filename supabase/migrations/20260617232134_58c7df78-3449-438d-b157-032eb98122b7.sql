
CREATE TABLE public.editorial_reference_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'instagram',
  reference_image TEXT,
  reference_url TEXT,

  destination TEXT,
  activity TEXT,
  mood TEXT,
  occasion TEXT,
  editorial_story TEXT,

  color_story TEXT,
  hero_piece TEXT,
  hero_piece_category TEXT,
  supporting_pieces JSONB NOT NULL DEFAULT '[]'::jsonb,

  accessory_strategy TEXT,
  silhouette_strategy TEXT,
  texture_strategy TEXT,

  destination_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  luxury_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  saveability_drivers JSONB NOT NULL DEFAULT '[]'::jsonb,

  learned_patterns TEXT,
  editorial_tags JSONB NOT NULL DEFAULT '[]'::jsonb,

  brands_detected JSONB NOT NULL DEFAULT '[]'::jsonb,
  price_tier_mix JSONB NOT NULL DEFAULT '{}'::jsonb,
  category_mix JSONB NOT NULL DEFAULT '{}'::jsonb,

  raw_extraction JSONB NOT NULL DEFAULT '{}'::jsonb,

  extraction_status TEXT NOT NULL DEFAULT 'pending',
  extraction_error TEXT,
  extracted_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.editorial_reference_library TO anon;
GRANT SELECT ON public.editorial_reference_library TO authenticated;
GRANT ALL ON public.editorial_reference_library TO service_role;

ALTER TABLE public.editorial_reference_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Editorial references are publicly readable"
  ON public.editorial_reference_library
  FOR SELECT
  USING (true);

CREATE TRIGGER update_editorial_reference_library_updated_at
  BEFORE UPDATE ON public.editorial_reference_library
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX editorial_reference_library_destination_idx
  ON public.editorial_reference_library (destination);
CREATE INDEX editorial_reference_library_activity_idx
  ON public.editorial_reference_library (activity);
CREATE INDEX editorial_reference_library_status_idx
  ON public.editorial_reference_library (extraction_status);
