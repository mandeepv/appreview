# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the Kinderwell Expo app. PostHog is now initialized via `src/config/posthog.ts` using environment variables loaded through `app.config.js`. The `PostHogProvider` is wrapped inside `NavigationContainer` in `App.tsx`, enabling autocapture of touch events and manual screen tracking via `onStateChange`. Users are identified on sign-in (both new onboarding and returning), and `posthog.reset()` is called on logout and account deletion. Eleven custom events are instrumented across six screens covering the full user lifecycle: onboarding completion, authentication, paywall interactions, lesson engagement, and churn signals.

| Event | Description | File |
|---|---|---|
| `onboarding_completed` | User reached the final auth screen after completing all onboarding steps. | `src/screens/onboarding/AuthScreen.tsx` |
| `user_signed_in` (new) | User successfully authenticated via Google or Apple during first-time onboarding. | `src/screens/onboarding/AuthScreen.tsx` |
| `user_signed_in` (returning) | Returning user successfully authenticated via Google or Apple on the sign-in screen. | `src/screens/onboarding/SignInScreen.tsx` |
| `subscription_purchased` | User successfully completed a premium subscription purchase via the paywall. | `src/screens/onboarding/LoadingScreen.tsx` |
| `paywall_dismissed` | User dismissed or skipped the paywall without completing a purchase. | `src/screens/onboarding/LoadingScreen.tsx` |
| `lesson_started` | User tapped a lesson module card on the Learn screen to begin a lesson. | `src/screens/LearnScreen.tsx` |
| `lesson_section_started` | User started a specific section within a multi-section lesson module. | `src/screens/SprinklersLessonScreen.tsx` |
| `user_logged_out` | User confirmed and completed the logout action from the Settings screen. | `src/screens/SettingsScreen.tsx` |
| `account_deleted` | User confirmed deletion of their account and all associated data. | `src/screens/SettingsScreen.tsx` |
| `subscription_managed` | User tapped Manage Subscription to open the App Store subscription management page. | `src/screens/SettingsScreen.tsx` |
| `purchases_restored` | User tapped Restore Purchases to recover a previously purchased subscription. | `src/screens/SettingsScreen.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard**: [Analytics basics (wizard)](https://us.posthog.com/project/493707/dashboard/1786098)
- [Onboarding → Sign-in → Subscription funnel](https://us.posthog.com/project/493707/insights/GclVpZoR)
- [Daily lesson starts](https://us.posthog.com/project/493707/insights/ihhOiqK9)
- [Sign-ins by auth method](https://us.posthog.com/project/493707/insights/6meVVugu)
- [Churn signals: logouts and deletions](https://us.posthog.com/project/493707/insights/eFDUI2v4)
- [Paywall conversions vs dismissals](https://us.posthog.com/project/493707/insights/hbYRGzgS)

## Verify before merging

- [ ] Run a full production build (the wizard only verified the files it touched) and fix any lint or type errors introduced by the generated code.
- [ ] Run the test suite — call sites that were rewritten or instrumented may need updated mocks or fixtures.
- [ ] Add `POSTHOG_PROJECT_TOKEN` and `POSTHOG_HOST` to `.env.example` and any onboarding/bootstrap scripts so collaborators know what to set.
- [ ] Confirm the returning-visitor path also calls `identify` — a handler that only identifies on fresh login can leave returning sessions on anonymous distinct IDs. (The `SignInScreen` already calls `identify` for returning users, but verify the `SplashScreen`/app-launch path also calls it for users with a persisted Supabase session.)

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.
