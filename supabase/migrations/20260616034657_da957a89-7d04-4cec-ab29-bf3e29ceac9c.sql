ALTER TABLE public.look_candidate_slots
  ADD COLUMN IF NOT EXISTS resolved_source_id uuid REFERENCES public.product_sources(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS resolution_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS resolved_at timestamp with time zone;

ALTER TABLE public.look_candidate_slots
  DROP CONSTRAINT IF EXISTS look_candidate_slots_resolution_status_check;
ALTER TABLE public.look_candidate_slots
  ADD CONSTRAINT look_candidate_slots_resolution_status_check
  CHECK (resolution_status IN ('unknown','primary_active','switched_to_alternate','using_alternative','needs_review'));

CREATE INDEX IF NOT EXISTS look_candidate_slots_resolution_status_idx
  ON public.look_candidate_slots(resolution_status);