
CREATE TABLE IF NOT EXISTS public.buying_search_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_code TEXT UNIQUE,
  destination TEXT NOT NULL,
  moment TEXT NOT NULL,
  founder_look_id UUID NULL,
  category_set JSONB NOT NULL DEFAULT '{}'::jsonb,
  strategy TEXT NOT NULL DEFAULT 'editorial_first',
  status TEXT NOT NULL DEFAULT 'open',
  source_diagnostics JSONB NOT NULL DEFAULT '{}'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.buying_search_sessions TO service_role;
ALTER TABLE public.buying_search_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buying_sessions_no_client" ON public.buying_search_sessions
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE TABLE IF NOT EXISTS public.buying_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.buying_search_sessions(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  source_adapter TEXT NULL,
  product_url TEXT NOT NULL,
  canonical_url TEXT NOT NULL,
  affiliate_url TEXT NULL,
  affiliate_status TEXT NOT NULL DEFAULT 'pending',
  retailer TEXT NULL,
  brand TEXT NULL,
  product_name TEXT NULL,
  category TEXT NULL,
  color TEXT NULL,
  price NUMERIC NULL,
  currency TEXT NULL,
  image_url TEXT NULL,
  image_missing BOOLEAN NOT NULL DEFAULT false,
  description TEXT NULL,
  availability TEXT NULL,
  sale_status TEXT NULL,
  notes TEXT NULL,
  editorial_score NUMERIC NULL,
  benchmark_similarity NUMERIC NULL,
  editorial_confidence NUMERIC NULL,
  ranking_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'review',
  rejection_reason TEXT NULL,
  imported_by TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, canonical_url)
);

CREATE INDEX IF NOT EXISTS idx_buying_candidates_session ON public.buying_candidates(session_id);
CREATE INDEX IF NOT EXISTS idx_buying_candidates_status ON public.buying_candidates(status);

GRANT ALL ON public.buying_candidates TO service_role;
ALTER TABLE public.buying_candidates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "buying_candidates_no_client" ON public.buying_candidates
  FOR ALL TO authenticated, anon USING (false) WITH CHECK (false);

CREATE TRIGGER buying_sessions_updated_at BEFORE UPDATE ON public.buying_search_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER buying_candidates_updated_at BEFORE UPDATE ON public.buying_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
