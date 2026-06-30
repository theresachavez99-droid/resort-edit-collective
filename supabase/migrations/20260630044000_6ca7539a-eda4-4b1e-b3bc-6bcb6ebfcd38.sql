-- View's WHERE clause and the RLS policy both reference `status`.
-- Add it to the column-level grant so the view runs as anon. Only
-- 'published' rows pass the policy, so anon can never see draft state.
GRANT SELECT (status) ON public.moments TO anon, authenticated;