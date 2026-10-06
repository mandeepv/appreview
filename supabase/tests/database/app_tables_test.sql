-- The app's own tables (SPEC-20 R9): profiles, lesson progress, and the
-- kill-switch config. access_test.sql (ported from the web repo) covers the
-- web-purchase tables, and its D1 already fails if ANY public table lacks RLS.
--
-- The app talks to these with the public key, so these policies are all that
-- keeps one parent's answers and progress from another — and keeps anyone
-- from switching off the kill switch.
-- Run with: supabase test db   (or, without Docker: scripts/db-test-local/run.sh)
begin;
create extension if not exists pgtap with schema extensions;
select plan(19);

-- Users A, B and C. A and B have a profile and some progress, written as the
-- table owner (the way the app's own first save would land).
insert into auth.users (id, email, aud, role) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'app-a@example.com', 'authenticated', 'authenticated'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'app-b@example.com', 'authenticated', 'authenticated'),
  ('cccccccc-0000-4000-8000-000000000003', 'app-c@example.com', 'authenticated', 'authenticated');
insert into public.user_profiles (id, user_type, name) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'mother', 'A'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'father', 'B');
insert into public.lesson_progress (user_id, lesson_id, completed_sections) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'sprinklers', '{1}'),
  ('aaaaaaaa-0000-4000-8000-000000000001', 'serveReturn', '{1,2}'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'sprinklers', '{1,2,3}');

-- ── As user A ───────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}', true);

select results_eq(
  $$ select id from public.user_profiles $$,
  $$ values ('aaaaaaaa-0000-4000-8000-000000000001'::uuid) $$,
  'A1: a user reads only their own profile'
);
select throws_ok(
  $$ insert into public.user_profiles (id, user_type) values ('cccccccc-0000-4000-8000-000000000003', 'other') $$,
  '42501', null,
  'A2: a user cannot create someone else''s profile'
);
select lives_ok(
  $$ update public.user_profiles set experience_level = 'some' where id = 'aaaaaaaa-0000-4000-8000-000000000001' $$,
  'A3: a user can update their own profile'
);
-- No WHERE on purpose, here and in A7. When an UPDATE reads columns (a WHERE
-- or RETURNING), Postgres also checks the new row against the SELECT policy,
-- which would block this move by itself and hide a missing WITH CHECK. The
-- UPDATE policy's USING still limits it to the user's own rows.
select throws_ok(
  $$ update public.user_profiles set id = 'cccccccc-0000-4000-8000-000000000003' $$,
  '42501', null,
  'A4: a user cannot move their profile onto another user (UPDATE ... WITH CHECK)'
);

select results_eq(
  $$ select lesson_id from public.lesson_progress order by lesson_id $$,
  $$ values ('serveReturn'::text), ('sprinklers'::text) $$,
  'A5: a user reads only their own lesson progress'
);
select throws_ok(
  $$ insert into public.lesson_progress (user_id, lesson_id) values ('bbbbbbbb-0000-4000-8000-000000000002', 'dissociation') $$,
  '42501', null,
  'A6: a user cannot write progress for someone else'
);
select throws_ok(
  $$ update public.lesson_progress set user_id = 'cccccccc-0000-4000-8000-000000000003' $$,
  '42501', null,
  'A7: a user cannot hand their progress row to another user (UPDATE ... WITH CHECK)'
);
select lives_ok(
  $$ delete from public.lesson_progress where lesson_id = 'serveReturn' $$,
  'A8: a user can delete their own progress'
);

-- Writes aimed at B, and a delete of A's own profile (there is no DELETE
-- policy: account deletion goes through the delete-account function). RLS
-- turns these into no-ops rather than errors; the checks below look at what
-- actually happened.
do $$ begin
  update public.user_profiles set name = 'hijacked' where id = 'bbbbbbbb-0000-4000-8000-000000000002';
  update public.lesson_progress set completed_sections = '{}' where user_id = 'bbbbbbbb-0000-4000-8000-000000000002';
  delete from public.lesson_progress where user_id = 'bbbbbbbb-0000-4000-8000-000000000002';
  delete from public.user_profiles;
end $$;

-- ── Anonymous (the public key, signed out) ─────────────────────────────────
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
select is_empty($$ select * from public.user_profiles $$, 'B1: anon reads no profiles');
select is_empty($$ select * from public.lesson_progress $$, 'B2: anon reads no lesson progress');
select isnt_empty(
  $$ select 1 from public.app_config where key = 'min_supported_ios_build' $$,
  'B3: anon can read the kill switch (the app checks it before sign-in)'
);
select throws_ok(
  $$ insert into public.app_config (key, value) values ('min_supported_ios_build_v2', '9999'::jsonb) $$,
  '42501', null,
  'B4: anon cannot add kill-switch config'
);
do $$ begin
  update public.app_config set value = '9999'::jsonb where key = 'min_supported_ios_build';
  delete from public.app_config;
end $$;

set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"aaaaaaaa-0000-4000-8000-000000000001","role":"authenticated"}', true);
select isnt_empty(
  $$ select 1 from public.app_config where key = 'min_supported_ios_build' $$,
  'B5: a signed-in user can read the kill switch too'
);
do $$ begin
  update public.app_config set value = '9999'::jsonb where key = 'min_supported_ios_build';
end $$;

-- ── What actually happened (as the owner) ──────────────────────────────────
reset role;
select is(
  (select name from public.user_profiles where id = 'bbbbbbbb-0000-4000-8000-000000000002'),
  'B',
  'C1: another user''s profile was not changed'
);
select is(
  (select completed_sections from public.lesson_progress
   where user_id = 'bbbbbbbb-0000-4000-8000-000000000002' and lesson_id = 'sprinklers'),
  '{1,2,3}'::text[],
  'C2: another user''s progress was not changed or deleted'
);
select is(
  (select experience_level from public.user_profiles where id = 'aaaaaaaa-0000-4000-8000-000000000001'),
  'some',
  'C3: the user''s own update landed'
);
select is(
  (select count(*)::int from public.user_profiles),
  2,
  'C4: no profile was deleted through the API'
);
select is(
  (select value from public.app_config where key = 'min_supported_ios_build'),
  '0'::jsonb,
  'C5: nobody on the API changed the kill switch'
);

-- Deleting the auth user (what delete-account's last step does) takes the
-- profile and progress with it.
delete from auth.users where id = 'aaaaaaaa-0000-4000-8000-000000000001';
select is_empty(
  $$ select 1 from public.user_profiles where id = 'aaaaaaaa-0000-4000-8000-000000000001'
     union all
     select 1 from public.lesson_progress where user_id = 'aaaaaaaa-0000-4000-8000-000000000001' $$,
  'C6: a deleted user''s profile and progress cascade away'
);

select * from finish();
rollback;
