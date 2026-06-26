
-- 1. Featured Editorial Collection refinement
ALTER TABLE public.editorial_collections
  ADD COLUMN IF NOT EXISTS season text,
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS featured_look_id uuid;

-- Only one featured collection per (destination, activity).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_featured_per_activity
  ON public.editorial_collections (destination, activity)
  WHERE featured = true;

CREATE INDEX IF NOT EXISTS idx_collections_published
  ON public.editorial_collections (status, published_at DESC);

-- 2. Product lifecycle fields on slots
ALTER TABLE public.editorial_collection_look_slots
  ADD COLUMN IF NOT EXISTS health_status text NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS last_health_check_at timestamptz,
  ADD COLUMN IF NOT EXISTS health_attempts integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fallback_active boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS original_source_url text;

CREATE INDEX IF NOT EXISTS idx_slots_health
  ON public.editorial_collection_look_slots (health_status, last_health_check_at);

-- 3. Inventory health events — append-only audit trail
CREATE TABLE IF NOT EXISTS public.inventory_health_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id uuid REFERENCES public.editorial_collection_look_slots(id) ON DELETE CASCADE,
  look_id uuid REFERENCES public.editorial_collection_looks(id) ON DELETE CASCADE,
  collection_id uuid REFERENCES public.editorial_collections(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  http_status integer,
  outcome text NOT NULL,
  message text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.inventory_health_events TO service_role;
ALTER TABLE public.inventory_health_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages inventory_health_events"
  ON public.inventory_health_events
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
CREATE INDEX IF NOT EXISTS idx_health_events_collection
  ON public.inventory_health_events (collection_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_health_events_slot
  ON public.inventory_health_events (slot_id, created_at DESC);

-- 4. Editorial Review Queue — Founder-facing exceptions
CREATE TABLE IF NOT EXISTS public.editorial_review_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid REFERENCES public.editorial_collections(id) ON DELETE CASCADE,
  look_id uuid REFERENCES public.editorial_collection_looks(id) ON DELETE CASCADE,
  slot_id uuid REFERENCES public.editorial_collection_look_slots(id) ON DELETE CASCADE,
  reason text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
GRANT ALL ON public.editorial_review_queue TO service_role;
ALTER TABLE public.editorial_review_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages editorial_review_queue"
  ON public.editorial_review_queue
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
CREATE INDEX IF NOT EXISTS idx_review_queue_status_priority
  ON public.editorial_review_queue (status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_queue_collection
  ON public.editorial_review_queue (collection_id, status);
