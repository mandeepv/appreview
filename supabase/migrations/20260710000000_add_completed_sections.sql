-- SPEC-13 R2 — account-scoped lesson progress sync.
--
-- The lesson_progress table has only stored whole-lesson booleans
-- (completed). The data-driven lesson engine (SPEC-09) tracks progress at the
-- SECTION level: an array of completed section-id strings per lesson, stored
-- device-local in AsyncStorage. To sync that across devices we add a column
-- that mirrors the AsyncStorage shape exactly.
--
-- Design (owner-decided 2026-07-10):
--   - completed_sections text[] NOT NULL DEFAULT '{}' — mirrors the
--     AsyncStorage array of section-id strings. text[] makes the sign-in
--     union-merge trivial and idempotent (a set union of two string arrays).
--   - We do NOT add a per-section table — one row per (user, lesson) keeps the
--     existing UNIQUE(user_id, lesson_id) + RLS policies working untouched.
--   - The existing `completed` boolean is kept as a DERIVED flag
--     (completed_sections.length === the lesson's section count in the
--     registry). It is not dropped — existing rows/consumers keep working.
--
-- Data-safe: the column is additive with a default, and the table was never
-- written by shipped code (the service had zero importers before this PR), so
-- no backfill or read-old-merge migration is needed. Existing rows get '{}'.
--
-- Runs against DEV via the normal dev push. PROD application is owner-only via
-- scripts/db-push-prod.sh (see the PR owner checklist). After applying, run
-- `npm run gen:supabase-types` and commit the regenerated src/types/supabase.ts.

ALTER TABLE public.lesson_progress
  ADD COLUMN IF NOT EXISTS completed_sections text[] NOT NULL DEFAULT '{}';

-- RLS is unchanged: the existing lesson_progress policies (user can only
-- see/modify their own rows) already cover the new column — it's the same row.
