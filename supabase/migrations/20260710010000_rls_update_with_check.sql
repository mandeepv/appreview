-- SPEC-FIX-04 R4 — RLS hardening: WITH CHECK on the UPDATE policies.
--
-- The initial schema's UPDATE policies on user_profiles and lesson_progress
-- have a USING clause (which row can I update?) but no explicit WITH CHECK
-- (what may the updated row look like?). This migration adds WITH CHECK
-- mirroring the INSERT policies (auth.uid() = <owner column>).
--
-- What this actually does: it makes the post-image check EXPLICIT rather than
-- implicit. Per the Postgres docs (sql-createpolicy): when WITH CHECK is
-- OMITTED on an UPDATE policy, the USING expression is applied to the
-- post-image row as well — so the owner-reassignment case was already blocked;
-- there was NO vulnerability before this migration. This is behavior-equivalent
-- hardening (explicit ≥ implicit): it states the post-image constraint outright
-- so a future reader/auditor doesn't have to know the implicit rule, and it
-- stays correct if the USING clause is ever changed. Verified backward-
-- compatible against the v1.0.0 / v1.1.0 write paths.
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
