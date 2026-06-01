
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email citext NOT NULL UNIQUE,
  source_page text,
  destination text,
  cta_source text,
  status text NOT NULL DEFAULT 'active',
  tags text[] NOT NULL DEFAULT '{}',
  notes text,
  unsubscribed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscribers_status_check CHECK (status IN ('active','unsubscribed')),
  CONSTRAINT subscribers_email_format CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

CREATE INDEX idx_subscribers_status ON public.subscribers(status);
CREATE INDEX idx_subscribers_created_at ON public.subscribers(created_at DESC);
CREATE INDEX idx_subscribers_destination ON public.subscribers(destination);

-- Private/admin-only table — only service_role (server functions) can access.
GRANT ALL ON public.subscribers TO service_role;

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies for anon/authenticated. All access via server fns.

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
