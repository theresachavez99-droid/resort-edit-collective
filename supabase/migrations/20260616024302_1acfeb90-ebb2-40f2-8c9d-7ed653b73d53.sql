
-- Look Studio: candidates and slots
CREATE TABLE public.look_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dna_id text NOT NULL,
  destination text NOT NULL,
  day integer,
  look integer,
  variant text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  muse_image_url text,
  lookboard_image_url text,
  scoring jsonb NOT NULL DEFAULT '{}'::jsonb,
  composite_score numeric,
  feedback_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  approved_at timestamptz,
  rejected_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT look_candidates_status_chk CHECK (status IN ('draft','pending_review','approved','rejected','improving','published'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.look_candidates TO authenticated;
GRANT ALL ON public.look_candidates TO service_role;
ALTER TABLE public.look_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "look_candidates service only"
  ON public.look_candidates FOR ALL
  USING (false) WITH CHECK (false);

CREATE INDEX look_candidates_dna_idx ON public.look_candidates(dna_id);
CREATE INDEX look_candidates_status_idx ON public.look_candidates(status);

CREATE TRIGGER look_candidates_updated_at
  BEFORE UPDATE ON public.look_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.look_candidate_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id uuid NOT NULL REFERENCES public.look_candidates(id) ON DELETE CASCADE,
  slot text NOT NULL,
  sourced_product_id uuid REFERENCES public.sourced_products(id) ON DELETE SET NULL,
  vault_product_id uuid REFERENCES public.vault_products(id) ON DELETE SET NULL,
  position integer NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT look_candidate_slots_slot_chk CHECK (slot IN (
    'swimwear','dress_or_coverup','shoes','bag','earrings','necklace',
    'bracelet','ring','sunglasses','hair_detail','optional_layer'
  ))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.look_candidate_slots TO authenticated;
GRANT ALL ON public.look_candidate_slots TO service_role;
ALTER TABLE public.look_candidate_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "look_candidate_slots service only"
  ON public.look_candidate_slots FOR ALL
  USING (false) WITH CHECK (false);

CREATE INDEX look_candidate_slots_candidate_idx ON public.look_candidate_slots(candidate_id);

CREATE TRIGGER look_candidate_slots_updated_at
  BEFORE UPDATE ON public.look_candidate_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Augment sourced_products for background auto-validation
ALTER TABLE public.sourced_products
  ADD COLUMN IF NOT EXISTS auto_score jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS auto_approved boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS validation_notes text;

-- Track which approved look a vault product originated from
ALTER TABLE public.vault_products
  ADD COLUMN IF NOT EXISTS source_look_candidate_id uuid REFERENCES public.look_candidates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_slot text;
