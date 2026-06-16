
ALTER TABLE public.look_candidates
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS why_it_works TEXT,
  ADD COLUMN IF NOT EXISTS best_for TEXT[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS resort_edit_tip TEXT,
  ADD COLUMN IF NOT EXISTS pack_instead_of TEXT,
  ADD COLUMN IF NOT EXISTS whats_in_her_bag JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS editorial_generated_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS look_candidates_slug_uidx ON public.look_candidates(slug) WHERE slug IS NOT NULL;

ALTER TABLE public.vault_products
  ADD COLUMN IF NOT EXISTS product_type TEXT,
  ADD COLUMN IF NOT EXISTS category_fallback_url TEXT,
  ADD COLUMN IF NOT EXISTS ai_replacements JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS replacements_generated_at TIMESTAMPTZ;
