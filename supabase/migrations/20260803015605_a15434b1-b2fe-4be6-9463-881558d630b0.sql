UPDATE public.founder_looks
SET hero_urls = '[]'::jsonb,
    updated_at = now()
WHERE destination = 'portofino'
  AND moment = 'arrival'
  AND status IN ('approved','published');