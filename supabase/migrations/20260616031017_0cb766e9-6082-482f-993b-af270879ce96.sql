-- Look Studio quality upgrade: aesthetic-first briefs + quality gate
ALTER TABLE public.look_candidates
  ADD COLUMN IF NOT EXISTS brief jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS quality_gate jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS retry_count integer NOT NULL DEFAULT 0;

-- Extend status enum to cover the new pipeline stages.
ALTER TABLE public.look_candidates DROP CONSTRAINT IF EXISTS look_candidates_status_chk;
ALTER TABLE public.look_candidates ADD CONSTRAINT look_candidates_status_chk
  CHECK (status = ANY (ARRAY[
    'draft','briefing','assembling','pending_muse','pending_score','pending_review',
    'approved','rejected','improving','published','failed_gate'
  ]));