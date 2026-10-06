-- A minimal stand-in for the parts of a Supabase database the migrations and
-- tests rely on, for scripts/db-test-local/run.sh (SPEC-20 R9). It is NOT a
-- Supabase replica: CI's `supabase test db` against the real local stack is
-- the authoritative run. This exists so the RLS tests can be run on a Mac
-- with Homebrew Postgres and no Docker.
--
-- The one thing it must get right is privileges. Supabase grants the API
-- roles everything on new public tables and functions by default, so RLS
-- (and explicit REVOKEs) are the only barrier. Without those default grants,
-- "anon cannot read X" would pass for the wrong reason — a missing GRANT, not
-- the policy under test.

-- API roles. service_role bypasses RLS, as on Supabase.
create role anon nologin noinherit;
create role authenticated nologin noinherit;
create role service_role nologin noinherit bypassrls;

create schema if not exists extensions;
create schema if not exists auth;
grant usage on schema public, extensions, auth to anon, authenticated, service_role;

-- auth.users: only the columns the migrations and tests use.
create table auth.users (
  id uuid primary key,
  email text,
  aud varchar(255),
  role varchar(255),
  raw_user_meta_data jsonb,
  created_at timestamptz not null default now()
);

-- auth.uid(): the signed-in user from the request's JWT claims, as Supabase
-- defines it (the newer request.jwt.claims JSON, or the older per-claim GUC).
create function auth.uid() returns uuid
language sql stable
as $$
  select nullif(
    coalesce(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
    ),
    ''
  )::uuid
$$;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- Supabase's default privileges for objects the migrations will create.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;

-- Supabase's search path, so pgTAP (loaded into `extensions`) resolves.
alter database postgres set search_path = "$user", public, extensions;
