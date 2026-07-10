<!-- ORIGIN: owner-supplied planning artifact, copied into the repo verbatim per OWNER_TODO Task 6 (the planning folder is not backed up; this repo is the durable store). Future work package — parked until owner go. -->

# SPEC-11 — Notifications (Phase 1: local reminders)

Context: plan Part C (Tier 9), items 9.1–9.4. Scope is **local notifications only** — remote push (9.5, push tokens, edge functions) is explicitly OUT of scope for this spec; do not collect or store push tokens anywhere. Depends on SPEC-09 (lesson engine) — the scheduling trigger and the pre-prompt hook live at the engine's section-completion point, which only exists as a single callsite post-engine.

Files: new `src/services/notificationService.ts`, new `src/components/NotificationPrePrompt.tsx` (or equivalent — match existing component conventions), `src/constants/storageKeys.ts`, `src/screens/SettingsScreen.tsx`, the lesson engine's section-completion controller (from SPEC-09), `app.config.js` (plugin entry only), `docs/INVARIANTS.md`.

Owner decision required before starting (DECISION(owner), plan 9.1): the reminder shape. Recommended default written into this spec: a single user-configured weekly-repeating "practice reminder" (day + time), off by default. If the owner wants a different shape, stop and re-scope R3.

## R1 — Dependency + config

- `npx expo install expo-notifications` and add its config plugin to `app.config.js`. (If SPEC-07's dead-dep sweep already removed it, this is the sanctioned re-add — a dep exists only while imported, and now it's imported.)
- No other `app.config.js` changes. No `eas.json` changes (owner-only, working agreement #4).

## R2 — Notification service (the only module that touches expo-notifications)

- `src/services/notificationService.ts` exposes: `getPermissionState()`, `requestPermission(context: string)`, `scheduleReminder(settings)`, `cancelAllReminders()`, `getReminderSettings()` / `setReminderSettings(settings)`.
- Screens and the engine import the service, never `expo-notifications` directly — same layering rule as the Supabase client (add an ESLint `no-restricted-imports` entry if SPEC-05's config makes that cheap; otherwise a grep in acceptance).
- Reminder settings persist under a new key registered in `storageKeys.ts` (invariant #10). Read path zod-parses with fail-safe defaults (malformed JSON → feature off, never a throw).
- Sign-out and account-delete paths call `cancelAllReminders()` — find where `Superwall.reset()` / `Sentry.setUser(null)` are called on sign-out and add it alongside, with a why-comment (a reminder firing for a signed-out account is a support ticket).

## R3 — Permission UX + scheduling

- **Pre-prompt, not system prompt:** an in-app card shown at the lesson engine's section-completion point, only when ALL of: system permission is `undetermined`, the user has ≥2 lifetime section completions, no pre-prompt was answered "Not now" within the last 14 days (timestamp under the same storage key), and no rating prompt fired this session (coordination rule from plan Part C — check whatever flag F3's implementation exposes; if F3 isn't built yet, leave a `TODO(F3)` comment marking the coordination point).
- **Card copy:** value-first, honest about frequency ("a reminder on your schedule"). "Yes" → `requestPermission('post_lesson_preprompt')` → on grant, navigate intent to the Settings reminder controls (or inline day/time picker — match existing UI patterns). "Not now" → record timestamp, dismiss, nothing else.
- **Never call the system permission API at launch, during onboarding, or on any paywall-adjacent screen.** The iOS prompt is one-shot; a launch-time ask burns it at the lowest-trust moment.
- **Settings screen:** a "Practice reminder" row — toggle + day/time control. When system permission is denied, the toggle renders disabled with a "Turn on notifications in Settings" link (`Linking.openSettings()`, try/catch per house pattern). Any settings change = `cancelAllReminders()` then re-schedule (never accumulate schedules).
- **Notification content comes from a fixed string catalog in the service file. Never interpolate user data** — no child names, no onboarding answers, nothing user-typed. The lock screen is a public surface; treat it under invariant #8.

## R4 — Tap routing through the gate (new invariant #19)

- Notification response handling (both the foreground/background response listener and the cold-start `getLastNotificationResponseAsync` path) must route to the **Loading screen** — never `replace('Root')`, never a lesson screen directly. Optionally pass an intended destination param that LoadingScreen forwards only after the gate passes; if that plumbing is awkward, landing on Loading with no destination is acceptable for Phase 1.
- A lapsed subscriber tapping a reminder must meet the paywall, not the content. The existing grep check (`grep -rn "replace('Root')" src/` → LoadingScreen only) must still hold.
- Add invariant #19 to `docs/INVARIANTS.md`: "Every notification tap enters via the Loading gate; notification handlers never navigate to Root or content directly." Match the doc's existing tone and numbering.

## R5 — Analytics (via `safeCapture`, house rules)

- Events: `notification_preprompt_shown`, `notification_preprompt_answered { answer: 'yes' | 'not_now' }`, `notification_permission_requested { context }`, `notification_permission_granted` / `notification_permission_denied { context }`, `reminder_enabled { day, hour }`, `reminder_disabled`, `notification_opened { type: 'practice_reminder' }`.
- No PII in any payload (invariant #8). Day/hour of the reminder is fine; nothing else about the user is.

## Constraints

- iOS only. Android channels / `POST_NOTIFICATIONS` land with SPEC-12 — do not add Android notification code here.
- No new screens for the pre-prompt if a modal/card component pattern already exists — reuse it.
- No push tokens, no new DB tables, no edge functions (Phase 2, plan 9.5).
- Reminder default is OFF. Nothing schedules a notification for a user who never opted in.

## Acceptance criteria

- [ ] Grep proof in PR: `expo-notifications` imported only in `notificationService.ts`; `replace('Root')` still hits only LoadingScreen; new storage key exists only in `storageKeys.ts` + the service.
- [ ] Dev-build: complete 2 sections → pre-prompt appears; "Not now" → doesn't reappear next session; "Yes" → system prompt → grant → reminder configurable in Settings.
- [ ] Scheduled reminder fires at the chosen time on a dev build (set 2 minutes ahead); tapping it cold-start lands on Loading (gate runs), NOT directly on content.
- [ ] Deny the system prompt → Settings toggle shows the disabled + "open Settings" state.
- [ ] Sign out → `getAllScheduledNotificationsAsync` (dev-menu check or log) returns empty.
- [ ] All R5 events visible in PostHog dev project with correct props; no PII in any payload.
- [ ] `docs/INVARIANTS.md` has invariant #19; PR description states invariants touched (#1, #8, #10, #19).
