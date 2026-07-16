DROP POLICY IF EXISTS "Authenticated read founder_looks" ON public.founder_looks;
DROP POLICY IF EXISTS "Authenticated read founder_validation_runs" ON public.founder_validation_runs;
REVOKE SELECT ON public.founder_looks FROM authenticated;
REVOKE SELECT ON public.founder_validation_runs FROM authenticated;