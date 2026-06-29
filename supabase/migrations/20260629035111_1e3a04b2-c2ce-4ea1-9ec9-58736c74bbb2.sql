ALTER TABLE public.founder_hero_outfits
  ADD COLUMN IF NOT EXISTS custom_components jsonb NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS buying_candidates_session_status_idx
  ON public.buying_candidates (session_id, status);