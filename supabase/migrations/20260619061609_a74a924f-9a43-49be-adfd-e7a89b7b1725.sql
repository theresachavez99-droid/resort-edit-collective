-- 1. Add image_source with default + CHECK constraint
ALTER TABLE public.founder_reference_products
  ADD COLUMN image_source text NOT NULL DEFAULT 'unknown'
    CHECK (image_source IN (
      'retailer_cdn',
      'brand_cdn',
      'cleaned_thumbnail',
      'founder_screenshot',
      'placeholder',
      'unknown'
    ));

-- 2. Add image_review_status for repair-queue dismissals
ALTER TABLE public.founder_reference_products
  ADD COLUMN image_review_status text
    CHECK (image_review_status IS NULL OR image_review_status IN ('ignored'));

CREATE INDEX IF NOT EXISTS idx_frp_image_source
  ON public.founder_reference_products (image_source);

-- 3. Classify existing rows deterministically.
--    Placeholders first (most specific), then SVG sketches, then known
--    retailer CDNs, then known brand CDNs. Everything else stays 'unknown'.

UPDATE public.founder_reference_products
SET image_source = 'placeholder'
WHERE image_url ILIKE '%placehold.co%'
   OR image_url ILIKE '%placeholder.com%'
   OR image_url ILIKE '%via.placeholder.com%';

UPDATE public.founder_reference_products
SET image_source = 'placeholder'
WHERE image_url ILIKE '%.svg'
   OR image_url ILIKE '%/src/assets/products/%';

UPDATE public.founder_reference_products
SET image_source = 'retailer_cdn'
WHERE image_source = 'unknown'
  AND (
       image_url ILIKE '%mytheresa.com%'
    OR image_url ILIKE '%net-a-porter.com%'
    OR image_url ILIKE '%saksfifthavenue.com%'
    OR image_url ILIKE '%nordstrom.com%'
    OR image_url ILIKE '%neimanmarcus.com%'
    OR image_url ILIKE '%bergdorfgoodman.com%'
    OR image_url ILIKE '%bloomingdales.com%'
    OR image_url ILIKE '%modaoperandi.com%'
    OR image_url ILIKE '%luisaviaroma.com%'
    OR image_url ILIKE '%harrods.com%'
    OR image_url ILIKE '%ssense.com%'
    OR image_url ILIKE '%fwrd.com%'
    OR image_url ILIKE '%intermixonline.com%'
    OR image_url ILIKE '%everythingbutwater.com%'
    OR image_url ILIKE '%shopbop.com%'
    OR image_url ILIKE '%revolve.com%'
    OR image_url ILIKE '%farfetch.com%'
    OR image_url ILIKE '%matchesfashion.com%'
  );

UPDATE public.founder_reference_products
SET image_source = 'brand_cdn'
WHERE image_source = 'unknown'
  AND (
       image_url ILIKE '%biankina.com%'
    OR image_url ILIKE '%milly.com%'
    OR image_url ILIKE '%zimmermann%.com%'
    OR image_url ILIKE '%dolcegabbana.com%'
    OR image_url ILIKE '%pucci.com%'
    OR image_url ILIKE '%etro.com%'
    OR image_url ILIKE '%aliceandolivia.com%'
    OR image_url ILIKE '%loewe.com%'
    OR image_url ILIKE '%hereu.com%'
    OR image_url ILIKE '%cultgaia.com%'
    OR image_url ILIKE '%farmrio.com%'
    OR image_url ILIKE '%johannaortiz.com%'
    OR image_url ILIKE '%aguabendita.com%'
    OR image_url ILIKE '%alemais.com%'
  );

-- Rows with empty/null image_url → placeholder (so they appear in the queue)
UPDATE public.founder_reference_products
SET image_source = 'placeholder'
WHERE image_url IS NULL OR length(btrim(image_url)) = 0;