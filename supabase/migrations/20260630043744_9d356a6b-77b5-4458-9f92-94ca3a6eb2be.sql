-- Gate A read path: grant low-privilege SELECT on the public projection
-- so the anon/publishable key can serve /portofino without service-role.
-- moments (raw, with brief/legacy keys/status) intentionally remains
-- locked to service_role only.
GRANT SELECT ON public.moments_public TO anon, authenticated;