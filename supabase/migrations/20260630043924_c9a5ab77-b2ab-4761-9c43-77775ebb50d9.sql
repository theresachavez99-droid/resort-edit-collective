-- Column-level SELECT on the safe public projection only. This keeps
-- `brief`, `legacy_day_slug`, `legacy_look_slug`, `status`,
-- `created_at`, `updated_at` unreachable to anon/authenticated, and
-- lets the moments_public view (security_invoker, default) succeed.
GRANT SELECT (id, destination, slug, name, sequence, hero_image, copy, published_at)
  ON public.moments TO anon, authenticated;