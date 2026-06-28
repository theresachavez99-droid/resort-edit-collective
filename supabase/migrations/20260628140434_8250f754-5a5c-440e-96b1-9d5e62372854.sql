CREATE TABLE IF NOT EXISTS public.founder_product_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_look_id uuid REFERENCES public.founder_looks(id) ON DELETE SET NULL,
  destination text,
  moment text,
  slot text NOT NULL,
  brand text,
  product_title text,
  product_url text,
  retailer text,
  image_url text,
  reason_code text NOT NULL,
  reason_label text,
  notes text,
  variant text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.founder_product_feedback TO authenticated;
GRANT ALL ON public.founder_product_feedback TO service_role;

ALTER TABLE public.founder_product_feedback ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_founder_product_feedback_brand
  ON public.founder_product_feedback (brand);
CREATE INDEX IF NOT EXISTS idx_founder_product_feedback_slot
  ON public.founder_product_feedback (slot);
CREATE INDEX IF NOT EXISTS idx_founder_product_feedback_look
  ON public.founder_product_feedback (founder_look_id);