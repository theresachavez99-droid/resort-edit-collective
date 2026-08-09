-- 1) brands: no direct anon/authenticated access; public reads go through public.brands_public
REVOKE ALL ON TABLE public.brands FROM anon;
REVOKE ALL ON TABLE public.brands FROM authenticated;
GRANT ALL ON TABLE public.brands TO service_role;
GRANT SELECT ON TABLE public.brands_public TO anon, authenticated;

-- 2) editorial_closet_events: insert-only for public clients; reads/updates/deletes admin-only
REVOKE ALL ON TABLE public.editorial_closet_events FROM anon;
REVOKE ALL ON TABLE public.editorial_closet_events FROM authenticated;
GRANT INSERT ON TABLE public.editorial_closet_events TO anon, authenticated;
GRANT ALL ON TABLE public.editorial_closet_events TO service_role;

-- 3) founder_looks: public read of published rows only; no write grants for public roles
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.founder_looks FROM anon, authenticated;
GRANT ALL ON TABLE public.founder_looks TO service_role;