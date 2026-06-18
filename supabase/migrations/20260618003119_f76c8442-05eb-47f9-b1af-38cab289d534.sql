ALTER TABLE public.editorial_reference_library
  ADD COLUMN IF NOT EXISTS collection TEXT NOT NULL DEFAULT 'core-stylist-references',
  ADD COLUMN IF NOT EXISTS reference_type TEXT,
  ADD COLUMN IF NOT EXISTS editorial_priority TEXT NOT NULL DEFAULT 'standard',
  ADD COLUMN IF NOT EXISTS engagement_unlock_keyword TEXT;

CREATE INDEX IF NOT EXISTS editorial_reference_library_collection_idx
  ON public.editorial_reference_library (collection);
CREATE INDEX IF NOT EXISTS editorial_reference_library_priority_idx
  ON public.editorial_reference_library (editorial_priority);