-- Editorial Affinity scoring replaces static brand tiers as the primary
-- ranking signal. Tier remains as legacy metadata for backward compat.

-- 1. Add affinity columns to brands ------------------------------------
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS editorial_affinity jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS affinity_signals jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.brands.editorial_affinity IS
  'Map of "<destination>:<activity>" -> score (0-100). Replaces static tier as primary ranking signal.';
COMMENT ON COLUMN public.brands.affinity_signals IS
  'Aggregated Founder signals per "<destination>:<activity>" — { approvals, rejections, replacements, publications }.';

-- 2. Seed initial affinity values from editorial brief ----------------
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:yacht-day', 98) WHERE slug = 'alexandra-miro';
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:yacht-day', 96, 'portofino:harbor-aperitivo', 88) WHERE slug = 'matteau';
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:yacht-day', 92, 'portofino:harbor-aperitivo', 84) WHERE slug = 'vix-paula-hermanny';
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:yacht-day', 94) WHERE slug = 'agua-by-agua-bendita';
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:harbor-aperitivo', 98, 'portofino:riviera-dinner', 99) WHERE slug = 'maygel-coronel';
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:harbor-aperitivo', 97, 'portofino:riviera-dinner', 98) WHERE slug = 'johanna-ortiz';
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:riviera-dinner', 96) WHERE slug = 'zimmermann';
UPDATE public.brands SET editorial_affinity = editorial_affinity ||
  jsonb_build_object('portofino:riviera-dinner', 94) WHERE slug = 'oseree';

-- 3. Founder approval signals: per-look brand picks tracked over time
-- We persist nothing new at look-level — aggregation happens in the engine
-- by reading editorial_collection_look_slots + editorial_collection_looks.
-- A helper view exposes per-brand approval/rejection counts per
-- destination + activity for the brand performance dashboard.

CREATE OR REPLACE VIEW public.brand_founder_signal_view AS
SELECT
  s.brand                                  AS brand_name,
  c.destination                            AS destination,
  c.activity                               AS activity,
  COUNT(*) FILTER (WHERE l.status = 'approved')         AS approvals,
  COUNT(*) FILTER (WHERE l.status = 'rejected')         AS rejections,
  COUNT(*) FILTER (WHERE c.status = 'approved')         AS collection_approvals,
  COUNT(*)                                              AS total_appearances,
  AVG((s.metadata->>'editorialScore')::numeric)
    FILTER (WHERE s.metadata ? 'editorialScore')        AS avg_editorial_score,
  MAX(s.updated_at)                                     AS last_seen_at
FROM public.editorial_collection_look_slots s
JOIN public.editorial_collection_looks l ON l.id = s.look_id
JOIN public.editorial_collections      c ON c.id = l.collection_id
WHERE s.brand IS NOT NULL
GROUP BY s.brand, c.destination, c.activity;

GRANT SELECT ON public.brand_founder_signal_view TO service_role;