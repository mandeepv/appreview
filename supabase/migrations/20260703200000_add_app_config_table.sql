-- App-level config that every app instance reads on launch.
-- Used as a kill switch: bump min_supported_*_build in a bad release scenario
-- to force old-build users to update via the App / Play Store.

CREATE TABLE IF NOT EXISTS public.app_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Seed defaults. min_supported_*_build = 0 means "no minimum, everyone allowed".
INSERT INTO public.app_config (key, value)
VALUES
  ('min_supported_ios_build', '0'::jsonb),
  ('min_supported_android_build', '0'::jsonb)
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Anon can read (config is intentionally public — no secrets stored here).
-- Drop-then-create for idempotency: if this migration ever half-applied (or
-- someone hand-created the policy on prod), a second db push would otherwise
-- fail with "policy already exists" and leave the whole file unapplied.
-- Fable review #11.
DROP POLICY IF EXISTS "Anon can read app_config" ON public.app_config;
CREATE POLICY "Anon can read app_config"
  ON public.app_config
  FOR SELECT
  USING (true);

-- Only service_role can update (i.e. only manual DB / dashboard access).
-- Deliberately no INSERT / UPDATE / DELETE policy for anon or authenticated.
