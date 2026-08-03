-- 1. Security: make the public product display view respect the querying user's permissions.
ALTER VIEW public.public_shop_slot_display SET (security_invoker = true);

-- 2. Richer failure classification for sitewide audits.
ALTER TABLE public.shop_slot_products
  DROP CONSTRAINT IF EXISTS shop_slot_products_status_check;
ALTER TABLE public.shop_slot_products
  ADD CONSTRAINT shop_slot_products_status_check CHECK (
    status = ANY (ARRAY[
      'active','sold_out','unavailable','404',
      'non_product_url','title_mismatch','blocked_or_inconclusive','needs_review'
    ])
  );

ALTER TABLE public.shop_slot_products
  ADD COLUMN IF NOT EXISTS last_final_url text,
  ADD COLUMN IF NOT EXISTS last_audit_verdict text,
  ADD COLUMN IF NOT EXISTS last_audit_detail jsonb NOT NULL DEFAULT '{}'::jsonb;

-- 3. Audit runs.
CREATE TABLE IF NOT EXISTS public.product_audit_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  scope text NOT NULL DEFAULT 'sitewide',
  destination text,
  moment text,
  look_key text,
  triggered_by text NOT NULL DEFAULT 'admin',
  urls_audited integer NOT NULL DEFAULT 0,
  unique_urls integer NOT NULL DEFAULT 0,
  counts jsonb NOT NULL DEFAULT '{}'::jsonb,
  auto_promoted integer NOT NULL DEFAULT 0,
  awaiting_styling integer NOT NULL DEFAULT 0,
  report jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  finished_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.product_audit_runs TO service_role;
ALTER TABLE public.product_audit_runs ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER product_audit_runs_updated_at
  BEFORE UPDATE ON public.product_audit_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Audit log: every automated promotion, suppression and manual approval.
CREATE TABLE IF NOT EXISTS public.product_audit_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid REFERENCES public.product_audit_runs(id) ON DELETE SET NULL,
  slot_product_id uuid REFERENCES public.shop_slot_products(id) ON DELETE SET NULL,
  candidate_id uuid REFERENCES public.product_replacement_candidates(id) ON DELETE SET NULL,
  destination text,
  moment text,
  look_key text NOT NULL,
  slot text NOT NULL,
  event_type text NOT NULL,
  actor text NOT NULL DEFAULT 'system',
  from_status text,
  to_status text,
  from_url text,
  to_url text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.product_audit_events TO service_role;
ALTER TABLE public.product_audit_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS product_audit_events_run_idx
  ON public.product_audit_events (run_id, created_at DESC);
CREATE INDEX IF NOT EXISTS product_audit_events_look_idx
  ON public.product_audit_events (look_key, slot, created_at DESC);