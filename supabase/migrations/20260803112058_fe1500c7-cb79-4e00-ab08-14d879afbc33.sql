-- 1. Security definer view -> security invoker, with a matching base-table policy
ALTER VIEW public.editorial_closet_public SET (security_invoker = true);

GRANT SELECT (
  id, destination, moment_slug, category, context_label, brand, product_name,
  retailer, product_url, image_url, price, color, availability,
  editorial_rationale, rationale_tag, match_score, "position"
) ON public.editorial_closet_candidates TO anon, authenticated;

DROP POLICY IF EXISTS "Public can read approved verified closet candidates" ON public.editorial_closet_candidates;
CREATE POLICY "Public can read approved verified closet candidates"
ON public.editorial_closet_candidates
FOR SELECT
TO anon, authenticated
USING (
  status = 'approved'
  AND verification_status = 'verified'
  AND verified_at IS NOT NULL
  AND (expires_at IS NULL OR expires_at > now())
);

-- 2. Remove redundant always-true catch-all policies (service_role bypasses RLS)
DROP POLICY IF EXISTS "Admin service role only" ON public.brand_crawl_jobs;
DROP POLICY IF EXISTS "Service role full products" ON public.products;
DROP POLICY IF EXISTS "Service role full sources" ON public.product_sources;
DROP POLICY IF EXISTS "Service role full muses" ON public.destination_muses;
DROP POLICY IF EXISTS "product_cache service role only" ON public.product_cache;
DROP POLICY IF EXISTS "brand_promotion_signals service role only" ON public.brand_promotion_signals;
DROP POLICY IF EXISTS "service_role full access moments" ON public.moments;
DROP POLICY IF EXISTS "service_role full access moment_runs" ON public.moment_runs;

-- 3. Validate closet analytics inserts instead of accepting anything
DROP POLICY IF EXISTS "anon can record closet interaction events" ON public.editorial_closet_events;
DROP POLICY IF EXISTS "authenticated can record closet interaction events" ON public.editorial_closet_events;
CREATE POLICY "clients can record closet interaction events"
ON public.editorial_closet_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN ('drawer_open', 'card_click', 'retailer_click', 'impression')
  AND (destination IS NULL OR char_length(destination) <= 64)
  AND (moment_slug IS NULL OR char_length(moment_slug) <= 128)
  AND (retailer IS NULL OR char_length(retailer) <= 64)
  AND (meta IS NULL OR pg_column_size(meta) <= 2048)
);

-- 4. Destination moments: public active-only read; archetypes backend-only
DROP POLICY IF EXISTS "destination moments authenticated read" ON public.destination_moments;
CREATE POLICY "Public can read active destination moments"
ON public.destination_moments
FOR SELECT
TO anon, authenticated
USING (active = true);
GRANT SELECT ON public.destination_moments TO anon, authenticated;

DROP POLICY IF EXISTS "moment archetypes authenticated read" ON public.destination_moment_archetypes;
REVOKE SELECT ON public.destination_moment_archetypes FROM anon, authenticated;
GRANT ALL ON public.destination_moment_archetypes TO service_role;