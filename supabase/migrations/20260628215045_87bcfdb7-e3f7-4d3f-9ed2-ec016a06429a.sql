
CREATE TABLE public.founder_hero_outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.buying_search_sessions(id) ON DELETE CASCADE,
  destination TEXT NOT NULL,
  moment TEXT NOT NULL,
  look_number INTEGER,
  title TEXT,
  primary_brand TEXT,
  retailers TEXT[] NOT NULL DEFAULT '{}',
  editorial_dna JSONB NOT NULL DEFAULT '{}'::jsonb,
  color_palette TEXT[] NOT NULL DEFAULT '{}',
  silhouette TEXT,
  activity TEXT,
  preview_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  founder_look_id UUID,
  founder_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  promoted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.founder_hero_outfits TO service_role;

ALTER TABLE public.founder_hero_outfits ENABLE ROW LEVEL SECURITY;

-- Deny-all by default (admin uses service-role only); no policies needed.

CREATE INDEX idx_fho_session ON public.founder_hero_outfits(session_id);
CREATE INDEX idx_fho_status ON public.founder_hero_outfits(status);

CREATE TRIGGER trg_fho_updated_at
BEFORE UPDATE ON public.founder_hero_outfits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Extend buying_candidates
ALTER TABLE public.buying_candidates
  ADD COLUMN IF NOT EXISTS hero_outfit_id UUID REFERENCES public.founder_hero_outfits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_hero_garment BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stylist_slot TEXT,
  ADD COLUMN IF NOT EXISTS stylist_source TEXT NOT NULL DEFAULT 'founder_url',
  ADD COLUMN IF NOT EXISTS selected_for_look BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_bc_hero_outfit ON public.buying_candidates(hero_outfit_id);
CREATE INDEX IF NOT EXISTS idx_bc_stylist_slot ON public.buying_candidates(hero_outfit_id, stylist_slot);
