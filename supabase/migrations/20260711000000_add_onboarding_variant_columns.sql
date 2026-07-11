-- SPEC-15: onboarding A/B test — record which flow (variant) a user went
-- through and, for variant B, their scaffold answers.
--
-- Additive and nullable, no backfill: existing rows keep NULL for both columns
-- (they predate the experiment). RLS is left untouched — the existing
-- row-owner policies on user_profiles already cover every column, new ones
-- included, so no policy change is needed.
--
-- `onboarding_variant` is 'control' | 'variant_b' (stored as text; the app is
-- the source of truth for the allowed values). `variant_b_answers` holds option
-- KEYS only, never free text (PII rule) — see onboardingService.ts.

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS onboarding_variant text;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS variant_b_answers jsonb;
