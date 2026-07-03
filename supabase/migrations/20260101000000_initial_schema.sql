-- Initial schema — baseline migration.
--
-- This file describes the schema that shipped with v1.0.0 (already applied to
-- prod, marked as applied on both dev and prod via `supabase migration repair`
-- on 2026-07-04). It is idempotent so it can also be replayed against a fresh
-- database if needed (e.g. spinning up a new dev environment).
--
-- Everything here is additive. Later migrations extend the schema.

-- Required for uuid_generate_v4() default on lesson_progress.id.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type text,
    name text,
    age integer,
    children_count integer,
    children jsonb,
    improvement_goals text[],
    notifications_enabled boolean DEFAULT false,
    partner_involvement text,
    partner_invited boolean DEFAULT false,
    learning_goal text,
    experience_level text,
    familiar_parenting_styles text[],
    emotional_challenges text[],
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    lesson_id text NOT NULL,
    completed boolean DEFAULT false,
    completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE (user_id, lesson_id)
);

-- ============================================================================
-- Row-Level Security
-- ============================================================================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

-- user_profiles policies — a signed-in user can only see / modify their own row.
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert/update own profile" ON public.user_profiles;
CREATE POLICY "Users can insert/update own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- lesson_progress policies — a signed-in user can only see / modify their own
-- progress rows.
DROP POLICY IF EXISTS "Users can view own progress" ON public.lesson_progress;
CREATE POLICY "Users can view own progress"
    ON public.lesson_progress FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own progress" ON public.lesson_progress;
CREATE POLICY "Users can insert own progress"
    ON public.lesson_progress FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own progress" ON public.lesson_progress;
CREATE POLICY "Users can update own progress"
    ON public.lesson_progress FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own progress" ON public.lesson_progress;
CREATE POLICY "Users can delete own progress"
    ON public.lesson_progress FOR DELETE
    USING (auth.uid() = user_id);
