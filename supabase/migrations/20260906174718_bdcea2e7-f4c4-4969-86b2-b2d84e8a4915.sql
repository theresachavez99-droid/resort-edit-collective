ALTER TABLE public.auto_edit_look_versions
  ADD COLUMN IF NOT EXISTS moment_slug text,
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS hero_asset_ref text,
  ADD COLUMN IF NOT EXISTS hero_fingerprint text,
  ADD COLUMN IF NOT EXISTS hero_validation jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS hero_state text NOT NULL DEFAULT 'missing',
  ADD COLUMN IF NOT EXISTS slots_fingerprint text,
  ADD COLUMN IF NOT EXISTS ai_verdict jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_verdict_state text NOT NULL DEFAULT 'absent',
  ADD COLUMN IF NOT EXISTS blocked_reason text,
  ADD COLUMN IF NOT EXISTS activated_at timestamptz;

CREATE UNIQUE INDEX IF NOT EXISTS auto_edit_look_versions_one_active
  ON public.auto_edit_look_versions (look_key)
  WHERE is_active;

CREATE TABLE IF NOT EXISTS public.auto_edit_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_key text NOT NULL UNIQUE,
  moment_slug text,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  spend_units integer NOT NULL DEFAULT 0,
  error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.auto_edit_jobs TO service_role;
ALTER TABLE public.auto_edit_jobs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.activate_auto_edit_version(p_version_id uuid)
RETURNS public.auto_edit_look_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v public.auto_edit_look_versions;
BEGIN
  SELECT * INTO v FROM public.auto_edit_look_versions WHERE id = p_version_id FOR UPDATE;
  IF v.id IS NULL THEN
    RAISE EXCEPTION 'version not found';
  END IF;
  IF NOT v.completeness_ok THEN
    RAISE EXCEPTION 'refusing to activate an incomplete look version';
  END IF;
  IF v.blocked_reason IS NOT NULL THEN
    RAISE EXCEPTION 'refusing to activate a blocked version: %', v.blocked_reason;
  END IF;
  IF v.hero_state <> 'validated' THEN
    RAISE EXCEPTION 'refusing to activate without a validated matching hero image';
  END IF;
  IF v.ai_verdict_state <> 'approved' THEN
    RAISE EXCEPTION 'refusing to activate without an approved stylist verdict';
  END IF;

  UPDATE public.auto_edit_look_versions
     SET is_active = false,
         state = CASE WHEN state = 'active' THEN 'superseded' ELSE state END,
         updated_at = now()
   WHERE look_key = v.look_key AND is_active AND id <> v.id;

  UPDATE public.auto_edit_look_versions
     SET is_active = true,
         state = 'active',
         activated_at = now(),
         updated_at = now()
   WHERE id = v.id
  RETURNING * INTO v;

  RETURN v;
END;
$$;

REVOKE ALL ON FUNCTION public.activate_auto_edit_version(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.activate_auto_edit_version(uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.activate_auto_edit_version(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.rollback_auto_edit_version(p_look_key text)
RETURNS public.auto_edit_look_versions
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev public.auto_edit_look_versions;
BEGIN
  SELECT * INTO prev
    FROM public.auto_edit_look_versions
   WHERE look_key = p_look_key
     AND NOT is_active
     AND completeness_ok
     AND blocked_reason IS NULL
     AND hero_state = 'validated'
     AND ai_verdict_state = 'approved'
   ORDER BY version DESC
   LIMIT 1;
  IF prev.id IS NULL THEN
    RAISE EXCEPTION 'no eligible previous version to roll back to';
  END IF;
  RETURN public.activate_auto_edit_version(prev.id);
END;
$$;

REVOKE ALL ON FUNCTION public.rollback_auto_edit_version(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.rollback_auto_edit_version(text) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rollback_auto_edit_version(text) TO service_role;