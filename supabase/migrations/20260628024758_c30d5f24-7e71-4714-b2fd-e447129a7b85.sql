
-- ============================================================
-- founder_looks: canonical Founder Look authoring table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.founder_looks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  destination text NOT NULL,
  moment text NOT NULL,
  style_family text[] NOT NULL DEFAULT '{}',
  hero_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
  activity_sequence text[] NOT NULL DEFAULT '{}',
  color_palette jsonb NOT NULL DEFAULT '{"include":[],"exclude":[]}'::jsonb,
  positive_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  negative_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  editorial_dna text,
  hero_philosophy text,
  founder_notes text,
  accessory_philosophy text,
  visual_weight text NOT NULL DEFAULT 'hero-dominant',
  luxury_level text NOT NULL DEFAULT 'editorial',
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT founder_looks_status_check CHECK (status IN ('draft','approved','published','retired')),
  CONSTRAINT founder_looks_visual_weight_check CHECK (visual_weight IN ('hero-dominant','balanced','accessory-led')),
  CONSTRAINT founder_looks_luxury_level_check CHECK (luxury_level IN ('editorial','heritage','mass-luxury'))
);

GRANT SELECT ON public.founder_looks TO authenticated;
GRANT ALL ON public.founder_looks TO service_role;

ALTER TABLE public.founder_looks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read founder_looks"
  ON public.founder_looks FOR SELECT TO authenticated USING (true);

CREATE TRIGGER founder_looks_set_updated_at
  BEFORE UPDATE ON public.founder_looks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS founder_looks_destination_moment_idx
  ON public.founder_looks (destination, moment, status);

-- Link reference products back to the source Founder Look (nullable for legacy rows).
ALTER TABLE public.founder_reference_products
  ADD COLUMN IF NOT EXISTS founder_look_id uuid REFERENCES public.founder_looks(id) ON DELETE SET NULL;

-- ============================================================
-- publish_founder_look(look_id): idempotent publish pipeline
--   - upserts one founder_reference_products row per hero URL
--   - upserts each hero brand into brand_intelligence as approved
--   - stamps published_at on the look
-- ============================================================
CREATE OR REPLACE FUNCTION public.publish_founder_look(look_id uuid)
RETURNS TABLE (refs_written int, brands_written int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_look public.founder_looks%ROWTYPE;
  v_hero jsonb;
  v_brand text;
  v_url text;
  v_image text;
  v_name text;
  v_cat text;
  v_role text;
  v_refs int := 0;
  v_brands int := 0;
  v_dest_tags text[];
  v_act_tags text[];
  v_style_tags text[];
  v_colors text[];
  v_slug text;
  v_existing uuid;
BEGIN
  SELECT * INTO v_look FROM public.founder_looks WHERE id = look_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'founder_look % not found', look_id; END IF;

  v_dest_tags := ARRAY[v_look.destination];
  v_act_tags := ARRAY[v_look.moment];
  v_style_tags := v_look.style_family;
  SELECT ARRAY(SELECT jsonb_array_elements_text(v_look.color_palette->'include')) INTO v_colors;

  FOR v_hero IN SELECT * FROM jsonb_array_elements(v_look.hero_urls) LOOP
    v_brand := v_hero->>'brand';
    v_url := v_hero->>'url';
    v_image := v_hero->>'image_url';
    v_name := v_hero->>'product_name';
    v_cat := COALESCE(v_hero->>'category','other');
    v_role := COALESCE(v_hero->>'role','Hero Garment');

    IF v_brand IS NULL OR v_url IS NULL THEN CONTINUE; END IF;

    -- Find existing reference by source_url
    SELECT id INTO v_existing FROM public.founder_reference_products WHERE source_url = v_url LIMIT 1;

    IF v_existing IS NULL THEN
      INSERT INTO public.founder_reference_products (
        brand, retailer, source_url, image_url, product_name, product_category,
        destination_tags, activity_tags, style_tags, color_story,
        founder_approved, approval_date, founder_notes,
        channel_type, image_source, founder_look_id
      ) VALUES (
        v_brand, v_brand, v_url, v_image, v_name, v_cat,
        v_dest_tags, v_act_tags, v_style_tags, v_colors,
        true, now(),
        COALESCE(v_look.founder_notes, '') ||
          E'\n[from Founder Look "' || v_look.title || '" · role: ' || v_role || ']',
        'brand_direct', 'brand_cdn', v_look.id
      );
    ELSE
      UPDATE public.founder_reference_products SET
        brand = v_brand,
        image_url = COALESCE(v_image, image_url),
        product_name = COALESCE(v_name, product_name),
        product_category = v_cat,
        destination_tags = v_dest_tags,
        activity_tags = v_act_tags,
        style_tags = v_style_tags,
        color_story = v_colors,
        founder_approved = true,
        approval_date = now(),
        founder_notes = COALESCE(v_look.founder_notes, '') ||
          E'\n[from Founder Look "' || v_look.title || '" · role: ' || v_role || ']',
        founder_look_id = v_look.id,
        updated_at = now()
      WHERE id = v_existing;
    END IF;
    v_refs := v_refs + 1;

    -- Brand intelligence upsert
    v_slug := lower(regexp_replace(v_brand, '[^a-zA-Z0-9]+', '-', 'g'));
    v_slug := trim(both '-' from v_slug);

    INSERT INTO public.brand_intelligence (
      brand, slug, status, source,
      suggested_activities, suggested_destinations,
      times_uploaded_by_founder, founder_reference_count,
      notes, channel_type
    ) VALUES (
      v_brand, v_slug, 'approved', 'founder_look',
      ARRAY[v_look.moment], ARRAY[v_look.destination],
      1, 1,
      'Approved via Founder Look "' || v_look.title || '".',
      'brand_direct'
    )
    ON CONFLICT (slug) DO UPDATE SET
      status = 'approved',
      suggested_activities = (
        SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.brand_intelligence.suggested_activities, '{}') || ARRAY[v_look.moment]))
      ),
      suggested_destinations = (
        SELECT ARRAY(SELECT DISTINCT unnest(COALESCE(public.brand_intelligence.suggested_destinations, '{}') || ARRAY[v_look.destination]))
      ),
      founder_reference_count = COALESCE(public.brand_intelligence.founder_reference_count, 0) + 1,
      updated_at = now();
    v_brands := v_brands + 1;
  END LOOP;

  UPDATE public.founder_looks
    SET published_at = COALESCE(published_at, now()),
        status = CASE WHEN status = 'draft' THEN 'approved' ELSE status END,
        updated_at = now()
    WHERE id = look_id;

  RETURN QUERY SELECT v_refs, v_brands;
END;
$fn$;

REVOKE ALL ON FUNCTION public.publish_founder_look(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_founder_look(uuid) TO service_role;

-- ============================================================
-- founder_validation_runs: store blind A/B results for tuning
-- ============================================================
CREATE TABLE IF NOT EXISTS public.founder_validation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_look_id uuid REFERENCES public.founder_looks(id) ON DELETE CASCADE,
  destination text NOT NULL,
  moment text NOT NULL,
  run_a jsonb NOT NULL,
  run_b jsonb NOT NULL,
  founder_side text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT founder_validation_runs_side_check CHECK (founder_side IN ('A','B'))
);

GRANT SELECT ON public.founder_validation_runs TO authenticated;
GRANT ALL ON public.founder_validation_runs TO service_role;

ALTER TABLE public.founder_validation_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read founder_validation_runs"
  ON public.founder_validation_runs FOR SELECT TO authenticated USING (true);
