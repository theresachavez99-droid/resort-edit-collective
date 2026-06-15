CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  website text,
  status text NOT NULL DEFAULT 'pending',
  tier text NOT NULL DEFAULT 'discovery',
  categories text[] NOT NULL DEFAULT '{}',
  activities text[] NOT NULL DEFAULT '{}',
  notes text,
  why_we_love text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.brands TO service_role;

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_brands_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX brands_status_idx ON public.brands(status);
CREATE INDEX brands_tier_idx ON public.brands(tier);
CREATE INDEX brands_categories_idx ON public.brands USING GIN(categories);
CREATE INDEX brands_activities_idx ON public.brands USING GIN(activities);