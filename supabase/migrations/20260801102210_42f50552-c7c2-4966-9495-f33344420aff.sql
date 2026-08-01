-- 1. Column-level restriction: public visitors may only read the curated
-- editorial columns of founder_looks, never internal strategy fields.
REVOKE ALL ON public.founder_looks FROM anon, authenticated;
GRANT SELECT (id, slug, title, destination, moment, style_family, color_palette, hero_urls, editorial_dna, published_at)
  ON public.founder_looks TO anon, authenticated;
GRANT ALL ON public.founder_looks TO service_role;

DROP POLICY IF EXISTS "Public can read published looks" ON public.founder_looks;
CREATE POLICY "Public can read published curated looks"
  ON public.founder_looks FOR SELECT TO anon, authenticated
  USING (published_at IS NOT NULL AND status <> 'draft');

GRANT SELECT ON public.founder_looks_public TO anon, authenticated;
GRANT SELECT ON public.founder_looks_public TO service_role;

-- 2. Batch 3 reconciliation: align legacy destination_moments with the
-- canonical twelve published moments in public.moments.
INSERT INTO public.destination_moment_archetypes (archetype_slug, archetype_name, sort_order)
VALUES
  ('espresso-morning','Espresso Morning',25),
  ('exploring-the-harbor','Exploring the Harbor',35),
  ('beach-club','Beach Club',45),
  ('pool-lounging','Pool Lounging',55),
  ('long-lunch','Long Lunch',65),
  ('nightcap','Nightcap',75)
ON CONFLICT (archetype_slug) DO NOTHING;

DELETE FROM public.destination_moments WHERE moment_slug = 'market-morning';

INSERT INTO public.destination_moments (destination_slug, moment_slug, moment_name, archetype_slug, sort_order, active)
SELECT 'portofino', m.slug, m.name,
       CASE WHEN EXISTS (SELECT 1 FROM public.destination_moment_archetypes a WHERE a.archetype_slug = m.slug)
            THEN m.slug ELSE NULL END,
       m.sequence * 10, true
FROM public.moments m
WHERE m.status = 'published' AND m.slug <> '__unassigned__'
ON CONFLICT DO NOTHING;

UPDATE public.destination_moments d
SET moment_name = m.name, sort_order = m.sequence * 10, active = true, updated_at = now()
FROM public.moments m
WHERE m.slug = d.moment_slug AND m.status = 'published';

UPDATE public.destination_moments d
SET active = false, updated_at = now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.moments m WHERE m.slug = d.moment_slug AND m.status = 'published'
);