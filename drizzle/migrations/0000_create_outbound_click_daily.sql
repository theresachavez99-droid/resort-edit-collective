CREATE TABLE public.outbound_click_daily (
  day date NOT NULL DEFAULT (now() AT TIME ZONE 'utc')::date,
  link_key text NOT NULL,
  placement text NOT NULL,
  clicks integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (day, link_key, placement)
);

-- Aggregate counts only. No public access of any kind: RLS is on with no
-- policies, and no privileges are granted to anon or authenticated.
GRANT ALL ON public.outbound_click_daily TO service_role;

ALTER TABLE public.outbound_click_daily ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.record_outbound_click(p_link_key text, p_placement text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_link_key IS NULL OR p_placement IS NULL
     OR length(p_link_key) > 80 OR length(p_placement) > 60
     OR p_link_key !~ '^[a-z0-9-]+$' OR p_placement !~ '^[a-z0-9-]+$' THEN
    RAISE EXCEPTION 'invalid outbound click key';
  END IF;

  INSERT INTO public.outbound_click_daily (day, link_key, placement, clicks)
  VALUES ((now() AT TIME ZONE 'utc')::date, p_link_key, p_placement, 1)
  ON CONFLICT (day, link_key, placement)
  DO UPDATE SET clicks = public.outbound_click_daily.clicks + 1, updated_at = now();
END;
$$;

REVOKE ALL ON FUNCTION public.record_outbound_click(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_outbound_click(text, text) FROM anon;
REVOKE ALL ON FUNCTION public.record_outbound_click(text, text) FROM authenticated;
GRANT EXECUTE ON FUNCTION public.record_outbound_click(text, text) TO service_role;