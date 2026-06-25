
-- 1. Extend brands with style DNA + materials
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS style_dna text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS materials text[] NOT NULL DEFAULT '{}';

-- 2. Editorial collections (one per destination+activity generation run)
CREATE TABLE public.editorial_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  activity text NOT NULL,
  title text,
  brief jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  scoring jsonb NOT NULL DEFAULT '{}'::jsonb,
  diagnostics jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.editorial_collections TO service_role;
ALTER TABLE public.editorial_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages editorial_collections"
  ON public.editorial_collections FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_editorial_collections_updated_at
  BEFORE UPDATE ON public.editorial_collections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_editorial_collections_dest_activity
  ON public.editorial_collections (destination, activity, created_at DESC);

-- 3. Looks inside a collection
CREATE TABLE public.editorial_collection_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.editorial_collections(id) ON DELETE CASCADE,
  position integer NOT NULL DEFAULT 0,
  title text NOT NULL,
  subtitle text,
  description text,
  style_dna text[] NOT NULL DEFAULT '{}',
  palette text[] NOT NULL DEFAULT '{}',
  editorial_score numeric NOT NULL DEFAULT 0,
  completeness_score numeric NOT NULL DEFAULT 0,
  reasoning jsonb NOT NULL DEFAULT '{}'::jsonb,
  missing_slots text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'draft',
  approved_at timestamptz,
  rejected_at timestamptz,
  pinned boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.editorial_collection_looks TO service_role;
ALTER TABLE public.editorial_collection_looks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages editorial_collection_looks"
  ON public.editorial_collection_looks FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_editorial_collection_looks_updated_at
  BEFORE UPDATE ON public.editorial_collection_looks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_editorial_collection_looks_collection
  ON public.editorial_collection_looks (collection_id, position);

-- 4. Slots (products) inside each look
CREATE TABLE public.editorial_collection_look_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  look_id uuid NOT NULL REFERENCES public.editorial_collection_looks(id) ON DELETE CASCADE,
  slot text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  brand text,
  product_name text,
  retailer text,
  source_url text,
  affiliate_url text,
  image_url text,
  price numeric,
  currency text DEFAULT 'USD',
  locked boolean NOT NULL DEFAULT false,
  reasoning text,
  rejected_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.editorial_collection_look_slots TO service_role;
ALTER TABLE public.editorial_collection_look_slots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service role manages editorial_collection_look_slots"
  ON public.editorial_collection_look_slots FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER trg_editorial_collection_look_slots_updated_at
  BEFORE UPDATE ON public.editorial_collection_look_slots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_editorial_collection_look_slots_look
  ON public.editorial_collection_look_slots (look_id, position);
