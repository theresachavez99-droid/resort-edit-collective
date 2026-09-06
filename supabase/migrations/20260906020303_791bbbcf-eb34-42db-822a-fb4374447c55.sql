CREATE TABLE public.auto_edit_look_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  look_key TEXT NOT NULL,
  destination TEXT,
  moment TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  state TEXT NOT NULL DEFAULT 'candidate',
  is_active BOOLEAN NOT NULL DEFAULT false,
  completeness_ok BOOLEAN NOT NULL DEFAULT false,
  styling_score NUMERIC,
  rationale TEXT,
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  health JSONB NOT NULL DEFAULT '{}'::jsonb,
  requires_review BOOLEAN NOT NULL DEFAULT false,
  replacement_reason TEXT,
  change_kind TEXT,
  evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  engine TEXT,
  model TEXT,
  prompt_version TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.auto_edit_look_versions TO service_role;
ALTER TABLE public.auto_edit_look_versions ENABLE ROW LEVEL SECURITY;

CREATE INDEX auto_edit_look_versions_look_key_idx ON public.auto_edit_look_versions (look_key, version DESC);
CREATE UNIQUE INDEX auto_edit_look_versions_active_idx ON public.auto_edit_look_versions (look_key) WHERE is_active;

CREATE TABLE public.auto_edit_slot_simulations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  look_key TEXT NOT NULL,
  slot_product_id UUID NOT NULL REFERENCES public.shop_slot_products(id) ON DELETE CASCADE,
  simulated_status TEXT NOT NULL DEFAULT '404',
  active BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.auto_edit_slot_simulations TO service_role;
ALTER TABLE public.auto_edit_slot_simulations ENABLE ROW LEVEL SECURITY;

CREATE INDEX auto_edit_slot_simulations_look_idx ON public.auto_edit_slot_simulations (look_key) WHERE active;

CREATE TRIGGER update_auto_edit_look_versions_updated_at
  BEFORE UPDATE ON public.auto_edit_look_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_auto_edit_slot_simulations_updated_at
  BEFORE UPDATE ON public.auto_edit_slot_simulations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();