
-- Canonical day images: published, public-readable
CREATE TABLE public.canonical_day_images (
  day_slug TEXT PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_source TEXT NOT NULL DEFAULT 'canonical_day_image',
  original_filename TEXT,
  notes TEXT,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.canonical_day_images TO anon, authenticated;
GRANT ALL ON public.canonical_day_images TO service_role;
ALTER TABLE public.canonical_day_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read of canonical day images"
ON public.canonical_day_images FOR SELECT
TO anon, authenticated
USING (true);

CREATE TRIGGER canonical_day_images_updated_at
BEFORE UPDATE ON public.canonical_day_images
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Staged uploads: server-only (founder review queue)
CREATE TABLE public.day_image_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_slug TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_source TEXT NOT NULL DEFAULT 'founder_upload_pending',
  original_filename TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.day_image_uploads TO service_role;
ALTER TABLE public.day_image_uploads ENABLE ROW LEVEL SECURITY;
-- No policies => deny-by-default for anon/authenticated.

CREATE TRIGGER day_image_uploads_updated_at
BEFORE UPDATE ON public.day_image_uploads
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX day_image_uploads_day_status_idx
  ON public.day_image_uploads (day_slug, status, created_at DESC);
