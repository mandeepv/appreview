-- SPEC-FIX-04 R4 — RLS hardening: WITH CHECK on the UPDATE policies.
--
-- The initial schema's UPDATE policies on user_profiles and lesson_progress
-- have a USING clause (which row can I update?) but NO WITH CHECK (what may the
-- updated row look like?). Without WITH CHECK, a crafted authenticated UPDATE
-- could reassign the row's owning id — e.g. set user_profiles.id /
-- lesson_progress.user_id to another user — because USING only gates the
-- pre-image, not the post-image. Adding WITH CHECK mirroring the INSERT
-- policies (auth.uid() = <owner column>) closes that: the row must still belong
-- to the caller AFTER the update.
--
-- Additive / expand-only (idempotent). Apply to dev via the normal push; PROD
-- application is owner-run via scripts/db-push-prod.sh — the v1.2.0 runbook's
-- migration step lists this alongside the completed_sections migration (ONE
-- prod push covers both). ALTER POLICY ... WITH CHECK is supported for these
-- permissive policies, so no drop/recreate is needed.

ALTER POLICY "Users can update own profile"
  ON public.user_profiles
  WITH CHECK (auth.uid() = id);

ALTER POLICY "Users can update own progress"
  ON public.lesson_progress
  WITH CHECK (auth.uid() = user_id);
