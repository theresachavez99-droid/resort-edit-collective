CREATE TABLE public.resort_edit_styling_policy (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active boolean NOT NULL DEFAULT true,
  retailer_priority text[] NOT NULL DEFAULT ARRAY['Revolve','Shopbop','Saks Fifth Avenue','Neiman Marcus','Nordstrom','Bloomingdale''s'],
  brand_direct_policy text NOT NULL DEFAULT 'Brand-direct PDPs are permitted ONLY when no approved affiliate retailer carries the exact product.',
  approved_brands text[] NOT NULL DEFAULT '{}',
  restricted_brands text[] NOT NULL DEFAULT '{}',
  no_rings boolean NOT NULL DEFAULT true,
  single_jewelry_family boolean NOT NULL DEFAULT true,
  destination_notes jsonb NOT NULL DEFAULT '{}'::jsonb,
  hero_threshold_note text NOT NULL DEFAULT 'Hero garments must be Vogue-resort worthy: distinctive silhouette, editorial fabric, and a designer with real fashion authority. Supporting accessories may be quieter but never generic.',
  extra_rules text[] NOT NULL DEFAULT '{}',
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT ALL ON public.resort_edit_styling_policy TO service_role;
ALTER TABLE public.resort_edit_styling_policy ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER update_resort_edit_styling_policy_updated_at BEFORE UPDATE ON public.resort_edit_styling_policy FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.resort_edit_styling_policy (notes, extra_rules) VALUES (
  'Seeded Resort Edit styling policy. Editable in Admin Studio → Availability.',
  ARRAY[
    'Editorial consistency and destination personality come before retailer convenience.',
    'Avoid repeating the same accessory or designer across nearby looks in the same moment.',
    'Luxury-editorial quality outranks product availability: never propose filler.'
  ]
);

CREATE TABLE public.product_styling_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_product_id uuid REFERENCES public.shop_slot_products(id) ON DELETE SET NULL,
  look_key text,
  slot text,
  destination text,
  moment text,
  feedback text NOT NULL,
  candidate_id uuid REFERENCES public.product_replacement_candidates(id) ON DELETE SET NULL,
  saved_to_policy boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT ALL ON public.product_styling_feedback TO service_role;
ALTER TABLE public.product_styling_feedback ENABLE ROW LEVEL SECURITY;
CREATE INDEX product_styling_feedback_look_slot_idx ON public.product_styling_feedback (look_key, slot);
CREATE TRIGGER update_product_styling_feedback_updated_at BEFORE UPDATE ON public.product_styling_feedback FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.product_replacement_candidates
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS silhouette text,
  ADD COLUMN IF NOT EXISTS material text,
  ADD COLUMN IF NOT EXISTS retailer_priority_rank integer,
  ADD COLUMN IF NOT EXISTS possible_duplicate_warning text,
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS verification_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS feedback_note text,
  ADD COLUMN IF NOT EXISTS failed_slot_summary text,
  ADD COLUMN IF NOT EXISTS nonnegotiable_constraints text[] NOT NULL DEFAULT '{}';