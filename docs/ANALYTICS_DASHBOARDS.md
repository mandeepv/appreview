<!-- ORIGIN: owner-supplied planning artifact (SHIP_READY_PLAN Appendix C — PostHog dashboard spec), copied into the repo verbatim per OWNER_TODO Task 6 (the planning folder is not backed up; this repo is the durable store). Future work — the four dashboards are built after v1.2.0 ships. -->

# APPENDIX C — PostHog dashboard spec

📌 **Owner decision 2026-07-10:** the four dashboards (C.1–C.4) are built **after v1.2.0 ships**, bundled with the 4.3/4.4 PostHog sitting (the retention/lesson charts need SPEC-13's lesson events flowing first). C.0 status: `paywall_presented`, `auth_succeeded`, `subscription_restored` ✅ live; lesson events ➡️ SPEC-13 R4.

**North star: weekly active learners** — subscribers completing ≥1 lesson section that week. Revenue follows it and it can only be moved by making the product genuinely used.

## C.0 — Instrumentation gaps to close first (charts below depend on these)

- [x] ~~(SPEC-06) `paywall_presented` — `onPresent` currently only console.logs (LoadingScreen.tsx:90-94). Add `safeCapture('paywall_presented', { paywall_name })`. Without it, paywall conversion rate — the single most important number — is uncomputable. (5 min)~~
- [x] ~~(SPEC-13) Lesson events — `lesson_started` / `lesson_section_completed` / `lesson_completed` with `lesson_id`. Wait for the lesson engine (5.2): post-refactor it's ONE instrumentation point in the generic controller instead of 343 files. Until then PostHog is blind to whether payers use the product.~~
- [x] ~~(SPEC-01) `subscription_restored` — ships with 1.1.1 (item 1.2).~~
- [x] ~~(SPEC-06) `auth_succeeded` - { provider, context } — completes the attempted/abandoned/succeeded triple; success is currently only inferable. (15 min)~~

**Governance:** every insight filtered `environment = prod`; internal-user filter (4.3) done before trusting any numbers; all events via the 8.19 typed registry once it lands.

## C.1 — Dashboard: Release health (ops)

| Chart | Type | Purpose |
|---|---|---|
| `paywall_skipped_by_superwall` by `skip_reason` | Trend, daily + PostHog alert | Only tripwire for dashboard misconfig silently un-paywalling everyone |
| `demo_mode_activated` | Trend, weekly | ~20/wk rip-out threshold (more urgent post-1.5.1: gesture was publicly documented) |
| `gate_escape_hatch_shown` | Trend | How often paying users hit the locked-out state (ships with 1.3) |
| Users by `$app_version` | Trend, stacked | Rollout adoption; shows when the kill-switch-unreachable 1.0.0 cohort dies out |
| `paywall_dismissed` | Trend | Should be ~0 under hard gate; nonzero = template shipped with a close control |

## C.2 — Dashboard: Revenue funnel

- **Master funnel (1-day window):** first onboarding step → `onboarding_completed` → `auth_succeeded` → `paywall_presented` → `subscription_purchased`. Breakdown: `user_type`, `$app_version`.
- **Onboarding micro-funnel:** all `trackOnboardingStepCompleted` steps → find the one screen where drop-off concentrates (cheapest conversion win in the app).
- **Paywall conversion rate:** `subscription_purchased` ÷ `paywall_presented`, trend. Judge every Superwall template/dashboard edit against it — snapshot before and after.
- **Restore rate:** `subscription_restored` trend (reinstall/device-switch proxy among payers).
- **Returning-user funnel (post-1.1.1):** `auth_succeeded` (context=returning_user) → `paywall_presented` → purchased — how the newly-gated existing-user cohort converts.

## C.3 — Dashboard: Engagement & retention (needs C.0 lesson events)

- **Subscriber retention:** Retention insight, return after `subscription_purchased`, weekly × 8 — renewal-rate leading indicator, months ahead of App Store Connect.
- **Activation:** % of purchasers completing ≥1 lesson section within 7 days. Zero-engagement week-one subscribers = future refunds/cancellations.
- **Lesson table:** `lesson_started` vs `lesson_completed` per `lesson_id` — which lessons hook, which get abandoned; informs what lesson #14 should be.
- **Stickiness:** DAU/WAU for subscribers.

## C.4 — Dashboard: Auth health

- `auth_attempted` → `auth_succeeded` conversion by provider — a provider gap (e.g. Apple 90% vs Google 60%) reveals flow bugs Sentry can't see (abandonment throws no error).
- `auth_abandoned` rate by provider and context (new vs returning).
