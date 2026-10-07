# OPS_STATE — living register of external state

Code is trackable from git; **non-code state is not** (DB migrations applied, dashboard settings, secrets, App Store Connect config). This is the one place that records what is currently true *outside* the repo.

**Rules:**
- **Update the row whenever you touch the setting.** A stale "Last verified" is a prompt to re-check, NOT a guess.
- **`unverified` is the honest default.** Never invent a value. If you don't know, it stays `unverified` until the owner confirms it in a sitting.
- Dashboard screenshots (`docs/dashboard-snapshots/`) are this doc's attachments.
- AI review sessions verify claims against THIS doc instead of asking the owner.

---

## Supabase

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Supabase | prod/dev project refs | see `DEV_PROD_ENVIRONMENTS.md` | unverified | `DEV_PROD_ENVIRONMENTS.md` |
| Supabase | prod password last rotated | **never** — risk accepted by owner | 2026-07-09 | Supabase dashboard → Settings → Database |
| Supabase | last manual backup run | 2026-07-11 (pre-v1.2.0-migration; `backups/prod_20260711T073402Z_*.sql`, schema+data via pg_dump) | 2026-07-11 | Supabase dashboard → Database → Backups |
| Supabase | last restore drill | **never** | unverified | — |
| Supabase | prod migrations applied through | **`20260710010000`** — `completed_sections` [SPEC-13] + `rls_update_with_check` [SPEC-FIX-04 R4] applied to prod 2026-07-11; `completed_sections` column verified present via prod REST (HTTP 200) | 2026-07-11 | `supabase migration list --linked` |
| Supabase | prod backup mechanism | pg_dump 17 direct (no Docker) via `scripts/backup-prod.sh`; needs `PROD_DB_URL` in gitignored `.env.prod` | 2026-07-11 | `scripts/backup-prod.sh` |
| Supabase | delete-account deployed version | **SPEC-FIX-06** (ES256/JWKS + HS256 dual-path) deployed to **BOTH dev + prod 2026-07-11**. Dev verified on-device (200, account deleted); prod verified reachable (401 on no-auth/tampered) | 2026-07-11 | Supabase → Edge Functions |
| Supabase | dev auth signing system | **asymmetric ES256** (new JWT Signing Keys) — JWKS advertises one ES256 key | 2026-07-11 | `/auth/v1/.well-known/jwks.json` |
| Supabase | prod auth signing system | **asymmetric ES256** (same as dev) — so prod delete-account needs NO JWT_SECRET (verifies via JWKS) | 2026-07-11 | prod `/auth/v1/.well-known/jwks.json` |
| Supabase | gateway `verify_jwt` | **dev: verified 2026-10-07** with `supabase functions list`: `delete-account` **true**, `redeem-handoff` **false** (by design, INVARIANTS #30); the website's functions are false too (they are called from its own server proxy, not the app). **prod: unverified** | dev 2026-10-07 | `supabase functions list --project-ref <ref>` + `supabase/config.toml` |
| Supabase | email provider + OTP length (web purchases, v1.3.0) | **dev: DONE — 6 digits, verified.** Dev was issuing 8-digit codes. The app accepts exactly 6 (`OTP_LENGTH`), so email sign-in on dev was impossible. Owner set it to 6 on 2026-10-06; a fresh code then verified at 6 digits (SPEC-20 E2E sign-in check). **prod: unverified** — must be 6 before App Review, or web buyers cannot sign in | dev 2026-10-06 | Supabase → Authentication → Providers → Email |
| Supabase | Magic Link email template shows the code | **required, not yet confirmed** — the template body must show `{{ .Token }}`. With only `{{ .ConfirmationURL }}` parents get a link instead of a 6-digit code and cannot sign in in-app. Dev + prod | unverified | Supabase → Authentication → Email Templates → Magic Link |
| Supabase | **Confirm signup** email template shows the code | **required, not yet confirmed** (web2app review 2026-10-07, B-11). `sendEmailOtp` keeps `shouldCreateUser` on, so a brand-new organic parent on "Continue with Email" is CREATED by that request — and GoTrue sends them the Confirm signup template, not Magic Link. With only a link there they land in Safari and never get in. Web buyers are pre-created and confirmed, so only organic sign-ups hit it; E2E can't see it (it reads codes via `generateLink`). Dev + prod; test once with a never-used address | unverified | Supabase → Authentication → Email Templates → Confirm signup |
| Supabase | custom SMTP (Resend) + email rate limit | **required, not yet confirmed** — `smtp.resend.com:465`, user `resend`, password = a Resend API key, sender `hello@kinderwell.app` (already verified in Resend). The built-in mailer only delivers to project team members, a few an hour: without this real customers never get their code (the app reports `email_address_not_authorized` to Sentry). Raise "emails sent per hour" for launch traffic (e.g. 100). Dev + prod. **dev: DONE (SMTP).** The owner set up Resend on dev on 2026-10-06, with the values above and a 60 s minimum interval per user; a code then sent. Before that, dev was on the built-in mailer, its limit fixed at 2/h ("Custom SMTP or Send Email hook is required"). That cap stopped the first E2E run at "Too many codes requested" (`over_email_send_rate_limit`). An earlier entry here inferred SMTP was already on; that was wrong. Enabling SMTP set the limit to 30/h; the owner raised dev to **100/h** on 2026-10-06, and an E2E flow then ran. **"Minimum interval per user" (SMTP Settings) must stay 60 s on dev and prod:** the app enables Resend after `RESEND_COOLDOWN_SECONDS` = 60 (`src/lib/emailOtp.ts`), so a longer interval makes Resend fail with "Too many codes requested". **prod: unverified** — on the built-in mailer, web buyers would get no code at all | dev 2026-10-06 (dashboard + a sent code) | Supabase → Authentication → SMTP Settings / Rate Limits |
| Supabase | web2app migrations | **dev: all five applied** — `20260918000000_web2app` earlier, then `20260928000000_email_opt_outs`, `20260930000000_webhook_hardening` and `20261005000000_event_ordering` on 2026-10-06 (`supabase db push --linked`, after a dry run; parity check and the 65 local database tests passed first), and `20261006000000_handoff_keys` (row below). Re-checked 2026-10-07: `supabase migration list --linked` shows local and remote equal through `20261006000000` (the website's runbook had said only `…0918`; corrected there). **None applied to prod** — all five go with the next owner-run `scripts/db-push-prod.sh`, before ads run, and `event_ordering` before the dodo-webhook that writes `last_event_at` is deployed | dev 2026-10-07 | `supabase migration list --linked` |
| Supabase | delete-account cancels Dodo (v1.3.0) | **code on `release/1.3.0`, NOT deployed** to dev or prod — dev still runs the 2026-07-11 version (v18; `supabase functions list`, 2026-10-07), so E2E flow 6 passed against the OLD function (web2app review XR-18). Deleting a web subscriber cancels their Dodo subscription first and refuses to delete if the cancel fails. Needs `DODO_API_KEY` + `DODO_ENV` secrets (the web side sets them on the same project) | dev 2026-10-07 | Supabase → Edge Functions → delete-account |
| Supabase | purchase handoff migration `20261006000000_handoff_keys` (SPEC-21, v1.3.0) | **dev: applied 2026-10-06** (`supabase db push --linked` after a dry run; the 83 local database tests passed first; types regenerated). Adds `handoff_keys` (service role only) and `funnel_sessions.handoff_nonce_hash`. **prod: not applied** — goes with the next owner-run `scripts/db-push-prod.sh`, BEFORE `redeem-handoff` is deployed there. Copied into kinderwell-web unchanged; `scripts/check-migration-parity.sh` passes (2026-10-07) | dev 2026-10-07 | `supabase migration list --linked` |
| Supabase | `redeem-handoff` edge function (SPEC-21, v1.3.0) | **dev: deployed 2026-10-06, `verify_jwt` = false (confirmed in `functions list`).** Live check on dev (spike S2): a fresh key → `ok` and a `token_hash` that `verifyOtp(type: magiclink)` turns into the buyer's session; same key again → `used`; expired / unknown / junk / refunded buyer → `expired` / `unknown` / `unknown` / `not_entitled`; 3 simultaneous redeems → one `ok`. **prod: not deployed** — RELEASE_CHECKLIST Phase 5, after the migration, with `--no-verify-jwt` (INVARIANTS #30). No secrets beyond the project's own | dev 2026-10-06 | `supabase functions list` |
| Supabase | `JWT_SECRET` set | **dev: yes** (set 2026-07-11; now optional there — dev is ES256/JWKS) / prod: no | 2026-07-11 | `supabase secrets list` |

## Superwall

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Superwall | `subscription_gate` | Gated, 100%, audience = "unsubscribed users / no active entitlements", no match-limit — **re-verified in dashboard 2026-07-11** (SPEC-FIX-10 F8) | 2026-07-11 | Superwall dashboard → Placements |
| Superwall | "Use a different account" on the `subscription_gate` paywall (v1.3.0) | **required for v1.3.0, not yet built** (owner confirmed 2026-10-06). A small text button near Restore, tap action **Custom action**, name exactly **`switch_account`**, then Publish. The app's handler is built and tested (`LoadingScreen` `handleSwitchAccount`: dismiss, sign out, Auth in sign-in mode). **Still needed with SPEC-21:** the handoff signs most buyers in correctly, but a buyer who skips it and signs in with Apple Hide My Email (or anyone on the wrong account) faces a hard paywall with no other way off. Log out is behind it, so they'd pay twice or delete the app | unverified | Superwall dashboard → Paywalls → the `subscription_gate` paywall |
| Superwall | `show_paywall` | kept for the v1.0.0 cohort | unverified | Superwall dashboard → Placements |
| Superwall | dashboard-change habit | screenshot on every change (F5 pointer) | — | `docs/dashboard-snapshots/` |

## Sentry

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Sentry | new-issue alert rule | prod-scoped, notifies owner email — **VERIFIED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike-regression rule | "Spike / regression (prod)" — escalation + resolved→unresolved → owner email — **CREATED** | 2026-07-10 | Sentry → Alerts |
| Sentry | spike protection | **ON** — VERIFIED | 2026-07-10 | Sentry → Settings → Quotas |
| Sentry | crash-free release alert (SPEC-20 R12) | **optional for now** (owner, 2026-10-06: Sentry's own new-issue emails are enough to ship v1.3.0) — alert when crash-free sessions on the newest release fall below 99% (the RELEASE_CHECKLIST Phase 11 pause threshold, automated) | unverified | Sentry → Alerts → Release health |
| PostHog | alert: `paywall_placement_not_found` (SPEC-20 R12) | **optional for now** (owner, 2026-10-06): the same failure also goes to Sentry (`reportError`, context `paywall_placement_not_found`), whose new-issue email covers it — any occurrence in prod within an hour → owner email. A missing `subscription_gate` placement now locks users OUT (INVARIANTS #2) | unverified | PostHog → Alerts |
| PostHog | alert: paywall skips (SPEC-20 R12) | **required BEFORE AD SPEND, which starts with v1.3.0, so before its launch; not yet created** (owner, 2026-10-06). Skips aren't errors, so Sentry never sees a paywall that lets people through without paying — `paywall_skipped_by_superwall` above 1% of `paywall_presented` (Phase 11 pause threshold, automated) | unverified | PostHog → Alerts |
| PostHog | alert: purchases down (SPEC-20 R12) | **required BEFORE AD SPEND, which starts with v1.3.0, so before its launch; not yet created** (owner, 2026-10-06). Once ads run, a silent purchase drop burns real money, and no error fires — day-over-day `subscription_purchased` down more than 50% (Phase 11 threshold) | unverified | PostHog → Alerts |
| PostHog | alert: web check failing (SPEC-20 R12) | **optional for now** (owner, 2026-10-06): check errors go to Sentry (`entitlementService`, `reportError`); timeouts don't — `web_entitlement_checked` with result `error`/`timeout` well above baseline; a failing check sends web buyers without a cached flag to the Apple paywall | unverified | PostHog → Alerts |
| PostHog | alert: demo mode discovered (SPEC-20 R12) | **optional for now** (owner, 2026-10-06; a weekly manual count is fine pre-ads) — `demo_mode_activated` above ~20 a week in prod (today a weekly manual count) | unverified | PostHog → Alerts |
| Sentry | client-key rate limit | 100 events per 1 hour — SET | 2026-07-10 | Sentry → Settings → Client Keys |
| Sentry | sourcemaps for live build | **STALE — last verified for 1.1.0 (dist 9), two releases ago.** v1.2.0 (build 11) shipped without this row being re-checked. Verify for 1.3.0 (build 12) at release: invariant 21 makes sourcemap upload release evidence, and without it a prod stack trace is unreadable. | **unverified (1.1.0 evidence only)** | Sentry → Releases → artifacts |

## PostHog

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| PostHog | internal-user filter | not done | unverified | PostHog → Settings → Project |
| PostHog | session replay | **NOT BUILT — nothing is wired, nothing records.** This row previously claimed code was wired 2026-07-21; that was never true (absent from `main` and from the shipped `v1.2.0-build-11`). It was genuinely built on 2026-09-15 and then **reverted the same day** — the plugin needs a native rebuild, and the policy questions below were not worth settling mid-redesign. `grep -n sessionReplay src/config/posthog.ts` returns nothing. To revisit: `git revert` commits 7f6f3e0 / 4dcf5a0 / 03c1de0 back in (they install `@posthog/react-native-plugin`, wire `enableSessionReplay` + masking, and gate it to dev). See BACKLOG R0 for the three owner items and the App Review reasoning. | **2026-09-15 (not built)** | `grep -n sessionReplay src/config/posthog.ts` — expect no hits |
| PostHog | session replay — PII masking posture | **N/A — replay is not built** (row above). When it returns: RN replay is SCREENSHOT-based (PostHog docs: the React Native SDK "always record[s] in screenshot mode", not configurable), so masking IS the PII control, not an add-on. The reverted commits kept PostHog's restrictive defaults — `maskAllTextInputs:true` (masks the typed NAME), `maskAllImages:true` — with tapped ANSWERS left visible on purpose, since those are buttons and are the point of watching a replay. | 2026-09-15 | — |
| PostHog | dashboards | none yet (Appendix C, after v1.2.0) | unverified | PostHog → Dashboards |
| PostHog | person-deletion on account delete | not built (7.2 parked) | unverified | — |

## App Store Connect

> **⚠️ APP TRANSFERRED 2026-08-21 — Kinderwell now lives in The Account Holder's Apple account, NOT the owner's.** Recipient Apple **Team ID `APPLETEAMID`**, Account Holder `owner-account@example.com`, ASC provider ID `ASCPROVIDERID`, Vendor # `VENDORNUM`. App Store **Seller name is now "The Account Holder"**. Bundle ID `com.kinderwell.app` and numeric App ID `APPLEAPPID` unchanged. To manage the app / ASC now, sign in as the account holder. Full record: `docs/APP_TRANSFER_RUNBOOK.md`. Rows below that predate the transfer describe the OLD account unless noted.

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| App Store Connect | **owning account (post-transfer)** | **The Account Holder — Team `APPLETEAMID`, `owner-account@example.com`** (transferred 2026-08-21; sales attribute to the account holder @15% from that date). Pre-transfer sales history + final payout (~early Oct 2026) stay on the owner's old account. | 2026-08-21 | ASC (signed in as the account holder) |
| App Store Connect | live version / build | **v1.2.0 (build 11)** — released (owner-confirmed); marker tag `appstore-live-v1.2.0` on `39badd3`. **Build numbers 12-14 were NEVER uploaded** — owner checked TestFlight 2026-09-15: highest build under the post-transfer account is 11 (1.2.0 b10/b11, 1.1.0 b9, 1.0.0 b1-b8). The abandoned v1.3.0-v1.6.0 rc train claimed those numbers in branch config only, so they are not burned and the redesign ships as **1.3.0 (build 12)**. | 2026-09-15 | ASC -> TestFlight -> iOS Builds |
| App Store Connect | phased-rollout state | **7-day phased release ON** (owner-confirmed 2026-07-19) — Phase 11 monitoring window active; watch crash-free % / Sentry, numeric pause thresholds per RELEASE_CHECKLIST Phase 11 | 2026-07-19 | ASC → App → Phased Release |
| Supabase | prod test-user cleanup (v1.2.0) | **done** — 1 test account deleted from prod Auth after release (RELEASE_CHECKLIST Phase 10) | 2026-07-19 | Supabase → Authentication → Users |
| App Store Connect | Small Business Program | **Both accounts enrolled.** the owner (old) enrolled 2026-07-09. **the account holder (new owner) enrolled — 15% EFFECTIVE 2026-08-15** (Apple welcome email; set as SBP Start Date `15/08/2026` in Superwall → Revenue Tracking). So the transfer carried NO 30% commission gap. | 2026-08-21 | ASC → Agreements (the account holder) |
| App Store Connect | ToS link in metadata | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | DSA trader status | unverified (1.5.3) | unverified | ASC → App Information |
| App Store Connect | offer codes | not set up (F2 skipped) | unverified | ASC → Subscriptions |
| App Store Connect | annual subscription price | **unverified — and the docs disagree** (web2app review 2026-10-07, B-13): RELEASE_CHECKLIST Phase 7.5 and STOREKIT_SETUP_GUIDE say **$69.99**, the website charges **$59.99**, and the house rule is that the three prices agree. Owner deferred 2026-10-07 ("pricing later") | unverified | ASC → Subscriptions → annual → Price |

## GitHub

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| GitHub | canonical repo private | yes (owner) | unverified | GitHub → repo settings |
| GitHub | branch protection / required checks | **SKIPPED** — paid feature on private repos (owner decision; compensating controls: PR-triggered CI + never-merge-on-red) | 2026-07-10 | GitHub → Settings → Branches |
| GitHub | public `appreview` copy | **KEPT, in use as the REDACTED review mirror** (supersedes "pending deletion"). Its whole history is a rewrite of this repo with keys, project refs, the Sentry DSN, EAS project id, Apple team/key/app ids, emails and names replaced by placeholders (text files only). **Never `git push appreview` a real branch** — it would publish every real value, and the histories don't share commits anyway. To update it: rebuild the new commits with the same replacements on top of its tip, check that the old tip reproduces its tip exactly, then push the rebuilt commits. **Recreated 2026-10-07** (new repo, same URL): a push command that wrapped when pasted published the real `release/1.3.0` there for a few minutes. A scan of everything exposed found no true secret (no DB password, service key, private key or token): only values that ship inside the app anyway, plus names, emails and Apple/EAS identifiers. The repo was deleted, recreated and refilled with the 25 redacted branches and 11 tags, and the leaked commit now returns "not found". Its `release/1.3.0` is the redacted copy of `8496aea` (`d10d600`). Push commands for this mirror must be short, with an explicit `<sha>:<ref>`. Last synced 2026-10-05: `design/onboarding-lesson-revamp` → `d08481d`, `feat/web-purchase-unlock` → `ec6f119`. The real repo folded those two (and `test/spec-17`) into `release/1.3.0` later on 2026-10-05 and deleted the July release-train branches; the mirror still has the old names until it is next rebuilt | 2026-10-05 | `git ls-remote --heads appreview` |

## Apple

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Apple | SIWA provider JWT expiry | **~2027-02-17** — regenerated 2026-08-21 under NEW team `APPLETEAMID`, key `APPLEKEYID0` (during transfer). Rotate before expiry or Apple logins break silently. | 2026-08-21 | `APPLE_JWT_ROTATION.md` |
| Apple | Apple ID recovery hardening | declined by owner (F6) | 2026-07-10 | — |
| Apple | Associated Domains on the App ID (v1.3.0, SPEC-21) | `app.config.js` now claims `applinks:open.kinderwell.app` and `applinks:kinderwell.app` (next to the Supabase host). EAS syncs them to the App ID at the first v1.3.0 build; nothing to do in the portal. **Unverified until that build's entitlements are checked** | unverified | the EAS build's entitlements / Apple Developer → Identifiers |

## Website (kinderwell.app) — what the app depends on

The website's own state lives in `~/kinderwell-web2app/kinderwell-web/OPS_RUNBOOK.md`. These rows are the parts the app's purchase handoff (SPEC-21) cannot work without.

| Area | Setting | Current value | Last verified | How to check |
|---|---|---|---|---|
| Vercel | domain `open.kinderwell.app` on the kinderwell-web project, plus its DNS record | **not added** (owner step, web MANUAL_STEPS §8.9 step 1). **Must be live ≥ 24 h before ANY v1.3.0 install** (preview, TestFlight, App Review): iOS fetches the AASA through Apple's CDN at install and caches a miss (web2app review B-9) | — | Vercel → kinderwell-web → Settings → Domains |
| Website | `/.well-known/apple-app-site-association` on `open.kinderwell.app` AND `kinderwell.app` | **built, live on kinderwell.app since 2026-10-07** (website `main`). Team `APPLETEAMID`, path `/k/*` ONLY — a wider path would send the funnel and `/manage` into the app. Bundles: `main` still lists `com.kinderwell.app` + the retired `.dev`; the website's `fix/prod-readiness-review` lists `com.kinderwell.app` only (every EAS profile uses it) | — | `curl -sI https://kinderwell.app/.well-known/apple-app-site-association` → 200, JSON, no redirect |
| Website | automatic collection off on pages that hold a key (INVARIANTS #29) | **built** (website `main`, 2026-10-07): Meta `autoConfig` false, PostHog autocapture and session replay off. Tests pinning all three are on `fix/prod-readiness-review` (`lib/analytics.test.ts`, `e2e/http.spec.ts`) | 2026-10-07 (code) | kinderwell-web `lib/analytics.ts`, `app/layout.tsx` |
| Website | functions deployed on dev (the project the live site uses) | the 2026-09-19 `capture-email`, `create-checkout`, `dodo-webhook`, `winback-sweep`; **not deployed:** `unsubscribe`, `resume`, `mint-handoff`. Deploy by name with the website's `scripts/deploy-functions.sh`; `mint-handoff` only with 1.3.0 (its deploy switches the sign-in links on) | 2026-10-07 | `supabase functions list` |
| Website | 2026-10-07 production-readiness review | every code finding fixed: website on `fix/prod-readiness-review` (not merged), app on `release/1.3.0` (not pushed). Owner list: web MANUAL_STEPS §8.10. Status per finding: `kinderwell-web/reviews/WEB2APP_PROD_READINESS_REVIEW.md` | 2026-10-07 | — |

## Accepted risks (owner decisions — revisit only on the stated trigger)

| Risk accepted | Decided | Compensating control / revisit trigger |
|---|---|---|
| EU analytics tracking without a consent gate | 2026-07-09 | Data already minimal (no PII, pseudonymous IDs, deletion path). Revisit at 5K MAU, first EU data-subject request, or any regulator/App-Review privacy contact |
| Prod DB password never rotated (leaked in old public git history) | 2026-07-09 | Apps use the anon key, not the DB password. Revisit if the repo history is ever shared again |
| No 2FA/recovery hardening on Apple ID & co. | 2026-07-09 | None — accepted as-is |
| No support playbook (tickets handled ad hoc) | 2026-07-09 | Revive if ticket volume appears |
| No mechanical merge-blocking on `main` (GitHub paywalls branch protection on private repos) | 2026-07-10 | The 4 blocking checks (+1 advisory `audit` job) run on every PR to main + "never merge on red" working rule. Revisit on a GitHub Team upgrade |
| CI runs on PRs + manual release gate only (not every push) | 2026-07-09 | Metered Actions minutes; local tsc/lint/test before merges; manual CI run is a release-checklist step |
| Offline first-v1.2.0-launch for a paying v1.1.0 user (SPEC-FIX-08) | 2026-07-11 | A paying v1.1.0 user whose FIRST v1.2.0 launch is offline has the legacy-unowned flag cleared (SPEC-FIX-08 migration) and sits at the retry/escape-hatch screen until connectivity returns. One launch wide, payers-only — inherent cost of the user-binding security fix. Revisit trigger: support tickets about it |
