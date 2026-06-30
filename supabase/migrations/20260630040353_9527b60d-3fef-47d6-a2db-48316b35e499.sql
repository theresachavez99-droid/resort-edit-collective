-- ─────────────────────────────────────────────────────────────────────────
-- Step 2 · Track B Pass 1 — Moment Definitions + Run artefacts
-- ─────────────────────────────────────────────────────────────────────────

-- 1. moments — durable Moment Definitions
CREATE TABLE public.moments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,                           -- 'portofino'
  slug text NOT NULL,                                  -- 'arrival', ...
  name text NOT NULL,
  sequence integer NOT NULL,                           -- editorial order
  hero_image text,
  copy jsonb NOT NULL DEFAULT '{}'::jsonb,             -- {subtitle, narrative, ...}
  brief jsonb NOT NULL DEFAULT '{}'::jsonb,            -- {references[], references_unassigned[], palette, notes, hero_urls, custom_components}
  status text NOT NULL DEFAULT 'draft'                 -- draft|published
    CHECK (status IN ('draft','published')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (destination, slug)
);

-- 2. GRANTs — service_role only on base table; view granted separately
GRANT SELECT, INSERT, UPDATE, DELETE ON public.moments TO service_role;
GRANT ALL ON public.moments TO service_role;

-- 3. RLS — base table is server-only
ALTER TABLE public.moments ENABLE ROW LEVEL SECURITY;

-- 4. Policy — explicit service_role full access; no anon/authenticated policies
CREATE POLICY "service_role full access moments"
  ON public.moments FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────
-- moment_runs — one active run per moment (UNIQUE → idempotency)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE public.moment_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moment_id uuid NOT NULL UNIQUE
    REFERENCES public.moments(id) ON DELETE CASCADE,
  stage integer NOT NULL DEFAULT 1
    CHECK (stage BETWEEN 1 AND 5),
  params jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'idle'
    CHECK (status IN ('idle','running','complete','failed')),
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.moment_runs TO service_role;
GRANT ALL ON public.moment_runs TO service_role;

ALTER TABLE public.moment_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role full access moment_runs"
  ON public.moment_runs FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────
-- moments_public — published-only view, EXCLUDES brief
-- ─────────────────────────────────────────────────────────────────────────
CREATE VIEW public.moments_public
WITH (security_invoker = true)
AS
  SELECT id, destination, slug, name, sequence, hero_image, copy, published_at
  FROM public.moments
  WHERE status = 'published';

GRANT SELECT ON public.moments_public TO anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- editorial_memory_products.moment_id — backfill column for Step 2
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE public.editorial_memory_products
  ADD COLUMN IF NOT EXISTS moment_id uuid
    REFERENCES public.moments(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_editorial_memory_products_moment_id
  ON public.editorial_memory_products (moment_id);

-- ─────────────────────────────────────────────────────────────────────────
-- updated_at triggers (reuse existing public.update_updated_at_column)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TRIGGER trg_moments_updated_at
  BEFORE UPDATE ON public.moments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_moment_runs_updated_at
  BEFORE UPDATE ON public.moment_runs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();