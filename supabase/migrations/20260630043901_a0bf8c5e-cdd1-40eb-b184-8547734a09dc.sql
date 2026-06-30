-- Raw `moments` holds internal editorial state (brief, legacy_*_slug,
-- status, etc.). The public must reach moment data ONLY through the
-- safe `moments_public` view. Revoke direct access from public roles.
REVOKE ALL ON public.moments FROM anon, authenticated;
-- Re-grant table-level CRUD to service_role for server-fn admin use.
GRANT ALL ON public.moments TO service_role;
-- And keep the view fully readable through the publishable key.
GRANT SELECT ON public.moments_public TO anon, authenticated;