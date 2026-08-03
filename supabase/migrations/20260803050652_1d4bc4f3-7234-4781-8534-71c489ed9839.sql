CREATE TABLE public.editorial_closet_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  moment_slug text NOT NULL,
  source_look_key text,
  category text NOT NULL,
  context_label text,
  brand text NOT NULL,
  product_name text NOT NULL,
  retailer text NOT NULL DEFAULT '',
  product_url text NOT NULL,
  image_url text,
  price text,
  color text,
  silhouette text,
  material text,
  availability text NOT NULL DEFAULT 'unknown',
  editorial_rationale text NOT NULL DEFAULT '',
  rationale_tag text,
  full_look_pairing jsonb,
  match_score numeric,
  retailer_priority_rank integer,
  status text NOT NULL DEFAULT 'generating',
  verification_status text NOT NULL DEFAULT 'unverified',
  verification_verdict text,
  http_status integer,
  verified_at timestamptz,
  availability_checked_at timestamptz,
  rejected_reason text,
  click_count integer NOT NULL DEFAULT 0,
  retailer_click_count integer NOT NULL DEFAULT 0,
  run_id uuid,
  model text,
  prompt_version text,
  position integer,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX editorial_closet_candidates_moment_idx
  ON public.editorial_closet_candidates (destination, moment_slug, status);
CREATE UNIQUE INDEX editorial_closet_candidates_url_idx
  ON public.editorial_closet_candidates (moment_slug, product_url);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_closet_candidates TO authenticated;
GRANT ALL ON public.editorial_closet_candidates TO service_role;
ALTER TABLE public.editorial_closet_candidates ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.editorial_closet_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination text NOT NULL,
  moment_slug text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  disabled_reason text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX editorial_closet_settings_key_idx
  ON public.editorial_closet_settings (destination, moment_slug);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.editorial_closet_settings TO authenticated;
GRANT ALL ON public.editorial_closet_settings TO service_role;
ALTER TABLE public.editorial_closet_settings ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.editorial_closet_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  candidate_id uuid REFERENCES public.editorial_closet_candidates(id) ON DELETE SET NULL,
  destination text,
  moment_slug text,
  retailer text,
  meta jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX editorial_closet_events_moment_idx
  ON public.editorial_closet_events (moment_slug, event_type, created_at DESC);

GRANT INSERT ON public.editorial_closet_events TO anon;
GRANT SELECT, INSERT ON public.editorial_closet_events TO authenticated;
GRANT ALL ON public.editorial_closet_events TO service_role;
ALTER TABLE public.editorial_closet_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon can record closet interaction events"
  ON public.editorial_closet_events FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "authenticated can record closet interaction events"
  ON public.editorial_closet_events FOR INSERT TO authenticated WITH CHECK (true);

CREATE VIEW public.editorial_closet_public
WITH (security_invoker = off) AS
  SELECT
    id,
    destination,
    moment_slug,
    category,
    context_label,
    brand,
    product_name,
    retailer,
    product_url,
    image_url,
    price,
    color,
    availability,
    editorial_rationale,
    rationale_tag,
    match_score,
    position
  FROM public.editorial_closet_candidates
  WHERE status = 'approved'
    AND verification_status = 'verified'
    AND verified_at IS NOT NULL
    AND (expires_at IS NULL OR expires_at > now());

GRANT SELECT ON public.editorial_closet_public TO anon;
GRANT SELECT ON public.editorial_closet_public TO authenticated;

CREATE TRIGGER editorial_closet_candidates_updated_at
  BEFORE UPDATE ON public.editorial_closet_candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER editorial_closet_settings_updated_at
  BEFORE UPDATE ON public.editorial_closet_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();