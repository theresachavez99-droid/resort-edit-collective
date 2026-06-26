
ALTER TABLE public.brands
  ADD COLUMN IF NOT EXISTS approval_level text NOT NULL DEFAULT 'core',
  ADD COLUMN IF NOT EXISTS approved_product_families text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS excluded_product_families text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_construction text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_materials text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS preferred_design_language text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS editorial_notes text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'brands_approval_level_check'
  ) THEN
    ALTER TABLE public.brands
      ADD CONSTRAINT brands_approval_level_check
      CHECK (approval_level IN ('core','selective','reference'));
  END IF;
END $$;

-- MC2 Saint Barth → selective with product-family curation
UPDATE public.brands
SET
  approval_level = 'selective',
  approved_product_families = ARRAY[
    'sangallo embroidery','broderie anglaise','elevated cotton lace','refined crochet',
    'architectural one-pieces','elegant swimwear','luxury resort trousers','elevated beach-to-lunch separates'
  ],
  excluded_product_families = ARRAY[
    'logo collections','graphic vacation apparel','novelty prints','cartoon motifs',
    'terry logo sets','loud branded resortwear','tourist collections','mass-market vacation graphics'
  ],
  preferred_construction = ARRAY['sangallo','broderie anglaise','luxury lace','hand embroidery','crochet'],
  editorial_notes = 'Selective: only sangallo/broderie/lace/refined crochet/architectural one-pieces. Exclude logo, novelty, and terry collections.'
WHERE lower(name) IN ('mc2 saint barth','mc2 saint barths');

-- Hunza G / Solid & Striped → archived from engine
UPDATE public.brands SET status = 'archived'
  WHERE lower(name) IN ('hunza g','solid & striped','solid and striped');

-- Callas Milano (Mediterranean Icons)
INSERT INTO public.brands (name, slug, status, tier, categories, activities, approval_level, editorial_notes)
SELECT 'Callas Milano','callas-milano','approved','luxury',
       ARRAY['dresses','coverups']::text[],
       ARRAY['harbor-aperitivo','long-lunch','statement-dinner']::text[],
       'core',
       'Refined Italian tailoring and quiet luxury — arrival, harbor, long lunch, Riviera dinner.'
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE lower(name) = 'callas milano');

-- L'AGENCE (Selective tailoring/separates)
INSERT INTO public.brands (name, slug, status, tier, categories, activities, approval_level,
  approved_product_families, excluded_product_families, editorial_notes)
SELECT 'L''AGENCE','lagence','approved','luxury',
       ARRAY['dresses','coverups']::text[],
       ARRAY['harbor-aperitivo','long-lunch']::text[],
       'selective',
       ARRAY['linen trousers','white tailoring','elevated separates','lightweight jackets','resort denim']::text[],
       ARRAY['swimwear','destination prints','beachwear']::text[],
       'Selective: elevated tailoring and separates that transition arrival to harbor lunch to evenings. Not for swim or beach.'
WHERE NOT EXISTS (SELECT 1 FROM public.brands WHERE lower(name) = 'l''agence');
