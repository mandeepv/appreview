# INVARIANTS

These are the rules the app's correctness silently depends on. Every bug found in the 2026-07 audit was a violation of one of these at an integration seam — none were in unit-level logic. Check every future diff against this list (human or AI review). When an invariant changes, change it here first, deliberately.

## Revenue / paywall

1. Every path into `Root` goes through the Loading gate. No screen may `navigation.replace('Root')` directly — grep for it in review; only LoadingScreen's purchase/restore/skip/subscriber paths qualify. *(The v1.1.0 sign-in bypass was a violation of exactly this.)*
2. `onSkip` grants access — but the skip *reason* matters (SPEC-FIX-08 R2). `Holdout`/`NoAudienceMatch` are legitimate (entitled / experiment-excluded) → enter Root. `PlacementNotFound` is a dashboard misconfig, NOT "entitled" → `retry` (fail SAFE to the gate); it fires a distinct `paywall_placement_not_found` event. Therefore the `subscription_gate` audience must be exactly "unsubscribed users" and **the placement must EXIST — a missing placement now means "locked to paywall," not "open." Any future intentional paywall teardown MUST reconfigure the placement/audience; NEVER delete the placement (deleting it locks users out).** The `paywall_skipped_by_superwall` count (and the `paywall_placement_not_found` event) are the tripwires for dashboard misconfig. Check on every dashboard edit.
3. `isSubscribed` (AsyncStorage) is a device-local memory of a Superwall-vouched fact. Only Superwall events (or a just-completed purchase) may set it true. **The cached flag is bound to a user id and is valid only while a session for that same user exists; ANY launch with no session, or a session for a different user, treats the flag as false. No account event may leave a `true` flag readable by a different or absent user.** (SPEC-FIX-08: persisted as `{ userId, subscribed }`, honored on hydrate only when `session.user.id === record.userId` — the old "clear-on-sign-out" rule was an event race; user-binding makes it structural. Lapsed-user grace window = SPEC-FIX-09.)
4. The `show_paywall` placement must stay configured in the dashboard while any v1.0.0 installs exist — the kill switch cannot reach v1.0.0 binaries (`appConfig.ts` doesn't exist there), so that cohort can never be force-updated off it.
5. `SKIP_PAYWALL=true` never reaches a prod build (`app.config.js` throw — keep it) and is `__DEV__`-gated at runtime (keep both layers).

## Auth / data

6. An error from `hasUserCompletedOnboarding` is never treated as `no_onboarding` — collapsing them re-onboards real users and overwrites their data. The tri-state union exists for this.
7. Profile upserts never include placeholder values (the `'Parent'` literal) that would clobber real data; omit fields instead of writing fallbacks.
8. No email, child names, or free-text PII in PostHog (`$set` or event props); `sendDefaultPii: false` stays in Sentry config. Identify by Supabase user ID only.
9. `delete-account` is only ever deployed with `verify_jwt` on (never `--no-verify-jwt`); the service-role key exists only in edge-function env, never in client code or eas.json.
10. AsyncStorage keys only via `storageKeys.ts`; a shipped key is never renamed without a read-old-merge-delete migration.

## Config / build

11. Prod builds fail loudly on missing env vars (app.config.js throws — never soften to warnings).
12. `buildNumber` is a bare monotonic integer, forever (a non-integer defeats the kill-switch parse guard).
13. A `__DEV__` build may never point at the prod DB (supabase.ts hard-throw — keep it).
14. The kill-switch config fetch always fails open (missing table/row/network → defaults, never a block), and honored minimums respect `MIN_SUPPORTED_BUILD_CAP`.

## Process

15. No prod `db push` without a same-day backup (the script enforces it — don't bypass the script).
16. The Supabase CLI is never left linked to prod.
17. Every release: verify sourcemaps uploaded, run the dashboard checks (invariant 2), tag the exact built commit (`eas build:list` knows it).
18. Per-release blocks get deleted from RELEASE_CHECKLIST.md after shipping; stale instructions are treated as bugs (three incidents already).
