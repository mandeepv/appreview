-- SPEC-19 R2 — daily_activity: record which local days had lesson activity.
--
-- The streak is DERIVED (a pure computeStreak walk), never a stored counter, so
-- there is nothing to corrupt or migrate. This table stores only facts: one row
-- per (user, local calendar day) that had ≥1 lesson section completed.
--
-- Idempotent by design: the PK is (user_id, activity_date), and writes use
-- upsert / ON CONFLICT DO NOTHING — completing five sections in a day is one row.
--
-- `activity_date` is a DEVICE-LOCAL calendar date (YYYY-MM-DD from the device's
-- local time, NOT UTC). A streak is a human-perceived daily ritual; UTC dates
-- would break it for most timezones. Timezone travel can occasionally gift or
-- cost a day — accepted (this is what the big streak apps accept too).
--
-- RLS mirrors lesson_progress exactly (owner-only, USING + WITH CHECK on
-- user_id = auth.uid()). Rows are insert-only facts, so there is NO UPDATE
-- policy; DELETE cascades with the auth user (delete-account coverage — the FK
-- is ON DELETE CASCADE via auth.users).
--
-- Additive / expand-only (IF NOT EXISTS). Apply to dev via the normal push; PROD
-- application is owner-run via scripts/db-push-prod.sh at release (SPEC-19 §5.2)
-- — it MUST land before the v1.6.0 binary goes live, or every recordActivity
-- upsert returns 'failed' and streaks silently stay local-only.

CREATE TABLE IF NOT EXISTS public.daily_activity (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date date NOT NULL,        -- device-local calendar date
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_date)
);

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- Owner-only SELECT.
DROP POLICY IF EXISTS "Users can view own activity" ON public.daily_activity;
CREATE POLICY "Users can view own activity"
    ON public.daily_activity FOR SELECT
    USING (auth.uid() = user_id);

-- Owner-only INSERT (WITH CHECK on the post-image, mirroring lesson_progress).
DROP POLICY IF EXISTS "Users can insert own activity" ON public.daily_activity;
CREATE POLICY "Users can insert own activity"
    ON public.daily_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Owner-only DELETE (defensive; the account-delete cascade also removes rows).
DROP POLICY IF EXISTS "Users can delete own activity" ON public.daily_activity;
CREATE POLICY "Users can delete own activity"
    ON public.daily_activity FOR DELETE
    USING (auth.uid() = user_id);

-- No UPDATE policy: rows are insert-only facts (a day either had activity or it
-- didn't). Updating an activity_date makes no sense; omitting the policy denies
-- UPDATE entirely under RLS.
