ALTER TABLE public.subscribers
  ADD COLUMN IF NOT EXISTS consent_at timestamptz NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS consent_source text,
  ADD COLUMN IF NOT EXISTS reactivated_at timestamptz,
  ADD COLUMN IF NOT EXISTS welcome_state text NOT NULL DEFAULT 'blocked_no_provider',
  ADD COLUMN IF NOT EXISTS welcome_sent_at timestamptz;

ALTER TABLE public.subscribers
  DROP CONSTRAINT IF EXISTS subscribers_welcome_state_check;
ALTER TABLE public.subscribers
  ADD CONSTRAINT subscribers_welcome_state_check
  CHECK (welcome_state IN ('blocked_no_provider','pending','sent','failed'));

UPDATE public.subscribers
SET consent_source = COALESCE(consent_source, cta_source),
    consent_at = COALESCE(consent_at, created_at)
WHERE consent_source IS NULL;